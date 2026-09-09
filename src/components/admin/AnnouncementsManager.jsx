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
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS } from '../../mock/sampleData';

const COMPANY_STATUS_OPTIONS = [
  { value: 'REPLY_RECEIVED', label: 'Reply Received' },
  { value: 'OPPORTUNITY_AVAILABLE', label: 'Opportunity Available' },
  { value: 'CAN_APPLY', label: 'Students Can Apply' },
  { value: 'INFO_REQUIRED', label: 'More Information Required' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'NO_ACTION', label: 'No Further Action Required' }
];

export default function AnnouncementsManager() {
  const { 
    announcements, 
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
  const [formData, setFormData] = useState({
    type: 'COMPANY_REPLY',
    category: 'Company Reply',
    title: '',
    content: '',
    companyName: '',
    companyStatus: 'OPPORTUNITY_AVAILABLE',
    replyDate: new Date().toISOString().split('T')[0],
    department: 'All Departments',
    duration: '',
    eligibility: '',
    deadline: '',
    actionRequired: '',
    coordinatorNotes: '',
    applyLink: '',
    isPinned: false,
    isActive: true
  });

  const [formErrors, setFormErrors] = useState({});

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      type: 'COMPANY_REPLY',
      category: 'Company Reply',
      title: '',
      content: '',
      companyName: '',
      companyStatus: 'OPPORTUNITY_AVAILABLE',
      replyDate: new Date().toISOString().split('T')[0],
      department: 'All Departments',
      duration: '',
      eligibility: '',
      deadline: '',
      actionRequired: '',
      coordinatorNotes: '',
      applyLink: '',
      isPinned: false,
      isActive: true
    });
    setFormErrors({});
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
      companyStatus: ann.companyStatus || 'REPLY_RECEIVED',
      replyDate: ann.replyDate || '',
      department: ann.department || 'All Departments',
      duration: ann.duration || '',
      eligibility: ann.eligibility || '',
      deadline: ann.deadline || '',
      actionRequired: ann.actionRequired || '',
      coordinatorNotes: ann.coordinatorNotes || '',
      applyLink: ann.applyLink || '',
      isPinned: Boolean(ann.isPinned),
      isActive: ann.isActive !== false
    });
    setFormErrors({});
    setIsModalOpen(true);
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
    <div className="space-y-7 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">
            <Megaphone className="w-3.5 h-3.5" />
            <span>COMMUNICATION & NOTICES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Announcements & Company Updates
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish company email responses and student notices to eliminate repetitive inquiries at the desk.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Update</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Posts</span>
          <div className="text-2xl font-bold text-white font-mono">{totalCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase">Active for Students</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{activeCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-blue-400 uppercase">Company Replies</span>
          <div className="text-2xl font-bold text-blue-400 font-mono">{companyReplyCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-amber-400 uppercase">Pinned to Top</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">{pinnedCount}</div>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
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
          <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <Megaphone className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No updates match your selected filter.</p>
          </div>
        ) : (
          filteredList.map(ann => (
            <div
              key={ann.id}
              className={`bg-slate-900 border p-4 sm:p-5 rounded-xl transition-all ${
                !ann.isActive 
                  ? 'opacity-60 border-slate-800' 
                  : ann.isPinned 
                  ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/10 to-slate-900' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* Left Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    {ann.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        <Pin className="w-2.5 h-2.5" />
                        PINNED
                      </span>
                    )}

                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      ann.type === 'COMPANY_REPLY' 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : ann.type === 'URGENT'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    }`}>
                      {ann.type === 'COMPANY_REPLY' ? 'Company Reply' : ann.type === 'URGENT' ? 'Urgent' : ann.category || 'General'}
                    </span>

                    {ann.isActive ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        ARCHIVED
                      </span>
                    )}

                    {ann.companyName && (
                      <span className="text-[11px] text-slate-300 font-semibold bg-slate-800 px-2 py-0.5 rounded">
                        {ann.companyName}
                      </span>
                    )}

                    {ann.replyDate && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ann.replyDate}
                      </span>
                    )}
                  </div>

                  {/* Title & Message */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                      {ann.content}
                    </p>
                  </div>

                  {/* Action preview */}
                  {ann.actionRequired && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate"><strong>Action:</strong> {ann.actionRequired}</span>
                    </div>
                  )}

                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 justify-end">
                  
                  {/* Toggle Pin */}
                  <button
                    onClick={() => toggleAnnouncementPin(ann.id)}
                    className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                      ann.isPinned
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
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
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                    }`}
                    title={ann.isActive ? 'Deactivate notice' : 'Activate notice'}
                  >
                    {ann.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(ann)}
                    className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
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
                    className="p-2 rounded-lg bg-slate-950 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {editingId ? 'Edit Announcement / Company Update' : 'Create New Announcement / Company Update'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Enter details once to publish across the Banner and Updates board.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              
              {/* Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
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
                            ? 'bg-blue-600/15 border-blue-500 text-blue-400 shadow'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
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
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-400">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Company Reply Specific Fields</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* Company Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. IndiGo Airlines, Zoho Corp"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      {formErrors.companyName && (
                        <span className="text-[10px] text-rose-400 mt-0.5 block">{formErrors.companyName}</span>
                      )}
                    </div>

                    {/* Company Response Status */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Response Status</label>
                      <select
                        value={formData.companyStatus}
                        onChange={(e) => setFormData({ ...formData, companyStatus: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {COMPANY_STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Reply Date */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Date Reply Received</label>
                      <input
                        type="date"
                        value={formData.replyDate}
                        onChange={(e) => setFormData({ ...formData, replyDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Target Department */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Eligible Department</label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="All Departments">All Departments</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Internship Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 3 Months / 6 Months"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Application Deadline */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Application Deadline</label>
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                  </div>

                  {/* Eligibility */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Eligibility Criteria</label>
                    <input
                      type="text"
                      placeholder="e.g. Min 6.5 CGPA, No active arrears, 2nd & 3rd Year students"
                      value={formData.eligibility}
                      onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Action Required */}
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 mb-1">
                      Action Required for Students (Highlight Box)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Submit resume online before Sept 15. Do not book appointment for token."
                      value={formData.actionRequired}
                      onChange={(e) => setFormData({ ...formData, actionRequired: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Coordinator Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-blue-400 mb-1">
                      Coordinator Desk Note (Instructions / Advice)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Company HR agreed to take 15 students. Shortlist will be posted directly here."
                      value={formData.coordinatorNotes}
                      onChange={(e) => setFormData({ ...formData, coordinatorNotes: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Apply Link */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Application Link / Portal URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://company.com/careers"
                      value={formData.applyLink}
                      onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                </div>
              )}

              {/* Title & Main Content */}
              <div className="space-y-3.5">
                
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Announcement Headline / Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IndiGo Airlines Summer Internship Opportunities"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {formErrors.title && (
                    <span className="text-[10px] text-rose-400 mt-0.5 block">{formErrors.title}</span>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Detailed Message / Update Content *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide detailed instructions or the response details..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  {formErrors.content && (
                    <span className="text-[10px] text-rose-400 mt-0.5 block">{formErrors.content}</span>
                  )}
                </div>

              </div>

              {/* Switches: Pinned & Active */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                
                {/* Pin Toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <div>
                    <span className="font-semibold text-white block">Pin this notice to top</span>
                    <span className="text-[11px] text-slate-400">Always displays at the top of banner and feed</span>
                  </div>
                </label>

                {/* Active Toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  <div>
                    <span className="font-semibold text-white block">Active & Published</span>
                    <span className="text-[11px] text-slate-400">Visible to students immediately</span>
                  </div>
                </label>

              </div>

              {/* Modal Submit & Cancel */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold border border-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
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
