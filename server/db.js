import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'vistas_portal.db');
const db = new Database(dbPath);

// Enable WAL mode for high performance
db.pragma('journal_mode = WAL');

// Initialize Schemas
db.exec(`
  CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    start_time TEXT NOT NULL DEFAULT '10:00',
    end_time TEXT NOT NULL DEFAULT '16:00',
    slot_duration INTEGER NOT NULL DEFAULT 15,
    break_start_time TEXT NOT NULL DEFAULT '13:00',
    break_end_time TEXT NOT NULL DEFAULT '14:00',
    max_bookings INTEGER NOT NULL DEFAULT 30,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    register_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    history_count INTEGER DEFAULT 1,
    private_notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    token_number TEXT UNIQUE NOT NULL,
    student_name TEXT NOT NULL,
    register_number TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'WAITING',
    queue_position INTEGER DEFAULT 0,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    is_walk_in BOOLEAN DEFAULT 0,
    duration_minutes INTEGER DEFAULT 11,
    notes TEXT DEFAULT '',
    started_at DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
