import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Hourglass, 
  Volume2, 
  Play, 
  Square, 
  UserPlus, 
  AlertCircle, 
  FileEdit,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TokenBadge from '../common/TokenBadge';
import StatusBadge from '../common/StatusBadge';
import WalkInModal from './WalkInModal';
import Modal from '../common/Modal';
import { calculateQueueMetrics } from '../../utils/tokenGenerator';

export default function OverviewDashboard({ setActiveAdminPage }) {
  const { 
    appointments, 
    availability, 
    activeMeeting, 
    callStudent, 
    startMeeting, 
    endMeeting, 
    markNoShow,
    updateAvailabilityStatus,
    resetAllTokens
  } = useApp();

  const metrics = calculateQueueMetrics(appointments);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isEndMeetingOpen, setIsEndMeetingOpen] = useState(false);
  const [meetingNotes, setMeetingNotes] = useState('');

  // Live Timer State for currently meeting student
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (activeMeeting?.startedAt) {
      const startTime = new Date(activeMeeting.startedAt).getTime();
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setTimerSeconds(elapsed > 0 ? elapsed : 0);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeMeeting]);

  const formatTimer = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Find currently meeting, called, and next student in line
  const currentlyMeetingApt = appointments.find(a => a.status === 'IN_PROGRESS');
  const calledApt = appointments.find(a => a.status === 'CALLED');
  const waitingQueue = appointments.filter(a => a.status === 'WAITING' || a.status === 'CALLED');
  const nextInLineApt = waitingQueue.length > 0 ? waitingQueue[0] : null;

  const handleCompleteMeetingSubmit = () => {
    if (currentlyMeetingApt) {
      const mins = Math.ceil(timerSeconds / 60) || 10;
      endMeeting(currentlyMeetingApt.id, meetingNotes, mins);
      setMeetingNotes('');
      setIsEndMeetingOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* COMMAND CENTER QUICK ACTION BAR */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 live-pulse" />
          <div>
            <h3 className="text-sm font-extrabold text-white">Coordinating Desk Command Bar</h3>
            <p className="text-xs text-slate-400">One-click controls for daily consultation workflow</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => updateAvailabilityStatus('AVAILABLE')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
          >
            ▶ START DAY
          </button>
          <button
            onClick={() => updateAvailabilityStatus('ON_BREAK')}
            className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
          >
            ☕ PAUSE (LUNCH BREAK)
          </button>
          <button
            onClick={() => updateAvailabilityStatus('UNAVAILABLE')}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
          >
            ⏹ END DAY
          </button>

          <button
            onClick={() => {
              if (confirm('🔥 DANGER ZONE: Are you sure you want to reset all tokens and clear the active queue? This will delete all appointments for today.')) {
                resetAllTokens();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 hover:text-white text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
          >
            🔥 RESET QUEUE
          </button>

          <button
            onClick={() => setIsWalkInOpen(true)}
            className="ml-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ ADD WALK-IN</span>
          </button>
        </div>
      </div>

      {/* TOP 4 KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">TODAY'S TOTAL</span>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">{metrics.totalToday}</div>
            <span className="text-[10px] text-slate-500 font-medium">Booked Appointments</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">COMPLETED</span>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">{metrics.completedCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">Consultations Done</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">WAITING QUEUE</span>
            <div className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{metrics.waitingCount}</div>
            <span className="text-[10px] text-slate-500 font-medium">Students In Queue</span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Hourglass className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">ESTIMATED WORK LEFT</span>
            <div className="text-2xl font-extrabold text-sky-400 font-mono mt-1">~{metrics.totalWaitMinutes} Mins</div>
            <span className="text-[10px] text-slate-500 font-medium">Expected completion 04:15 PM</span>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* PROMINENT LIVE MEETING CONTROL CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-2 border-blue-500/40 p-6 md:p-8 rounded-2xl shadow-2xl space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-blue-400 live-pulse" />
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {currentlyMeetingApt ? 'CURRENTLY MEETING STUDENT' : 'READY FOR NEXT STUDENT'}
              </h2>
              <p className="text-xs text-slate-400">Live Meeting Console & Digital Duration Counter</p>
            </div>
          </div>

          {currentlyMeetingApt && (
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-blue-500/30 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-400 animate-spin" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">MEETING DURATION</span>
                <span className="text-2xl font-black font-mono text-blue-400 tracking-wider">
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Meeting Info Content */}
        {currentlyMeetingApt ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            {/* Student Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-4">
                <TokenBadge tokenNumber={currentlyMeetingApt.tokenNumber} size="large" variant="blue" />
                <div>
                  <h3 className="text-2xl font-bold text-white">{currentlyMeetingApt.studentName}</h3>
                  <p className="text-xs text-slate-300">{currentlyMeetingApt.department} • {currentlyMeetingApt.year}</p>
                  <p className="text-xs font-mono text-slate-400">Reg: {currentlyMeetingApt.registerNumber}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Query Category: {currentlyMeetingApt.category}
                </span>
                <p className="text-xs text-slate-300 italic">
                  "{currentlyMeetingApt.description || 'No additional details provided.'}"
                </p>
              </div>
            </div>

            {/* Actions for Currently Meeting */}
            <div className="space-y-3 flex flex-col justify-center">
              <button
                onClick={() => setIsEndMeetingOpen(true)}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>END MEETING & COMPLETE</span>
              </button>

              <button
                onClick={() => markNoShow(currentlyMeetingApt.id)}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 text-xs font-semibold border border-slate-800 transition-colors"
              >
                Mark Student As No-Show
              </button>
            </div>

          </div>
        ) : (
          /* When No Meeting Active: Show Next Student */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            <div className="lg:col-span-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">NEXT STUDENT IN QUEUE</span>
              {nextInLineApt ? (
                <div className="flex items-center gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <TokenBadge tokenNumber={nextInLineApt.tokenNumber} size="large" variant={nextInLineApt.status === 'CALLED' ? 'orange' : 'amber'} />
                  <div>
                    <h3 className="text-lg font-bold text-white">{nextInLineApt.studentName}</h3>
                    <p className="text-xs text-slate-300">{nextInLineApt.department} • {nextInLineApt.appointmentTime}</p>
                    <p className="text-xs font-semibold text-blue-400 mt-0.5">{nextInLineApt.category}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
                  No students currently waiting in queue.
                </div>
              )}
            </div>

            {/* Actions for Calling/Starting next */}
            <div className="space-y-3">
              {nextInLineApt && (
                <>
                  <button
                    onClick={() => callStudent(nextInLineApt.id)}
                    className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Volume2 className="w-5 h-5 animate-pulse" />
                    <span>CALL STUDENT (ALERT)</span>
                  </button>

                  <button
                    onClick={() => startMeeting(nextInLineApt.id)}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-5 h-5" />
                    <span>START CONSULTATION MEETING</span>
                  </button>
                </>
              )}
            </div>

          </div>
        )}

      </div>

      {/* QUICK QUEUE SNAPSHOT */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">Live Waiting Queue ({waitingQueue.length})</h3>
          <button
            onClick={() => setActiveAdminPage('live-queue')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>Open Full Queue Manager</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {waitingQueue.slice(0, 5).map((apt, idx) => (
            <div key={apt.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-500 font-bold w-5">#{idx + 1}</span>
                <TokenBadge tokenNumber={apt.tokenNumber} size="small" variant={apt.status === 'CALLED' ? 'orange' : 'blue'} />
                <div>
                  <span className="font-bold text-white block">{apt.studentName}</span>
                  <span className="text-slate-400">{apt.department} • {apt.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={apt.status} size="normal" />
                <button
                  onClick={() => startMeeting(apt.id)}
                  className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-semibold text-[11px] transition-colors"
                >
                  Start
                </button>
              </div>
            </div>
          ))}

          {waitingQueue.length === 0 && (
            <div className="py-6 text-center text-slate-500 text-xs">
              Queue is completely empty. Take a moment to prepare for upcoming slots.
            </div>
          )}
        </div>
      </div>

      {/* WALK-IN MODAL */}
      <WalkInModal isOpen={isWalkInOpen} onClose={() => setIsWalkInOpen(false)} />

      {/* END MEETING CONFIRMATION MODAL */}
      <Modal isOpen={isEndMeetingOpen} onClose={() => setIsEndMeetingOpen(false)} title="✓ Complete Consultation Meeting" maxWidth="max-w-md">
        <div className="space-y-4 text-xs text-slate-200">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <p className="text-xs font-bold text-white">Student: {currentlyMeetingApt?.studentName}</p>
            <p className="text-xs font-mono text-blue-400">Token: {currentlyMeetingApt?.tokenNumber}</p>
            <p className="text-xs text-slate-400">Meeting Duration: <strong>{formatTimer(timerSeconds)}</strong></p>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold">Private Coordinator Notes (Optional)</label>
            <textarea
              rows="3"
              placeholder="Record any guidance given, approved documents, or follow-up tasks..."
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsEndMeetingOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleCompleteMeetingSubmit}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
            >
              COMPLETE & NEXT STUDENT →
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
