import React from 'react';
import { GraduationCap, MapPin, Clock } from 'lucide-react';
import { OFFICE_LOCATION } from '../../mock/sampleData';

export default function Footer({ setActiveTab }) {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-500 py-10 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Col 1: About */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">VISTAS Internship Portal</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Smart Token Queue & Consultation Scheduling System for Vels Hi-Tech Campus students.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('home')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Portal Home
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('book')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Book Consultation Slot
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('track')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Track Token Live Queue
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('status')} className="text-slate-600 hover:text-blue-600 transition-colors">
                  Coordinator Desk Status
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Location & Hours */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Campus Location & Hours</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-700">{OFFICE_LOCATION}</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Regular Slots: After 03:00 PM (Emergency pre-3 PM)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Minimalist Bottom Copyright Bar */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <p className="text-slate-600 font-medium">
              Copyright © 2026 <span className="text-slate-900 font-semibold">Sid</span>. All rights reserved.
            </p>
            <span className="hidden sm:inline text-slate-300">•</span>
            <p className="text-slate-500">
              Designed & Developed by <span className="text-slate-700 font-medium">Sid</span>
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin')}
            className="text-slate-600 hover:text-blue-600 font-medium text-xs transition-colors flex items-center gap-1.5"
          >
            <span>Coordinator Desk Access</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">Admin</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
