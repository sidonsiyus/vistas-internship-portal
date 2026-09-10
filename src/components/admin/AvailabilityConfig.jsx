import React, { useState } from 'react';
import { Clock, Save, Sliders, Calendar, Plus, Trash2, Check, AlertCircle, Sun, CalendarCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const DAYS_OF_WEEK = [
  { key: 'Mon', label: 'Monday', short: 'Mon' },
  { key: 'Tue', label: 'Tuesday', short: 'Tue' },
  { key: 'Wed', label: 'Wednesday', short: 'Wed' },
  { key: 'Thu', label: 'Thursday', short: 'Thu' },
  { key: 'Fri', label: 'Friday', short: 'Fri' },
  { key: 'Sat', label: 'Saturday', short: 'Sat' },
  { key: 'Sun', label: 'Sunday', short: 'Sun' },
];

export default function AvailabilityConfig() {
  const { availability, updateAvailabilityConfig, updateAvailabilityStatus } = useApp();

  const [formData, setFormData] = useState({
    startTime: availability.startTime || '15:00',
    endTime: availability.endTime || '17:30',
    slotDuration: availability.slotDuration || 15,
    breakStartTime: availability.breakStartTime || '16:15',
    breakEndTime: availability.breakEndTime || '16:30',
    maxBookings: availability.maxBookings || 25,
    bookingDeadline: availability.bookingDeadline || '17:00',
    workingDays: availability.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    dateOverrides: availability.dateOverrides || {}
  });

  // Date override local form
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideType, setOverrideType] = useState('WORKING'); // 'WORKING' or 'HOLIDAY'
  const [overrideNote, setOverrideNote] = useState('');

  const toggleDay = (dayKey) => {
    setFormData(prev => {
      const exists = prev.workingDays.includes(dayKey);
      const updated = exists 
        ? prev.workingDays.filter(d => d !== dayKey)
        : [...prev.workingDays, dayKey];
      return { ...prev, workingDays: updated };
    });
  };

  const handleAddOverride = (e) => {
    e.preventDefault();
    if (!overrideDate) return;
    setFormData(prev => ({
      ...prev,
      dateOverrides: {
        ...prev.dateOverrides,
        [overrideDate]: {
          type: overrideType,
          note: overrideNote || (overrideType === 'WORKING' ? 'Special Working Day' : 'Office Holiday')
        }
      }
    }));
    setOverrideDate('');
    setOverrideNote('');
  };

  const handleRemoveOverride = (dateKey) => {
    setFormData(prev => {
      const copy = { ...prev.dateOverrides };
      delete copy[dateKey];
      return { ...prev, dateOverrides: copy };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAvailabilityConfig(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Coordinator Schedule & Working Days Controls
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure active working days (e.g. working Saturdays), holiday overrides, and session hours.
        </p>
      </div>

      {/* QUICK STATUS SWITCHER CARD */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          DESK CONSULTATION STATUS
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => updateAvailabilityStatus('AVAILABLE')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              availability.status === 'AVAILABLE'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold ring-1 ring-emerald-500'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 live-pulse" />
            <span className="text-xs font-bold">● AVAILABLE</span>
            <span className="text-[10px] text-slate-500">Students can book slots</span>
          </button>

          <button
            type="button"
            onClick={() => updateAvailabilityStatus('ON_BREAK')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              availability.status === 'ON_BREAK'
                ? 'bg-amber-50 border-amber-500 text-amber-700 font-semibold ring-1 ring-amber-500'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 live-pulse" />
            <span className="text-xs font-bold">● ON BREAK</span>
            <span className="text-[10px] text-slate-500">Consultations paused</span>
          </button>

          <button
            type="button"
            onClick={() => updateAvailabilityStatus('UNAVAILABLE')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              availability.status === 'UNAVAILABLE'
                ? 'bg-rose-50 border-rose-500 text-rose-700 font-semibold ring-1 ring-rose-500'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 live-pulse" />
            <span className="text-xs font-bold">● UNAVAILABLE</span>
            <span className="text-[10px] text-slate-500">Bookings disabled</span>
          </button>
        </div>
      </div>

      {/* WORKING DAYS CONFIGURATION SECTION */}
      <div className="bg-white border border-blue-200/80 p-5 rounded-2xl shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span>Weekly Working Days (Enable / Disable Days)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toggle which days of the week are available for student booking (e.g. enable Saturday for working Saturdays).
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {formData.workingDays.length} Active Days
          </span>
        </div>

        {/* Day Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isWorking = formData.workingDays.includes(day.key);
            const isSatOrSun = day.key === 'Sat' || day.key === 'Sun';

            return (
              <button
                type="button"
                key={day.key}
                onClick={() => toggleDay(day.key)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                  isWorking
                    ? isSatOrSun
                      ? 'bg-blue-50 border-blue-400 text-blue-800 ring-1 ring-blue-400 font-semibold'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-1 ring-emerald-400 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-mono font-bold">{day.short}</span>
                <span className="text-[10px] font-medium">
                  {isWorking ? (isSatOrSun ? 'Working Sat' : 'Working') : 'Off'}
                </span>
                {isWorking && <Check className="w-3 h-3 mt-0.5 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }))}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Mon – Fri (Standard)
          </button>
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }))}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            + Include Working Saturday (Mon – Sat)
          </button>
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }))}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            All 7 Days
          </button>
        </div>
      </div>

      {/* SPECIFIC CALENDAR DATE OVERRIDES (HOLIDAYS OR SPECIAL SATURDAYS) */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Specific Date Overrides (Special Working Days / Holidays)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mark a specific calendar date as a working day (e.g. a compensatory Saturday) or as a holiday.
            </p>
          </div>
        </div>

        {/* Add Override Form */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Select Date</label>
            <input
              type="date"
              value={overrideDate}
              onChange={(e) => setOverrideDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Day Type</label>
            <select
              value={overrideType}
              onChange={(e) => setOverrideType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            >
              <option value="WORKING">Working Day (Open for Bookings)</option>
              <option value="HOLIDAY">Holiday / Desk Closed</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Label / Reason (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Working Saturday or Campus Holiday"
              value={overrideNote}
              onChange={(e) => setOverrideNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={handleAddOverride}
            disabled={!overrideDate}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Override</span>
          </button>
        </div>

        {/* Existing Overrides List */}
        {Object.keys(formData.dateOverrides).length > 0 ? (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-semibold text-slate-600 block">Active Date Overrides:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(formData.dateOverrides).map(([dateStr, cfg]) => {
                const isWorking = typeof cfg === 'string' ? cfg === 'WORKING' : cfg.type === 'WORKING';
                const note = typeof cfg === 'string' ? (isWorking ? 'Working Day' : 'Holiday') : cfg.note;

                return (
                  <div
                    key={dateStr}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isWorking 
                        ? 'bg-blue-50/70 border-blue-200 text-blue-900' 
                        : 'bg-rose-50/70 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{dateStr}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          isWorking ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {isWorking ? 'Working Day' : 'Holiday'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{note}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveOverride(dateStr)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove override"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 italic pt-1">
            No date overrides active. The calendar strictly follows the weekly working days above.
          </p>
        )}
      </div>

      {/* HOURS & PARAMETERS FORM */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-5">
        
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-blue-600" />
          <span>Working Hours & Slot Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Time */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Desk Opening Time</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* End Time */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Desk Closing Time</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Slot Duration */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Consultation Slot Duration</label>
            <select
              value={formData.slotDuration}
              onChange={(e) => setFormData(p => ({ ...p, slotDuration: parseInt(e.target.value, 10) }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
            >
              <option value={10}>10 Minutes / Slot</option>
              <option value={15}>15 Minutes / Slot (Default)</option>
              <option value={20}>20 Minutes / Slot</option>
              <option value={30}>30 Minutes / Slot</option>
            </select>
          </div>

          {/* Max Bookings */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Maximum Daily Appointments Cap</label>
            <input
              type="number"
              min="5"
              max="100"
              value={formData.maxBookings}
              onChange={(e) => setFormData(p => ({ ...p, maxBookings: parseInt(e.target.value, 10) }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Break Start */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Lunch / Break Start Time</label>
            <input
              type="time"
              value={formData.breakStartTime}
              onChange={(e) => setFormData(p => ({ ...p, breakStartTime: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Break End */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Lunch / Break Resume Time</label>
            <input
              type="time"
              value={formData.breakEndTime}
              onChange={(e) => setFormData(p => ({ ...p, breakEndTime: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>SAVE AVAILABILITY & WORKING DAYS CONFIGURATION</span>
          </button>
        </div>

      </form>
    </div>
  );
}
