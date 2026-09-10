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

  // When newest notice or announcements list updates in real-time, auto-switch to front (index 0)
  const newestTimestamp = activeAnnouncements.length > 0 
    ? `${activeAnnouncements[0].id}-${activeAnnouncements[0].updatedAt || activeAnnouncements[0].createdAt}`
    : '';

  const prevNewestRef = React.useRef(newestTimestamp);
  React.useEffect(() => {
    if (newestTimestamp && newestTimestamp !== prevNewestRef.current) {
      prevNewestRef.current = newestTimestamp;
      setCurrentIndex(0);
    }
  }, [newestTimestamp]);

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
          bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-800/80 shadow-sm'
        };
      case 'COMPANY_REPLY':
        return {
          icon: Building2,
          label: 'Company Response',
          bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800/80 shadow-sm'
        };
      case 'INTERNSHIP_UPDATE':
        return {
          icon: Briefcase,
          label: 'Internship Update',
          bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800/80 shadow-sm'
        };
      default:
        return {
          icon: Megaphone,
          label: ann.category || 'Announcement',
          bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
          border: 'border-slate-200 dark:border-slate-800 shadow-sm'
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
    <div className="w-full bg-slate-100/60 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className={`relative rounded-xl bg-white dark:bg-slate-900 border ${badge.border} p-4 shadow-sm transition-all`}
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
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                      <Pin className="w-2.5 h-2.5" />
                      PINNED
                    </span>
                  )}

                  {current.type === 'COMPANY_REPLY' && current.companyName && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full">
                      <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <strong>{current.companyName}</strong>
                    </span>
                  )}

                  {current.type === 'COMPANY_REPLY' && current.studentsIncluded && current.studentsIncluded.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-full">
                      <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <strong>{current.studentsIncluded.length} Students Listed</strong>
                    </span>
                  )}

                  {current.replyDate && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {current.replyDate}
                    </span>
                  )}
                </div>

                {/* Announcement Title */}
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                  {current.title}
                </h3>

                {/* Short message snippet */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {current.content}
                </p>

                {/* Targeted note if Company Reply with students */}
                {current.type === 'COMPANY_REPLY' && current.studentsIncluded && current.studentsIncluded.length > 0 && (
                  <div className="pt-0.5 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                    ⚡ <em>Applies specifically to the {current.studentsIncluded.length} students included in the initial request. Click below to verify names.</em>
                  </div>
                )}

                {/* Action Required preview if Company Reply */}
                {current.actionRequired && (
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 live-pulse shrink-0" />
                    <span className="truncate"><strong className="text-slate-800 dark:text-slate-200">Action:</strong> {current.actionRequired}</span>
                  </div>
                )}

              </div>

            </div>

            {/* Right Action & Multi-Notice Controls */}
            <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
              
              {/* Pagination & Dot indicators if multiple notices */}
              {activeAnnouncements.length > 1 && (
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={prevAnnouncement}
                    className="p-1 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
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
                          currentIndex === idx ? 'w-4 bg-blue-600 dark:bg-blue-400' : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                        }`}
                        title={`Go to notice ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    {currentIndex + 1}/{activeAnnouncements.length}
                  </span>

                  <button 
                    onClick={nextAnnouncement}
                    className="p-1 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
                    title="Next notice"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* View Updates Hub Button */}
              <button
                onClick={() => setActiveTab('updates')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-all shadow-sm"
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
