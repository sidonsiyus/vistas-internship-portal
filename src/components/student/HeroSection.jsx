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
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-800/60 bg-gradient-to-b from-[#0c1220] to-[#090d16] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          
          {/* Desk & Location Pills */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-slate-900/60 border border-slate-800/80 px-3 py-1.5 rounded-full shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Coordinator Desk</span>
            </div>

            <span className="text-slate-700">•</span>

            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{OFFICE_LOCATION}</span>
            </div>

            <span className="text-slate-700">•</span>

            <StatusBadge status={availability.status} size="small" />
          </div>

          {/* Headline - Clean & Minimalist */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Internship Consultation{' '}
            <span className="text-blue-400">
              Queue System
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-xl mx-auto">
            Reserve your 15-minute consultation slot with the Internship Coordinator. Regular hours run <span className="text-slate-200 font-semibold">after 3:00 PM</span>. Pre-3:00 PM slots are designated for emergency requests.
          </p>

          {/* Minimalist Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleBook}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
            >
              <Ticket className="w-4 h-4 text-blue-100" />
              <span>BOOK A TOKEN SLOT</span>
              <ArrowRight className="w-4 h-4 ml-0.5 opacity-80" />
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-medium text-sm border border-slate-800 transition-all"
            >
              <Clock className="w-4 h-4 text-blue-400" />
              <span>TRACK MY TOKEN LIVE</span>
            </button>
          </div>

          {/* Company Response Reminder Pill */}
          <div className="pt-1">
            <button 
              onClick={() => setActiveTab('updates')}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800/90 border border-blue-500/30 text-blue-300 text-xs font-medium transition-all hover:border-blue-400 shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Checking on company email replies? <strong className="text-white hover:underline">View Company Response Updates →</strong></span>
            </button>
          </div>

          {/* Clean Policy Note */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Regular Slots: <strong className="text-slate-200 font-medium">After 3:00 PM</strong> (15 Mins / Student)</span>
            </div>
            <span className="hidden sm:inline text-slate-700">•</span>
            <div className="flex items-center gap-1.5 text-rose-300">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Pre-3 PM: Emergency Requests Only</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
