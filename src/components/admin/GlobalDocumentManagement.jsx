import React, { useState, useMemo } from 'react';
import { 
  FolderGit2, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Users, 
  FileCheck, 
  Sparkles,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS } from '../../mock/sampleData';
import { DOCUMENT_TYPES } from './DocumentUploadModal';
import DocumentPreviewModal from './DocumentPreviewModal';

export default function GlobalDocumentManagement() {
  const { 
    documents = [], 
    students = [], 
    updateDocumentStatus, 
    deleteStudentDocument, 
    getDocumentSignedUrl,
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  // Preview & delete state
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState(null);

  // Status edit modal/popover
  const [statusEditDoc, setStatusEditDoc] = useState(null);
  const [newStatus, setNewStatus] = useState('Verified');
  const [statusNotes, setStatusNotes] = useState('');

  // Extract companies list from documents
  const allCompanies = useMemo(() => {
    return Array.from(new Set(
      documents
        .filter(d => d.companyName && d.companyName.trim())
        .map(d => d.companyName.trim())
    ));
  }, [documents]);

  // Overall metrics
  const totalCount = documents.length;
  const verifiedCount = documents.filter(d => d.status === 'Verified').length;
  const reviewCount = documents.filter(d => d.status === 'Under Review' || d.status === 'Uploaded').length;
  const replacementCount = documents.filter(d => d.status === 'Replacement Required').length;

  // Filtered list
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = doc.documentTitle?.toLowerCase().includes(q);
        const matchStudent = doc.studentName?.toLowerCase().includes(q);
        const matchReg = doc.studentRegisterNumber?.toLowerCase().includes(q);
        const matchFile = doc.fileName?.toLowerCase().includes(q);
        const matchCompany = doc.companyName?.toLowerCase().includes(q);
        if (!matchTitle && !matchStudent && !matchReg && !matchFile && !matchCompany) {
          return false;
        }
      }

      // Type
      if (selectedType !== 'ALL' && doc.documentType !== selectedType) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL' && doc.status !== selectedStatus) {
        return false;
      }

      // Dept
      if (selectedDept !== 'ALL' && doc.studentDepartment !== selectedDept) {
        return false;
      }

      // Company
      if (selectedCompany !== 'ALL' && doc.companyName !== selectedCompany) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'NEWEST') {
        return new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime();
      }
      if (sortBy === 'OLDEST') {
        return new Date(a.uploadedAt || 0).getTime() - new Date(b.uploadedAt || 0).getTime();
      }
      if (sortBy === 'STUDENT') {
        return (a.studentName || '').localeCompare(b.studentName || '');
      }
      if (sortBy === 'TITLE') {
        return (a.documentTitle || '').localeCompare(b.documentTitle || '');
      }
      return 0;
    });
  }, [documents, searchQuery, selectedType, selectedStatus, selectedDept, selectedCompany, sortBy]);

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

  const handleOpenStatusModal = (doc) => {
    setStatusEditDoc(doc);
    setNewStatus(doc.status || 'Verified');
    setStatusNotes(doc.adminNotes || '');
  };

  const handleSaveStatusModal = async () => {
    if (statusEditDoc) {
      await updateDocumentStatus(statusEditDoc.id, newStatus, statusNotes);
      setStatusEditDoc(null);
    }
  };

  const handleExportCsv = () => {
    if (filteredDocs.length === 0) {
      showToast('No documents to export', 'warning');
      return;
    }
    const headers = ['Register No', 'Student Name', 'Department', 'Document Title', 'Type', 'Company', 'Status', 'Version', 'File Name', 'Uploaded Date', 'Admin Notes'];
    const rows = filteredDocs.map(d => [
      `"${d.studentRegisterNumber || ''}"`,
      `"${d.studentName || ''}"`,
      `"${d.studentDepartment || ''}"`,
      `"${d.documentTitle || ''}"`,
      `"${d.documentType || ''}"`,
      `"${d.companyName || ''}"`,
      `"${d.status || ''}"`,
      `"${d.version || 1}"`,
      `"${d.fileName || ''}"`,
      `"${new Date(d.uploadedAt).toLocaleDateString()}"`,
      `"${(d.adminNotes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = window.document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VISTAS_Internship_Documents_${new Date().toISOString().split('T')[0]}.csv`);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    showToast('Exported document roster to CSV', 'success');
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>CENTRAL REPOSITORY & AUDIT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Student Document Vault & Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit, verify, and track official student internship submissions across all departments.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs shadow-xs transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export Roster (CSV)</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Files in Vault</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{totalCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase">Verified Dossiers</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono">{verifiedCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-amber-600 uppercase">Under Review</span>
          <div className="text-2xl font-bold text-amber-600 font-mono">{reviewCount}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-rose-600 uppercase">Needs Replacement</span>
          <div className="text-2xl font-bold text-rose-600 font-mono">{replacementCount}</div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, register no, file title, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Quick Clear */}
          {(searchQuery || selectedType !== 'ALL' || selectedStatus !== 'ALL' || selectedDept !== 'ALL' || selectedCompany !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedStatus('ALL');
                setSelectedDept('ALL');
                setSelectedCompany('ALL');
              }}
              className="px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Selects */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {DOCUMENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Verified">🟢 Verified</option>
            <option value="Under Review">🟡 Under Review</option>
            <option value="Replacement Required">🔴 Replacement Required</option>
            <option value="Uploaded">🔵 Uploaded</option>
            <option value="Rejected">⚫ Rejected</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="NEWEST">Sort: Newest Uploaded</option>
            <option value="OLDEST">Sort: Oldest First</option>
            <option value="STUDENT">Sort: Student Name</option>
            <option value="TITLE">Sort: Document Title</option>
          </select>
        </div>
      </div>

      {/* Documents Table / Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {filteredDocs.length === 0 ? (
          <div className="py-14 px-4 text-center space-y-2">
            <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No documents found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No files match your query or filters. Upload documents via the Student Directory to populate the vault.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Document Title & File</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{doc.studentName}</span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">Reg: {doc.studentRegisterNumber}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">{doc.studentDepartment}</span>
                      </div>
                    </td>

                    {/* Document Title & File */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2 max-w-xs">
                        <div 
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0 cursor-pointer hover:bg-blue-100 transition-colors mt-0.5"
                          title="Preview Document"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <span 
                              onClick={() => setPreviewDoc(doc)}
                              className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer truncate block"
                            >
                              {doc.documentTitle}
                            </span>
                            <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 shrink-0">
                              v{doc.version || 1}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 block truncate">
                            {doc.fileName} ({(doc.fileSize / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {doc.documentType}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="py-3 px-4">
                      {doc.companyName ? (
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {doc.companyName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">--</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleOpenStatusModal(doc)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all hover:ring-2 hover:ring-blue-500/20 ${getStatusBadge(doc.status)}`}
                        title="Click to change status"
                      >
                        ● {doc.status}
                      </button>
                    </td>

                    {/* Upload Date */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingDocId(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

      {/* Status Edit Modal */}
      {statusEditDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Update Status: {statusEditDoc.documentTitle}
            </h3>
            <div className="space-y-2 text-xs">
              <label className="block text-slate-600 dark:text-slate-400">Verification Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="Verified">🟢 Verified (Approved)</option>
                <option value="Under Review">🟡 Under Review</option>
                <option value="Replacement Required">🔴 Replacement Required</option>
                <option value="Uploaded">🔵 Uploaded</option>
                <option value="Rejected">⚫ Rejected</option>
              </select>

              <label className="block text-slate-600 dark:text-slate-400 pt-1">Coordinator Remarks</label>
              <textarea
                rows="2"
                placeholder="Add verification notes..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusEditDoc(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStatusModal}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Save
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
                Are you sure you want to permanently delete this document? Both storage file and database record will be removed.
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
