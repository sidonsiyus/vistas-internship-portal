import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Users, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2, 
  Calendar, 
  Edit3, 
  FileText, 
  RefreshCw, 
  Settings2,
  ChevronDown,
  Layers,
  FileCheck,
  UserPlus,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import ClassSelectionModal from './ClassSelectionModal';
import InternshipEditModal from './InternshipEditModal';
import GoogleSheetConfigModal from './GoogleSheetConfigModal';
import AddStudentToClassModal from './AddStudentToClassModal';
import { exportInternshipWorkbook, formatAttendance, cleanDisplayDate, ALL_CLASSES } from '../../../utils/internshipExcelSync';

export default function ClassInchargeDashboard() {
  const { 
    internshipRecords = [], 
    selectedClassIncharge, 
    setSelectedClassIncharge,
    googleSheetWebhookUrl,
    googleSheetBrowserUrl,
    lastGSheetSyncTime,
    syncWithGoogleSheet,
    restoreOfficialDatabase,
    showToast 
  } = useApp();

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(!selectedClassIncharge);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isGSheetModalOpen, setIsGSheetModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isSyncingGSheet, setIsSyncingGSheet] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Completed' | 'On Going' | 'Not Started' | 'PENDING_CERT'

  // Filter records for active class
  const classRecords = useMemo(() => {
    if (!selectedClassIncharge) return [];
    return internshipRecords.filter(r => 
      (r.className || '').trim().toUpperCase() === selectedClassIncharge.trim().toUpperCase()
    ).sort((a, b) => (a.regNo || '').localeCompare(b.regNo || ''));
  }, [internshipRecords, selectedClassIncharge]);

  // KPIs
  const totalCount = classRecords.length;
  const completedCount = classRecords.filter(r => r.status === 'Completed').length;
  const ongoingCount = classRecords.filter(r => r.status === 'On Going').length;
  const notStartedCount = classRecords.filter(r => r.status === 'Not Started' || !r.status).length;
  const certCollectedCount = classRecords.filter(r => r.certificateCollected === 'Yes' || r.certificateCollected === 'Collected').length;
  const certPendingCount = classRecords.filter(r => r.status === 'Completed' && (r.certificateCollected === 'No' || r.certificateCollected === 'Pending' || !r.certificateCollected)).length;

  // Filtered displayed records
  const filteredRecords = useMemo(() => {
    return classRecords.filter(r => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q || 
        (r.studentName || '').toLowerCase().includes(q) || 
        (r.regNo || '').toLowerCase().includes(q) ||
        (r.companyName || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'Completed') return r.status === 'Completed';
      if (statusFilter === 'On Going') return r.status === 'On Going';
      if (statusFilter === 'Not Started') return r.status === 'Not Started' || !r.status;
      if (statusFilter === 'PENDING_CERT') {
        return r.status === 'Completed' && (r.certificateCollected === 'No' || r.certificateCollected === 'Pending');
      }

      return true;
    });
  }, [classRecords, searchTerm, statusFilter]);

  const handleExportThisClass = () => {
    if (!selectedClassIncharge) return;
    exportInternshipWorkbook(internshipRecords, selectedClassIncharge);
    showToast(`Exported ${selectedClassIncharge} Excel spreadsheet`, 'success');
    setShowExportMenu(false);
  };

  const handleExportAllClasses = () => {
    exportInternshipWorkbook(internshipRecords, null);
    showToast('Exported complete 13-class workbook (.xlsx)', 'success');
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner / Class Switcher Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 shadow-xs shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Class Incharge Desk
                </h1>
                {selectedClassIncharge && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {selectedClassIncharge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                <span>
                  {selectedClassIncharge 
                    ? `Active class roster: ${totalCount} students enrolled`
                    : 'Select your class to manage student internship details and documentation'}
                </span>
                {lastGSheetSyncTime && (
                  <>
                    <span>•</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      G-Sheet synced {new Date(lastGSheetSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Add Student Button */}
            {selectedClassIncharge && (
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                title="Add student missing from this class section"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Student</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsClassModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{selectedClassIncharge ? 'Switch Class' : 'Choose Class'}</span>
            </button>

            {/* Excel Export Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Export Excel</span>
                <ChevronDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={handleExportThisClass}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between cursor-pointer"
                  >
                    <span>Export {selectedClassIncharge || 'Active Class'} (.xlsx)</span>
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={handleExportAllClasses}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    <span>Export All 13 Classes (.xlsx)</span>
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Restore Database Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Restore the official database of 531 students across all 14 classes? Any uploaded documents will be preserved.')) {
                  restoreOfficialDatabase(false);
                }
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Restore official 531 student database across all classes"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Restore Roster</span>
            </button>

            {/* Two-Way Google Sheets Sync Buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (googleSheetBrowserUrl) {
                    window.open(googleSheetBrowserUrl, '_blank', 'noopener,noreferrer');
                  } else {
                    setIsGSheetModalOpen(true);
                  }
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  googleSheetBrowserUrl
                    ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
                title={googleSheetBrowserUrl ? "Open Google Sheet in a new tab" : "Connect or paste your Google Sheet link"}
              >
                <ExternalLink className={`w-3.5 h-3.5 ${googleSheetBrowserUrl ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>Open Sheet ↗</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!googleSheetWebhookUrl) {
                    setIsGSheetModalOpen(true);
                  } else {
                    setIsSyncingGSheet(true);
                    try {
                      await syncWithGoogleSheet(selectedClassIncharge);
                    } finally {
                      setIsSyncingGSheet(false);
                    }
                  }
                }}
                disabled={isSyncingGSheet}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  googleSheetWebhookUrl
                    ? 'bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
                title={googleSheetWebhookUrl ? "Two-Way Sync: Pull latest changes from Google Sheet" : "Configure Google Sheet sync"}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isSyncingGSheet ? 'animate-spin' : ''}`} />
                <span>{isSyncingGSheet ? 'Syncing...' : (googleSheetWebhookUrl ? 'Sync G-Sheet' : 'Connect G-Sheet')}</span>
                {googleSheetWebhookUrl && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" title="Connected" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsGSheetModalOpen(true)}
                className="p-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all shadow-xs cursor-pointer"
                title="Google Sheet Two-Way Sync Settings"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* KPI Summary Cards */}
        {selectedClassIncharge && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
            
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Class Enrolled</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{totalCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
              <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>On Going</span>
              </div>
              <div className="text-xl font-bold text-blue-800 dark:text-blue-300 mt-0.5">{ongoingCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed</span>
              </div>
              <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-0.5">{completedCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60">
              <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1">
                <FileCheck className="w-3 h-3" />
                <span>Cert. Collected</span>
              </div>
              <div className="text-xl font-bold text-purple-800 dark:text-purple-300 mt-0.5">{certCollectedCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Pending Entry</span>
              </div>
              <div className="text-xl font-bold text-amber-800 dark:text-amber-300 mt-0.5">{notStartedCount}</div>
            </div>

          </div>
        )}
      </div>

      {/* Roster Table Section */}
      {selectedClassIncharge ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-colors">
          
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, reg no, or company..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: `All (${classRecords.length})` },
                { id: 'On Going', label: `Ongoing (${ongoingCount})` },
                { id: 'Completed', label: `Completed (${completedCount})` },
                { id: 'PENDING_CERT', label: `Cert. Pending (${certPendingCount})` },
                { id: 'Not Started', label: `Not Started (${notStartedCount})` }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === f.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Reg No & Student</th>
                  <th className="py-3 px-4">Company & Location</th>
                  <th className="py-3 px-4">Dates & Duration</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Certificate</th>
                  <th className="py-3 px-4">Docs</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 px-4 text-center text-slate-400 text-xs">
                      {classRecords.length === 0 ? (
                        <div className="max-w-md mx-auto space-y-3 py-4">
                          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            No student records found in {selectedClassIncharge || 'this class'}.
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs">
                            If your data was cleared by a sync or an empty sheet was loaded, click below to immediately restore all 531 official student records across all 14 classes.
                          </p>
                          <button
                            type="button"
                            onClick={() => restoreOfficialDatabase(false)}
                            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>↺ Restore Official Database (531 Students)</span>
                          </button>
                        </div>
                      ) : (
                        <span>No student records found matching the current search or filter.</span>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => {
                    const docCount = Array.isArray(r.documents) ? r.documents.length : 0;
                    const isCertCollected = r.certificateCollected === 'Yes' || r.certificateCollected === 'Collected';

                    return (
                      <tr 
                        key={r.id || r.regNo} 
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        {/* Student Info */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white leading-tight">
                            {r.studentName}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                            {r.regNo}
                          </div>
                        </td>

                        {/* Company & Location */}
                        <td className="py-3 px-4">
                          {r.companyName ? (
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {r.companyName}
                              </div>
                              {r.location && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                  <span>{r.location}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">— Not entered —</span>
                          )}
                        </td>

                        {/* Dates & Duration */}
                        <td className="py-3 px-4">
                          {r.startDate || r.endDate ? (
                            <div>
                              <div className="font-medium text-slate-700 dark:text-slate-300">
                                {cleanDisplayDate(r.startDate) || '—'} → {cleanDisplayDate(r.endDate) || '—'}
                              </div>
                              {r.duration && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {r.duration}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">—</span>
                          )}
                        </td>

                        {/* Attendance */}
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {formatAttendance(r.attendance) || '—'}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {r.status === 'Completed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed
                            </span>
                          ) : r.status === 'On Going' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <Clock className="w-3 h-3" />
                              On Going
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Not Started
                            </span>
                          )}
                        </td>

                        {/* Certificate */}
                        <td className="py-3 px-4">
                          {isCertCollected ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Collected
                            </span>
                          ) : r.status === 'Completed' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              Pending
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Documents Count */}
                        <td className="py-3 px-4">
                          {docCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <FileText className="w-3 h-3" />
                              <span>{docCount}</span>
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600 text-xs">0</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setEditingRecord(r)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all flex items-center gap-1 ml-auto shadow-2xs cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit / Docs</span>
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900 mx-auto flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Please Select Your Class
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Choose your assigned class and section (e.g. AERO 2A, BSC 3B, BBA 2A) to view your students and manage their internship records.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto mb-5">
            {ALL_CLASSES.map(cls => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClassIncharge(cls)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all cursor-pointer"
              >
                {cls}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsClassModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Choose from List
            </button>
            <button
              type="button"
              onClick={() => restoreOfficialDatabase(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restore Official Database</span>
            </button>
          </div>
        </div>
      )}

      {/* Class Selection Modal */}
      <ClassSelectionModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        selectedClass={selectedClassIncharge}
        onSelectClass={(cls) => {
          setSelectedClassIncharge(cls);
          showToast(`Switched to class ${cls}`, 'info');
        }}
        records={internshipRecords}
      />

      {/* Add Student to Class Modal */}
      <AddStudentToClassModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        targetClass={selectedClassIncharge}
      />

      {/* Internship Record Edit & Document Upload Modal */}
      <InternshipEditModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        record={editingRecord}
      />

      {/* Google Sheets Sync Configuration Modal */}
      <GoogleSheetConfigModal
        isOpen={isGSheetModalOpen}
        onClose={() => setIsGSheetModalOpen(false)}
      />

    </div>
  );
}
