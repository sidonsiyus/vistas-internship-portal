import React from 'react';
import { Ticket, Clock, ArrowRight, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../common/StatusBadge';
import { OFFICE_LOCATION } from '../../mock/sampleData';

export default function HeroSection({ setActiveTab }) {
  const { availability } = useApp();
  const isAvailable = availability.status === 'AVAILABLE';

  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800/80">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          
          {/* Desk & Location Pills */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-slate-950/90 border border-slate-800 p-2 rounded-full shadow-xl">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/10 rounded-full border border-blue-500/20">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-300">Internship Coordinator Desk</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-xs text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{OFFICE_LOCATION}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1">
              <StatusBadge status={availability.status} size="normal" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Your Internship Questions.{' '}
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Managed Better.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Book a 15-minute consultation slot with the Internship Coordinator. Regular hours run <strong className="text-white">after 3:00 PM</strong>. Pre-3:00 PM slots are strictly for emergency requests.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setActiveTab('book')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <Ticket className="w-5 h-5 text-blue-100" />
              <span>BOOK A TOKEN SLOT</span>
              <ArrowRight className="w-5 h-5 ml-1 opacity-80" />
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-base border border-slate-700 transition-all"
            >
              <Clock className="w-5 h-5 text-blue-400" />
              <span>TRACK MY TOKEN LIVE</span>
            </button>
          </div>

          {/* Next Available & Policy Banner */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Next Regular Session: <strong className="text-white">Today at 3:00 PM</strong> (15 Mins / Student)</span>
            </div>
            <span className="hidden sm:inline text-slate-700">•</span>
            <div className="flex items-center gap-1.5 text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>Pre-3 PM: Emergency Requests Only</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
