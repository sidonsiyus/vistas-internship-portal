import React from 'react';
import { GraduationCap, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { OFFICE_LOCATION } from '../../mock/sampleData';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          
          {/* Col 1: About */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              <span className="font-bold text-base">Internship Portal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Token Queue & Consultation Management System for Vels Hi-Tech Campus students.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-1.5 text-xs">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-blue-400 transition-colors">Portal Home</button></li>
              <li><button onClick={() => setActiveTab('book')} className="hover:text-blue-400 transition-colors">Book Consultation Slot</button></li>
              <li><button onClick={() => setActiveTab('track')} className="hover:text-blue-400 transition-colors">Track Token Live Queue</button></li>
              <li><button onClick={() => setActiveTab('status')} className="hover:text-blue-400 transition-colors">Desk Status</button></li>
            </ul>
          </div>

          {/* Col 3: Location & Hours (No Email / Phone) */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Location & Schedule</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-300">{OFFICE_LOCATION}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Regular Slots: 03:00 PM – 05:30 PM (Pre-3 PM Emergency Only)</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Vels Hi-Tech Campus Internship Cell. All rights reserved.</p>
          <button
            onClick={() => setActiveTab('admin')}
            className="text-slate-400 hover:text-blue-400 font-semibold text-xs transition-colors"
          >
            Admin Desk Access
          </button>
        </div>
      </div>
    </footer>
  );
}
