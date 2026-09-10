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
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'INTERNSHIP_CONFIRMED':
        return {
          label: 'Internship Confirmed',
          classes: 'bg-green-50 text-green-700 border-green-200'
        };
      case 'OPPORTUNITY_AVAILABLE':
        return {
          label: 'Opportunity Available',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'CAN_APPLY':
        return {
          label: 'Students Can Apply',
          classes: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'REPLY_RECEIVED':
        return {
          label: 'Reply Received',
          classes: 'bg-teal-50 text-teal-700 border-teal-200'
        };
      case 'PENDING_STUDENT_ACTION':
        return {
          label: 'Pending Student Action',
          classes: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'INFO_REQUIRED':
        return {
          label: 'More Info Required',
          classes: 'bg-amber-50 text-amber-800 border-amber-200'
        };
      case 'CLOSED':
        return {
          label: 'Opportunity Closed',
          classes: 'bg-slate-100 text-slate-600 border-slate-200'
        };
      case 'REJECTED':
        return {
          label: 'Not Feasible / Rejected',
          classes: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'NO_ACTION':
        return {
          label: 'No Action Required',
          classes: 'bg-slate-100 text-slate-700 border-slate-200'
        };
      default:
        return {
          label: status || 'Updated',
          classes: 'bg-slate-100 text-slate-700 border-slate-200'
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
      <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-3">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Official Company Response Board</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Internship & Company Reply Updates
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The Internship Coordinator posts live updates when companies respond to institutional inquiry emails. <strong className="text-blue-700 font-semibold">Please check this board before booking an appointment</strong> to find company answers, eligibility guidelines, and application links.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span><strong>{companyRepliesCount}</strong> Company Responses</span>
            </div>
            {urgentCount > 0 && (
              <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span><strong>{urgentCount}</strong> Urgent Deadlines</span>
              </div>
            )}
            <button
              onClick={() => setActiveTab('book')}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline pt-1 sm:pt-0"
            >
              <span>Need to book appointment instead?</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-4 shadow-sm">
        
        {/* Left: Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company name, role, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all"
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === type.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
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
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
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
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No updates found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No notices match your selected filters. Clear the search or check back later.
            </p>
            {(searchQuery || selectedType !== 'ALL' || selectedDept !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('ALL');
                  setSelectedDept('ALL');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200"
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
                className={`bg-white rounded-2xl border transition-all hover:border-slate-300 shadow-sm overflow-hidden ${
                  isUrgent 
                    ? 'border-rose-300 bg-gradient-to-br from-rose-50/30 via-white to-white' 
                    : ann.isPinned
                    ? 'border-amber-300 bg-gradient-to-br from-amber-50/30 via-white to-white'
                    : 'border-slate-200'
                }`}
              >
                <div className="p-5 sm:p-6 space-y-4">
                  
                  {/* Card Top Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Pinned pill */}
                      {ann.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          <Pin className="w-2.5 h-2.5" />
                          PINNED
                        </span>
                      )}

                      {/* Type Pill */}
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        isUrgent 
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isCompanyReply
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
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
                        <span className="text-[11px] text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          <span>{ann.companyLocation}</span>
                        </span>
                      )}

                      {/* Students Included Count Pill */}
                      {ann.studentsIncluded && ann.studentsIncluded.length > 0 && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Users className="w-3 h-3 text-blue-600" />
                          <span>{ann.studentsIncluded.length} Students Listed</span>
                        </span>
                      )}

                    </div>

                    {/* Dates & Reference */}
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500">
                      {ann.requestSentDate && (
                        <span className="flex items-center gap-1">
                          <Send className="w-3 h-3 text-slate-400" />
                          <span>Sent: <strong>{ann.requestSentDate}</strong></span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isCompanyReply ? `Reply: ${ann.replyDate || 'Recent'}` : `Posted: ${ann.replyDate || 'Recent'}`}</span>
                      </span>
                      {ann.emailReference && (
                        <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          Ref: {ann.emailReference}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Company & Title Header */}
                  <div className="flex items-start gap-3.5">
                    {isCompanyReply && (
                      <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                        {ann.companyName ? ann.companyName.charAt(0) : 'C'}
                      </div>
                    )}
                    
                    <div className="space-y-1 flex-1">
                      {isCompanyReply && ann.companyName && (
                        <div className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{ann.companyName}</span>
                        </div>
                      )}
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                        {ann.title}
                      </h2>
                    </div>
                  </div>

                  {/* Main Announcement Message */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>

                  {/* PROMINENT DISCLAIMER / NOTICE FOR TARGETED COMPANY REPLIES */}
                  {isCompanyReply && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide block">
                          Important Notice: Targeted Opportunity
                        </span>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          This company reply and internship opportunity apply <strong className="text-amber-950 font-bold">only to the students listed below</strong>, as they were included in the original internship request sent to the company. Other students need not follow these instructions or book consultation appointments for this specific response.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STUDENTS INCLUDED IN THIS REQUEST SECTION */}
                  {ann.studentsIncluded && ann.studentsIncluded.length > 0 && (
                    <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Students Included in This Request
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-mono font-bold">
                            {ann.studentsIncluded.length} Students
                          </span>
                        </div>

                        {/* Search / filter within this card if students > 3 */}
                        {ann.studentsIncluded.length > 3 && (
                          <div className="relative w-full sm:w-56">
                            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Filter student or reg no..."
                              value={cardStudentFilters[ann.id] || ''}
                              onChange={(e) => setCardStudentFilters({ ...cardStudentFilters, [ann.id]: e.target.value })}
                              className="w-full pl-7 pr-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm"
                            />
                          </div>
                        )}
                      </div>

                      {/* Students Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-[10px] uppercase text-slate-500 border-b border-slate-200">
                              <th className="pb-2 font-semibold">#</th>
                              <th className="pb-2 font-semibold">Student Name</th>
                              <th className="pb-2 font-semibold">Register Number</th>
                              <th className="pb-2 font-semibold">Department</th>
                              <th className="pb-2 font-semibold">Year & Sec</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
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
                                <tr key={idx} className="hover:bg-slate-100/60 transition-colors">
                                  <td className="py-2 font-mono text-[10px] text-slate-400">{idx + 1}</td>
                                  <td className="py-2 font-semibold text-slate-900">{s.name}</td>
                                  <td className="py-2 font-mono text-blue-600 font-bold">{s.registerNumber}</td>
                                  <td className="py-2 text-slate-600">{s.department || '-'}</td>
                                  <td className="py-2 text-slate-600">{s.year || ''} {s.section || ''}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Key Metadata Grid (for company replies or internship opportunities) */}
                  {(ann.department || ann.duration || ann.eligibility || ann.deadline) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs">
                      {ann.department && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">Target Department</span>
                          <span className="font-semibold text-slate-800">{ann.department}</span>
                        </div>
                      )}
                      {ann.duration && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">Duration</span>
                          <span className="font-semibold text-slate-800">{ann.duration}</span>
                        </div>
                      )}
                      {ann.eligibility && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">Eligibility</span>
                          <span className="font-semibold text-slate-800">{ann.eligibility}</span>
                        </div>
                      )}
                      {ann.deadline && (
                        <div>
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">Reporting / Deadline</span>
                          <span className="font-bold text-rose-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-rose-500" />
                            {ann.deadline}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Highlighted Required Documents Box */}
                  {ann.requiredDocuments && (
                    <div className="bg-blue-50/80 border border-blue-200 p-3.5 rounded-xl flex items-start gap-2.5">
                      <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">Required Documents to Submit / Carry:</span>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {ann.requiredDocuments}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Highlighted Action Required Box */}
                  {ann.actionRequired && (
                    <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">Action Required for Students:</span>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {ann.actionRequired}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Coordinator Notes Callout */}
                  {ann.coordinatorNotes && (
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start gap-2.5 text-xs text-slate-700">
                      <GraduationCap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Coordinator Desk Note:</span>
                        <p className="text-xs text-slate-700 italic">
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
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm"
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
