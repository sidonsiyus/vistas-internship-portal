import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building2, 
  User, 
  Calendar,
  Layers,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

export default function DocumentPreviewModal({ isOpen, onClose, document: doc, onStatusChange }) {
  const { getDocumentSignedUrl } = useApp();
  const [fileUrl, setFileUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && doc) {
      setLoadingUrl(true);
      getDocumentSignedUrl(doc)
        .then(url => {
          if (isMounted) {
            setFileUrl(url || '');
            setLoadingUrl(false);
          }
        })
        .catch(() => {
          if (isMounted) setLoadingUrl(false);
        });
    } else {
      setFileUrl('');
    }
    return () => { isMounted = false; };
  }, [isOpen, doc]);

  if (!doc) return null;

  const isPdf = doc.mimeType?.includes('pdf') || doc.fileName?.toLowerCase().endsWith('.pdf');
  const isImage = doc.mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(doc.fileName);
  const isWord = doc.mimeType?.includes('word') || /\.(doc|docx)$/i.test(doc.fileName);

  const handleDownload = () => {
    if (!fileUrl) return;
    const a = window.document.createElement('a');
    a.href = fileUrl;
    a.download = doc.fileName || 'document';
    a.target = '_blank';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Document Preview: ${doc.documentTitle}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4 text-xs font-sans">
        
        {/* Document Header & Metadata Ribbon */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(doc.status)}`}>
                ● {doc.status}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                v{doc.version || 1}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                {doc.documentType}
              </span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{doc.documentTitle}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Student: {doc.studentName} ({doc.studentRegisterNumber}) • {doc.fileName} ({(doc.fileSize / 1024).toFixed(1)} KB)
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Preview Viewer Area */}
        <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden min-h-[420px] max-h-[580px] flex items-center justify-center relative">
          {loadingUrl ? (
            <div className="p-8 text-center space-y-2">
              <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block" />
              <p className="text-xs text-slate-500">Generating secure preview token...</p>
            </div>
          ) : isPdf && fileUrl ? (
            <iframe
              src={`${fileUrl}#toolbar=0`}
              title={doc.documentTitle}
              className="w-full h-[520px] border-0"
            />
          ) : isImage && fileUrl ? (
            <div className="p-4 flex items-center justify-center max-h-[520px] overflow-auto">
              <img
                src={fileUrl}
                alt={doc.documentTitle}
                className="max-h-[480px] w-auto object-contain rounded-lg shadow-md"
              />
            </div>
          ) : (
            <div className="p-8 text-center max-w-sm space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {isWord ? 'Microsoft Word Document' : 'Document File'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This document type ({doc.mimeType || doc.fileName}) is not directly renderable inside the browser viewer. Click below to securely download and view the file.
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download {doc.fileName}</span>
              </button>
            </div>
          )}
        </div>

        {/* Detailed Metadata Grid & Quick Verification Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">DOCUMENT INFORMATION</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Associated Company:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{doc.companyName || 'General / None'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Uploaded By:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{doc.uploadedBy}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Uploaded Date:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Storage Path:</span>
                <span className="font-mono text-[10px] text-slate-500 truncate block">{doc.storagePath || 'Local Vault Cache'}</span>
              </div>
            </div>
            {doc.description && (
              <p className="text-[11px] text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 font-medium">Notes: </span>{doc.description}
              </p>
            )}
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">COORDINATOR VERIFICATION</span>
              {doc.adminNotes ? (
                <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-1 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  "{doc.adminNotes}"
                </p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1 italic">No coordinator remarks recorded.</p>
              )}
            </div>

            {/* Quick Status Toggles */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-500 font-medium">Quick Action:</span>
              <button
                type="button"
                onClick={() => onStatusChange && onStatusChange(doc.id, 'Verified')}
                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold transition-colors"
              >
                ✓ Mark Verified
              </button>
              <button
                type="button"
                onClick={() => onStatusChange && onStatusChange(doc.id, 'Replacement Required')}
                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-semibold transition-colors"
              >
                ⚠ Needs Replacement
              </button>
              <button
                type="button"
                onClick={() => onStatusChange && onStatusChange(doc.id, 'Under Review')}
                className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-semibold transition-colors"
              >
                ⏳ Under Review
              </button>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
}
