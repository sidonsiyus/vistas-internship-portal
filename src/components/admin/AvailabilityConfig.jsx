import React, { useState } from 'react';
import { Clock, Save, Sliders, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AvailabilityConfig() {
  const { availability, updateAvailabilityConfig, updateAvailabilityStatus } = useApp();

  const [formData, setFormData] = useState({
    startTime: availability.startTime || '10:00',
    endTime: availability.endTime || '16:00',
    slotDuration: availability.slotDuration || 15,
    breakStartTime: availability.breakStartTime || '13:00',
    breakEndTime: availability.breakEndTime || '14:00',
    maxBookings: availability.maxBookings || 30,
    bookingDeadline: availability.bookingDeadline || '15:30'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAvailabilityConfig(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Coordinator Availability & Slot Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure working hours, break intervals, slot durations, and daily capacity limits.
        </p>
      </div>

      {/* QUICK STATUS SWITCHER CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">DESK CONSULTATION STATUS</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => updateAvailabilityStatus('AVAILABLE')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              availability.status === 'AVAILABLE'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-emerald-400 live-pulse" />
            <span className="text-sm font-extrabold">● AVAILABLE</span>
            <span className="text-[10px] text-slate-400">Students can book slots</span>
          </button>

          <button
            onClick={() => updateAvailabilityStatus('ON_BREAK')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              availability.status === 'ON_BREAK'
                ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold ring-2 ring-amber-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-amber-400 live-pulse" />
            <span className="text-sm font-extrabold">● ON BREAK</span>
            <span className="text-[10px] text-slate-400">Consultations paused</span>
          </button>

          <button
            onClick={() => updateAvailabilityStatus('UNAVAILABLE')}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              availability.status === 'UNAVAILABLE'
                ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-bold ring-2 ring-rose-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="h-3 w-3 rounded-full bg-rose-400 live-pulse" />
            <span className="text-sm font-extrabold">● UNAVAILABLE</span>
            <span className="text-[10px] text-slate-400">Bookings disabled</span>
          </button>
        </div>
      </div>

      {/* CONFIGURATION FORM */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl space-y-6">
        
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-5 h-5 text-blue-400" />
          <span>Working Hours & Slot Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Start Time */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Desk Opening Time</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
            />
          </div>

          {/* End Time */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Desk Closing Time</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
            />
          </div>

          {/* Slot Duration */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Consultation Slot Duration</label>
            <select
              value={formData.slotDuration}
              onChange={(e) => setFormData(p => ({ ...p, slotDuration: parseInt(e.target.value, 10) }))}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
            >
              <option value={10}>10 Minutes / Slot</option>
              <option value={15}>15 Minutes / Slot (Default)</option>
              <option value={20}>20 Minutes / Slot</option>
              <option value={30}>30 Minutes / Slot</option>
            </select>
          </div>

          {/* Max Bookings */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Maximum Daily Appointments Cap</label>
            <input
              type="number"
              min="5"
              max="100"
              value={formData.maxBookings}
              onChange={(e) => setFormData(p => ({ ...p, maxBookings: parseInt(e.target.value, 10) }))}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
            />
          </div>

          {/* Break Start */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Lunch / Break Start Time</label>
            <input
              type="time"
              value={formData.breakStartTime}
              onChange={(e) => setFormData(p => ({ ...p, breakStartTime: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
            />
          </div>

          {/* Break End */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Lunch / Break Resume Time</label>
            <input
              type="time"
              value={formData.breakEndTime}
              onChange={(e) => setFormData(p => ({ ...p, breakEndTime: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>SAVE AVAILABILITY CONFIGURATION</span>
          </button>
        </div>

      </form>
    </div>
  );
}
