import React from 'react';
import { Clock, Sunset, AlertTriangle, Info } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export default function TimeStep({ selectedDate, selectedTime, setSelectedTime, onNext, onBack }) {
  const { appointments } = useApp();

  // Pre-3:00 PM Emergency slots
  const emergencySlots = [
    { time: '11:00 AM (Emergency Only)', value: '11:00 AM' },
    { time: '11:30 AM (Emergency Only)', value: '11:30 AM' },
    { time: '01:30 PM (Emergency Only)', value: '01:30 PM' },
    { time: '02:30 PM (Emergency Only)', value: '02:30 PM' },
  ];

  // Regular slots after 3:00 PM (15-min intervals)
  const regularAfter3Slots = [
    { time: '03:00 PM', value: '03:00 PM' },
    { time: '03:15 PM', value: '03:15 PM' },
    { time: '03:30 PM', value: '03:30 PM' },
    { time: '03:45 PM', value: '03:45 PM' },
    { time: '04:00 PM', value: '04:00 PM' },
    { time: '04:15 PM', value: '04:15 PM' },
    { time: '04:30 PM', value: '04:30 PM' },
    { time: '04:45 PM', value: '04:45 PM' },
    { time: '05:00 PM', value: '05:00 PM' },
    { time: '05:15 PM', value: '05:15 PM' },
  ];

  const checkIsBooked = (timeVal) => {
    return appointments.some(
      a => a.appointmentDate === selectedDate &&
           a.appointmentTime === timeVal &&
           a.status !== 'CANCELLED'
    );
  };

  const isEmergencyTime = selectedTime && (
    selectedTime.includes('11:') || selectedTime.includes('01:') || selectedTime.includes('02:')
  );

  return (
    <div className="space-y-6 font-sans">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span>Select Consultation Time Slot</span>
          </h3>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            15 Mins / Student
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Showing real-time availability for <strong className="text-white">{selectedDate}</strong>.
        </p>
      </div>

      {/* Sticky Selection Summary Card */}
      {selectedTime && (
        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          isEmergencyTime
            ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
            : 'bg-blue-600/15 border-blue-500/40 text-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${isEmergencyTime ? 'bg-rose-600' : 'bg-blue-600'} text-white`}>
              {isEmergencyTime ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">
                {isEmergencyTime ? '🚨 EMERGENCY TIME SLOT SELECTED' : 'REGULAR CONSULTATION SLOT'}
              </p>
              <p className="text-sm font-bold text-white">
                {selectedDate} at <span className="font-mono text-blue-300">{selectedTime}</span>
              </p>
              <p className="text-[11px] text-slate-400">15-minute individual consultation session</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Slot Reserved
          </span>
        </div>
      )}

      {/* SECTION 1: REGULAR CONSULTATIONS AFTER 3:00 PM */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
            <Sunset className="w-4 h-4 text-orange-400" />
            <span>Regular Consultations (03:00 PM – 05:30 PM)</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            ● Live Slot Status
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {regularAfter3Slots.map((slot) => {
            const isSelected = selectedTime === slot.value;
            const isBooked = checkIsBooked(slot.value);

            let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700';
            if (isBooked) {
              btnStyle = 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed opacity-60';
            } else if (isSelected) {
              btnStyle = 'bg-blue-600/25 border-blue-500 text-white ring-2 ring-blue-500/50 shadow-lg';
            }

            return (
              <button
                key={slot.value}
                disabled={isBooked}
                onClick={() => setSelectedTime(slot.value)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${btnStyle}`}
              >
                <span className="font-mono font-bold text-sm">{slot.time}</span>
                {isBooked ? (
                  <span className="text-[10px] font-extrabold uppercase text-rose-500">Booked</span>
                ) : isSelected ? (
                  <span className="text-[10px] font-bold text-blue-300">Selected ✓</span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-400">Available</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: EMERGENCY SLOTS BEFORE 3:00 PM */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Pre-3:00 PM Emergency Slots (Urgent Requests Only)</span>
          </div>
          <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            Requires Emergency Reason
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {emergencySlots.map((slot) => {
            const isSelected = selectedTime === slot.value;
            const isBooked = checkIsBooked(slot.value);

            let btnStyle = 'bg-slate-900/80 border-slate-800/90 text-slate-300 hover:border-rose-500/40';
            if (isBooked) {
              btnStyle = 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed opacity-60';
            } else if (isSelected) {
              btnStyle = 'bg-rose-600/25 border-rose-500 text-white ring-2 ring-rose-500/50 shadow-lg';
            }

            return (
              <button
                key={slot.value}
                disabled={isBooked}
                onClick={() => setSelectedTime(slot.value)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${btnStyle}`}
              >
                <span className="font-mono font-bold text-xs text-rose-300">{slot.value}</span>
                {isBooked ? (
                  <span className="text-[10px] font-extrabold uppercase text-rose-500">Booked</span>
                ) : (
                  <span className="text-[10px] text-slate-400">Emergency Only</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Policy Reminder */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <span>Booked slots are automatically locked in real time to prevent double-booking.</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm border border-slate-800 transition-all"
        >
          ← Back to Date
        </button>

        <button
          disabled={!selectedTime}
          onClick={onNext}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg transition-all"
        >
          Continue to Student Details →
        </button>
      </div>
    </div>
  );
}
