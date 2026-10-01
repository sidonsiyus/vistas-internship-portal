import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Star, 
  UserCheck, 
  FileText,
  Users,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { 
  getNextActiveWorkingDay, 
  getUpcomingActiveDays,
  getRecentAndUpcomingActiveDays,
  generateRegularSlots, 
  formatTimeDisplay,
  timeToMinutes
} from '../../utils/slotGenerator';
import TokenBadge from '../common/TokenBadge';

export default function RescheduleAppointmentModal({ isOpen, onClose, appointment }) {
  const { availability = {}, rescheduleAppointment } = useApp();

  const workingDays = availability.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dateOverrides = availability.dateOverrides || {};
  const regularStart = availability.startTime || '15:30';
  const regularEnd = availability.endTime || '17:30';
  const slotDuration = availability.slotDuration || 15;

  const nextActive = useMemo(() => {
    return getNextActiveWorkingDay(
      appointment?.appointmentDate || new Date().toISOString().split('T')[0],
      workingDays,
      dateOverrides
    );
  }, [appointment?.appointmentDate, workingDays, dateOverrides]);

  // Center around appointment date or today, showing both past days and future days
  const recentAndUpcomingDays = useMemo(() => {
    return getRecentAndUpcomingActiveDays(
      new Date().toISOString().split('T')[0],
      6, // past 6 working days
      12, // next 12 working days
      workingDays,
      dateOverrides
    );
  }, [workingDays, dateOverrides]);

  // Available regular slots
  const availableSlots = useMemo(() => {
    return generateRegularSlots({
      startTime: regularStart,
      endTime: regularEnd,
      slotDuration: slotDuration,
      breakStartTime: availability.breakStartTime,
      breakEndTime: availability.breakEndTime
    });
  }, [regularStart, regularEnd, slotDuration, availability.breakStartTime, availability.breakEndTime]);

  // Form State
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [keepFirst, setKeepFirst] = useState(false);
  const [reasonMode, setReasonMode] = useState('student_request');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track the ID of the appointment being edited so periodic background polling 
  // or parent re-renders do NOT wipe out the coordinator's selection!
  const targetKey = appointment?.id || appointment?.tokenNumber || null;

  useEffect(() => {
    if (appointment && isOpen) {
      setSelectedDate(appointment.appointmentDate || nextActive?.isoDate || '');
      const initialTime = appointment.appointmentTime 
        ? formatTimeDisplay(appointment.appointmentTime) 
        : (availableSlots[0]?.value || formatTimeDisplay(regularStart));
      setSelectedTime(initialTime);
      setKeepFirst(!!appointment.isPriority);
      setReasonMode('student_request');
      setCustomReason('');
    }
  }, [targetKey, isOpen]); // ONLY run when modal opens or target appointment changes, NOT on every 3s polling re-render!

  if (!appointment) return null;

  const reasonPresets = {
    student_request: 'Student requested change of date/time slot',
    academic_clash: 'Academic timetable / lab exam schedule conflict',
    duty: 'Coordinator unavailable / urgent administrative duty',
    sick_leave: 'Medical / sick leave requirement',
    custom: 'Other reason (custom coordinator remark)'
  };

  const finalReason = reasonMode === 'custom' 
    ? (customReason.trim() || 'Date/Time updated by Coordinator') 
    : reasonPresets[reasonMode];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const targetId = appointment.parentAppointment?.id || appointment.id || appointment.tokenNumber;
      await rescheduleAppointment(targetId, {
        newDate: selectedDate,
        newTime: selectedTime,
        reason: finalReason,
        keepFirst
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSameDateTime = String(selectedDate || '').trim() === String(appointment.appointmentDate || '').trim() && 
    timeToMinutes(selectedTime) === timeToMinutes(appointment.appointmentTime);
  const isSamePriority = Boolean(keepFirst) === Boolean(appointment.isPriority);
  const isSameAsCurrent = isSameDateTime && isSamePriority && !customReason.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🗓️ Modify Appointment Date & Slot Timing"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-700 dark:text-slate-300">
        
        {/* Student & Current Slot Context */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TokenBadge tokenNumber={appointment.tokenNumber} size="normal" variant="blue" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">{appointment.studentName}</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">Reg: {appointment.registerNumber || 'N/A'}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>Currently Scheduled:</span>
            <span className="font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/60 font-mono">
              {appointment.appointmentDate} at {appointment.appointmentTime}
            </span>
            {appointment.isPriority && (
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                ⭐ Priority #1
              </span>
            )}
          </div>
        </div>

        {/* Target Date Picker (Input + Quick Select Past & Future Active Days) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Select Date (Past, Today, or Future):</span>
            </label>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Choose any date or click an active day
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Quick Active Days Grid (Past, Today, Future) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
              <span>Quick Select Working Days:</span>
              <span className="text-[9px] text-slate-400 font-normal">Past ← | → Upcoming</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {recentAndUpcomingDays.map((day) => {
                const isSelected = selectedDate === day.isoDate;
                return (
                  <button
                    type="button"
                    key={day.isoDate}
                    onClick={() => setSelectedDate(day.isoDate)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-600 text-blue-900 dark:text-blue-100 font-semibold'
                        : day.isPast
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/40 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                        : day.isToday
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span>{day.weekday}</span>
                      {day.isPast && <span className="text-[9px] font-normal text-amber-700 dark:text-amber-400 uppercase">Past</span>}
                      {day.isToday && <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">Today</span>}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{day.isoDate}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Time Slot Selection */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Select Consultation Time Slot:</span>
          </label>

          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
            required
          >
            {availableSlots.map(slot => (
              <option key={slot.value} value={slot.value} className="dark:bg-slate-800">
                {slot.time} {slot.value === availableSlots[0]?.value ? '(First Slot)' : ''}
              </option>
            ))}
            {/* If existing slot is non-standard, include it */}
            {!availableSlots.some(s => s.value === selectedTime) && selectedTime && (
              <option value={selectedTime} className="dark:bg-slate-800">
                {selectedTime} (Custom Slot)
              </option>
            )}
          </select>
        </div>

        {/* Queue Priority Option */}
        <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={keepFirst}
              onChange={(e) => setKeepFirst(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Place Student First (#1 Priority in Queue) on the new date</span>
              </span>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed mt-0.5">
                Recommended if rescheduling due to coordinator unavailability or emergency postponement so the student is called first when the desk opens.
              </p>
            </div>
          </label>
        </div>

        {/* Reason / Coordinator Remark */}
        <div className="space-y-2">
          <label className="font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wider text-[11px]">
            Reason / Remark for Reschedule (Visible to Student):
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {Object.entries(reasonPresets).map(([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() => setReasonMode(key)}
                className={`p-2 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                  reasonMode === key
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold ring-1 ring-blue-500'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {reasonMode === 'custom' && (
            <textarea
              rows="2"
              placeholder="Enter custom explanation for student..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          )}
        </div>

        {/* Changes Diff Banner */}
        <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-900/60 text-[11px] text-blue-950 dark:text-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Updated Slot: <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>
              {keepFirst && <span className="font-bold text-amber-700 dark:text-amber-400"> (Rank #1 In Queue)</span>}
            </span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !selectedDate || !selectedTime || isSameAsCurrent}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Changes...' : isSameAsCurrent ? 'No Changes Made' : 'Save Date & Timing Changes'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
}
