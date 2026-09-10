import React from 'react';
import { Calendar as CalendarIcon, Check, Info } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export default function DateStep({ selectedDate, setSelectedDate, onNext }) {
  const { appointments, availability } = useApp();

  const maxSlotsPerDay = availability.maxBookings || 25;
  const activeWorkingDays = availability.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dateOverrides = availability.dateOverrides || {};

  // Real-time current date (no past days shown)
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const isPastClosingToday = currentHour > 17 || (currentHour === 17 && currentMinute >= 30);

  const baseToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Generate 10 upcoming days starting strictly from Today onwards
  const dates = Array.from({ length: 10 }).map((_, idx) => {
    const d = new Date(baseToday);
    d.setDate(baseToday.getDate() + idx);

    const yearStr = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const isoDate = `${yearStr}-${monthStr}-${dayStr}`;

    const dayNum = d.getDate();
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = idx === 0;
    const isTomorrow = idx === 1;

    let daySubLabel = weekday;
    if (isToday) daySubLabel = 'Today';
    else if (isTomorrow) daySubLabel = 'Tmrw';

    // Check specific date override (e.g. Working Saturday or Holiday)
    const override = dateOverrides[isoDate];
    const isOverrideWorking = override && (typeof override === 'string' ? override === 'WORKING' : override.type === 'WORKING');
    const isOverrideHoliday = override && (typeof override === 'string' ? override === 'HOLIDAY' : override.type === 'HOLIDAY');

    // Check against weekly working days
    const isStandardWorkingDay = activeWorkingDays.includes(weekday);
    const isWorkingDay = isOverrideWorking || (!isOverrideHoliday && isStandardWorkingDay);

    const isWeekend = d.getDay() === 0 || d.getDay() === 6; // Sat or Sun
    const isSpecialWorkingWeekend = isWorkingDay && isWeekend;

    // Live booked appointments count for this date
    const bookedForDate = appointments.filter(
      a => a.appointmentDate === isoDate && a.status !== 'CANCELLED'
    ).length;

    const slotsRemaining = Math.max(0, maxSlotsPerDay - bookedForDate);

    let status = 'AVAILABLE';
    if (!isWorkingDay) {
      status = isOverrideHoliday ? 'HOLIDAY' : 'UNAVAILABLE';
    } else if (isToday && isPastClosingToday) {
      status = 'CLOSED_TODAY';
    } else if (slotsRemaining === 0) {
      status = 'FULL';
    } else if (slotsRemaining <= 5) {
      status = 'LIMITED';
    }

    return {
      date: isoDate,
      day: dayNum,
      weekday,
      daySubLabel,
      isToday,
      status,
      isSpecialWorkingWeekend,
      override,
      slotsLeft: slotsRemaining,
      bookedCount: bookedForDate
    };
  });

  const monthYearLabel = baseToday.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <span>Step 1: Select Consultation Date</span>
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Select an upcoming consultation date. Working days and Saturday hours are managed dynamically by the Coordinator.
        </p>
      </div>

      {/* Month & Status Header */}
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-slate-900">{monthYearLabel}</span>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
            Active Schedule
          </span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Regular hours after 3:00 PM
        </span>
      </div>

      {/* Dynamic Upcoming Dates Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {dates.map((item) => {
          const isSelected = selectedDate === item.date;
          const isDisabled = item.status === 'UNAVAILABLE' || item.status === 'HOLIDAY' || item.status === 'FULL' || item.status === 'CLOSED_TODAY';

          let statusStyle = 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm text-slate-800';
          let badge = null;

          if (item.isSpecialWorkingWeekend && item.status === 'AVAILABLE') {
            badge = <span className="text-[10px] text-blue-700 font-semibold">Working {item.weekday}! ({item.slotsLeft})</span>;
          } else if (item.status === 'AVAILABLE') {
            badge = <span className="text-[10px] text-emerald-700 font-semibold">{item.slotsLeft} slots open</span>;
          } else if (item.status === 'LIMITED') {
            badge = <span className="text-[10px] text-amber-800 font-semibold">Only {item.slotsLeft} left!</span>;
          } else if (item.status === 'FULL') {
            statusStyle = 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed';
            badge = <span className="text-[10px] text-rose-600 font-semibold">Fully Booked</span>;
          } else if (item.status === 'CLOSED_TODAY') {
            statusStyle = 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed';
            badge = <span className="text-[10px] text-slate-400 font-semibold">Hours Passed</span>;
          } else if (item.status === 'HOLIDAY') {
            statusStyle = 'bg-slate-50/70 border-slate-200 text-slate-400 cursor-not-allowed opacity-60';
            badge = <span className="text-[10px] text-amber-700 font-semibold">Holiday / Off</span>;
          } else if (item.status === 'UNAVAILABLE') {
            statusStyle = 'bg-slate-50/70 border-slate-200 text-slate-400 cursor-not-allowed opacity-60';
            badge = <span className="text-[10px] text-slate-400 font-medium">{item.weekday === 'Sat' || item.weekday === 'Sun' ? 'Weekend Off' : 'Day Off'}</span>;
          }

          if (isSelected) {
            statusStyle = 'bg-blue-50/80 border-2 border-blue-600 text-blue-900 shadow-sm ring-2 ring-blue-500/10';
          }

          return (
            <button
              key={item.date}
              disabled={isDisabled}
              onClick={() => setSelectedDate(item.date)}
              className={`p-4 rounded-xl border flex flex-col items-center justify-between gap-1.5 transition-all text-center relative ${statusStyle}`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-xs uppercase font-semibold text-slate-500">{item.daySubLabel}</span>
                {item.isToday && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 live-pulse" />
                )}
              </div>
              <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">{item.day}</span>
              {badge}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600" /> Working Sat</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Limited / Holiday</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Fully Booked</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" /> Day Off</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Real-time availability synced with Coordinator Schedule.</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end pt-3">
        <button
          disabled={!selectedDate}
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-sm transition-all"
        >
          Continue to Select Time →
        </button>
      </div>
    </div>
  );
}
