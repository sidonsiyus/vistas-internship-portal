import React, { useState } from 'react';
import { 
  ListOrdered, 
  UserPlus, 
  Volume2, 
  Play, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw, 
  UserX, 
  X, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TokenBadge from '../common/TokenBadge';
import StatusBadge from '../common/StatusBadge';
import WalkInModal from './WalkInModal';
import { calculateQueueMetrics, formatMinutesToReadable } from '../../utils/tokenGenerator';

export default function LiveQueueManager() {
  const { 
    appointments, 
    callStudent, 
    startMeeting, 
    endMeeting, 
    markNoShow, 
    cancelAppointment,
    resetAllTokens
  } = useApp();

  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  const currentlyServing = appointments.find(a => a.status === 'IN_PROGRESS');
  const calledStudent = appointments.find(a => a.status === 'CALLED');

  const waitingQueue = appointments.filter(a => a.status === 'WAITING' || a.status === 'CALLED');
  const metrics = calculateQueueMetrics(appointments);

  return (
    <div className="space-y-6">
      
      {/* Page Title & Queue Intelligence Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-500 live-pulse" />
            <span>REAL-TIME QUEUE MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Live Queue Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student sequence, call next token, inject walk-ins, and override priorities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('🔥 DANGER ZONE: Are you sure you want to delete all tokens and reset the queue sequence for today?')) {
                resetAllTokens();
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-900/50 transition-colors"
          >
            🔥 RESET ALL TOKENS
          </button>

          <button
            onClick={() => setIsWalkInOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ ADD WALK-IN STUDENT</span>
          </button>
        </div>
      </div>

      {/* QUEUE INTELLIGENCE FORECAST BOX */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-3 md:pb-0 md:pr-4">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">STUDENTS WAITING</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">{waitingQueue.length}</div>
        </div>

        <div className="border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-3 md:pb-0 md:pr-4">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">ESTIMATED QUEUE DURATION</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-1">
            {formatMinutesToReadable(metrics.totalWaitMinutes)}
          </div>
        </div>

        <div className="border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 pb-3 md:pb-0 md:pr-4">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">AVERAGE PACE</span>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-1">
            {metrics.avgDurationMinutes} Mins / Student
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">EXPECTED COMPLETION</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            04:45 PM
          </div>
        </div>
      </div>

      {/* NOW SERVING & NEXT UP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* NOW SERVING CARD */}
        <div className="bg-white dark:bg-slate-900 border-2 border-blue-200/80 dark:border-blue-900/60 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 live-pulse" />
              NOW SERVING
            </span>
            <StatusBadge status={currentlyServing ? 'IN_PROGRESS' : 'AVAILABLE'} />
          </div>

          {currentlyServing ? (
            <div className="space-y-3">
              <TokenBadge tokenNumber={currentlyServing.tokenNumber} size="large" variant="blue" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{currentlyServing.studentName}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{currentlyServing.department} • Reg: {currentlyServing.registerNumber}</p>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">{currentlyServing.category}</p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => endMeeting(currentlyServing.id, 'Consultation finished from Queue view')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                >
                  ✓ Complete Consultation
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No active meeting right now. Click Start on the next student in line.
            </div>
          )}
        </div>

        {/* CALLED / ON DECK CARD */}
        <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              NEXT UP / CALLED
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
              ON DECK
            </span>
          </div>

          {calledStudent ? (
            <div className="space-y-3">
              <TokenBadge tokenNumber={calledStudent.tokenNumber} size="large" variant="orange" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{calledStudent.studentName}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{calledStudent.department} • {calledStudent.appointmentTime}</p>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">Called • Student En Route to Office</p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => startMeeting(calledStudent.id)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
                >
                  ▶ Start Consultation
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              Call the next student in queue using the button below.
            </div>
          )}
        </div>

      </div>

      {/* FULL WAITING QUEUE LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Active Queue Sequence ({waitingQueue.length})</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Ordered by appointment time & arrival</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {waitingQueue.map((apt, idx) => (
            <div 
              key={apt.id}
              className={`py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                apt.status === 'CALLED' ? 'bg-amber-50/60 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40' : ''
              }`}
            >
              {/* Left Student Info */}
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono font-bold text-slate-600 dark:text-slate-300 text-xs">
                  #{idx + 1}
                </div>

                <TokenBadge tokenNumber={apt.tokenNumber} size="normal" variant={apt.status === 'CALLED' ? 'orange' : 'blue'} />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{apt.studentName}</span>
                    {apt.isWalkIn && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        WALK-IN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{apt.department} • {apt.appointmentTime}</p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">{apt.category}</p>
                </div>
              </div>

              {/* Right Queue Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={apt.status} size="normal" />

                <button
                  onClick={() => callStudent(apt.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-500 hover:text-white text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-800/60 transition-colors flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Call</span>
                </button>

                <button
                  onClick={() => startMeeting(apt.id)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start</span>
                </button>

                <button
                  onClick={() => markNoShow(apt.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                  title="Mark No-Show"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => cancelAppointment(apt.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
                  title="Cancel Booking"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {waitingQueue.length === 0 && (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <CheckCircle2 className="w-9 h-9 mx-auto text-emerald-500/50" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">The Queue is Completely Clear!</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">All students for this session have been served.</p>
            </div>
          )}
        </div>
      </div>

      <WalkInModal isOpen={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} />

    </div>
  );
}
