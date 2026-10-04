import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Trash2, 
  ExternalLink, 
  Download,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import Modal from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { formatAttendance } from '../../../utils/internshipExcelSync';

export default function InternshipEditModal({ isOpen, onClose, record }) {
  const { updateInternshipRecord, uploadInternshipDocument, deleteInternshipDocument, showToast } = useApp();

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'documents'

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    location: '',
    startDate: '',
    endDate: '',
    duration: '',
    attendance: '',
    status: 'Not Started',
    certificateCollected: 'No',
    remarks: ''
  });

  // Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('COMPLETION_CERTIFICATE');
  const [docTitle, setDocTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        companyName: record.companyName || '',
        location: record.location || '',
        startDate: record.startDate || '',
        endDate: record.endDate || '',
        duration: record.duration || '',
        attendance: record.attendance || 'No leaves taken',
        status: record.status || 'Not Started',
        certificateCollected: record.certificateCollected || 'No',
        remarks: record.remarks || ''
      });
      setSelectedFile(null);
      setDocTitle('');
      setActiveTab('details');
    }
  }, [record]);

  if (!record) return null;

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    const cleanedAttendance = formatAttendance(formData.attendance);
    await updateInternshipRecord(record.id, {
      ...formData,
      attendance: cleanedAttendance || formData.attendance
    });
    onClose();
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    setIsUploading(true);
    try {
      await uploadInternshipDocument(record.id, {
        file: selectedFile,
        docType,
        title: docTitle.trim() || selectedFile.name
      });
      setSelectedFile(null);
      setDocTitle('');
    } catch (err) {
      showToast('Upload failed: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const docs = Array.isArray(record.documents) ? record.documents : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Internship Profile: ${record.studentName}`}
      subtitle={`Reg No: ${record.regNo} | Class: ${record.className || record.department}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        
        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Internship Details</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documents Vault</span>
            {docs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold">
                {docs.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: INTERNSHIP DETAILS */}
        {activeTab === 'details' && (
          <form onSubmit={handleSaveDetails} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="e.g. Airport Authority of India, Blue Dart"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internship Location / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g. Chennai, Bangalore, Coimbatore"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Date
                </label>
                <input
                  type="text"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  placeholder="e.g. 15 days, 30 days, 1 month"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internship Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Completed">Completed</option>
                  <option value="On Going">On Going</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Offer Received">Offer Received</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attendance / Leaves
                </label>
                <input
                  type="text"
                  value={formData.attendance}
                  onChange={(e) => handleInputChange('attendance', e.target.value)}
                  placeholder="e.g. 85%, No leaves taken, 30 days"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Certificate Collected?
                </label>
                <select
                  value={formData.certificateCollected}
                  onChange={(e) => handleInputChange('certificateCollected', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Yes">Yes (Collected)</option>
                  <option value="No">No (Not Collected)</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Remarks / Special Notes
              </label>
              <textarea
                rows={2}
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="e.g. Rescheduled after three days, excellent performance feedback, pending final report"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
              >
                Save Internship Details
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: DOCUMENTS VAULT */}
        {activeTab === 'documents' && (
          <div className="space-y-5">
            
            {/* Upload Area */}
            <form onSubmit={handleFileUpload} className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Upload New Internship Document</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Document Category
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  >
                    <option value="COMPLETION_CERTIFICATE">Completion Certificate</option>
                    <option value="OFFER_LETTER">Offer Letter / Selection Email</option>
                    <option value="NOC">NOC / Permission Letter</option>
                    <option value="ATTENDANCE_RECORD">Attendance Sheet / Log</option>
                    <option value="REPORT">Internship Report / Diary</option>
                    <option value="OTHER">Other Supporting Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Document Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g. AAI Certificate - July 2026"
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Choose File (PDF, PNG, JPG)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Document'}</span>
                </button>
              </div>
            </form>

            {/* List of Attached Documents */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Attached Documents ({docs.length})</span>
              </div>

              {docs.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                  No documents uploaded for this student yet. Upload an offer letter or completion certificate above.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {docs.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {d.title}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-blue-600 dark:text-blue-400">{d.docType}</span>
                            <span>•</span>
                            <span>{new Date(d.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {d.fileUrl && (
                          <a
                            href={d.fileUrl}
                            download={d.fileName || d.title}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            title="Download / View"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteInternshipDocument(record.id, d.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl shadow-sm transition-all"
              >
                Done
              </button>
            </div>

          </div>
        )}

      </div>
    </Modal>
  );
}
