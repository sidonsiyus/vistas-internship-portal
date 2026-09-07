import React from 'react';
import { UserCheck, MapPin, Clock, Calendar, AlertCircle, ShieldCheck, Mail, Phone, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../common/StatusBadge';
import { OFFICE_LOCATION } from '../../mock/sampleData';

export default function CoordinatorStatusView({ setActiveTab }) {
  const { availability } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Vels Hi-Tech Campus Official Desk</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Internship Coordinator Schedule & Desk Availability
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Check live desk status, location details, 3:00 PM consultation schedule, and emergency guidelines.
        </p>
      </div>

      {/* Main Status Hero Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block">CURRENT DESK STATUS</span>
          <div className="flex items-center justify-center md:justify-start gap-3">
            <StatusBadge status={availability.status} size="large" />
          </div>
          <p className="text-sm text-slate-300 font-medium">
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
          className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shrink-0"
        >
          Book Consultation Slot →
        </button>
      </div>

      {/* Schedule & Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Hours & Location */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Schedule & Desk Location</span>
          </h3>

          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Regular Desk Consultations</span>
              <span className="font-mono font-bold text-emerald-400">03:00 PM – 05:30 PM</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Pre-3:00 PM Session</span>
              <span className="font-mono font-bold text-rose-400">Emergency Requests Only</span>
            </li>
            <li className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Slot Duration Pace</span>
              <span className="font-mono font-bold text-blue-400">15 Minutes / Student</span>
            </li>
            <li className="flex items-start gap-2 pt-1 text-slate-300">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-semibold text-white">{OFFICE_LOCATION}</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Guidelines */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Consultation Rules & Policy</span>
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Regular consultation slots are available only <strong>after 3:00 PM</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span>Pre-3:00 PM visits require explicit emergency justification.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Each slot is structured for 15 minutes to prevent queue delays.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 font-bold">•</span>
              <span>Desk Location: 7th Floor Staff Room, Vels Hi-Tech Campus.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
}
