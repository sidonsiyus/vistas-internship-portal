import React, { useEffect } from 'react';
import { CheckCircle2, Ticket, Download, ArrowRight } from 'lucide-react';
import TokenBadge from '../../common/TokenBadge';
import { downloadIcsFile } from '../../../utils/calendar';
import { useApp } from '../../../context/AppContext';

export default function ConfirmationStep({ appointment, onTrackToken, onCancel }) {
  const { cancelAppointment } = useApp();

  useEffect(() => {
    try {
      if (window.confetti) {
        window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    } catch (e) {}
  }, []);

  if (!appointment) return null;

  const actualTokenNumber = appointment.tokenNumber;

  return (
    <div className="space-y-6 text-center">
      
      {/* Confirmation Header */}
      <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 mb-1">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          ✓ BOOKING CONFIRMED!
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Your consultation slot has been reserved. Please state your token number when called.
        </p>
      </div>

      {/* Prominent Token Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 rounded-2xl border border-blue-500/40 shadow-2xl space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">YOUR DIGITAL CONSULTATION TOKEN</span>
          <div className="py-2">
            <TokenBadge tokenNumber={actualTokenNumber} size="giant" variant="blue" />
          </div>
          <p className="text-xs text-emerald-400 font-mono font-bold">STATUS: CONFIRMED & QUEUED</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-left border-t border-b border-slate-800 py-4 text-xs">
          <div>
            <span className="text-slate-500 block font-medium">STUDENT NAME</span>
            <span className="font-bold text-white text-sm">{appointment.studentName}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">REGISTER NO.</span>
            <span className="font-bold text-white font-mono text-sm">{appointment.registerNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">DATE & TIME</span>
            <span className="font-bold text-blue-400">{appointment.appointmentDate} • {appointment.appointmentTime}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">CATEGORY</span>
            <span className="font-bold text-slate-200">{appointment.category}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
        <button
          onClick={onTrackToken}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl transition-all"
        >
          <Ticket className="w-4 h-4" />
          <span>TRACK MY TOKEN LIVE</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => downloadIcsFile(appointment)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 transition-all"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>CALENDAR (.ICS)</span>
        </button>
      </div>

      {/* Cancel Option */}
      <div className="pt-2">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to cancel this booking?')) {
              cancelAppointment(appointment.id);
              onCancel();
            }
          }}
          className="text-xs text-rose-400 hover:text-rose-300 underline font-medium"
        >
          Need to cancel this booking?
        </button>
      </div>
    </div>
  );
}
