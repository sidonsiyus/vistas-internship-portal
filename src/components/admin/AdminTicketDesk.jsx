import React, { useState, useMemo } from 'react';
import { 
  LifeBuoy, 
  Bug, 
  Lightbulb, 
  Wrench, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Laptop, 
  Eye, 
  Trash2, 
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  Calendar,
  User,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CreateTicketModal from './CreateTicketModal';
import Modal from '../common/Modal';

export default function AdminTicketDesk() {
  const { tickets = [], updateTicketStatus, deleteTicket, showToast } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalInitialType, setCreateModalInitialType] = useState('BUG_REPORT');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolutionNotesInput, setResolutionNotesInput] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [submitterFilter, setSubmitterFilter] = useState('ALL');

  // Stats calculation
  const stats = useMemo(() => {
    const total = tickets.length;
    const openCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_REVIEW' || t.status === 'IN_PROGRESS').length;
    const bugCount = tickets.filter(t => t.type === 'BUG_REPORT').length;
    const featureCount = tickets.filter(t => t.type === 'FEATURE_REQUEST' || t.type === 'ENHANCEMENT').length;
    const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const studentCount = tickets.filter(t => t.submitterRole === 'STUDENT').length;

    return { total, openCount, bugCount, featureCount, resolvedCount, studentCount };
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        t.title?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.submitterName?.toLowerCase().includes(q) ||
        t.studentRegisterNumber?.toLowerCase().includes(q);

      const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchesSubmitter = submitterFilter === 'ALL' || 
        (submitterFilter === 'STUDENT' && t.submitterRole === 'STUDENT') ||
        (submitterFilter === 'COORDINATOR' && t.submitterRole !== 'STUDENT');

      return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesSubmitter;
    });
  }, [tickets, searchQuery, typeFilter, statusFilter, priorityFilter, submitterFilter]);

  const openInspectModal = (ticket) => {
    setSelectedTicket(ticket);
    setResolutionNotesInput(ticket.resolutionNotes || '');
  };

  const handleSaveNotes = () => {
    if (!selectedTicket) return;
    updateTicketStatus(selectedTicket.id, selectedTicket.status, resolutionNotesInput);
    setSelectedTicket(prev => prev ? { ...prev, resolutionNotes: resolutionNotesInput } : null);
    showToast('Saved coordinator notes for ticket', 'success');
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tickets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `VISTAS_Admin_Tickets_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">🔴 Critical</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">🟠 High</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">🟡 Medium</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">🟢 Low</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'BUG_REPORT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <Bug className="w-3 h-3 text-rose-500" />
            <span>Bug Report</span>
          </span>
        );
      case 'FEATURE_REQUEST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Lightbulb className="w-3 h-3 text-purple-500" />
            <span>Feature Request</span>
          </span>
        );
      case 'ENHANCEMENT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Wrench className="w-3 h-3 text-blue-500" />
            <span>Enhancement</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Open</span>;
      case 'IN_REVIEW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">In Review</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">In Progress</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">✓ Resolved</span>;
      case 'CLOSED':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Closed</span>;
    }
  };

  const getSubmitterRoleBadge = (role, regNumber) => {
    if (role === 'STUDENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span>👨‍🎓 Student</span>
          {regNumber && <span className="font-mono text-[9px] opacity-90">({regNumber})</span>}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
        <span>Staff / Admin</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <LifeBuoy className="w-4 h-4" />
            <span>DEVELOPER SUPPORT & PORTAL FEEDBACK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Support & Feature Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log issues, report bugs encountered in the portal, or propose new features for upcoming releases.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Export Log</span>
          </button>

          <button
            onClick={() => {
              setCreateModalInitialType('BUG_REPORT');
              setIsCreateModalOpen(true);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Bug className="w-3.5 h-3.5 text-rose-600" />
            <span>Report Bug</span>
          </button>

          <button
            onClick={() => {
              setCreateModalInitialType('FEATURE_REQUEST');
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Request Feature</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">TOTAL TICKETS</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{stats.total}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">All submissions</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase tracking-wider block">ACTIVE / OPEN</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">{stats.openCount}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Under review</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider block">BUG REPORTS</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">{stats.bugCount}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Issues reported</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider block">FEATURE IDEAS</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">{stats.featureCount}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Requested tools</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider block">RESOLVED / DONE</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">{stats.resolvedCount}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Completed items</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-3">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tickets by ID, title, module, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL" className="dark:bg-slate-800">All Ticket Types</option>
          <option value="BUG_REPORT" className="dark:bg-slate-800">🐛 Bug Reports</option>
          <option value="FEATURE_REQUEST" className="dark:bg-slate-800">💡 Feature Requests</option>
          <option value="ENHANCEMENT" className="dark:bg-slate-800">🛠️ Enhancements</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL" className="dark:bg-slate-800">All Statuses</option>
          <option value="OPEN" className="dark:bg-slate-800">Open</option>
          <option value="IN_REVIEW" className="dark:bg-slate-800">In Review</option>
          <option value="IN_PROGRESS" className="dark:bg-slate-800">In Progress</option>
          <option value="RESOLVED" className="dark:bg-slate-800">Resolved</option>
          <option value="CLOSED" className="dark:bg-slate-800">Closed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL" className="dark:bg-slate-800">All Priorities</option>
          <option value="CRITICAL" className="dark:bg-slate-800">🔴 Critical</option>
          <option value="HIGH" className="dark:bg-slate-800">🟠 High</option>
          <option value="MEDIUM" className="dark:bg-slate-800">🟡 Medium</option>
          <option value="LOW" className="dark:bg-slate-800">🟢 Low</option>
        </select>

        {/* Submitter Role Filter */}
        <select
          value={submitterFilter}
          onChange={(e) => setSubmitterFilter(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL" className="dark:bg-slate-800">All Submitters ({stats.total})</option>
          <option value="STUDENT" className="dark:bg-slate-800">👨‍🎓 Students ({stats.studentCount})</option>
          <option value="COORDINATOR" className="dark:bg-slate-800">🛡️ Staff / Admins ({stats.total - stats.studentCount})</option>
        </select>

      </div>

      {/* Tickets List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          
          {filteredTickets.map((t) => (
            <div 
              key={t.id} 
              className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {t.id}
                  </span>
                  {getTypeBadge(t.type)}
                  {getPriorityBadge(t.priority)}
                  {getStatusBadge(t.status)}
                  {getSubmitterRoleBadge(t.submitterRole, t.studentRegisterNumber)}
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    • {t.category}
                  </span>
                </div>

                <h3 
                  onClick={() => openInspectModal(t)}
                  className="font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                >
                  {t.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {t.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
                  <span>By: <strong className="text-slate-600 dark:text-slate-300">{t.submitterName}</strong> {t.submitterRole === 'STUDENT' && t.studentRegisterNumber && <span className="font-mono text-[10px] text-slate-500">[{t.studentRegisterNumber}]</span>}</span>
                  <span>Logged: {new Date(t.createdAt).toLocaleDateString()}</span>
                  {t.resolutionNotes && (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <MessageSquare className="w-3 h-3" />
                      <span>Has Resolution Notes</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* Status Quick Select */}
                <select
                  value={t.status}
                  onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="OPEN" className="dark:bg-slate-800">Open</option>
                  <option value="IN_REVIEW" className="dark:bg-slate-800">In Review</option>
                  <option value="IN_PROGRESS" className="dark:bg-slate-800">In Progress</option>
                  <option value="RESOLVED" className="dark:bg-slate-800">Resolved</option>
                  <option value="CLOSED" className="dark:bg-slate-800">Closed</option>
                </select>

                <button
                  onClick={() => openInspectModal(t)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold text-xs border border-blue-200 dark:border-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete ticket ${t.id}?`)) {
                      deleteTicket(t.id);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 text-slate-400 text-xs transition-colors cursor-pointer"
                  title="Delete Ticket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          ))}

          {filteredTickets.length === 0 && (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs space-y-3">
              <LifeBuoy className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No tickets match your filters</p>
              <p className="text-slate-400">Raise a new bug report or feature request whenever you need enhancements.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Raise Ticket Now</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialType={createModalInitialType}
      />

      {/* TICKET DETAIL INSPECT MODAL */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Ticket File: ${selectedTicket?.id}`}
        maxWidth="max-w-xl"
      >
        {selectedTicket && (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            
            {/* Header info */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {getTypeBadge(selectedTicket.type)}
                  {getPriorityBadge(selectedTicket.priority)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400">Status:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      updateTicketStatus(selectedTicket.id, newStatus, selectedTicket.resolutionNotes);
                      setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
                    }}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                {selectedTicket.title}
              </h2>
              
              <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                <span>Module: <strong className="text-slate-700 dark:text-slate-300">{selectedTicket.category}</strong></span>
                <span>Submitted: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">Description:</span>
              <p className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedTicket.description}
              </p>
            </div>

            {/* Reproduction steps if bug */}
            {selectedTicket.type === 'BUG_REPORT' && selectedTicket.reproductionSteps && (
              <div className="space-y-1">
                <span className="font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Steps to Reproduce:</span>
                <p className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/80 dark:border-rose-900/40 text-slate-800 dark:text-slate-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.reproductionSteps}
                </p>
              </div>
            )}

            {/* Expected benefit if feature */}
            {selectedTicket.type !== 'BUG_REPORT' && selectedTicket.expectedBenefit && (
              <div className="space-y-1">
                <span className="font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">Expected Workflow Benefit:</span>
                <p className="p-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200/80 dark:border-purple-900/40 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.expectedBenefit}
                </p>
              </div>
            )}

            {/* Submitter & Telemetry info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px]">
              <div>
                <span className="font-bold text-slate-600 dark:text-slate-400 block mb-1">Submitter Details:</span>
                <div className="flex items-center gap-1.5 mb-1">
                  {getSubmitterRoleBadge(selectedTicket.submitterRole, selectedTicket.studentRegisterNumber)}
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedTicket.submitterName}</p>
                {selectedTicket.submitterEmail && (
                  <p className="text-slate-500 font-mono text-[10px]">{selectedTicket.submitterEmail}</p>
                )}
                {selectedTicket.studentRegisterNumber && (
                  <p className="text-amber-700 dark:text-amber-300 font-mono text-[10px] font-semibold">
                    Reg No: {selectedTicket.studentRegisterNumber}
                  </p>
                )}
              </div>
              <div>
                <span className="font-bold text-slate-600 dark:text-slate-400 block mb-0.5">Device Diagnostics:</span>
                <p className="text-slate-600 dark:text-slate-300 font-mono">{selectedTicket.environment?.browser || 'Browser N/A'}</p>
                <p className="text-slate-500 font-mono">Screen: {selectedTicket.environment?.screen || 'N/A'}</p>
              </div>
            </div>

            {/* Resolution Notes section */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  Coordinator & Developer Resolution Notes:
                </label>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                >
                  Save Notes
                </button>
              </div>
              <textarea
                rows="3"
                placeholder="Add development notes, fixes applied, or scheduled release versions..."
                value={resolutionNotesInput}
                onChange={(e) => setResolutionNotesInput(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete ticket ${selectedTicket.id}?`)) {
                    deleteTicket(selectedTicket.id);
                    setSelectedTicket(null);
                  }
                }}
                className="px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-semibold text-xs border border-rose-200 dark:border-rose-900/50 transition-colors"
              >
                Delete Ticket
              </button>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        )}
      </Modal>

    </div>
  );
}
