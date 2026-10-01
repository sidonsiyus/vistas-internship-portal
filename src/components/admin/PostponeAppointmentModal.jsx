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
  ChevronRight
} from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { 
  getNextActiveWorkingDay, 
  getUpcomingActiveDays, 
  generateRegularSlots, 
  formatTimeDisplay 
} from '../../utils/slotGenerator';
import TokenBadge from '../common/TokenBadge';

export default function PostponeAppointmentModal({ isOpen, onClose, appointment }) {
  const { availability = {}, postponeAppointment } = useApp();

  const workingDays = availability.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dateOverrides = availability.dateOverrides || {};
  const regularStart = availability.startTime || '15:30';
  const regularEnd = availability.endTime || '17:30';
  const slotDuration = availability.slotDuration || 15;

  // Next active day calculation
  const nextActive = useMemo(() => {
    return getNextActiveWorkingDay(
      appointment?.appointmentDate || new Date().toISOString().split('T')[0],
      workingDays,
      dateOverrides
    );
  }, [appointment?.appointmentDate, workingDays, dateOverrides]);

  const upcomingActiveDays = useMemo(() => {
    return getUpcomingActiveDays(
      appointment?.appointmentDate || new Date().toISOString().split('T')[0],
      7,
      workingDays,
      dateOverrides
    );
  }, [appointment?.appointmentDate, workingDays, dateOverrides]);

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
  const [keepFirst, setKeepFirst] = useState(true);
  const [selectedReasonPreset, setSelectedReasonPreset] = useState('duty');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const targetKey = appointment?.id || appointment?.tokenNumber || null;

  // Initialize defaults whenever modal opens for an appointment
  useEffect(() => {
    if (appointment && nextActive && isOpen) {
      setSelectedDate(nextActive.isoDate);
      setSelectedTime(availableSlots.length > 0 ? availableSlots[0].value : formatTimeDisplay(regularStart));
      setKeepFirst(true);
      setSelectedReasonPreset('duty');
      setCustomReason('');
    }
  }, [targetKey, isOpen]);

  if (!appointment) return null;

  const reasonPresets = {
    duty: 'Coordinator on urgent administrative duty / meeting',
    unavailable: 'Coordinator desk temporarily unavailable today',
    council: 'Coordinator attending University Academic Council session',
    priority: 'Rescheduled for in-depth priority consultation',
    custom: 'Other reason (custom notice)'
  };

  const finalReason = selectedReasonPreset === 'custom' 
    ? (customReason.trim() || 'Rescheduled by Coordinator') 
    : reasonPresets[selectedReasonPreset];

  const handleConfirmPostpone = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const targetId = appointment.parentAppointment?.id || appointment.id || appointment.tokenNumber;
      await postponeAppointment(targetId, {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🗓️ Postpone Consultation to Next Active Day"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleConfirmPostpone} className="space-y-5 text-xs text-slate-700 dark:text-slate-300">
        
        {/* Student & Current Slot Context */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TokenBadge tokenNumber={appointment.tokenNumber} size="normal" variant="blue" />
              <span className="font-bold text-slate-900 dark:text-white text-sm">{appointment.studentName}</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">Reg: {appointment.registerNumber || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>Currently Scheduled:</span>
            <span className="font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/60 font-mono">
              {appointment.appointmentDate} at {appointment.appointmentTime}
            </span>
          </div>
        </div>

        {/* Target Reschedule Date Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Select Next Active Working Day:</span>
            </label>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ● Auto-detects Coordinator Working Days
            </span>
          </div>

          {/* Quick Active Days Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {upcomingActiveDays.map((day, idx) => {
              const isSelected = selectedDate === day.isoDate;
              const isNext = idx === 0;

              return (
                <button
                  type="button"
                  key={day.isoDate}
                  onClick={() => setSelectedDate(day.isoDate)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-600 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/10'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{day.weekday}</span>
                    {isNext && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        Next Active
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] mt-1">{day.isoDate}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slot Selection */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Consultation Slot on Rescheduled Day:</span>
          </label>

          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
          >
            {availableSlots.map(slot => (
              <option key={slot.value} value={slot.value} className="dark:bg-slate-800">
                {slot.time} {slot.value === availableSlots[0]?.value ? '(First Regular Slot - Recommended)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Priority 1st Position Checkbox */}
        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-1.5">
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
                <span>Keep Student First (#1 Priority in Queue) on the next active day</span>
              </span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed mt-0.5">
                This guarantees this student is placed at position #1 ahead of other appointments for that date so their delayed consultation is served immediately when desk opens.
              </p>
            </div>
          </label>
        </div>

        {/* Reason / Notice to Student */}
        <div className="space-y-2">
          <label className="font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wider text-[11px]">
            Reason for Postponement (Visible to Student):
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {Object.entries(reasonPresets).map(([key, label]) => (
              <button
                type="button"
                key={key}
                onClick={() => setSelectedReasonPreset(key)}
                className={`p-2 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                  selectedReasonPreset === key
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold ring-1 ring-blue-500'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {selectedReasonPreset === 'custom' && (
            <textarea
              rows="2"
              placeholder="Enter custom explanation for student..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          )}
        </div>

        {/* Summary Card Before Confirming */}
        <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-950 dark:text-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Moving to <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>
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
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !selectedDate || !selectedTime}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Rescheduling...' : 'Confirm & Postpone to Next Active Day'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
}
