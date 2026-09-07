import React from 'react';
import { Calendar as CalendarIcon, Check, Info } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export default function DateStep({ selectedDate, setSelectedDate, onNext }) {
  const { appointments, availability } = useApp();

  const maxSlotsPerDay = availability.maxBookings || 25;

  // Generate 10 upcoming days starting from Today (Sep 7, 2026)
  const baseDate = new Date(2026, 8, 7); // September 7, 2026

  const dates = Array.from({ length: 10 }).map((_, idx) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + idx);

    const yearStr = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const isoDate = `${yearStr}-${monthStr}-${dayStr}`;

    const dayNum = d.getDate();
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const label = `${weekday}, ${d.toLocaleDateString('en-US', { month: 'short' })} ${dayNum}`;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6; // Sun or Sat

    // Calculate actual live booked appointments for this date
    const bookedForDate = appointments.filter(
      a => a.appointmentDate === isoDate && a.status !== 'CANCELLED'
    ).length;

    const slotsRemaining = Math.max(0, maxSlotsPerDay - bookedForDate);

    let status = 'AVAILABLE';
    if (isWeekend) {
      status = 'UNAVAILABLE';
    } else if (slotsRemaining === 0) {
      status = 'FULL';
    } else if (slotsRemaining <= 5) {
      status = 'LIMITED';
    }

    return {
      date: isoDate,
      label,
      day: dayNum,
      weekday,
      status,
      slotsLeft: slotsRemaining,
      bookedCount: bookedForDate
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          <span>Step 1: Select Consultation Date</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Dates dynamically calculate live availability based on student bookings.
        </p>
      </div>

      {/* Month Header */}
      <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-white">September 2026</span>
          <span className="text-xs px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
            Live Availability Engine
          </span>
        </div>
      </div>

      {/* Dynamic Date Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {dates.map((item) => {
          const isSelected = selectedDate === item.date;
          const isDisabled = item.status === 'UNAVAILABLE' || item.status === 'FULL';

          let statusStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200';
          let badge = null;

          if (item.status === 'AVAILABLE') {
            badge = <span className="text-[10px] text-emerald-400 font-semibold">{item.slotsLeft} slots open</span>;
          } else if (item.status === 'LIMITED') {
            badge = <span className="text-[10px] text-amber-400 font-semibold">Only {item.slotsLeft} left!</span>;
          } else if (item.status === 'FULL') {
            statusStyle = 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed';
            badge = <span className="text-[10px] text-rose-500 font-semibold">Fully Booked</span>;
          } else if (item.status === 'UNAVAILABLE') {
            statusStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-50';
            badge = <span className="text-[10px] text-slate-500 font-semibold">Weekend Off</span>;
          }

          if (isSelected) {
            statusStyle = 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/20 ring-2 ring-blue-500/50';
          }

          return (
            <button
              key={item.date}
              disabled={isDisabled}
              onClick={() => setSelectedDate(item.date)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-between gap-2 transition-all text-center relative ${statusStyle}`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <span className="text-xs uppercase font-medium text-slate-400">{item.weekday}</span>
              <span className="text-2xl font-black font-mono tracking-tight">{item.day}</span>
              {badge}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Limited</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Fully Booked</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600" /> Weekend Off</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Calculated live from active Supabase database records.</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-4">
        <button
          disabled={!selectedDate}
          onClick={onNext}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg transition-all"
        >
          Continue to Select Time →
        </button>
      </div>
    </div>
  );
}
