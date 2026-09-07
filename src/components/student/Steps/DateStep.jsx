import React from 'react';
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, Info } from 'lucide-react';

export default function DateStep({ selectedDate, setSelectedDate, onNext }) {
  // Calendar dates for September 2026
  const dates = [
    { date: '2026-09-07', label: 'Mon, Sep 7', day: '7', weekday: 'Mon', status: 'AVAILABLE', slotsLeft: 12 },
    { date: '2026-09-08', label: 'Tue, Sep 8', day: '8', weekday: 'Tue', status: 'AVAILABLE', slotsLeft: 18 },
    { date: '2026-09-09', label: 'Wed, Sep 9', day: '9', weekday: 'Wed', status: 'LIMITED', slotsLeft: 4 },
    { date: '2026-09-10', label: 'Thu, Sep 10', day: '10', weekday: 'Thu', status: 'FULL', slotsLeft: 0 },
    { date: '2026-09-11', label: 'Fri, Sep 11', day: '11', weekday: 'Fri', status: 'AVAILABLE', slotsLeft: 14 },
    { date: '2026-09-12', label: 'Sat, Sep 12', day: '12', weekday: 'Sat', status: 'UNAVAILABLE', slotsLeft: 0 },
    { date: '2026-09-13', label: 'Sun, Sep 13', day: '13', weekday: 'Sun', status: 'UNAVAILABLE', slotsLeft: 0 },
    { date: '2026-09-14', label: 'Mon, Sep 14', day: '14', weekday: 'Mon', status: 'AVAILABLE', slotsLeft: 20 },
    { date: '2026-09-15', label: 'Tue, Sep 15', day: '15', weekday: 'Tue', status: 'AVAILABLE', slotsLeft: 16 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          <span>Step 1: Select Consultation Date</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Choose an available date for your meeting with the Internship Coordinator.
        </p>
      </div>

      {/* Calendar Month Header */}
      <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-white">September 2026</span>
          <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
            Active Term
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <button disabled className="p-1 hover:text-white disabled:opacity-40">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button disabled className="p-1 hover:text-white disabled:opacity-40">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {dates.map((item) => {
          const isSelected = selectedDate === item.date;
          const isDisabled = item.status === 'UNAVAILABLE' || item.status === 'FULL';

          let statusStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200';
          let badge = null;

          if (item.status === 'AVAILABLE') {
            badge = <span className="text-[10px] text-emerald-400 font-semibold">{item.slotsLeft} slots</span>;
          } else if (item.status === 'LIMITED') {
            badge = <span className="text-[10px] text-amber-400 font-semibold">Only {item.slotsLeft} left!</span>;
          } else if (item.status === 'FULL') {
            statusStyle = 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed';
            badge = <span className="text-[10px] text-rose-500 font-semibold">Fully Booked</span>;
          } else if (item.status === 'UNAVAILABLE') {
            statusStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-50';
            badge = <span className="text-[10px] text-slate-500 font-semibold">Holiday / Off</span>;
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

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Limited</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Fully Booked</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600" /> Weekend / Off</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Consultations are 15 minutes each.</span>
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
