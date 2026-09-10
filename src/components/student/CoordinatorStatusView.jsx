import React from 'react';
import { Clock, MapPin, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../common/StatusBadge';
import { OFFICE_LOCATION } from '../../mock/sampleData';

export default function CoordinatorStatusView({ setActiveTab }) {
  const { availability } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-7 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Vels Hi-Tech Campus Official Desk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Coordinator Schedule & Desk Availability
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Check live desk status, office location details, and the 3:00 PM consultation schedule.
        </p>
      </div>

      {/* Main Status Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">CURRENT DESK STATUS</span>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <StatusBadge status={availability.status} size="large" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            {availability.status === 'AVAILABLE' ? (
              'The Internship Coordinator is currently accepting regular student consultation bookings after 3:00 PM and emergency requests.'
            ) : availability.status === 'ON_BREAK' ? (
              'The Coordinator is currently in a meeting or administrative break.'
            ) : (
              'Desk consultations are currently closed.'
            )}
          </p>
        </div>

        <button
          onClick={() => setActiveTab('book')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shrink-0 transition-all"
        >
          Book Consultation Slot →
        </button>
      </div>

      {/* Schedule & Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Card 1: Hours & Location */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3.5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Schedule & Desk Location</span>
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Regular Desk Consultations</span>
              <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">03:00 PM – 05:30 PM</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Pre-3:00 PM Session</span>
              <span className="font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Emergency Requests Only</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Slot Duration Pace</span>
              <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">15 Minutes / Student</span>
            </li>
            <li className="flex items-start gap-2 pt-1 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span className="font-medium text-slate-800">{OFFICE_LOCATION}</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Guidelines */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3.5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Consultation Policy</span>
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Regular consultation slots are available only <strong>after 3:00 PM</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-600 font-bold">•</span>
              <span>Pre-3:00 PM visits require emergency justification.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Each slot is structured for 15 minutes to prevent queue delays.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>Office Location: {OFFICE_LOCATION}.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
