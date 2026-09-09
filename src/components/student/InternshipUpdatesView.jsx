import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles, 
  Pin, 
  GraduationCap, 
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileText,
  AlertTriangle,
  Briefcase,
  Megaphone,
  Users,
  MapPin,
  Send,
  FileCheck,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DEPARTMENTS } from '../../mock/sampleData';

export default function InternshipUpdatesView({ setActiveTab }) {
  const { announcements, markUpdatesAsRead } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [cardStudentFilters, setCardStudentFilters] = useState({});

  // Mark all updates as read when viewing this hub
  useEffect(() => {
    markUpdatesAsRead();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'INTERNSHIP_APPROVED':
        return {
          label: 'Internship Approved',
          classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
      case 'INTERNSHIP_CONFIRMED':
        return {
          label: 'Internship Confirmed',
          classes: 'bg-green-500/15 text-green-300 border-green-500/30'
        };
      case 'OPPORTUNITY_AVAILABLE':
        return {
          label: 'Opportunity Available',
          classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
      case 'CAN_APPLY':
        return {
          label: 'Students Can Apply',
          classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
        };
      case 'REPLY_RECEIVED':
        return {
          label: 'Reply Received',
          classes: 'bg-teal-500/15 text-teal-300 border-teal-500/30'
        };
      case 'PENDING_STUDENT_ACTION':
        return {
          label: 'Pending Student Action',
          classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
        };
      case 'INFO_REQUIRED':
        return {
          label: 'More Info Required',
          classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
      case 'CLOSED':
        return {
          label: 'Opportunity Closed',
          classes: 'bg-slate-800 text-slate-400 border-slate-700'
        };
      case 'REJECTED':
        return {
          label: 'Not Feasible / Rejected',
          classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
        };
      case 'NO_ACTION':
        return {
          label: 'No Action Required',
          classes: 'bg-slate-800/80 text-slate-300 border-slate-700/80'
        };
      default:
        return {
          label: status || 'Updated',
          classes: 'bg-slate-800 text-slate-300 border-slate-700'
        };
    }
  };

  // Filter active announcements
  const filteredAnnouncements = (announcements || [])
    .filter(a => a.isActive !== false)
    .filter(a => {
      if (selectedType === 'COMPANY_REPLY' && a.type !== 'COMPANY_REPLY') return false;
      if (selectedType === 'URGENT' && a.type !== 'URGENT') return false;
      if (selectedType === 'GENERAL' && a.type !== 'GENERAL' && a.type !== 'INTERNSHIP_UPDATE') return false;
      return true;
    })
    .filter(a => {
      if (selectedDept !== 'ALL') {
        if (a.department && a.department !== 'All Departments' && !a.department.includes(selectedDept)) {
          return false;
        }
      }
      return true;
    })
    .filter(a => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchBasic = (
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.content && a.content.toLowerCase().includes(q)) ||
        (a.companyName && a.companyName.toLowerCase().includes(q)) ||
        (a.companyLocation && a.companyLocation.toLowerCase().includes(q)) ||
        (a.emailReference && a.emailReference.toLowerCase().includes(q)) ||
        (a.requiredDocuments && a.requiredDocuments.toLowerCase().includes(q)) ||
        (a.coordinatorNotes && a.coordinatorNotes.toLowerCase().includes(q)) ||
        (a.actionRequired && a.actionRequired.toLowerCase().includes(q))
      );
      if (matchBasic) return true;

      // Check students included in this reply
      if (Array.isArray(a.studentsIncluded)) {
        return a.studentsIncluded.some(s => 
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.registerNumber && s.registerNumber.toLowerCase().includes(q)) ||
          (s.department && s.department.toLowerCase().includes(q))
        );
      }
      return false;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  const companyRepliesCount = (announcements || []).filter(a => a.isActive !== false && a.type === 'COMPANY_REPLY').length;
  const urgentCount = (announcements || []).filter(a => a.isActive !== false && a.type === 'URGENT').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8 font-sans">
      
      {/* Header Banner with Clear Objective */}
      <div className="bg-gradient-to-br from-[#0c1322] via-[#090d16] to-[#0d1627] border border-slate-800/80 p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Official Company Response Board</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Internship & Company Reply Updates
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            The Internship Coordinator posts live updates when companies respond to institutional inquiry emails. <strong className="text-blue-400 font-semibold">Please check this board before booking an appointment</strong> to find company answers, eligibility guidelines, and application links.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span><strong>{companyRepliesCount}</strong> Company Responses</span>
            </div>
            {urgentCount > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span><strong>{urgentCount}</strong> Urgent Deadlines</span>
              </div>
            )}
            <button
              onClick={() => setActiveTab('book')}
              className="ml-auto text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline pt-1 sm:pt-0"
            >
              <span>Need to book appointment instead?</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0b101b] border border-slate-800/80 p-4 rounded-xl space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-4 shadow-sm">
        
        {/* Left: Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company name, role, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Middle: Type filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Updates' },
            { id: 'COMPANY_REPLY', label: 'Company Replies' },
            { id: 'URGENT', label: 'Urgent' },
            { id: 'GENERAL', label: 'General Notices' },
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedType === type.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/60'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Right: Department select */}
        <div className="shrink-0">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Announcements & Company Replies Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16 bg-[#0b101b] border border-slate-800/80 rounded-2xl space-y-3">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-slate-200">No updates found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No notices match your selected filters. Clear the search or check back later.
            </p>
            {(searchQuery || selectedType !== 'ALL' || selectedDept !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('ALL');
                  setSelectedDept('ALL');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          filteredAnnouncements.map(ann => {
            const isCompanyReply = ann.type === 'COMPANY_REPLY';
            const isUrgent = ann.type === 'URGENT';
            const statusConfig = isCompanyReply ? getStatusBadge(ann.companyStatus) : null;

            return (
              <article
                key={ann.id}
                className={`bg-[#0b101b] rounded-2xl border transition-all hover:border-slate-700 shadow-md overflow-hidden ${
                  isUrgent 
                    ? 'border-rose-500/40 bg-gradient-to-br from-rose-950/10 via-[#0b101b] to-[#0b101b]' 
                    : ann.isPinned
                    ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/10 via-[#0b101b] to-[#0b101b]'
                    : 'border-slate-800/80'
                }`}
              >
                <div className="p-5 sm:p-6 space-y-4">
                  
                  {/* Card Top Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/60 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Pinned pill */}
                      {ann.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">
                          <Pin className="w-2.5 h-2.5" />
                          PINNED
                        </span>
                      )}

                      {/* Type Pill */}
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        isUrgent 
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : isCompanyReply
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      }`}>
                        {ann.type === 'COMPANY_REPLY' ? 'Company Response' : ann.type === 'URGENT' ? 'Urgent Deadline' : ann.category || 'Announcement'}
                      </span>

                      {/* Company Status badge if Company Reply */}
                      {isCompanyReply && statusConfig && (
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.classes}`}>
                          {statusConfig.label}
                        </span>
                      )}

                      {/* Location Badge */}
                      {ann.companyLocation && (
                        <span className="text-[11px] text-slate-300 bg-slate-800/70 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span>{ann.companyLocation}</span>
                        </span>
                      )}

                      {/* Students Included Count Pill */}
                      {ann.studentsIncluded && ann.studentsIncluded.length > 0 && (
                        <span className="text-[10px] font-bold text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-400" />
                          <span>{ann.studentsIncluded.length} Students Listed</span>
                        </span>
                      )}

                    </div>

                    {/* Dates & Reference */}
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-400">
                      {ann.requestSentDate && (
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3 text-slate-500" />
                          <span>Sent: <strong>{ann.requestSentDate}</strong></span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isCompanyReply ? `Reply: ${ann.replyDate || 'Recent'}` : `Posted: ${ann.replyDate || 'Recent'}`}</span>
                      </span>
                      {ann.emailReference && (
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Ref: {ann.emailReference}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Company & Title Header */}
                  <div className="flex items-start gap-3.5">
                    {isCompanyReply && (
                      <div className="h-10 w-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm shrink-0">
                        {ann.companyName ? ann.companyName.charAt(0) : 'C'}
                      </div>
                    )}
                    
                    <div className="space-y-1 flex-1">
                      {isCompanyReply && ann.companyName && (
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{ann.companyName}</span>
                        </div>
                      )}
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                        {ann.title}
                      </h2>
                    </div>
                  </div>

                  {/* Main Announcement Message */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>

                  {/* PROMINENT DISCLAIMER / NOTICE FOR TARGETED COMPANY REPLIES */}
                  {isCompanyReply && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide block">
                          Important Notice: Targeted Opportunity
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          This company reply and internship opportunity apply <strong className="text-amber-300 font-semibold">only to the students listed below</strong>, as they were included in the original internship request sent to the company. Other students need not follow these instructions or book consultation appointments for this specific response.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STUDENTS INCLUDED IN THIS REQUEST SECTION */}
                  {ann.studentsIncluded && ann.studentsIncluded.length > 0 && (
                    <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Students Included in This Request
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold">
                            {ann.studentsIncluded.length} Students
                          </span>
                        </div>

                        {/* Search / filter within this card if students > 3 */}
                        {ann.studentsIncluded.length > 3 && (
                          <div className="relative w-full sm:w-56">
                            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Filter student or reg no..."
                              value={cardStudentFilters[ann.id] || ''}
                              onChange={(e) => setCardStudentFilters({ ...cardStudentFilters, [ann.id]: e.target.value })}
                              className="w-full pl-7 pr-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Students Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-800/80">
                              <th className="pb-2 font-semibold">#</th>
                              <th className="pb-2 font-semibold">Student Name</th>
                              <th className="pb-2 font-semibold">Register Number</th>
                              <th className="pb-2 font-semibold">Department</th>
                              <th className="pb-2 font-semibold">Year & Sec</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50 text-slate-300 font-medium">
                            {ann.studentsIncluded
                              .filter(s => {
                                const filter = (cardStudentFilters[ann.id] || '').toLowerCase().trim();
                                if (!filter) return true;
                                return (
                                  (s.name && s.name.toLowerCase().includes(filter)) ||
                                  (s.registerNumber && s.registerNumber.toLowerCase().includes(filter)) ||
                                  (s.department && s.department.toLowerCase().includes(filter))
                                );
                              })
                              .map((s, idx) => (
                                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                                  <td className="py-2 font-mono text-[10px] text-slate-500">{idx + 1}</td>
                                  <td className="py-2 font-semibold text-white">{s.name}</td>
                                  <td className="py-2 font-mono text-blue-400 font-semibold">{s.registerNumber}</td>
                                  <td className="py-2 text-slate-400">{s.department || '-'}</td>
                                  <td className="py-2 text-slate-400">{s.year || ''} {s.section || ''}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Key Metadata Grid (for company replies or internship opportunities) */}
                  {(ann.department || ann.duration || ann.eligibility || ann.deadline) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-xl text-xs">
                      {ann.department && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Target Department</span>
                          <span className="font-medium text-slate-200">{ann.department}</span>
                        </div>
                      )}
                      {ann.duration && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Duration</span>
                          <span className="font-medium text-slate-200">{ann.duration}</span>
                        </div>
                      )}
                      {ann.eligibility && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Eligibility</span>
                          <span className="font-medium text-slate-200">{ann.eligibility}</span>
                        </div>
                      )}
                      {ann.deadline && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Reporting / Deadline</span>
                          <span className="font-semibold text-rose-300 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-rose-400" />
                            {ann.deadline}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Highlighted Required Documents Box */}
                  {ann.requiredDocuments && (
                    <div className="bg-blue-950/20 border border-blue-500/30 p-3.5 rounded-xl flex items-start gap-2.5">
                      <FileCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block">Required Documents to Submit / Carry:</span>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {ann.requiredDocuments}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Highlighted Action Required Box */}
                  {ann.actionRequired && (
                    <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">Action Required for Students:</span>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {ann.actionRequired}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Coordinator Notes Callout */}
                  {ann.coordinatorNotes && (
                    <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
                      <GraduationCap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Coordinator Desk Note:</span>
                        <p className="text-xs text-slate-300 italic">
                          "{ann.coordinatorNotes}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Bottom Footer Actions (Apply Link or Contact) */}
                  {ann.applyLink && (
                    <div className="pt-2 flex items-center justify-end">
                      <a
                        href={ann.applyLink.startsWith('http') ? ann.applyLink : `https://${ann.applyLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md"
                      >
                        <span>Open Application / Portal Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                </div>
              </article>
            );
          })
        )}
      </div>

    </div>
  );
}
