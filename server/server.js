import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Helper: Format DB Appointment to JS Object
const formatAppointment = (row) => ({
  id: row.id,
  tokenNumber: row.token_number,
  studentName: row.student_name,
  registerNumber: row.register_number,
  department: row.department,
  year: row.year,
  phone: row.phone,
  email: row.email,
  category: row.category,
  description: row.description,
  status: row.status,
  queuePosition: row.queue_position,
  appointmentDate: row.appointment_date,
  appointmentTime: row.appointment_time,
  isWalkIn: Boolean(row.is_walk_in),
  durationMinutes: row.duration_minutes,
  notes: row.notes,
  startedAt: row.started_at,
  completedAt: row.completed_at
});

// Helper: Get Current State Payload
const getFullState = () => {
  const avail = db.prepare('SELECT * FROM availability WHERE id = 1').get();
  const apts = db.prepare('SELECT * FROM appointments ORDER BY created_at ASC').all().map(formatAppointment);
  const stds = db.prepare('SELECT * FROM students').all();

  const activeMeeting = apts.find(a => a.status === 'IN_PROGRESS') || null;

  return {
    availability: {
      status: avail?.status || 'AVAILABLE',
      startTime: avail?.start_time || '10:00',
      endTime: avail?.end_time || '16:00',
      slotDuration: avail?.slot_duration || 15,
      breakStartTime: avail?.break_start_time || '13:00',
      breakEndTime: avail?.break_end_time || '14:00',
      maxBookings: avail?.max_bookings || 30
    },
    appointments: apts,
    students: stds.map(s => ({
      id: s.id,
      registerNumber: s.register_number,
      name: s.name,
      department: s.department,
      year: s.year,
      email: s.email,
      phone: s.phone,
      historyCount: s.history_count,
      privateNotes: s.private_notes
    })),
    activeMeeting
  };
};

// --- REST API ENDPOINTS ---

// GET /api/state
app.get('/api/state', (req, res) => {
  res.json(getFullState());
});

// PUT /api/availability
app.put('/api/availability', (req, res) => {
  const { status, startTime, endTime, slotDuration, breakStartTime, breakEndTime, maxBookings } = req.body;
  
  const stmt = db.prepare(`
    UPDATE availability 
    SET status = COALESCE(?, status),
        start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time),
        slot_duration = COALESCE(?, slot_duration),
        break_start_time = COALESCE(?, break_start_time),
        break_end_time = COALESCE(?, break_end_time),
        max_bookings = COALESCE(?, max_bookings),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `);

  stmt.run(status, startTime, endTime, slotDuration, breakStartTime, breakEndTime, maxBookings);
  
  const newState = getFullState();
  io.emit('state:updated', newState);
  res.json({ success: true, availability: newState.availability });
});

