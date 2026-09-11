import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  FileCheck,
  Sparkles
} from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

export const DOCUMENT_TYPES = [
  'Resume',
  'NOC',
  'Internship Request Letter',
  'Offer Letter',
  'Joining Letter',
  'Internship Certificate',
  'Completion Certificate',
  'Internship Report',
  'Company Evaluation',
  'ID Proof',
  'Other'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function DocumentUploadModal({ isOpen, onClose, student }) {
  const { uploadStudentDocument, announcements = [] } = useApp();

  const [documentType, setDocumentType] = useState('Offer Letter');
  const [customType, setCustomType] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [description, setDescription] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState('Under Review');

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Extract known company names from company reply announcements
  const knownCompanies = Array.from(new Set(
    announcements
      .filter(a => a.companyName && a.companyName.trim())
      .map(a => a.companyName.trim())
  ));

  const validateAndSetFile = (file) => {
    setFileError('');
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setFileError(`Unsupported file format (${ext}). Allowed: PDF, DOC, DOCX, JPG, PNG.`);
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileError(`File is too large (${sizeMb} MB). Maximum size allowed is 10 MB.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    if (!documentTitle.trim()) {
      // Auto-suggest title based on type and student name or company
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setDocumentTitle(cleanName);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError('Please select a file to upload.');
      return;
    }

    const effectiveType = documentType === 'Other' ? (customType.trim() || 'Other') : documentType;
    const effectiveTitle = documentTitle.trim() || `${effectiveType} - ${student?.name || 'Student'}`;
    const effectiveCompany = companyName === '__CUSTOM__' ? customCompany.trim() : companyName;

    setIsSubmitting(true);
    try {
      await uploadStudentDocument({
        student,
        file: selectedFile,
        metadata: {
          documentType: effectiveType,
          customDocumentType: documentType === 'Other' ? customType.trim() : '',
          documentTitle: effectiveTitle,
          companyName: effectiveCompany,
          description: description.trim(),
          adminNotes: adminNotes.trim(),
          status
        }
      });

      // Reset and close
      setSelectedFile(null);
      setDocumentTitle('');
      setCustomType('');
      setCustomCompany('');
      setDescription('');
      setAdminNotes('');
      setFileError('');
      onClose();
    } catch (err) {
      setFileError('Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Upload Student Document — ${student?.name || 'Student'}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700 dark:text-slate-200">
        
        {/* Student Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-xs block">{student?.name}</span>
            <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">Reg: {student?.registerNumber}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-[11px] border border-blue-200 dark:border-blue-800">
            {student?.department}
          </span>
        </div>

        {/* File Drop & Browse Zone */}
        <div className="space-y-1.5">
          <label className="block font-semibold text-slate-700 dark:text-slate-300">
            Document File <span className="text-rose-500">*</span>
          </label>
          
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20' 
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-blue-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                Drag & drop document here, or <span className="text-blue-600 dark:text-blue-400 underline">browse files</span>
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Accepted: PDF, DOC, DOCX, JPG, PNG (Max 10 MB)
              </p>
            </div>
          ) : (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Document'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {fileError && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {fileError}
            </p>
          )}
        </div>

        {/* Document Type & Custom Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Document Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {DOCUMENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {documentType === 'Other' ? (
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Custom Document Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Parental Consent Form"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Under Review">🟡 Under Review</option>
                <option value="Verified">🟢 Verified</option>
                <option value="Uploaded">🔵 Uploaded (Pending Check)</option>
                <option value="Replacement Required">🔴 Replacement Required</option>
                <option value="Rejected">⚫ Rejected</option>
              </select>
            </div>
          )}
        </div>

        {/* Document Title */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-700 dark:text-slate-300">
            Document Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. XYZ Aviation Services Approved Offer Letter"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Company Association */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Internship / Company Association</span>
            <span className="text-[10px] text-slate-400 font-normal">Optional</span>
          </label>
          <select
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">-- None / General Document --</option>
            {knownCompanies.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__CUSTOM__">+ Enter Other Company...</option>
          </select>
          {companyName === '__CUSTOM__' && (
            <input
              type="text"
              placeholder="Enter Company Name..."
              value={customCompany}
              onChange={(e) => setCustomCompany(e.target.value)}
              className="mt-2 w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          )}
        </div>

        {/* Description / Notes */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Description / Context</span>
            <span className="text-[10px] text-slate-400 font-normal">Optional</span>
          </label>
          <textarea
            rows="2"
            placeholder="e.g. Received via official HR email on 10 Sep. Requires indemnity attachment."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Coordinator Verification Notes */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Coordinator Verification Remarks</span>
            <span className="text-[10px] text-slate-400 font-normal">Confidential</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Verified with HR contact, stamp authentic."
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedFile}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload to Vault</span>
              </>
            )}
          </button>
        </div>

      </form>
    </Modal>
  );
}
