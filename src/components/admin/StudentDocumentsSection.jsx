import React, { useState, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  Eye, 
  Trash2, 
  RefreshCw, 
  Check, 
  ExternalLink,
  Building2,
  Calendar,
  Layers,
  Edit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentPreviewModal from './DocumentPreviewModal';

const CORE_CHECKLIST = [
  'Resume',
  'NOC',
  'Offer Letter',
  'Joining Letter',
  'Internship Certificate',
  'Internship Report'
];

export default function StudentDocumentsSection({ student }) {
  const { 
    documents = [], 
    updateDocumentStatus, 
    deleteStudentDocument, 
    replaceStudentDocument, 
    getDocumentSignedUrl 
  } = useApp();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Status edit state
  const [editingStatusDocId, setEditingStatusDocId] = useState(null);
  const [selectedNewStatus, setSelectedNewStatus] = useState('Verified');
  const [statusNote, setStatusNote] = useState('');

  // Replace doc state
  const [replacingDoc, setReplacingDoc] = useState(null);
  const [replaceNote, setReplaceNote] = useState('');
  const replaceFileInputRef = useRef(null);

  // Delete confirmation
  const [deletingDocId, setDeletingDocId] = useState(null);

  if (!student) return null;

  const studentDocs = documents.filter(d => d.studentRegisterNumber === student.registerNumber);

  // Metrics calculation
  const totalCount = studentDocs.length;
  const verifiedCount = studentDocs.filter(d => d.status === 'Verified').length;
  const pendingCount = studentDocs.filter(d => d.status === 'Under Review' || d.status === 'Uploaded').length;
  const replacementCount = studentDocs.filter(d => d.status === 'Replacement Required').length;

  // Completion percentage based on core checklist uploaded
  const uploadedChecklistTypes = new Set(studentDocs.map(d => d.documentType));
  const completedChecklistCount = CORE_CHECKLIST.filter(t => uploadedChecklistTypes.has(t)).length;
  const completionPercentage = Math.round((completedChecklistCount / CORE_CHECKLIST.length) * 100);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Under Review':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Replacement Required':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Rejected':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  const handleDownload = async (doc) => {
    const url = await getDocumentSignedUrl(doc);
    if (!url) return;
    const a = window.document.createElement('a');
    a.href = url;
    a.download = doc.fileName || 'document';
    a.target = '_blank';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleOpenStatusEdit = (doc) => {
    setEditingStatusDocId(doc.id);
    setSelectedNewStatus(doc.status || 'Verified');
    setStatusNote(doc.adminNotes || '');
  };

  const handleSaveStatus = async (docId) => {
    await updateDocumentStatus(docId, selectedNewStatus, statusNote);
    setEditingStatusDocId(null);
  };

  const handleReplaceFileSelected = async (e) => {
    if (e.target.files && e.target.files[0] && replacingDoc) {
      await replaceStudentDocument(replacingDoc.id, e.target.files[0], replaceNote);
      setReplacingDoc(null);
      setReplaceNote('');
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans">

      {/* Summary KPI Ribbon */}
      <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="grid grid-cols-4 gap-2 text-center flex-1">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
              <span className="text-base font-bold font-mono text-slate-800 dark:text-white">{totalCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold block">Verified</span>
              <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-300">{verifiedCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/50">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-semibold block">Review</span>
              <span className="text-base font-bold font-mono text-amber-700 dark:text-amber-300">{pendingCount}</span>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-semibold block">Progress</span>
              <span className="text-base font-bold font-mono text-blue-700 dark:text-blue-300">{completionPercentage}%</span>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Internship Dossier Completion</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{completedChecklistCount} of {CORE_CHECKLIST.length} Core Documents</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Required Documentation Checklist */}
      <div className="bg-slate-50/70 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Internship Checklist Requirements
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CORE_CHECKLIST.map(docName => {
            const isUploaded = uploadedChecklistTypes.has(docName);
            const matchingDoc = studentDocs.find(d => d.documentType === docName);
            const isVerified = matchingDoc?.status === 'Verified';

            return (
              <div 
                key={docName}
                className={`p-2 rounded-lg border flex items-center justify-between text-[11px] transition-colors ${
                  isVerified
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : isUploaded
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800 text-blue-800 dark:text-blue-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <span className="truncate pr-1">{docName}</span>
                {isVerified ? (
                  <span className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400 shrink-0">✓ Verified</span>
                ) : isUploaded ? (
                  <span className="text-[9px] font-bold uppercase text-blue-600 dark:text-blue-400 shrink-0">Uploaded</span>
                ) : (
                  <span className="text-[9px] font-medium text-slate-400 shrink-0">Pending</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Uploaded Documents ({studentDocs.length})
          </span>
          {studentDocs.length > 0 && (
            <span className="text-[10px] text-slate-400">Click any document to preview</span>
          )}
        </div>

        {studentDocs.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">No internship documents uploaded yet</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Upload the student's Resume, NOC, or Company Offer Letter to maintain their official training dossier.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload First Document</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {studentDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 p-3.5 rounded-xl shadow-xs space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2.5 overflow-hidden">
                    <div 
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 shrink-0 cursor-pointer hover:bg-blue-100 transition-colors"
                      title="Click to Preview"
                    >
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <h4 
                          onClick={() => setPreviewDoc(doc)}
                          className="font-bold text-slate-900 dark:text-white text-xs truncate hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {doc.documentTitle}
                        </h4>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          v{doc.version || 1}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {doc.fileName} • {(doc.fileSize / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(doc.status)}`}>
                      ● {doc.status}
                    </span>
                    <button
                      onClick={() => handleOpenStatusEdit(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Update status & coordinator notes"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      title="Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setReplacingDoc(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      title="Replace with new version"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingDocId(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-row: Category, Company & Notes */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span>Category: <strong className="text-slate-700 dark:text-slate-300">{doc.documentType}</strong></span>
                  {doc.companyName && (
                    <span>Company: <strong className="text-blue-600 dark:text-blue-400">{doc.companyName}</strong></span>
                  )}
                  {doc.adminNotes && (
                    <span className="italic text-slate-600 dark:text-slate-300">"{doc.adminNotes}"</span>
                  )}
                </div>

                {/* Inline Status Edit Form */}
                {editingStatusDocId === doc.id && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                    <span className="font-bold text-slate-800 dark:text-white block text-[11px]">Update Verification Status & Notes</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={selectedNewStatus}
                        onChange={(e) => setSelectedNewStatus(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="Verified">🟢 Verified (Approved)</option>
                        <option value="Under Review">🟡 Under Review</option>
                        <option value="Replacement Required">🔴 Replacement Required</option>
                        <option value="Uploaded">🔵 Uploaded (Pending Check)</option>
                        <option value="Rejected">⚫ Rejected</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Coordinator verification notes..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingStatusDocId(null)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveStatus(doc.id)}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        student={student}
      />

      {/* Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        onStatusChange={async (docId, newStatus) => {
          await updateDocumentStatus(docId, newStatus);
          setPreviewDoc(prev => prev ? { ...prev, status: newStatus } : null);
        }}
      />

      {/* Replace Document Modal */}
      {replacingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Replace Document: {replacingDoc.documentTitle}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload an updated version. The system will retain the metadata and automatically bump the version to <strong>v{(replacingDoc.version || 1) + 1}</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <input
                ref={replaceFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleReplaceFileSelected}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />

              <input
                type="text"
                placeholder="Reason for replacement (optional)..."
                value={replaceNote}
                onChange={(e) => setReplaceNote(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReplacingDoc(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDocId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete Document?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to permanently delete this document? This will remove both the storage file and the student record.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingDocId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteStudentDocument(deletingDocId);
                  setDeletingDocId(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
