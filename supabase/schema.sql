-- =========================================================
-- VISTAS INTERNSHIP CONSULTATION PORTAL - SUPABASE DB SCHEMA
-- =========================================================
-- Paste this entire script into your Supabase Dashboard SQL Editor
-- and click 'RUN' to create all required tables & realtime listeners.

-- 1. ENABLE UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS public.availability (
    id INT PRIMARY KEY DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'AVAILABLE',
    start_time TEXT NOT NULL DEFAULT '15:00',
    end_time TEXT NOT NULL DEFAULT '17:30',
    slot_duration INT NOT NULL DEFAULT 15,
    break_start_time TEXT NOT NULL DEFAULT '16:15',
    break_end_time TEXT NOT NULL DEFAULT '16:30',
    max_bookings INT NOT NULL DEFAULT 25,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial availability row if empty
INSERT INTO public.availability (id, status, start_time, end_time, slot_duration, break_start_time, break_end_time, max_bookings)
VALUES (1, 'AVAILABLE', '15:00', '17:30', 15, '16:15', '16:30', 25)
ON CONFLICT (id) DO NOTHING;

-- 3. CREATE STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    register_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    year TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    history_count INT DEFAULT 1,
    private_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    queue_position INT DEFAULT 1,
    appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    appointment_time TEXT NOT NULL,
    is_walk_in BOOLEAN DEFAULT FALSE,
    duration_minutes INT DEFAULT 11,
    notes TEXT DEFAULT '',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE ADMIN USERS TABLE FOR DESK AUTHENTICATION
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    passcode TEXT NOT NULL DEFAULT 'vistas2026',
    role TEXT NOT NULL DEFAULT 'coordinator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default admin user if empty
INSERT INTO public.admin_users (email, passcode, role)
VALUES ('coordinator@velshitech.edu.in', 'vistas2026', 'coordinator')
ON CONFLICT (email) DO NOTHING;

-- 6. CREATE ANNOUNCEMENTS & COMPANY UPDATES TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'GENERAL', -- GENERAL, INTERNSHIP_UPDATE, COMPANY_REPLY, URGENT
    category TEXT DEFAULT 'Important',
    company_name TEXT,
    company_location TEXT,
    company_contact_email TEXT,
    request_sent_date DATE,
    email_reference TEXT,
    company_status TEXT, -- REPLY_RECEIVED, INTERNSHIP_APPROVED, INTERNSHIP_CONFIRMED, INFO_REQUIRED, PENDING_STUDENT_ACTION, CLOSED, REJECTED
    reply_date DATE DEFAULT CURRENT_DATE,
    department TEXT,
    duration TEXT,
    eligibility TEXT,
    deadline DATE,
    required_documents TEXT,
    action_required TEXT,
    coordinator_notes TEXT,
    apply_link TEXT,
    students_included JSONB DEFAULT '[]',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on availability" ON public.availability FOR SELECT USING (true);
CREATE POLICY "Allow public update on availability" ON public.availability FOR UPDATE USING (true);

CREATE POLICY "Allow public select on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert on students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on students" ON public.students FOR UPDATE USING (true);

CREATE POLICY "Allow public select on appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on appointments" ON public.appointments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on appointments" ON public.appointments FOR DELETE USING (true);

CREATE POLICY "Allow public select on admin_users" ON public.admin_users FOR SELECT USING (true);

CREATE POLICY "Allow public select on announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow public insert on announcements" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on announcements" ON public.announcements FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on announcements" ON public.announcements FOR DELETE USING (true);

-- 8. ENABLE SUPABASE REALTIME REPLICATION
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.appointments, public.availability, public.students, public.announcements;
COMMIT;

-- 9. CREATE STUDENT DOCUMENTS TABLE & VAULT
CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_register_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    custom_document_type TEXT,
    document_title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size INT NOT NULL,
    mime_type TEXT NOT NULL,
    company_name TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Under Review',
    admin_notes TEXT,
    version INT NOT NULL DEFAULT 1,
    uploaded_by TEXT DEFAULT 'Admin Coordinator',
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_docs_reg ON public.student_documents(student_register_number);
CREATE INDEX IF NOT EXISTS idx_student_docs_status ON public.student_documents(status);
CREATE INDEX IF NOT EXISTS idx_student_docs_type ON public.student_documents(document_type);

ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select on student_documents" ON public.student_documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert on student_documents" ON public.student_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on student_documents" ON public.student_documents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on student_documents" ON public.student_documents FOR DELETE USING (true);

-- 10. CREATE PRIVATE STORAGE BUCKET: student-documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-documents',
    'student-documents',
    false,
    10485760,
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760;

CREATE POLICY "Allow coordinator select on student-documents bucket" ON storage.objects FOR SELECT USING (bucket_id = 'student-documents');
CREATE POLICY "Allow coordinator insert on student-documents bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'student-documents');
CREATE POLICY "Allow coordinator update on student-documents bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'student-documents');
CREATE POLICY "Allow coordinator delete on student-documents bucket" ON storage.objects FOR DELETE USING (bucket_id = 'student-documents');

