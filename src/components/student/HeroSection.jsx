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
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/80 to-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          
          {/* Desk & Location Pills */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-sm">
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Coordinator Desk</span>
            </div>

            <span className="text-slate-300">•</span>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>{OFFICE_LOCATION}</span>
            </div>

            <span className="text-slate-300">•</span>

            <StatusBadge status={availability.status} size="small" />
          </div>

          {/* Headline - Clean & Minimalist */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            Internship Consultation{' '}
            <span className="text-blue-600">
              Queue System
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl mx-auto">
            Reserve your 15-minute consultation slot with the Internship Coordinator. Regular hours run <span className="text-slate-900 font-semibold">after 3:00 PM</span>. Pre-3:00 PM slots are designated for emergency requests.
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
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm transition-all"
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span>TRACK MY TOKEN LIVE</span>
            </button>
          </div>

          {/* Company Response Reminder Pill */}
          <div className="pt-1">
            <button 
              onClick={() => setActiveTab('updates')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-medium transition-all shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Checking on company email replies? <strong className="text-blue-900 underline underline-offset-2">View Company Response Updates →</strong></span>
            </button>
          </div>

          {/* Clean Policy Note */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Regular Slots: <strong className="text-slate-800 font-medium">After 3:00 PM</strong> (15 Mins / Student)</span>
            </div>
            <span className="hidden sm:inline text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-rose-600">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Pre-3 PM: Emergency Requests Only</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
