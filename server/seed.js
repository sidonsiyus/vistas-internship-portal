import db from './db.js';
import { INITIAL_APPOINTMENTS, INITIAL_AVAILABILITY, MOCK_STUDENTS } from '../src/mock/sampleData.js';

console.log('🌱 Seeding VISTAS Internship Portal Database...');

// Seed Availability if empty
const availCheck = db.prepare('SELECT COUNT(*) as count FROM availability').get();
if (availCheck.count === 0) {
  const insertAvail = db.prepare(`
    INSERT INTO availability (id, status, start_time, end_time, slot_duration, break_start_time, break_end_time, max_bookings)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAvail.run(
    INITIAL_AVAILABILITY.status,
    INITIAL_AVAILABILITY.startTime,
    INITIAL_AVAILABILITY.endTime,
    INITIAL_AVAILABILITY.slotDuration,
    INITIAL_AVAILABILITY.breakStartTime,
    INITIAL_AVAILABILITY.breakEndTime,
    INITIAL_AVAILABILITY.maxBookings
  );
  console.log('✓ Availability table seeded.');
}

// Seed Students if empty
const studentCheck = db.prepare('SELECT COUNT(*) as count FROM students').get();
if (studentCheck.count === 0) {
  const insertStudent = db.prepare(`
    INSERT INTO students (id, register_number, name, department, year, email, phone, history_count, private_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  MOCK_STUDENTS.forEach(std => {
    insertStudent.run(
      std.id,
      std.registerNumber,
      std.name,
      std.department,
      std.year,
      std.email,
      std.phone,
      std.historyCount,
      std.privateNotes
    );
  });
  console.log(`✓ ${MOCK_STUDENTS.length} Students seeded.`);
}

// Seed Appointments if empty
const aptCheck = db.prepare('SELECT COUNT(*) as count FROM appointments').get();
if (aptCheck.count === 0) {
  const insertApt = db.prepare(`
    INSERT INTO appointments (
      id, token_number, student_name, register_number, department, year, phone, email,
      category, description, status, queue_position, appointment_date, appointment_time,
      is_walk_in, duration_minutes, notes, started_at, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  INITIAL_APPOINTMENTS.forEach(apt => {
    insertApt.run(
      apt.id,
      apt.tokenNumber,
      apt.studentName,
      apt.registerNumber,
      apt.department,
      apt.year || '3rd Year',
      apt.phone || '+91 98765 43210',
      apt.email || 'student@vistas.edu.in',
      apt.category,
      apt.description || '',
      apt.status,
      apt.queuePosition || 0,
      apt.appointmentDate,
      apt.appointmentTime,
      apt.isWalkIn ? 1 : 0,
      apt.durationMinutes || 11,
      apt.notes || '',
      apt.startedAt || null,
      apt.completedAt || null
    );
  });
  console.log(`✓ ${INITIAL_APPOINTMENTS.length} Appointments seeded.`);
}

console.log('✅ Database seeding complete!');
