-- =========================================================
-- VISTAS INTERNSHIP PORTAL: STUDENT DOCUMENTS MANAGEMENT
-- =========================================================
-- Paste this script into your Supabase Dashboard SQL Editor
-- and click 'RUN' to create the student_documents table,
-- private storage bucket, and security policies.

-- 1. CREATE STUDENT DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.student_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_register_number TEXT NOT NULL,
    student_name TEXT NOT NULL,
    document_type TEXT NOT NULL, -- Resume, NOC, Offer Letter, Joining Letter, Internship Certificate, Completion Certificate, Internship Report, Company Evaluation, ID Proof, Other
    custom_document_type TEXT,
    document_title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size INT NOT NULL, -- bytes
    mime_type TEXT NOT NULL,
    company_name TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Under Review', -- Uploaded, Under Review, Verified, Rejected, Replacement Required
    admin_notes TEXT,
    version INT NOT NULL DEFAULT 1,
    uploaded_by TEXT DEFAULT 'Admin Coordinator',
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for rapid student lookup and status filtering
CREATE INDEX IF NOT EXISTS idx_student_docs_reg ON public.student_documents(student_register_number);
CREATE INDEX IF NOT EXISTS idx_student_docs_status ON public.student_documents(status);
CREATE INDEX IF NOT EXISTS idx_student_docs_type ON public.student_documents(document_type);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.student_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on student_documents" 
ON public.student_documents FOR SELECT USING (true);

CREATE POLICY "Allow public insert on student_documents" 
ON public.student_documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on student_documents" 
ON public.student_documents FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on student_documents" 
ON public.student_documents FOR DELETE USING (true);

-- 3. CREATE PRIVATE STORAGE BUCKET: student-documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-documents',
    'student-documents',
    false, -- Private bucket (access restricted to signed/authenticated URLs)
    10485760, -- 10MB maximum file size limit
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
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760;

-- 4. STORAGE RLS POLICIES FOR student-documents BUCKET
CREATE POLICY "Allow coordinator select on student-documents bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-documents');

CREATE POLICY "Allow coordinator insert on student-documents bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-documents');

CREATE POLICY "Allow coordinator update on student-documents bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'student-documents');

CREATE POLICY "Allow coordinator delete on student-documents bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'student-documents');

-- 5. ENABLE REALTIME REPLICATION FOR student_documents
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_documents;
