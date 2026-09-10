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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-500 live-pulse" />
            <span>REAL-TIME QUEUE MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Live Queue Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
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
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
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
      <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">STUDENTS WAITING</span>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{waitingQueue.length}</div>
        </div>

        <div className="border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">ESTIMATED QUEUE DURATION</span>
          <div className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
            {formatMinutesToReadable(metrics.totalWaitMinutes)}
          </div>
        </div>

        <div className="border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">AVERAGE PACE</span>
          <div className="text-2xl font-extrabold text-blue-600 font-mono mt-1">
            {metrics.avgDurationMinutes} Mins / Student
          </div>
        </div>

        <div>
          <span className="text-[11px] text-slate-500 uppercase font-semibold">EXPECTED COMPLETION</span>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
            04:45 PM
          </div>
        </div>
      </div>

      {/* NOW SERVING & NEXT UP GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* NOW SERVING CARD */}
        <div className="bg-white border-2 border-blue-200/80 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 live-pulse" />
              NOW SERVING
            </span>
            <StatusBadge status={currentlyServing ? 'IN_PROGRESS' : 'AVAILABLE'} />
          </div>

          {currentlyServing ? (
            <div className="space-y-3">
              <TokenBadge tokenNumber={currentlyServing.tokenNumber} size="large" variant="blue" />
              <div>
                <h3 className="text-base font-bold text-slate-900">{currentlyServing.studentName}</h3>
                <p className="text-xs text-slate-600">{currentlyServing.department} • Reg: {currentlyServing.registerNumber}</p>
                <p className="text-xs font-semibold text-blue-600 mt-1">{currentlyServing.category}</p>
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
            <div className="py-8 text-center text-slate-400 text-xs">
              No active meeting right now. Click Start on the next student in line.
            </div>
          )}
        </div>

        {/* CALLED / ON DECK CARD */}
        <div className="bg-white border border-amber-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              NEXT UP / CALLED
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ON DECK
            </span>
          </div>

          {calledStudent ? (
            <div className="space-y-3">
              <TokenBadge tokenNumber={calledStudent.tokenNumber} size="large" variant="orange" />
              <div>
                <h3 className="text-base font-bold text-slate-900">{calledStudent.studentName}</h3>
                <p className="text-xs text-slate-600">{calledStudent.department} • {calledStudent.appointmentTime}</p>
                <p className="text-xs font-bold text-amber-600 mt-1">Called • Student En Route to Office</p>
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
            <div className="py-8 text-center text-slate-400 text-xs">
              Call the next student in queue using the button below.
            </div>
          )}
        </div>

      </div>

      {/* FULL WAITING QUEUE LIST */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-blue-600" />
            <span>Active Queue Sequence ({waitingQueue.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Ordered by appointment time & arrival</span>
        </div>

        <div className="divide-y divide-slate-100">
          {waitingQueue.map((apt, idx) => (
            <div 
              key={apt.id}
              className={`py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                apt.status === 'CALLED' ? 'bg-amber-50/60 p-3.5 rounded-xl border border-amber-200' : ''
              }`}
            >
              {/* Left Student Info */}
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-slate-600 text-xs">
                  #{idx + 1}
                </div>

                <TokenBadge tokenNumber={apt.tokenNumber} size="normal" variant={apt.status === 'CALLED' ? 'orange' : 'blue'} />

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{apt.studentName}</span>
                    {apt.isWalkIn && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        WALK-IN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{apt.department} • {apt.appointmentTime}</p>
                  <p className="text-[11px] text-blue-600 font-medium mt-0.5">{apt.category}</p>
                </div>
              </div>

              {/* Right Queue Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={apt.status} size="normal" />

                <button
                  onClick={() => callStudent(apt.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 font-bold text-xs border border-amber-200 transition-colors flex items-center gap-1"
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
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold text-xs border border-slate-200 transition-colors"
                  title="Mark No-Show"
                >
                  <UserX className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => cancelAppointment(apt.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold text-xs border border-slate-200 transition-colors"
                  title="Cancel Booking"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {waitingQueue.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-9 h-9 mx-auto text-emerald-500/50" />
              <p className="text-sm font-bold text-slate-700">The Queue is Completely Clear!</p>
              <p className="text-xs text-slate-500">All students for this session have been served.</p>
            </div>
          )}
        </div>
      </div>

      <WalkInModal isOpen={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} />

    </div>
  );
}
