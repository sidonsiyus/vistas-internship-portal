import React, { useState } from 'react';
import { 
  Building2, 
  Megaphone, 
  Plus, 
  Search, 
  Pin, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ExternalLink, 
  X, 
  Briefcase,
  Layers,
  Sparkles,
  Info,
  Users,
  UserPlus,
  UserCheck,
  MapPin,
  Mail,
  Send,
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS } from '../../mock/sampleData';

const COMPANY_STATUS_OPTIONS = [
  { value: 'REPLY_RECEIVED', label: 'Reply Received' },
  { value: 'INTERNSHIP_APPROVED', label: 'Internship Approved' },
  { value: 'INTERNSHIP_CONFIRMED', label: 'Internship Confirmed' },
  { value: 'INFO_REQUIRED', label: 'More Information Required' },
  { value: 'PENDING_STUDENT_ACTION', label: 'Pending Student Action' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'OPPORTUNITY_AVAILABLE', label: 'Opportunity Available' },
  { value: 'CAN_APPLY', label: 'Students Can Apply' },
  { value: 'NO_ACTION', label: 'No Further Action Required' }
];

export default function AnnouncementsManager() {
  const { 
    announcements, 
    students = [],
    createAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement, 
    toggleAnnouncementActive, 
    toggleAnnouncementPin 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const defaultFormState = {
    type: 'COMPANY_REPLY',
    category: 'Company Reply',
    title: '',
    content: '',
    companyName: '',
    companyLocation: '',
    companyContactEmail: '',
    requestSentDate: '',
    emailReference: '',
    companyStatus: 'INTERNSHIP_APPROVED',
    replyDate: new Date().toISOString().split('T')[0],
    department: 'All Departments',
    duration: '',
    eligibility: '',
    deadline: '',
    requiredDocuments: '',
    actionRequired: '',
    coordinatorNotes: '',
    applyLink: '',
    studentsIncluded: [],
    isPinned: true,
    isActive: true
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [formErrors, setFormErrors] = useState({});
  const [studentDirectorySearch, setStudentDirectorySearch] = useState('');
  const [expandedStudentsCardId, setExpandedStudentsCardId] = useState(null);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(defaultFormState);
    setFormErrors({});
    setStudentDirectorySearch('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann) => {
    setEditingId(ann.id);
    setFormData({
      type: ann.type || 'GENERAL',
      category: ann.category || 'Important',
      title: ann.title || '',
      content: ann.content || '',
      companyName: ann.companyName || '',
      companyLocation: ann.companyLocation || '',
      companyContactEmail: ann.companyContactEmail || '',
      requestSentDate: ann.requestSentDate || '',
      emailReference: ann.emailReference || '',
      companyStatus: ann.companyStatus || 'INTERNSHIP_APPROVED',
      replyDate: ann.replyDate || '',
      department: ann.department || 'All Departments',
      duration: ann.duration || '',
      eligibility: ann.eligibility || '',
      deadline: ann.deadline || '',
      requiredDocuments: ann.requiredDocuments || '',
      actionRequired: ann.actionRequired || '',
      coordinatorNotes: ann.coordinatorNotes || '',
      applyLink: ann.applyLink || '',
      studentsIncluded: Array.isArray(ann.studentsIncluded) ? [...ann.studentsIncluded] : [],
      isPinned: Boolean(ann.isPinned),
      isActive: ann.isActive !== false
    });
    setFormErrors({});
    setStudentDirectorySearch('');
    setIsModalOpen(true);
  };

  // Student list helpers
  const handleAddStudentFromDirectory = (std) => {
    // Check if already in list
    const alreadyExists = formData.studentsIncluded.some(
      s => (s.registerNumber && s.registerNumber === std.registerNumber)
    );
    if (alreadyExists) return;

    const newStudent = {
      name: std.name || '',
      registerNumber: std.registerNumber || '',
      department: std.department || (formData.department !== 'All Departments' ? formData.department : ''),
      year: std.year || '',
      section: std.section || '',
      contact: std.phone || std.email || ''
    };

    setFormData(prev => ({
      ...prev,
      studentsIncluded: [...prev.studentsIncluded, newStudent]
    }));
    setStudentDirectorySearch('');
  };

  const handleAddManualStudent = () => {
    const newStudent = {
      name: '',
      registerNumber: '',
      department: formData.department !== 'All Departments' ? formData.department : '',
      year: '',
      section: '',
      contact: ''
    };
    setFormData(prev => ({
      ...prev,
      studentsIncluded: [...prev.studentsIncluded, newStudent]
    }));
  };

  const handleUpdateStudent = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.studentsIncluded];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, studentsIncluded: updated };
    });
  };

  const handleRemoveStudent = (index) => {
    setFormData(prev => ({
      ...prev,
      studentsIncluded: prev.studentsIncluded.filter((_, i) => i !== index)
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.content.trim()) errors.content = 'Message/Content is required';
    if (formData.type === 'COMPANY_REPLY' && !formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingId) {
      await updateAnnouncement(editingId, formData);
    } else {
      await createAnnouncement(formData);
    }

    setIsModalOpen(false);
  };

  // Metrics
  const totalCount = announcements.length;
  const activeCount = announcements.filter(a => a.isActive !== false).length;
  const companyReplyCount = announcements.filter(a => a.type === 'COMPANY_REPLY').length;
  const pinnedCount = announcements.filter(a => a.isPinned).length;

  // Filtered
  const filteredList = announcements
    .filter(a => {
      if (activeFilter === 'ACTIVE') return a.isActive !== false;
      if (activeFilter === 'ARCHIVED') return a.isActive === false;
      if (activeFilter === 'COMPANY_REPLY') return a.type === 'COMPANY_REPLY';
      if (activeFilter === 'URGENT') return a.type === 'URGENT';
      if (activeFilter === 'GENERAL') return a.type === 'GENERAL' || a.type === 'INTERNSHIP_UPDATE';
      return true;
    })
    .filter(a => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.content && a.content.toLowerCase().includes(q)) ||
        (a.companyName && a.companyName.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Megaphone className="w-3.5 h-3.5" />
            <span>COMMUNICATION & NOTICES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Announcements & Company Updates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish company email responses and student notices to eliminate repetitive inquiries at the desk.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Update</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Posts</span>
          <div className="text-2xl font-bold text-slate-900 font-mono">{totalCount}</div>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase">Active for Students</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono">{activeCount}</div>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-blue-600 uppercase">Company Replies</span>
          <div className="text-2xl font-bold text-blue-600 font-mono">{companyReplyCount}</div>
        </div>
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm space-y-1">
          <span className="text-[11px] font-semibold text-amber-600 uppercase">Pinned to Top</span>
          <div className="text-2xl font-bold text-amber-600 font-mono">{pinnedCount}</div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'COMPANY_REPLY', label: 'Company Replies' },
            { id: 'URGENT', label: 'Urgent' },
            { id: 'GENERAL', label: 'General' },
            { id: 'ARCHIVED', label: 'Archived' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200/80 rounded-xl space-y-2">
            <Megaphone className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">No updates match your selected filter.</p>
          </div>
        ) : (
          filteredList.map(ann => (
            <div
              key={ann.id}
              className={`bg-white border p-4 sm:p-5 rounded-xl shadow-sm transition-all ${
                !ann.isActive 
                  ? 'opacity-60 border-slate-200 bg-slate-50' 
                  : ann.isPinned 
                  ? 'border-amber-300 bg-amber-50/20' 
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* Left Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    {ann.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Pin className="w-2.5 h-2.5" />
                        PINNED
                      </span>
                    )}

                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      ann.type === 'COMPANY_REPLY' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ann.type === 'URGENT'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {ann.type === 'COMPANY_REPLY' ? 'Company Reply' : ann.type === 'URGENT' ? 'Urgent' : ann.category || 'General'}
                    </span>

                    {/* Company Response Status if Company Reply */}
                    {ann.type === 'COMPANY_REPLY' && ann.companyStatus && (
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        {COMPANY_STATUS_OPTIONS.find(o => o.value === ann.companyStatus)?.label || ann.companyStatus}
                      </span>
                    )}

                    {ann.isActive ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        ARCHIVED
                      </span>
                    )}

                    {ann.companyName && (
                      <span className="text-[11px] text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-blue-600" />
                        {ann.companyName}
                      </span>
                    )}

                    {ann.companyLocation && (
                      <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200/60">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        {ann.companyLocation}
                      </span>
                    )}

                    {ann.studentsIncluded && ann.studentsIncluded.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Users className="w-3 h-3 text-blue-600" />
                        {ann.studentsIncluded.length} Students Included
                      </span>
                    )}
                  </div>

                  {/* Dates & Reference Subline */}
                  {(ann.requestSentDate || ann.replyDate || ann.emailReference) && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      {ann.requestSentDate && (
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3 text-slate-400" />
                          <span>Request Sent: <strong>{ann.requestSentDate}</strong></span>
                        </span>
                      )}
                      {ann.replyDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Reply Date: <strong>{ann.replyDate}</strong></span>
                        </span>
                      )}
                      {ann.emailReference && (
                        <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          Ref: {ann.emailReference}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Title & Message */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>

                  {/* Action preview */}
                  {ann.actionRequired && (
                    <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 pt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                      <span className="truncate"><strong>Action:</strong> {ann.actionRequired}</span>
                    </div>
                  )}

                  {/* Students Included Quick Toggle in Card */}
                  {ann.studentsIncluded && ann.studentsIncluded.length > 0 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setExpandedStudentsCardId(expandedStudentsCardId === ann.id ? null : ann.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>
                          {expandedStudentsCardId === ann.id ? 'Hide Included Students' : `View Included Students (${ann.studentsIncluded.length})`}
                        </span>
                        {expandedStudentsCardId === ann.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Expandable Students Table */}
                      {expandedStudentsCardId === ann.id && (
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-200">
                                <th className="pb-1.5 font-semibold">#</th>
                                <th className="pb-1.5 font-semibold">Name</th>
                                <th className="pb-1.5 font-semibold">Reg No</th>
                                <th className="pb-1.5 font-semibold">Department</th>
                                <th className="pb-1.5 font-semibold">Year & Sec</th>
                                <th className="pb-1.5 font-semibold">Contact</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/60 font-medium text-slate-700">
                              {ann.studentsIncluded.map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-100/50">
                                  <td className="py-1.5 font-mono text-[10px] text-slate-400">{idx + 1}</td>
                                  <td className="py-1.5 text-slate-900 font-semibold">{s.name}</td>
                                  <td className="py-1.5 font-mono text-blue-600">{s.registerNumber}</td>
                                  <td className="py-1.5 text-slate-600">{s.department || '-'}</td>
                                  <td className="py-1.5 text-slate-600">{s.year || ''} {s.section || ''}</td>
                                  <td className="py-1.5 text-slate-500 text-[11px]">{s.contact || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 justify-end">
                  
                  {/* Toggle Pin */}
                  <button
                    onClick={() => toggleAnnouncementPin(ann.id)}
                    className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                      ann.isPinned
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                    }`}
                    title={ann.isPinned ? 'Unpin' : 'Pin to top'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Active */}
                  <button
                    onClick={() => toggleAnnouncementActive(ann.id)}
                    className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                      ann.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                    }`}
                    title={ann.isActive ? 'Deactivate notice' : 'Activate notice'}
                  >
                    {ann.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(ann)}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                    title="Edit announcement"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete notice "${ann.title}"?`)) {
                        deleteAnnouncement(ann.id);
                      }
                    }}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    {editingId ? 'Edit Announcement / Company Update' : 'Create New Announcement / Company Update'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Enter details once to publish across the Banner and Updates board.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              
              {/* Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Update Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'COMPANY_REPLY', label: 'Company Reply', icon: Building2 },
                    { id: 'INTERNSHIP_UPDATE', label: 'Internship Update', icon: Briefcase },
                    { id: 'URGENT', label: 'Urgent Notice', icon: AlertTriangle },
                    { id: 'GENERAL', label: 'General Notice', icon: Megaphone },
                  ].map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setFormData({ ...formData, type: t.id })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                          formData.type === t.id
                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 mb-1.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC COMPANY REPLY FIELDS */}
              {formData.type === 'COMPANY_REPLY' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-700">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Company Reply & Student Specifics</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Applies only to targeted students
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Company Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. IndiGo Airlines, Air India SATS"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      {formErrors.companyName && (
                        <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.companyName}</span>
                      )}
                    </div>

                    {/* Company Response Status */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Response Status</label>
                      <select
                        value={formData.companyStatus}
                        onChange={(e) => setFormData({ ...formData, companyStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        {COMPANY_STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Company Location / Branch */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Company Location / Branch</label>
                      <input
                        type="text"
                        placeholder="e.g. Chennai Airport Terminal 2 / Guindy Tech Park"
                        value={formData.companyLocation}
                        onChange={(e) => setFormData({ ...formData, companyLocation: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Company Contact / HR Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">HR / Coordinator Contact Email</label>
                      <input
                        type="text"
                        placeholder="e.g. hr.recruitment@company.com"
                        value={formData.companyContactEmail}
                        onChange={(e) => setFormData({ ...formData, companyContactEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Date Request Sent */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Date Request Sent</label>
                      <input
                        type="date"
                        value={formData.requestSentDate}
                        onChange={(e) => setFormData({ ...formData, requestSentDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Reply Date */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Date Reply Received</label>
                      <input
                        type="date"
                        value={formData.replyDate}
                        onChange={(e) => setFormData({ ...formData, replyDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Email / Letter Reference */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Reference / Dispatch No.</label>
                      <input
                        type="text"
                        placeholder="e.g. VELS/INT/2026/XYZ-042"
                        value={formData.emailReference}
                        onChange={(e) => setFormData({ ...formData, emailReference: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Target Department */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Eligible Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value="All Departments">All Departments</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Internship Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 1 Month / 3 Months (Full-Time)"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Application Deadline */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting / Acceptance Deadline</label>
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                  </div>

                  {/* Required Documents */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Required Documents to Bring / Submit</label>
                    <input
                      type="text"
                      placeholder="e.g. College ID Card, 2 Passport Photos, Signed Indemnity Bond"
                      value={formData.requiredDocuments}
                      onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* STUDENTS INCLUDED IN THIS COMPANY REQUEST */}
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-700">
                          <Users className="w-3.5 h-3.5" />
                          <span>Students Included in This Company Request</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold">
                            {formData.studentsIncluded.length} Students
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Specify the students who were included in the institutional request email to the company.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddManualStudent}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold self-start sm:self-auto transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add Student Row</span>
                      </button>
                    </div>

                    {/* Quick Search Student Directory */}
                    <div className="relative">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Quick search student database by name or reg no (e.g. Aakash, 25326101)..."
                          value={studentDirectorySearch}
                          onChange={(e) => setStudentDirectorySearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Dropdown matching results */}
                      {studentDirectorySearch.trim().length >= 2 && (
                        <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                          {students
                            .filter(s => {
                              const q = studentDirectorySearch.toLowerCase();
                              const inList = formData.studentsIncluded.some(item => item.registerNumber === s.registerNumber);
                              if (inList) return false;
                              return (
                                (s.name && s.name.toLowerCase().includes(q)) ||
                                (s.registerNumber && s.registerNumber.toLowerCase().includes(q)) ||
                                (s.department && s.department.toLowerCase().includes(q))
                              );
                            })
                            .slice(0, 6)
                            .map(s => (
                              <button
                                key={s.id || s.registerNumber}
                                type="button"
                                onClick={() => handleAddStudentFromDirectory(s)}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between text-xs transition-colors"
                              >
                                <div>
                                  <span className="font-semibold text-slate-900 block">{s.name}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {s.registerNumber} • {s.department} • {s.year} {s.section}
                                  </span>
                                </div>
                                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  + Select
                                </span>
                              </button>
                            ))}
                          {students.filter(s => {
                            const q = studentDirectorySearch.toLowerCase();
                            return (
                              (s.name && s.name.toLowerCase().includes(q)) ||
                              (s.registerNumber && s.registerNumber.toLowerCase().includes(q))
                            );
                          }).length === 0 && (
                            <div className="p-3 text-center text-xs text-slate-500">
                              No matching students found. Use "Add Student Row" to input manually.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Students Table / Rows */}
                    {formData.studentsIncluded.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center space-y-1">
                        <Users className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="text-xs text-slate-600 font-medium">No students attached to this company reply yet.</p>
                        <p className="text-[10px] text-slate-400">
                          Search from student database above or click "+ Add Student Row" to add.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {formData.studentsIncluded.map((std, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 p-2.5 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                          >
                            <div className="sm:col-span-1 flex items-center justify-center font-mono text-[10px] text-slate-400 font-bold">
                              #{idx + 1}
                            </div>
                            
                            {/* Student Name */}
                            <div className="sm:col-span-3">
                              <input
                                type="text"
                                placeholder="Student Name *"
                                value={std.name}
                                onChange={(e) => handleUpdateStudent(idx, 'name', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            {/* Register Number */}
                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                placeholder="Reg No *"
                                value={std.registerNumber}
                                onChange={(e) => handleUpdateStudent(idx, 'registerNumber', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                              />
                            </div>

                            {/* Department */}
                            <div className="sm:col-span-3">
                              <input
                                type="text"
                                placeholder="Department"
                                value={std.department}
                                onChange={(e) => handleUpdateStudent(idx, 'department', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            {/* Year / Sec */}
                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                placeholder="Year & Sec"
                                value={std.year ? `${std.year} ${std.section || ''}`.trim() : (std.section || '')}
                                onChange={(e) => handleUpdateStudent(idx, 'year', e.target.value)}
                                className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            {/* Remove button */}
                            <div className="sm:col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveStudent(idx)}
                                className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Remove student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Eligibility */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                    <input
                      type="text"
                      placeholder="e.g. Min 6.5 CGPA, No active arrears, 2nd & 3rd Year students"
                      value={formData.eligibility}
                      onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Action Required */}
                  <div>
                    <label className="block text-xs font-semibold text-emerald-700 mb-1">
                      Action Required for Students (Highlight Box)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Submit resume online before Sept 15. Do not book appointment for token."
                      value={formData.actionRequired}
                      onChange={(e) => setFormData({ ...formData, actionRequired: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Coordinator Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">
                      Coordinator Desk Note (Instructions / Advice)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Company HR agreed to take 15 students. Shortlist will be posted directly here."
                      value={formData.coordinatorNotes}
                      onChange={(e) => setFormData({ ...formData, coordinatorNotes: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Apply Link */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Application Link / Portal URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://company.com/careers"
                      value={formData.applyLink}
                      onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                </div>
              )}

              {/* Title & Main Content */}
              <div className="space-y-3.5">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Announcement Headline / Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IndiGo Airlines Summer Internship Opportunities"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  {formErrors.title && (
                    <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.title}</span>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Message / Update Content *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide detailed instructions or the response details..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  {formErrors.content && (
                    <span className="text-[10px] text-rose-600 mt-0.5 block">{formErrors.content}</span>
                  )}
                </div>

              </div>

              {/* Switches: Pinned & Active */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Pin Toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded bg-white border-slate-300 text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">Pin this notice to top</span>
                    <span className="text-[11px] text-slate-500">Always displays at the top of banner and feed</span>
                  </div>
                </label>

                {/* Active Toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded bg-white border-slate-300 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">Active & Published</span>
                    <span className="text-[11px] text-slate-500">Visible to students immediately</span>
                  </div>
                </label>

              </div>

              {/* Modal Submit & Cancel */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  {editingId ? 'Save Changes' : 'Publish Update'}
                </button>
              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}
