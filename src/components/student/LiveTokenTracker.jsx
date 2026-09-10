import React, { useState } from 'react';
import { Ticket, Users, Clock, AlertCircle, RefreshCw, CheckCircle2, ChevronRight, Volume2, Search, ArrowRight, MapPin } from 'lucide-react';
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
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Track
          </button>
        </form>
      </div>

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
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{currentlyServing.studentName}</p>
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
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">{myPosition > 0 ? myPosition : '—'}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{studentsAhead} student{studentsAhead === 1 ? '' : 's'} ahead of you</p>
            </div>

            {/* Estimated Wait Stat */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">ESTIMATED WAIT TIME</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {myPosition > 0 ? formatMinutesToReadable(estimatedWaitMins) : '0 mins'}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Based on live consultation pace</p>
            </div>

            {/* Status Human-friendly Message */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">LIVE ADVISORY</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {myAppointment.status === 'CALLED' ? (
                  <span className="text-amber-700 dark:text-amber-300 font-semibold">Please proceed to 7th Floor Staff Room immediately!</span>
                ) : myAppointment.status === 'IN_PROGRESS' ? (
                  <span className="text-blue-700 dark:text-blue-300 font-semibold">You are currently meeting the Internship Coordinator.</span>
                ) : myAppointment.status === 'COMPLETED' ? (
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">✓ Consultation completed. Have a great day!</span>
                ) : (
                  <span>Please wait in the lounge. There are {studentsAhead} students ahead of you.</span>
                )}
              </p>
            </div>

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