// POST /api/appointments (Book Slot)
app.post('/api/appointments', (req, res) => {
  const { name, registerNumber, department, year, phone, email, category, description, date, timeSlot } = req.body;

  const maxSeqRow = db.prepare(`SELECT MAX(CAST(SUBSTR(token_number, 5) AS INTEGER)) as max_seq FROM appointments`).get();
  const nextSeq = (maxSeqRow.max_seq || 0) + 1;
  const tokenNumber = `INT-${String(nextSeq).padStart(3, '0')}`;

  const activeWaiting = db.prepare(`SELECT COUNT(*) as count FROM appointments WHERE status IN ('WAITING', 'CALLED')`).get();
  const queuePosition = activeWaiting.count + 1;
  const id = `apt-${Date.now()}`;

  const stmt = db.prepare(`
    INSERT INTO appointments (
      id, token_number, student_name, register_number, department, year, phone, email,
      category, description, status, queue_position, appointment_date, appointment_time, is_walk_in
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'WAITING', ?, ?, ?, 0)
  `);

  const todayStr = new Date().toISOString().split('T')[0];
  stmt.run(id, tokenNumber, name, registerNumber, department, year, phone, email, category, description || '', queuePosition, date || todayStr, timeSlot);

  const stdCheck = db.prepare('SELECT * FROM students WHERE register_number = ?').get(registerNumber);
  if (!stdCheck) {
    db.prepare(`
      INSERT INTO students (id, register_number, name, department, year, email, phone, history_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(`std-${Date.now()}`, registerNumber, name, department, year, email, phone);
  } else {
    db.prepare('UPDATE students SET history_count = history_count + 1 WHERE register_number = ?').run(registerNumber);
  }

  const newState = getFullState();
  io.emit('state:updated', newState);

  const createdApt = newState.appointments.find(a => a.id === id);
  res.status(201).json({ success: true, appointment: createdApt });
});

// POST /api/appointments/walk-in
app.post('/api/appointments/walk-in', (req, res) => {
  const { name, registerNumber, department, year, category, positionChoice, description } = req.body;

  const maxSeqRow = db.prepare(`SELECT MAX(CAST(SUBSTR(token_number, 5) AS INTEGER)) as max_seq FROM appointments`).get();
  const nextSeq = (maxSeqRow.max_seq || 0) + 1;
  const tokenNumber = `INT-${String(nextSeq).padStart(3, '0')}`;

  const activeWaiting = db.prepare(`SELECT COUNT(*) as count FROM appointments WHERE status IN ('WAITING', 'CALLED')`).get();
  let pos = activeWaiting.count + 1;
  if (positionChoice === 'PRIORITY') pos = 1;

  const id = `apt-${Date.now()}`;

  const todayStr = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT INTO appointments (
      id, token_number, student_name, register_number, department, year, phone, email,
      category, description, status, queue_position, appointment_date, appointment_time, is_walk_in
    ) VALUES (?, ?, ?, ?, ?, ?, 'N/A', 'N/A', ?, ?, 'WAITING', ?, ?, ?, 1)
  `).run(id, tokenNumber, name, registerNumber || 'WALK-IN', department, year || 'N/A', category, `[WALK-IN] ${description || ''}`, pos, todayStr, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const newState = getFullState();
  io.emit('state:updated', newState);
  res.status(201).json({ success: true, appointment: newState.appointments.find(a => a.id === id) });
});

// PUT /api/appointments/:id/call
app.put('/api/appointments/:id/call', (req, res) => {
  db.prepare(`UPDATE appointments SET status = 'CALLED' WHERE id = ?`).run(req.params.id);
  const newState = getFullState();
  const calledApt = newState.appointments.find(a => a.id === req.params.id);
  io.emit('token:called', { calledToken: calledApt?.tokenNumber });
  io.emit('state:updated', newState);
  res.json({ success: true });
});

// PUT /api/appointments/:id/start
app.put('/api/appointments/:id/start', (req, res) => {
  const now = new Date().toISOString();
  db.prepare(`UPDATE appointments SET status = 'IN_PROGRESS', started_at = ? WHERE id = ?`).run(now, req.params.id);
  const newState = getFullState();
  io.emit('state:updated', newState);
  res.json({ success: true });
});

// PUT /api/appointments/:id/complete
app.put('/api/appointments/:id/complete', (req, res) => {
  const { notes, durationMinutes } = req.body;
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE appointments 
    SET status = 'COMPLETED', completed_at = ?, notes = ?, duration_minutes = ?
    WHERE id = ?
  `).run(now, notes || 'Consultation completed.', durationMinutes || 11, req.params.id);

  const newState = getFullState();
  io.emit('state:updated', newState);
  res.json({ success: true });
});

// PUT /api/appointments/:id/no-show
app.put('/api/appointments/:id/no-show', (req, res) => {
  db.prepare(`UPDATE appointments SET status = 'NO_SHOW', notes = 'Marked No-Show' WHERE id = ?`).run(req.params.id);
  const newState = getFullState();
  io.emit('state:updated', newState);
  res.json({ success: true });
});

// PUT /api/appointments/:id/cancel
app.put('/api/appointments/:id/cancel', (req, res) => {
  db.prepare(`UPDATE appointments SET status = 'CANCELLED' WHERE id = ?`).run(req.params.id);
  const newState = getFullState();
  io.emit('state:updated', newState);
  res.json({ success: true });
});

// PUT /api/students/:id/notes
app.put('/api/students/:id/notes', (req, res) => {
  const { privateNotes } = req.body;
  db.prepare('UPDATE students SET private_notes = ? WHERE id = ?').run(privateNotes, req.params.id);
  const newState = getFullState();
  io.emit('state:updated', newState);
  res.json({ success: true });
});

// Serve static frontend build
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback SPA route for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// WebSockets Connection Handler
io.on('connection', (socket) => {
  console.log(`📡 WebSocket Client Connected: ${socket.id}`);
  socket.emit('state:updated', getFullState());
  socket.on('disconnect', () => {
    console.log(`🔌 WebSocket Client Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 VISTAS Portal Server running on http://localhost:${PORT}`);
});
