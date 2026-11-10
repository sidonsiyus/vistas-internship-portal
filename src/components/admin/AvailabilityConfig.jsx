import React, { useState, useEffect } from 'react';
import { Clock, Save, Sliders, Calendar, Plus, Trash2, Check, AlertCircle, Sun, CalendarCheck, Sparkles, Coffee, Video, Globe, Link as LinkIcon, Power } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateRegularSlots, generateOnlineSlots, formatTimeDisplay } from '../../utils/slotGenerator';

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
    startTime: availability.startTime || '15:30',
    endTime: availability.endTime || '17:30',
    slotDuration: availability.slotDuration || 15,
    breakStartTime: availability.breakStartTime || '16:30',
    breakEndTime: availability.breakEndTime || '16:45',
    maxBookings: availability.maxBookings || 25,
    bookingDeadline: availability.bookingDeadline || '17:00',
    workingDays: availability.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    dateOverrides: availability.dateOverrides || {},
    onlineAppointmentsEnabled: !!availability.onlineAppointmentsEnabled,
    onlineStartTime: availability.onlineStartTime || '14:00',
    onlineEndTime: availability.onlineEndTime || '17:00',
    onlineSlotDuration: availability.onlineSlotDuration || 15,
    onlineMeetingLink: availability.onlineMeetingLink || ''
  });

  // Sync external updates (e.g. from Overview command bar toggle or cloud sync)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      onlineAppointmentsEnabled: !!availability.onlineAppointmentsEnabled,
      onlineStartTime: availability.onlineStartTime || prev.onlineStartTime,
      onlineEndTime: availability.onlineEndTime || prev.onlineEndTime,
      onlineSlotDuration: availability.onlineSlotDuration || prev.onlineSlotDuration,
      onlineMeetingLink: availability.onlineMeetingLink ?? prev.onlineMeetingLink
    }));
  }, [
    availability.onlineAppointmentsEnabled,
    availability.onlineStartTime,
    availability.onlineEndTime,
    availability.onlineSlotDuration,
    availability.onlineMeetingLink
  ]);

  // Date override local form
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideType, setOverrideType] = useState('WORKING'); // 'WORKING' or 'HOLIDAY'
  const [overrideNote, setOverrideNote] = useState('');

  const handleToggleOnline = () => {
    const nextEnabled = !formData.onlineAppointmentsEnabled;
    const nextState = { ...formData, onlineAppointmentsEnabled: nextEnabled };
    setFormData(nextState);
    updateAvailabilityConfig(nextState);
  };

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

  const onlinePreviewSlots = generateOnlineSlots({
    startTime: formData.onlineStartTime || '14:00',
    endTime: formData.onlineEndTime || '17:00',
    slotDuration: formData.onlineSlotDuration || 15
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Coordinator Schedule & Working Days Controls
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure active working days (e.g. working Saturdays), online appointment hours (2:00 PM – 5:00 PM), holiday overrides, and session hours.
        </p>
      </div>

      {/* QUICK STATUS SWITCHER CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          DESK CONSULTATION STATUS
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => updateAvailabilityStatus('AVAILABLE')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              availability.status === 'AVAILABLE'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 live-pulse" />
            <span className="text-xs font-bold">● AVAILABLE</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Students can book slots</span>
          </button>

          <button
            type="button"
            onClick={() => updateAvailabilityStatus('ON_BREAK')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              availability.status === 'ON_BREAK'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300 font-semibold ring-1 ring-amber-500'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 live-pulse" />
            <span className="text-xs font-bold">● ON BREAK</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Consultations paused</span>
          </button>

          <button
            type="button"
            onClick={() => updateAvailabilityStatus('UNAVAILABLE')}
            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
              availability.status === 'UNAVAILABLE'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 font-semibold ring-1 ring-rose-500'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 live-pulse" />
            <span className="text-xs font-bold">● UNAVAILABLE</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Bookings disabled</span>
          </button>
        </div>
      </div>

      {/* ONLINE CONSULTATIONS CONTROL CARD (2:00 PM – 5:00 PM) */}
      <div className={`bg-white dark:bg-slate-900 border-2 p-5 rounded-2xl shadow-sm space-y-4 transition-colors ${
        formData.onlineAppointmentsEnabled
          ? 'border-indigo-300 dark:border-indigo-800'
          : 'border-slate-200/80 dark:border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              formData.onlineAppointmentsEnabled
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Online Appointments (02:00 PM – 05:00 PM)
                </h3>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                  formData.onlineAppointmentsEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>
                  {formData.onlineAppointmentsEnabled ? '● Enabled for Students' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Allow students to book video/online consultations between 2:00 PM and 5:00 PM. Overlapping slots automatically block in-person bookings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleOnline}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs ${
              formData.onlineAppointmentsEnabled
                ? 'bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{formData.onlineAppointmentsEnabled ? 'Disable Online Bookings' : 'Enable Online Bookings'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Online Start Time
            </label>
            <input
              type="time"
              value={formData.onlineStartTime}
              onChange={(e) => setFormData(p => ({ ...p, onlineStartTime: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Default: 14:00 (02:00 PM)</span>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Online End Time
            </label>
            <input
              type="time"
              value={formData.onlineEndTime}
              onChange={(e) => setFormData(p => ({ ...p, onlineEndTime: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500">Default: 17:00 (05:00 PM)</span>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Online Slot Duration
            </label>
            <select
              value={formData.onlineSlotDuration}
              onChange={(e) => setFormData(p => ({ ...p, onlineSlotDuration: parseInt(e.target.value, 10) }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
            >
              <option value={10}>10 Minutes / Slot</option>
              <option value={15}>15 Minutes / Slot (Default)</option>
              <option value={20}>20 Minutes / Slot</option>
              <option value={30}>30 Minutes / Slot</option>
            </select>
            <span className="text-[10px] text-slate-500">Pace for online video calls</span>
          </div>
        </div>

        {/* Single Reusable Meeting Link */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Single Reusable Meeting Link (Google Meet / Zoom / Microsoft Teams)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="e.g. https://meet.google.com/abc-defg-hij"
              value={formData.onlineMeetingLink}
              onChange={(e) => setFormData(p => ({ ...p, onlineMeetingLink: e.target.value }))}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => updateAvailabilityConfig(formData)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Online Config</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            This single meeting link is automatically attached to all confirmed Online Appointments and shown to students on their Token Card & Live Tracker.
          </p>
        </div>

        {/* Online Slots Live Preview */}
        <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Online Slots Preview ({onlinePreviewSlots.length} Slots)</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {formatTimeDisplay(formData.onlineStartTime)} – {formatTimeDisplay(formData.onlineEndTime)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {onlinePreviewSlots.map(slot => (
              <span
                key={slot.value}
                className="px-2 py-1 rounded-lg text-[11px] font-mono font-medium bg-white dark:bg-slate-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800/80"
              >
                {slot.time}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* WORKING DAYS CONFIGURATION SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-900/50 p-5 rounded-2xl shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Weekly Working Days (Enable / Disable Days)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Toggle which days of the week are available for student booking (e.g. enable Saturday for working Saturdays).
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
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
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500 text-blue-800 dark:text-blue-200 ring-1 ring-blue-400 font-semibold'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-400 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span className="text-xs font-mono font-bold">{day.short}</span>
                <span className="text-[10px] font-medium">
                  {isWorking ? (isSatOrSun ? 'Working Sat' : 'Working') : 'Off'}
                </span>
                {isWorking && <Check className="w-3 h-3 mt-0.5 text-emerald-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }))}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Mon – Fri (Standard)
          </button>
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] }))}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60"
          >
            + Include Working Saturday (Mon – Sat)
          </button>
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }))}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            All 7 Days
          </button>
        </div>
      </div>

      {/* SPECIFIC CALENDAR DATE OVERRIDES (HOLIDAYS OR SPECIAL SATURDAYS) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Specific Date Overrides (Special Working Days / Holidays)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mark a specific calendar date as a working day (e.g. a compensatory Saturday) or as a holiday.
            </p>
          </div>
        </div>

        {/* Add Override Form */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">Select Date</label>
            <input
              type="date"
              value={overrideDate}
              onChange={(e) => setOverrideDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">Day Type</label>
            <select
              value={overrideType}
              onChange={(e) => setOverrideType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              <option value="WORKING" className="dark:bg-slate-800">Working Day (Open for Bookings)</option>
              <option value="HOLIDAY" className="dark:bg-slate-800">Holiday / Desk Closed</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">Label / Reason (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Working Saturday or Campus Holiday"
              value={overrideNote}
              onChange={(e) => setOverrideNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500"
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
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">Active Date Overrides:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(formData.dateOverrides).map(([dateStr, cfg]) => {
                const isWorking = typeof cfg === 'string' ? cfg === 'WORKING' : cfg.type === 'WORKING';
                const note = typeof cfg === 'string' ? (isWorking ? 'Working Day' : 'Holiday') : cfg.note;

                return (
                  <div
                    key={dateStr}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isWorking 
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-200' 
                        : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{dateStr}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          isWorking ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300' : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                        }`}>
                          {isWorking ? 'Working Day' : 'Holiday'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{note}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveOverride(dateStr)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
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
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
            No date overrides active. The calendar strictly follows the weekly working days above.
          </p>
        )}
      </div>

      {/* HOURS & PARAMETERS FORM */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-5">
        
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Working Hours & Slot Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Time */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Regular Consultation Start Time
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Regular slots start at this time (e.g. 15:30 = 03:30 PM). Slots before this are emergency.
            </span>
          </div>

          {/* End Time */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Regular Consultation End Time
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Desk closing time for student appointments (e.g. 17:30 = 05:30 PM).
            </span>
          </div>

          {/* Slot Duration */}
          <div className="space-y-1 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Consultation Slot Duration (Pace)
              </label>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                Current: {formData.slotDuration} Minutes per slot
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={formData.slotDuration}
                onChange={(e) => setFormData(p => ({ ...p, slotDuration: parseInt(e.target.value, 10) }))}
                className="w-full sm:w-1/2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none"
              >
                <option value={5} className="dark:bg-slate-800">5 Minutes / Slot (Rapid Check-in)</option>
                <option value={10} className="dark:bg-slate-800">10 Minutes / Slot (High Capacity - Fast Pace)</option>
                <option value={15} className="dark:bg-slate-800">15 Minutes / Slot (Standard Pace - Default)</option>
                <option value={20} className="dark:bg-slate-800">20 Minutes / Slot (In-Depth Review)</option>
                <option value={25} className="dark:bg-slate-800">25 Minutes / Slot</option>
                <option value={30} className="dark:bg-slate-800">30 Minutes / Slot (Extended Consultation)</option>
                <option value={45} className="dark:bg-slate-800">45 Minutes / Slot</option>
                <option value={60} className="dark:bg-slate-800">60 Minutes / Slot</option>
              </select>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, slotDuration: 10 }))}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    formData.slotDuration === 10
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  ⚡ 10 Mins (High Vol)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, slotDuration: 15 }))}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    formData.slotDuration === 15
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Standard 15 Mins
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, slotDuration: 20 }))}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    formData.slotDuration === 20
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  20 Mins
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, slotDuration: 30 }))}
                  className={`text-[11px] px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                    formData.slotDuration === 30
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  30 Mins
                </button>
              </div>
            </div>
          </div>

          {/* Max Bookings */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Maximum Daily Appointments Cap</label>
            <input
              type="number"
              min="5"
              max="100"
              value={formData.maxBookings}
              onChange={(e) => setFormData(p => ({ ...p, maxBookings: parseInt(e.target.value, 10) }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Break Start */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Administrative / Break Start Time</label>
            <input
              type="time"
              value={formData.breakStartTime}
              onChange={(e) => setFormData(p => ({ ...p, breakStartTime: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Break End */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Administrative / Break Resume Time</label>
            <input
              type="time"
              value={formData.breakEndTime}
              onChange={(e) => setFormData(p => ({ ...p, breakEndTime: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* LIVE PREVIEW OF GENERATED SLOTS */}
        {(() => {
          const previewSlots = generateRegularSlots({
            startTime: formData.startTime,
            endTime: formData.endTime,
            slotDuration: formData.slotDuration,
            breakStartTime: formData.breakStartTime,
            breakEndTime: formData.breakEndTime
          });

          return (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Live Booking Grid Preview for Students ({previewSlots.length} Regular Slots)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {formatTimeDisplay(formData.startTime)} – {formatTimeDisplay(formData.endTime)} ({formData.slotDuration} min intervals)
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {previewSlots.map((slot) => (
                  <span
                    key={slot.value}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                      slot.isBreak
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {slot.time}
                    {slot.isBreak && ' (Break)'}
                  </span>
                ))}
                {previewSlots.length === 0 && (
                  <span className="text-xs text-rose-500 italic">No slots fit within the chosen start and end times.</span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                * Note: Saving this will instantly update the slot intervals for all students booking consultations.
              </p>
            </div>
          );
        })()}

        {/* Submit Button */}
        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>SAVE TIMING & WORKING DAYS CONFIGURATION</span>
          </button>
        </div>

      </form>
    </div>
  );
}
