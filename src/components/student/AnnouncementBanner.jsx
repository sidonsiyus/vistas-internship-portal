import React, { useState } from 'react';
import { 
  Bell, 
  Megaphone, 
  AlertTriangle, 
  Briefcase, 
  ArrowRight, 
  Pin, 
  Calendar, 
  ChevronRight, 
  Building2, 
  Clock,
  Sparkles,
  ChevronLeft,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AnnouncementBanner({ setActiveTab }) {
  const { announcements } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter only active announcements, sort pinned first, then newest updated
  const activeAnnouncements = (announcements || [])
    .filter(a => a.isActive !== false)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      return timeB - timeA;
    });

  // Auto-rotate every 6 seconds when not hovered
  React.useEffect(() => {
    if (activeAnnouncements.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeAnnouncements.length, isPaused]);

  // Keep index within bounds
  React.useEffect(() => {
    if (currentIndex >= activeAnnouncements.length) {
      setCurrentIndex(0);
    }
  }, [activeAnnouncements.length, currentIndex]);

  if (activeAnnouncements.length === 0) {
    return null;
  }

  const current = activeAnnouncements[currentIndex] || activeAnnouncements[0];

  const getBadgeConfig = (ann) => {
    switch (ann.type) {
      case 'URGENT':
        return {
          icon: AlertTriangle,
          label: 'Urgent Notice',
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          border: 'border-rose-500/30 shadow-rose-950/20'
        };
      case 'COMPANY_REPLY':
        return {
          icon: Building2,
          label: 'Company Response',
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          border: 'border-emerald-500/30 shadow-emerald-950/20'
        };
      case 'INTERNSHIP_UPDATE':
        return {
          icon: Briefcase,
          label: 'Internship Update',
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
          border: 'border-blue-500/30 shadow-blue-950/20'
        };
      default:
        return {
          icon: Megaphone,
          label: ann.category || 'Announcement',
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          border: 'border-slate-800/80'
        };
    }
  };

  const badge = getBadgeConfig(current);
  const BadgeIcon = badge.icon;

  const nextAnnouncement = () => {
    setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
  };

  const prevAnnouncement = () => {
    setCurrentIndex((prev) => (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length);
  };

  return (
    <div className="w-full bg-[#080d19] border-b border-slate-800/80 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className={`relative rounded-xl bg-gradient-to-r from-slate-900 via-[#0b1222] to-slate-900 border ${badge.border} p-4 shadow-lg transition-all`}
        >
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left Content Area */}
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              
              {/* Badge Icon */}
              <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${badge.bg}`}>
                <BadgeIcon className="w-4 h-4" />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>

                  {current.isPinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      <Pin className="w-2.5 h-2.5" />
                      PINNED
                    </span>
                  )}

                  {current.type === 'COMPANY_REPLY' && current.companyName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-slate-800/70 px-2 py-0.5 rounded-full">
                      <Building2 className="w-3 h-3 text-blue-400" />
                      <strong>{current.companyName}</strong>
                    </span>
                  )}

                  {current.type === 'COMPANY_REPLY' && current.studentsIncluded && current.studentsIncluded.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300 bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                      <Users className="w-3 h-3 text-blue-400" />
                      <strong>{current.studentsIncluded.length} Students Listed</strong>
                    </span>
                  )}

                  {current.replyDate && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {current.replyDate}
                    </span>
                  )}
                </div>

                {/* Announcement Title */}
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                  {current.title}
                </h3>

                {/* Short message snippet */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {current.content}
                </p>

                {/* Targeted note if Company Reply with students */}
                {current.type === 'COMPANY_REPLY' && current.studentsIncluded && current.studentsIncluded.length > 0 && (
                  <div className="pt-0.5 text-[11px] text-amber-300/90 font-medium">
                    ⚡ <em>Applies specifically to the {current.studentsIncluded.length} students included in the initial request. Click below to verify names.</em>
                  </div>
                )}

                {/* Action Required preview if Company Reply */}
                {current.actionRequired && (
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 live-pulse shrink-0" />
                    <span className="truncate"><strong className="text-slate-200">Action:</strong> {current.actionRequired}</span>
                  </div>
                )}

              </div>

            </div>

            {/* Right Action & Multi-Notice Controls */}
            <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
              
              {/* Pagination & Dot indicators if multiple notices */}
              {activeAnnouncements.length > 1 && (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  <button 
                    onClick={prevAnnouncement}
                    className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="Previous notice"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5 px-1">
                    {activeAnnouncements.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          currentIndex === idx ? 'w-4 bg-blue-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                        }`}
                        title={`Go to notice ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <span className="font-mono text-[10px] text-slate-400">
                    {currentIndex + 1}/{activeAnnouncements.length}
                  </span>

                  <button 
                    onClick={nextAnnouncement}
                    className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="Next notice"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* View Updates Hub Button */}
              <button
                onClick={() => setActiveTab('updates')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-sm hover:shadow-blue-500/20"
              >
                <span>{current.type === 'COMPANY_REPLY' ? 'View Included Students & Details' : 'View All Updates'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
