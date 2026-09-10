import React from 'react';
import { Ticket, Clock, ArrowRight, ShieldCheck, MapPin, AlertCircle, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../common/StatusBadge';
import { OFFICE_LOCATION } from '../../mock/sampleData';

export default function HeroSection({ setActiveTab, onBookClick }) {
  const { availability } = useApp();

  const handleBook = () => {
    if (onBookClick) onBookClick();
    else setActiveTab('book');
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          
          {/* Desk & Location Pills */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-full shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Coordinator Desk</span>
            </div>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{OFFICE_LOCATION}</span>
            </div>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <StatusBadge status={availability.status} size="small" />
          </div>

          {/* Headline - Clean & Minimalist */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            Internship Consultation{' '}
            <span className="text-blue-600 dark:text-blue-400">
              Queue System
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl mx-auto">
            Reserve your 15-minute consultation slot with the Internship Coordinator. Regular hours run <span className="text-slate-900 dark:text-white font-semibold">after 3:00 PM</span>. Pre-3:00 PM slots are designated for emergency requests.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleBook}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              <Ticket className="w-4 h-4 text-white" />
              <span>BOOK A TOKEN SLOT</span>
              <ArrowRight className="w-4 h-4 ml-0.5 opacity-90" />
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            >
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>TRACK MY TOKEN LIVE</span>
            </button>
          </div>

          {/* Company Response Reminder Pill */}
          <div className="pt-1">
            <button 
              onClick={() => setActiveTab('updates')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100/70 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-medium transition-all shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Checking on company email replies? <strong className="text-blue-900 dark:text-blue-100 underline underline-offset-2">View Company Response Updates →</strong></span>
            </button>
          </div>

          {/* Clean Policy Note */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Regular Slots: <strong className="text-slate-800 dark:text-slate-200 font-medium">After 3:00 PM</strong> (15 Mins / Student)</span>
            </div>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Pre-3 PM: Emergency Requests Only</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
