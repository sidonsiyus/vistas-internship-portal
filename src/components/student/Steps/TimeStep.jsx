import React from 'react';
import { Clock, Sunset, AlertTriangle, Info } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export default function TimeStep({ selectedDate, selectedTime, setSelectedTime, onNext, onBack }) {
  const { appointments } = useApp();

  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
  const todayDay = String(now.getDate()).padStart(2, '0');
  const todayIso = `${todayYear}-${todayMonth}-${todayDay}`;

  const isToday = selectedDate === todayIso;

  // Check if a time slot has already passed today
  const isTimePassed = (timeVal) => {
    if (!isToday) return false;
    const parts = timeVal.split(' ');
    if (parts.length < 2) return false;
    const [timeStr, modifier] = parts;
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const currentH = now.getHours();
    const currentM = now.getMinutes();
    return currentH > hours || (currentH === hours && currentM >= minutes);
  };

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
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Select Consultation Time Slot</span>
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            15 Mins / Student
          </span>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          Showing real-time slot availability for <strong className="text-slate-900 font-semibold">{selectedDate}</strong> {isToday ? '(Today)' : ''}.
        </p>
      </div>

      {/* Sticky Selection Summary Card */}
      {selectedTime && (
        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
          isEmergencyTime
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEmergencyTime ? 'bg-rose-600' : 'bg-blue-600'} text-white shadow-sm`}>
              {isEmergencyTime ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                {isEmergencyTime ? 'EMERGENCY TIME SLOT SELECTED' : 'REGULAR CONSULTATION SLOT'}
              </p>
              <p className="text-sm font-bold text-slate-900">
                {selectedDate} at <span className="font-mono text-blue-700">{selectedTime}</span>
              </p>
              <p className="text-[11px] text-slate-500">15-minute consultation with Coordinator</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Slot Selected
          </span>
        </div>
      )}

      {/* SECTION 1: REGULAR CONSULTATIONS AFTER 3:00 PM */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Sunset className="w-4 h-4 text-orange-500" />
            <span>Regular Consultations (03:00 PM – 05:30 PM)</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            ● Live Status
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {regularAfter3Slots.map((slot) => {
            const isSelected = selectedTime === slot.value;
            const isBooked = checkIsBooked(slot.value);
            const passed = isTimePassed(slot.value);
            const isDisabled = isBooked || passed;

            let btnStyle = 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:shadow-sm';
            if (passed) {
              btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60';
            } else if (isBooked) {
              btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60';
            } else if (isSelected) {
              btnStyle = 'bg-blue-50/80 border-2 border-blue-600 text-blue-900 ring-2 ring-blue-500/10 shadow-sm';
            }

            return (
              <button
                key={slot.value}
                disabled={isDisabled}
                onClick={() => setSelectedTime(slot.value)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${btnStyle}`}
              >
                <span className="font-mono font-bold text-xs">{slot.time}</span>
                {passed ? (
                  <span className="text-[10px] font-medium text-slate-400">Passed</span>
                ) : isBooked ? (
                  <span className="text-[10px] font-bold uppercase text-rose-600">Booked</span>
                ) : isSelected ? (
                  <span className="text-[10px] font-semibold text-blue-700">Selected ✓</span>
                ) : (
                  <span className="text-[10px] font-semibold text-emerald-700">Available</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: EMERGENCY SLOTS BEFORE 3:00 PM */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Pre-3:00 PM Emergency Slots (Urgent Requests Only)</span>
          </div>
          <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            Emergency Justification Required
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {emergencySlots.map((slot) => {
            const isSelected = selectedTime === slot.value;
            const isBooked = checkIsBooked(slot.value);
            const passed = isTimePassed(slot.value);
            const isDisabled = isBooked || passed;

            let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-rose-300';
            if (passed) {
              btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60';
            } else if (isBooked) {
              btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60';
            } else if (isSelected) {
              btnStyle = 'bg-rose-50 border-2 border-rose-500 text-rose-900 ring-2 ring-rose-500/10 shadow-sm';
            }

            return (
              <button
                key={slot.value}
                disabled={isDisabled}
                onClick={() => setSelectedTime(slot.value)}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${btnStyle}`}
              >
                <span className="font-mono font-medium text-xs text-rose-800">{slot.value}</span>
                {passed ? (
                  <span className="text-[10px] font-medium text-slate-400">Passed</span>
                ) : isBooked ? (
                  <span className="text-[10px] font-bold uppercase text-rose-600">Booked</span>
                ) : (
                  <span className="text-[10px] text-slate-500">Emergency Only</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Policy Reminder */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <span>Booked slots are automatically locked in real time to prevent double-booking.</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 shadow-sm transition-all"
        >
          ← Back to Date
        </button>

        <button
          disabled={!selectedTime}
          onClick={onNext}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-sm transition-all"
        >
          Continue to Student Details →
        </button>
      </div>
    </div>
  );
}
