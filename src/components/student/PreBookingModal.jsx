import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  ExternalLink,
  Sparkles,
  Ticket
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function PreBookingModal({ isOpen, onClose, onProceedToBooking, onNavigateToUpdates }) {
  const { announcements } = useApp();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  // Get recent 2 company reply updates for immediate preview
  const recentCompanyReplies = (announcements || [])
    .filter(a => a.isActive !== false && a.type === 'COMPANY_REPLY')
    .slice(0, 2);

  const handleProceed = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('vistas_suppress_prebooking_advisory', 'true');
      } catch (e) {}
    }
    onProceedToBooking();
  };

  const handleViewUpdates = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('vistas_suppress_prebooking_advisory', 'true');
      } catch (e) {}
    }
    onNavigateToUpdates();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans transition-colors duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Check Company Updates First
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Save your time before queuing for a consultation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 p-3.5 rounded-xl text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <strong>Before booking a consultation token:</strong> If your inquiry is regarding whether a company has responded to an internship request, eligibility guidelines, or application status, <span className="text-blue-950 dark:text-blue-100 font-bold">your question may already have been answered on the Company Response Board!</span>
          </div>

          {/* Quick Preview of Recent Company Replies */}
          {recentCompanyReplies.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Recent Company Responses:
              </span>

              <div className="space-y-2">
                {recentCompanyReplies.map(item => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{item.companyName || item.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{item.title}</p>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Reply Posted
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Don't show again toggle */}
          <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-600 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-blue-600 focus:ring-blue-500/20 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Don't show this advisory again on this browser</span>
          </label>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          
          <button
            onClick={handleProceed}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
          >
            Continue to Book Slot →
          </button>

          <button
            onClick={handleViewUpdates}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Latest Updates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

    </div>
  );
}
