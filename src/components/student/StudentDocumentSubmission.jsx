import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Award, 
  Search, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  Clock, 
  Download, 
  Eye, 
  X, 
  Sparkles, 
  GraduationCap, 
  FileCheck,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import studentsDatabase from '../../data/studentsDatabase.json';

const DOCUMENT_TYPES = [
  'Internship Certificate',
  'Completion Certificate',
  'Offer Letter',
  'Joining Letter',
  'Internship Report',
  'Company Evaluation',
  'Other'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function StudentDocumentSubmission({ setActiveTab }) {
  const { 
    students: contextStudents = [], 
    documents = [], 
    announcements = [], 
    uploadStudentDocument, 
    getDocumentSignedUrl,
    showToast 
  } = useApp();

  // Combine local JSON database and context students
  const studentPool = useMemo(() => {
    const map = new Map();
    if (Array.isArray(studentsDatabase)) {
      studentsDatabase.forEach(s => {
        if (s && s.registerNumber) map.set(s.registerNumber.toLowerCase().trim(), s);
      });
    }
    if (Array.isArray(contextStudents)) {
      contextStudents.forEach(s => {
        if (s && s.registerNumber && !String(s.registerNumber).startsWith('__SYS_')) {
          const key = s.registerNumber.toLowerCase().trim();
          map.set(key, { ...(map.get(key) || {}), ...s });
        }
      });
    }
    return Array.from(map.values());
  }, [contextStudents]);

  // Search & Student Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Form Fields
  const [documentType, setDocumentType] = useState('Internship Certificate');
  const [customType, setCustomType] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Extract known companies from announcements for quick suggestions
  const suggestedCompanies = useMemo(() => {
    return Array.from(new Set(
      announcements
        .filter(a => a.companyName && a.companyName.trim())
        .map(a => a.companyName.trim())
    )).slice(0, 6);
  }, [announcements]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update default document title when student or company changes
  useEffect(() => {
    if (selectedStudent && companyName) {
      setDocumentTitle(`${selectedStudent.name} - ${companyName} ${documentType}`);
    } else if (selectedStudent) {
      setDocumentTitle(`${selectedStudent.name} - ${documentType}`);
    }
  }, [selectedStudent, companyName, documentType]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const clean = val.trim().toLowerCase();
    if (clean.length >= 1) {
      const matches = studentPool
        .filter(s => 
          (s.name && s.name.toLowerCase().includes(clean)) ||
          (s.registerNumber && s.registerNumber.toLowerCase().includes(clean))
        )
        .slice(0, 8);
      setSuggestions(matches);
      setIsDropdownOpen(true);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchQuery(`${student.name} (${student.registerNumber})`);
    setIsDropdownOpen(false);
    setSubmissionSuccess(false);
  };

  const handleClearStudent = () => {
    setSelectedStudent(null);
    setSearchQuery('');
    setSuggestions([]);
    setSelectedFile(null);
    setFileError('');
    setSubmissionSuccess(false);
  };

  const validateAndSetFile = (file) => {
    setFileError('');
    if (!file) return;

    const extension = `.${file.name.split('.').pop().toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFileError(`Invalid file format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError('File size exceeds the 10MB limit. Please compress or select a smaller file.');
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('Please search and select your student profile first', 'error');
      return;
    }

    if (!selectedFile) {
      setFileError('Please select or upload your certificate document file');
      return;
    }

    if (!companyName.trim()) {
      showToast('Please specify the company / organization name', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await uploadStudentDocument({
        student: {
          registerNumber: selectedStudent.registerNumber,
          name: selectedStudent.name,
          department: selectedStudent.department || ''
        },
        file: selectedFile,
        metadata: {
          documentType: documentType === 'Other' && customType ? customType : documentType,
          customDocumentType: customType,
          documentTitle: documentTitle || `${selectedStudent.name} - ${companyName} Certificate`,
          companyName: companyName.trim(),
          description: description.trim(),
          status: 'Under Review',
          uploadedBy: `${selectedStudent.name} (Student Submission)`,
          adminNotes: `Submitted online by student on ${new Date().toLocaleDateString()}`
        }
      });

      setSubmissionSuccess(true);
      setSelectedFile(null);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('Certificate submitted successfully to Coordinator Desk!', 'success');
    } catch (err) {
      console.error('Error submitting certificate:', err);
      showToast('Submission failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find all documents previously uploaded for this student
  const studentDocuments = useMemo(() => {
    if (!selectedStudent) return [];
    return documents.filter(
      d => d.studentRegisterNumber && d.studentRegisterNumber.toLowerCase() === selectedStudent.registerNumber.toLowerCase()
    );
  }, [documents, selectedStudent]);

  const handleDownloadDoc = async (doc) => {
    const url = await getDocumentSignedUrl(doc);
    if (!url) {
      showToast('Document preview is unavailable', 'error');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName || `${doc.documentTitle}.pdf`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 font-sans transition-colors duration-200">
      
      {/* Page Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold shadow-xs">
          <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>STUDENT DOCUMENT SUBMISSION VAULT</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Upload Completed Internship Certificate
        </h1>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Submit your official internship completion certificates, offer letters, or project evaluation reports directly to the Coordinator Desk. Submissions are verified and reflected against your student profile.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm relative">
        
        {/* Step 1: Student Lookup */}
        <div className={`p-6 md:p-8 ${selectedStudent ? 'border-b border-slate-100 dark:border-slate-800' : ''} space-y-4`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                Step 1: Student Verification
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Search Your Name or Register Number
              </h2>
            </div>
            {selectedStudent && (
              <button
                type="button"
                onClick={handleClearStudent}
                className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Switch Student</span>
              </button>
            )}
          </div>

          {!selectedStudent ? (
            <div className="relative z-30" ref={searchContainerRef}>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Type your Full Name (e.g. Aakash) or Register Number (e.g. 25326101)..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 1) setIsDropdownOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && suggestions.length > 0) {
                      e.preventDefault();
                      handleSelectStudent(suggestions[0]);
                    } else if (e.key === 'Escape') {
                      setIsDropdownOpen(false);
                    }
                  }}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setIsDropdownOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-slate-900/10">
                  {suggestions.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/95 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between sticky top-0 backdrop-blur-xs z-10 border-b border-slate-100 dark:border-slate-700/50">
                        <span>Enrolled Students Found ({suggestions.length})</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold normal-case">Click your profile to continue</span>
                      </div>
                      {suggestions.map((std) => (
                        <button
                          type="button"
                          key={std.registerNumber || std.id}
                          onClick={() => handleSelectStudent(std)}
                          className="w-full p-3.5 text-left hover:bg-blue-50 dark:hover:bg-blue-950/60 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                        >
                          <div className="min-w-0 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {std.name ? std.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {std.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {std.department || 'Engineering'} • {std.year || 'Student'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                            {std.registerNumber}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.trim().length >= 1 ? (
                    <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                      No enrolled student found matching "<span className="font-semibold text-slate-800 dark:text-slate-200">{searchQuery}</span>". Check your name spelling or register number.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : (
            /* Selected Verified Student Card */
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedStudent.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200">
                      {selectedStudent.registerNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {selectedStudent.department} • {selectedStudent.year}
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 self-start sm:self-auto">
                OFFICIAL STUDENT RECORD
              </span>
            </div>
          )}
        </div>

        {/* Step 2: Upload Form (Active when Student Selected) */}
        {selectedStudent && (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Step 2: Certificate & Document Details
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Enter Internship Information & Attach Document
              </h2>
            </div>

            {/* Document Type Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Document Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DOCUMENT_TYPES.map(type => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setDocumentType(type)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left truncate ${
                      documentType === type
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-600 text-blue-900 dark:text-blue-200 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Type when 'Other' */}
            {documentType === 'Other' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Custom Document Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Project Completion Certificate"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            )}

            {/* Company / Organization Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Company / Organization Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. IndiGo Airlines, Air India SATS, TCS, Zoho..."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-xs"
                  required
                />
              </div>

              {/* Quick Company Suggestions */}
              {suggestedCompanies.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Quick select:</span>
                  {suggestedCompanies.map(comp => (
                    <button
                      type="button"
                      key={comp}
                      onClick={() => setCompanyName(comp)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[10px] text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 transition-colors border border-slate-200/60 dark:border-slate-700"
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Document Title Headline */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Document Label / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul - IndiGo Airlines Internship Certificate"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>

            {/* Optional Remarks */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Remarks / Internship Details <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Completed 45-day internship in Airport Ground Operations. Mentor: Mr. Rajesh."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none shadow-xs"
              />
            </div>

            {/* File Upload Zone */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Upload Certificate File (PDF, JPG, PNG) <span className="text-rose-500">*</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/20'
                  }`}
                >
                  <UploadCloud className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to select certificate file or drag and drop here
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Supports PDF, JPG, and PNG documents up to 10MB
                  </p>
                </div>
              ) : (
                /* Selected File Preview Box */
                <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {selectedFile.name.endsWith('.pdf') ? 'PDF' : 'IMG'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {formatBytes(selectedFile.size)} • Ready for submission
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium underline px-2 py-1"
                    >
                      Change File
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {fileError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {fileError}
                </p>
              )}
            </div>

            {/* Submission Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading & Securing Document...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>SUBMIT INTERNSHIP CERTIFICATE →</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Banner & Records Archive */}
        {selectedStudent && (
          <div className="p-6 md:p-8 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 space-y-4">
            
            {submissionSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide">
                    Certificate Recorded Against Your Profile!
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    Your certificate has been securely uploaded and linked to your register number (<strong>{selectedStudent.registerNumber}</strong>). It is now listed in the Admin Coordinator Directory under your student profile for verification.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Your Submitted Documents ({studentDocuments.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Official Student Vault
              </span>
            </div>

            {studentDocuments.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No documents on file yet for this register number. Submit your certificate above.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {studentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {doc.documentTitle}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {doc.documentType} {doc.companyName ? `• ${doc.companyName}` : ''} • {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        doc.status === 'Verified'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : doc.status === 'Rejected' || doc.status === 'Replacement Required'
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {doc.status || 'Under Review'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(doc)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
