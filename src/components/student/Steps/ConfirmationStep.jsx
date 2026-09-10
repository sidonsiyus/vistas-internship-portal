import React, { useEffect } from 'react';
import { CheckCircle2, Ticket, Download, ArrowRight, MapPin } from 'lucide-react';
import TokenBadge from '../../common/TokenBadge';
import { downloadIcsFile } from '../../../utils/calendar';
import { useApp } from '../../../context/AppContext';

export const OFFICE_LOCATION = '7th Floor Staff Room, Vels Hi-Tech Campus';

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
    <div className="space-y-6 text-center font-sans">
      
      {/* Confirmation Header */}
      <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-full border border-emerald-200 text-emerald-600 mb-1">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          ✓ BOOKING CONFIRMED!
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Your consultation slot has been reserved. Please state your token number when called.
        </p>
      </div>

      {/* Prominent Token Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-md space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">YOUR DIGITAL CONSULTATION TOKEN</span>
          <div className="py-2">
            <TokenBadge tokenNumber={actualTokenNumber} size="giant" variant="blue" />
          </div>
          <p className="text-xs text-emerald-700 font-mono font-bold">STATUS: CONFIRMED & QUEUED</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-left border-t border-b border-slate-100 py-4 text-xs">
          <div>
            <span className="text-slate-500 block font-medium">STUDENT NAME</span>
            <span className="font-bold text-slate-900 text-sm">{appointment.studentName}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">REGISTER NO.</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{appointment.registerNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">DATE & TIME</span>
            <span className="font-bold text-blue-700">{appointment.appointmentDate} • {appointment.appointmentTime}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">CATEGORY</span>
            <span className="font-bold text-slate-800">{appointment.category}</span>
          </div>
          <div className="col-span-2 border-t border-slate-100 pt-2">
            <span className="text-slate-500 block font-medium">LOCATION</span>
            <span className="font-semibold text-slate-800 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              <span>{OFFICE_LOCATION}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
        <button
          onClick={onTrackToken}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
        >
          <Ticket className="w-4 h-4" />
          <span>TRACK MY TOKEN LIVE</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => downloadIcsFile(appointment)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-blue-600" />
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
          className="text-xs text-rose-600 hover:text-rose-700 underline font-medium"
        >
          Need to cancel this booking?
        </button>
      </div>
    </div>
  );
}
