import React, { useState } from 'react';
import { Ticket, Users, Clock, AlertCircle, RefreshCw, CheckCircle2, ChevronRight, Volume2, Search, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TokenBadge from '../common/TokenBadge';
import StatusBadge from '../common/StatusBadge';
import { calculateEstimatedWaitTime, formatMinutesToReadable } from '../../utils/tokenGenerator';

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
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
      
      {/* Tracker Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-500 live-pulse" />
            <span>REAL-TIME LIVE QUEUE FEED</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Live Consultation Queue Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-updates instantly as the Internship Coordinator calls students. No refresh needed.
          </p>
        </div>

        {/* Search Token Input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Track token e.g. INT-024"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {/* CALL NOTIFICATION BANNER IF STUDENT IS CALLED */}
      {myAppointment?.status === 'CALLED' && (
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white p-6 rounded-2xl shadow-2xl animate-bounce flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-amber-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
              <Volume2 className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-200">
                🚨 YOUR TOKEN IS CALLED NOW!
              </span>
              <h3 className="text-2xl font-black tracking-tight">
                TOKEN {myAppointment.tokenNumber} — PROCEED TO 7TH FLOOR STAFF ROOM!
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                The Internship Coordinator is ready to meet you at Vels Hi-Tech Campus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MAIN QUEUE METRICS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: NOW SERVING */}
        <div className="bg-slate-900 border border-blue-500/40 p-6 rounded-2xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-400 live-pulse" />
                NOW SERVING
              </span>
              <StatusBadge status={currentlyServing ? 'IN_PROGRESS' : 'AVAILABLE'} />
            </div>

            {currentlyServing ? (
              <div className="space-y-3">
                <TokenBadge tokenNumber={currentlyServing.tokenNumber} size="large" variant="blue" />
                <div>
                  <p className="text-sm font-bold text-white">{currentlyServing.studentName}</p>
                  <p className="text-xs text-slate-400">{currentlyServing.department}</p>
                  <p className="text-[11px] text-blue-400 font-medium mt-1">{currentlyServing.category}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">Desk Ready For Next Student</p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Location: 7th Floor Staff Room, Vels Hi-Tech Campus</span>
            <span className="font-mono text-emerald-400">Live Sync</span>
          </div>
        </div>

        {/* Card 2: NEXT UP */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                NEXT IN QUEUE
              </span>
              <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                ON DECK
              </span>
            </div>

            {calledStudent ? (
              <div className="space-y-3">
                <TokenBadge tokenNumber={calledStudent.tokenNumber} size="large" variant="orange" />
                <div>
                  <p className="text-sm font-bold text-orange-300">{calledStudent.studentName}</p>
                  <p className="text-xs text-slate-400">{calledStudent.department}</p>
                  <p className="text-[11px] text-orange-400 font-bold mt-1 animate-pulse">Called • Approaching Desk</p>
                </div>
              </div>
            ) : nextTokenApt ? (
              <div className="space-y-3">
                <TokenBadge tokenNumber={nextTokenApt.tokenNumber} size="large" variant="amber" />
                <div>
                  <p className="text-sm font-bold text-white">{nextTokenApt.studentName}</p>
                  <p className="text-xs text-slate-400">{nextTokenApt.department}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/40" />
                <p className="text-xs font-semibold text-slate-400">Queue is Clear</p>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
            Please be ready outside Room 204
          </div>
        </div>

        {/* Card 3: ESTIMATED PACE & QUEUE TIME */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
              QUEUE PACE & FORECAST
            </span>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">Total Students Waiting</span>
                <span className="text-3xl font-extrabold text-white font-mono">{waitingList.length}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Avg Meeting Pace</span>
                <span className="text-sm font-bold text-slate-200">~11 Minutes per student</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-emerald-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Coordinator is on schedule today</span>
          </div>
        </div>

      </div>

      {/* TRACKED TOKEN PERSONAL STATUS CARD */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-blue-500/30 p-6 md:p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">YOUR TRACKED TOKEN</span>
            <div className="flex items-center gap-3 mt-1">
              {trackedToken ? (
                <TokenBadge tokenNumber={trackedToken} size="large" variant="blue" />
              ) : (
                <span className="text-sm text-slate-400 font-mono">No Token Tracked</span>
              )}
              {myAppointment && <StatusBadge status={myAppointment.status} size="large" />}
            </div>
          </div>

          {!myAppointment && (
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
              {trackedToken ? (
                <span>No active booking found for token <strong>{trackedToken}</strong>.</span>
              ) : (
                <span>Enter your Token Number above (e.g. INT-001) or book a slot to track your status.</span>
              )}
            </div>
          )}
        </div>

        {myAppointment ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            {/* Position Stat */}
            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">YOUR QUEUE POSITION</span>
              <div className="text-4xl font-extrabold text-blue-400 font-mono">{myPosition > 0 ? myPosition : '—'}</div>
              <p className="text-[11px] text-slate-500">{studentsAhead} student{studentsAhead === 1 ? '' : 's'} ahead of you</p>
            </div>

            {/* Estimated Wait Stat */}
            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 font-semibold uppercase">ESTIMATED WAIT TIME</span>
              <div className="text-2xl font-extrabold text-white font-mono">
                {myPosition > 0 ? formatMinutesToReadable(estimatedWaitMins) : '0 mins'}
              </div>
              <p className="text-[11px] text-slate-500">Based on live consultation pace</p>
            </div>

            {/* Status Human-friendly Message */}
            <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold uppercase block">LIVE ADVISORY</span>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {myAppointment.status === 'CALLED' ? (
                  <span className="text-orange-400 font-bold">🚨 Please proceed to the Internship Coordinator's Office immediately!</span>
                ) : myAppointment.status === 'IN_PROGRESS' ? (
                  <span className="text-blue-400 font-bold">You are currently meeting the Internship Coordinator.</span>
                ) : myAppointment.status === 'COMPLETED' ? (
                  <span className="text-emerald-400 font-bold">✓ Consultation completed. Have a great day!</span>
                ) : (
                  <span>Please wait in the waiting lounge. There are {studentsAhead} students ahead of you.</span>
                )}
              </p>
            </div>

          </div>
        ) : (
          <div className="text-center py-4">
            <button
              onClick={() => setActiveTab('book')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg inline-flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Book a Consultation Slot Now</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
