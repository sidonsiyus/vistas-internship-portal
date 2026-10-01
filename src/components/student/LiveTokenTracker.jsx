import React, { useState } from 'react';
import { Ticket, Users, Clock, AlertCircle, RefreshCw, CheckCircle2, ChevronRight, Volume2, Search, ArrowRight, MapPin, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TokenBadge from '../common/TokenBadge';
import StatusBadge from '../common/StatusBadge';
import { calculateEstimatedWaitTime, formatMinutesToReadable } from '../../utils/tokenGenerator';
import { OFFICE_LOCATION } from '../../mock/sampleData';

export default function LiveTokenTracker({ setActiveTab }) {
  const { appointments, trackedToken, setTrackedToken, availability } = useApp();
  const [searchInput, setSearchInput] = useState('');

  // Find currently active, called, and next tokens
  const currentlyServing = appointments.find(a => a.status === 'IN_PROGRESS');
  const calledStudent = appointments.find(a => a.status === 'CALLED');

  const waitingList = appointments.filter(a => a.status === 'WAITING' || a.status === 'CALLED');
  const nextTokenApt = waitingList.length > 0 ? waitingList[0] : null;

  // Find student's tracked token appointment
  const myAppointment = appointments.find(a => a.tokenNumber === trackedToken);

  // Calculate position and students ahead
  let myPosition = 0;
  let studentsAhead = 0;

  if (myAppointment && (myAppointment.status === 'WAITING' || myAppointment.status === 'CALLED')) {
    const idx = waitingList.findIndex(a => a.id === myAppointment.id);
    if (idx !== -1) {
      myPosition = idx + 1;
      studentsAhead = idx;
    }
  }

  const estimatedWaitMins = calculateEstimatedWaitTime(studentsAhead, 11);

  // Handle Token Search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      let formatted = searchInput.trim().toUpperCase();
      if (!formatted.startsWith('INT-') && !isNaN(formatted)) {
        formatted = `INT-${formatted.padStart(3, '0')}`;
      }
      setTrackedToken(formatted);
      setSearchInput('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-7 font-sans transition-colors duration-200">
      
      {/* Tracker Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 live-pulse" />
            <span>REAL-TIME LIVE QUEUE FEED</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Live Consultation Queue Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-updates instantly as the Internship Coordinator calls students. No refresh needed.
          </p>
        </div>

        {/* Search Token Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Track token e.g. INT-024"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
          >
            Track
          </button>
        </form>
      </div>

      {/* POSTPONED / RESCHEDULED APPOINTMENT BANNER */}
      {myAppointment && (myAppointment.postponedFromDate || myAppointment.rescheduledFromDate || myAppointment.isPriority || (myAppointment.notes && (myAppointment.notes.includes('[Postponed') || myAppointment.notes.includes('[Rescheduled')))) && (
        <div className={`p-5 rounded-2xl border-2 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
          myAppointment.isPriority
            ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-amber-400/70 dark:border-amber-500/50'
            : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
        }`}>
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl shadow-sm shrink-0 ${
              myAppointment.isPriority ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'
            }`}>
              {myAppointment.isPriority ? (
                <Sparkles className="w-6 h-6 animate-spin-slow" />
              ) : (
                <Calendar className="w-6 h-6" />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  myAppointment.isPriority 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-blue-600 text-white'
                }`}>
                  {myAppointment.isPriority ? '🗓️ APPOINTMENT POSTPONED — #1 PRIORITY' : '🗓️ APPOINTMENT RESCHEDULED'}
                </span>
                {(myAppointment.postponedFromDate || myAppointment.rescheduledFromDate) && (
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Originally booked: {myAppointment.postponedFromDate || myAppointment.rescheduledFromDate}
                    {(myAppointment.postponedFromTime || myAppointment.rescheduledFromTime) && ` at ${myAppointment.postponedFromTime || myAppointment.rescheduledFromTime}`}
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                New Consultation Schedule: {myAppointment.appointmentDate} at {myAppointment.appointmentTime}
              </h3>

              <div className="p-2.5 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <span>Reason for Change:</span>
                  <span className="font-normal text-slate-600 dark:text-slate-300">
                    {myAppointment.postponedReason || myAppointment.rescheduledReason || myAppointment.postponeReason || 'Coordinator updated schedule.'}
                  </span>
                </div>
                {myAppointment.isPriority && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                    ⭐ Because your appointment was moved by the coordinator, your token is placed at the front of the queue (#1 Priority) on {myAppointment.appointmentDate}.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-white/90 dark:bg-slate-900/90 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Queue Status</span>
            <span className={`text-lg font-extrabold font-mono ${
              myAppointment.isPriority ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
            }`}>
              {myAppointment.isPriority ? 'Priority #1' : myAppointment.appointmentTime}
            </span>
          </div>
        </div>
      )}

      {/* PENDING COORDINATOR APPROVAL BANNER */}
      {myAppointment?.status === 'PENDING_APPROVAL' && (
        <div className="p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-r from-amber-50/90 via-rose-50/60 to-transparent dark:from-amber-950/40 dark:via-rose-950/30 dark:to-transparent shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-sm shrink-0">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-amber-500 text-white">
                  ⚠️ EMERGENCY REQUEST — AWAITING COORDINATOR APPROVAL
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Pre-3:00 PM Slot: {myAppointment.appointmentDate} at {myAppointment.appointmentTime}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Emergency Consultation Justification Under Review
              </h3>

              {myAppointment.emergencyJustification && (
                <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200/80 dark:border-amber-900/60 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block text-[10px] uppercase tracking-wider mb-0.5">Your Submitted Emergency Reason:</span>
                  <p className="italic">"{myAppointment.emergencyJustification}"</p>
                </div>
              )}

              <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                The Placement Coordinator will review and either approve or deny this slot. Once approved, your active queue position will be confirmed.
              </p>
            </div>
          </div>

          <div className="shrink-0 bg-white/90 dark:bg-slate-900/90 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-800 text-right">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Approval Status</span>
            <span className="text-sm font-extrabold font-mono text-amber-600 dark:text-amber-400 animate-pulse">
              PENDING REVIEW
            </span>
          </div>
        </div>
      )}

      {/* CALL NOTIFICATION BANNER IF STUDENT IS CALLED */}
      {myAppointment?.status === 'CALLED' && (
        <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 p-5 rounded-xl border border-amber-300 dark:border-amber-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-700 dark:text-amber-300">
              <Volume2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-800 dark:text-amber-400 block">
                YOUR TOKEN IS CALLED NOW
              </span>
              <h3 className="text-xl font-bold tracking-tight text-amber-950 dark:text-white">
                TOKEN {myAppointment.tokenNumber} — PROCEED TO 7TH FLOOR STAFF ROOM
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                The Internship Coordinator is ready to meet you at Vels Hi-Tech Campus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN QUEUE METRICS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: NOW SERVING */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 live-pulse" />
                NOW SERVING
              </span>
              <StatusBadge status={currentlyServing ? 'IN_PROGRESS' : 'AVAILABLE'} size="small" />
            </div>

            {currentlyServing ? (
              <div className="space-y-2.5">
                <TokenBadge tokenNumber={currentlyServing.tokenNumber} size="large" variant="blue" />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{currentlyServing.studentName}</p>
                    {(currentlyServing.isBulk || currentlyServing.studentCount > 1) && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                        👥 Group ({currentlyServing.studentCount || currentlyServing.students?.length})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{currentlyServing.department}</p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium mt-0.5">{currentlyServing.category}</p>
                </div>
              </div>
            ) : (
              <div className="py-5 text-center text-slate-400 dark:text-slate-500 space-y-1.5">
                <Users className="w-7 h-7 mx-auto text-slate-400 dark:text-slate-500" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Desk Ready For Next Student</p>
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="truncate">{OFFICE_LOCATION}</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold shrink-0 ml-2">Live Sync</span>
          </div>
        </div>

        {/* Card 2: NEXT UP */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                NEXT IN QUEUE
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                ON DECK
              </span>
            </div>

            {calledStudent ? (
              <div className="space-y-2.5">
                <TokenBadge tokenNumber={calledStudent.tokenNumber} size="large" variant="orange" />
                <div>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{calledStudent.studentName}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{calledStudent.department}</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5 animate-pulse">Called • Approaching Desk</p>
                </div>
              </div>
            ) : nextTokenApt ? (
              <div className="space-y-2.5">
                <TokenBadge tokenNumber={nextTokenApt.tokenNumber} size="large" variant="amber" />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{nextTokenApt.studentName}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{nextTokenApt.department}</p>
                </div>
              </div>
            ) : (
              <div className="py-5 text-center text-slate-400 dark:text-slate-500 space-y-1.5">
                <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-500" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Queue is Clear</p>
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            Please be ready outside the Staff Room
          </div>
        </div>

        {/* Card 3: ESTIMATED PACE & QUEUE TIME */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
              QUEUE PACE & FORECAST
            </span>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Students Waiting</span>
                <span className="text-3xl font-bold text-slate-900 dark:text-white font-mono">{waitingList.length}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Avg Consultation Pace</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">~11 Minutes per student</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Coordinator is on schedule today</span>
          </div>
        </div>

      </div>

      {/* TRACKED TOKEN PERSONAL STATUS CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">YOUR TRACKED TOKEN</span>
            <div className="flex items-center gap-3 mt-1">
              {trackedToken ? (
                <TokenBadge tokenNumber={trackedToken} size="large" variant="blue" />
              ) : (
                <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">No Token Tracked</span>
              )}
              {myAppointment && <StatusBadge status={myAppointment.status} size="normal" />}
            </div>
          </div>

          {!myAppointment && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300">
              {trackedToken ? (
                <span>No active booking found for token <strong>{trackedToken}</strong>.</span>
              ) : (
                <span>Enter your Token Number above or book a slot to track live status.</span>
              )}
            </div>
          )}
        </div>

        {myAppointment ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            
            {/* Position Stat */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">YOUR QUEUE POSITION</span>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                {myAppointment.status === 'PENDING_APPROVAL' ? (
                  <span className="text-amber-500 text-lg font-bold block pt-1">Under Review</span>
                ) : myAppointment.isPriority ? (
                  <span className="text-amber-500 font-extrabold flex items-center justify-center gap-1">
                    <span>#1</span>
                    <span className="text-xs uppercase px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded">Priority</span>
                  </span>
                ) : myPosition > 0 ? myPosition : '—'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {myAppointment.status === 'PENDING_APPROVAL'
                  ? 'Awaiting coordinator approval'
                  : myAppointment.isPriority 
                  ? 'First student called when desk opens' 
                  : `${studentsAhead} student${studentsAhead === 1 ? '' : 's'} ahead of you`}
              </p>
            </div>

            {/* Estimated Wait Stat */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">ESTIMATED WAIT TIME</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {myAppointment.status === 'PENDING_APPROVAL'
                  ? 'Pending Review'
                  : myAppointment.isPriority ? 'Next Up (0-5 mins)' : myPosition > 0 ? formatMinutesToReadable(estimatedWaitMins) : '0 mins'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {myAppointment.status === 'PENDING_APPROVAL'
                  ? 'Queue position confirmed after validation'
                  : myAppointment.isPriority ? 'Top priority queue placement' : 'Based on live consultation pace'}
              </p>
            </div>

            {/* Status Human-friendly Message */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">LIVE ADVISORY</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {myAppointment.status === 'PENDING_APPROVAL' ? (
                  <span className="text-amber-800 dark:text-amber-300 font-medium">
                    ⚠️ Emergency justification under review by Coordinator. You will be notified here once approved.
                  </span>
                ) : myAppointment.status === 'CALLED' ? (
                  <span className="text-amber-700 dark:text-amber-300 font-semibold">Please proceed to 7th Floor Staff Room immediately!</span>
                ) : myAppointment.status === 'IN_PROGRESS' ? (
                  <span className="text-blue-700 dark:text-blue-300 font-semibold">You are currently meeting the Internship Coordinator.</span>
                ) : myAppointment.status === 'COMPLETED' ? (
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">✓ Consultation completed. Have a great day!</span>
                ) : myAppointment.isPriority ? (
                  <span className="text-amber-800 dark:text-amber-300 font-medium">
                    ⭐ Postponed slot: You will be called <strong>first</strong> for consultation on {myAppointment.appointmentDate} at {myAppointment.appointmentTime}.
                    {(myAppointment.postponedReason || myAppointment.rescheduledReason) && (
                      <span className="block mt-1 text-[11px] opacity-90">Reason: "{myAppointment.postponedReason || myAppointment.rescheduledReason}"</span>
                    )}
                  </span>
                ) : (myAppointment.rescheduledFromDate || (myAppointment.notes && myAppointment.notes.includes('[Rescheduled'))) ? (
                  <span className="text-blue-800 dark:text-blue-300 font-medium">
                    🗓️ Slot updated to {myAppointment.appointmentDate} at {myAppointment.appointmentTime}.
                    {(myAppointment.rescheduledReason || myAppointment.postponedReason) && (
                      <span className="block mt-1 text-[11px] opacity-90">Reason: "{myAppointment.rescheduledReason || myAppointment.postponedReason}"</span>
                    )}
                  </span>
                ) : (
                  <span>Please wait in the lounge. There are {studentsAhead} students ahead of you.</span>
                )}
              </p>
            </div>

            {/* If Bulk Appointment: Show attending students */}
            {(myAppointment.isBulk || (myAppointment.students && myAppointment.students.length > 1)) && (
              <div className="md:col-span-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    <span>Group Consultation ({myAppointment.studentCount || myAppointment.students?.length} Students Booked in this Slot)</span>
                  </span>
                  {myAppointment.companyName && (
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Company: {myAppointment.companyName}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {(myAppointment.students && myAppointment.students.length > 0
                    ? myAppointment.students
                    : [{ name: myAppointment.studentName, registerNumber: myAppointment.registerNumber, department: myAppointment.department, year: myAppointment.year, isLead: true }]
                  ).map((std, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {std.name} {std.isLead ? '(Lead)' : ''}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {std.department || myAppointment.department}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/60 shrink-0">
                        {std.registerNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-2">
            <button
              onClick={() => setActiveTab('book')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm inline-flex items-center gap-2 transition-colors"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Book a Consultation Slot Now</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
