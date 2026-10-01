import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Users, 
  AlertTriangle, 
  Check, 
  X, 
  Filter, 
  Search, 
  CalendarDays,
  Sparkles,
  CheckCircle2,
  Eye,
  Building,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TokenBadge from '../common/TokenBadge';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import RescheduleAppointmentModal from './RescheduleAppointmentModal';
import PostponeAppointmentModal from './PostponeAppointmentModal';
import { timeToMinutes } from '../../utils/slotGenerator';
import { DEPARTMENTS } from '../../mock/sampleData';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to format date object to YYYY-MM-DD
const toIsoDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CalendarView() {
  const { 
    appointments = [], 
    approveAppointment, 
    denyAppointment, 
    cancelAppointment, 
    markNoShow 
  } = useApp();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'day'

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Selected appointment for detail inspect modal
  const [selectedApt, setSelectedApt] = useState(null);
  const [rescheduleTargetApt, setRescheduleTargetApt] = useState(null);
  const [postponeTargetApt, setPostponeTargetApt] = useState(null);
  const [denyTargetApt, setDenyTargetApt] = useState(null);
  const [denyReason, setDenyReason] = useState('Emergency criteria not met. Please book during standard consultation hours.');

  const todayIso = useMemo(() => toIsoDate(new Date()), []);

  // Filtered appointments based on search and status
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        (apt.studentName && apt.studentName.toLowerCase().includes(q)) ||
        (apt.tokenNumber && apt.tokenNumber.toLowerCase().includes(q)) ||
        (apt.registerNumber && String(apt.registerNumber).toLowerCase().includes(q)) ||
        (apt.category && apt.category.toLowerCase().includes(q));

      const matchesStatus = !selectedStatus || apt.status === selectedStatus;
      const matchesDept = !selectedDept || apt.department === selectedDept;

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [appointments, searchTerm, selectedStatus, selectedDept]);

  // Map appointments by ISO date string
  const appointmentsByDate = useMemo(() => {
    const map = new Map();
    filteredAppointments.forEach(apt => {
      if (!apt.appointmentDate) return;
      const list = map.get(apt.appointmentDate) || [];
      list.push(apt);
      map.set(apt.appointmentDate, list);
    });

    // Sort each day's appointments by time
    map.forEach((list, key) => {
      list.sort((a, b) => timeToMinutes(a.appointmentTime) - timeToMinutes(b.appointmentTime));
    });

    return map;
  }, [filteredAppointments]);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentDate(prev => {
      const copy = new Date(prev);
      if (viewMode === 'month') {
        copy.setMonth(copy.getMonth() - 1);
      } else if (viewMode === 'week') {
        copy.setDate(copy.getDate() - 7);
      } else {
        copy.setDate(copy.getDate() - 1);
      }
      return copy;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      const copy = new Date(prev);
      if (viewMode === 'month') {
        copy.setMonth(copy.getMonth() + 1);
      } else if (viewMode === 'week') {
        copy.setDate(copy.getDate() + 7);
      } else {
        copy.setDate(copy.getDate() + 1);
      }
      return copy;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Header Title computed based on active view mode
  const headerTitle = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = MONTH_NAMES[currentDate.getMonth()];

    if (viewMode === 'month') {
      return `${month} ${year}`;
    }

    if (viewMode === 'week') {
      const dayOfWeek = currentDate.getDay(); // 0 is Sunday
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startMonth = MONTH_NAMES[startOfWeek.getMonth()].slice(0, 3);
      const endMonth = MONTH_NAMES[endOfWeek.getMonth()].slice(0, 3);

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startMonth} ${startOfWeek.getDate()} – ${endOfWeek.getDate()}, ${year}`;
      }
      return `${startMonth} ${startOfWeek.getDate()} – ${endMonth} ${endOfWeek.getDate()}, ${year}`;
    }

    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }

    return '';
  }, [currentDate, viewMode]);

  // Overall metric counts in period
  const totalPendingInPeriod = useMemo(() => {
    return appointments.filter(a => a.status === 'PENDING_APPROVAL').length;
  }, [appointments]);

  return (
    <div className="space-y-6 font-sans transition-colors duration-200">
      
      {/* CALENDAR HEADER & SWITCHES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>APPOINTMENTS SCHEDULE & CALENDAR DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span>{headerTitle}</span>
            {totalPendingInPeriod > 0 && (
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{totalPendingInPeriod} Emergency Approval{totalPendingInPeriod === 1 ? '' : 's'}</span>
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive consultation timeline. Switch between Monthly, Weekly, and Daily views.
          </p>
        </div>

        {/* View Switches & Nav Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* View Mode Buttons */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily
            </button>
          </div>

          {/* Date Navigation Controls */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-2xs">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search calendar by student name, token, register number, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING_APPROVAL">Pending Approval (Emergency)</option>
            <option value="WAITING">WAITING</option>
            <option value="CALLED">CALLED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="NO_SHOW">NO_SHOW</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: MONTHLY GRID */}
      {viewMode === 'month' && (
        <MonthCalendarGrid
          currentDate={currentDate}
          todayIso={todayIso}
          appointmentsByDate={appointmentsByDate}
          onSelectApt={setSelectedApt}
          onSelectDay={(dayIso) => {
            setCurrentDate(new Date(dayIso + 'T00:00:00'));
            setViewMode('day');
          }}
        />
      )}

      {/* VIEW 2: WEEKLY VIEW */}
      {viewMode === 'week' && (
        <WeekCalendarView
          currentDate={currentDate}
          todayIso={todayIso}
          appointmentsByDate={appointmentsByDate}
          onSelectApt={setSelectedApt}
          onApprove={approveAppointment}
          onDeny={(apt) => setDenyTargetApt(apt)}
        />
      )}

      {/* VIEW 3: DAILY VIEW */}
      {viewMode === 'day' && (
        <DayCalendarView
          currentDate={currentDate}
          todayIso={todayIso}
          appointmentsByDate={appointmentsByDate}
          onSelectApt={setSelectedApt}
          onReschedule={(apt) => setRescheduleTargetApt(apt)}
          onPostpone={(apt) => setPostponeTargetApt(apt)}
          onApprove={approveAppointment}
          onDeny={(apt) => setDenyTargetApt(apt)}
        />
      )}

      {/* DETAIL INSPECT MODAL */}
      <Modal 
        isOpen={!!selectedApt} 
        onClose={() => setSelectedApt(null)} 
        title={`Appointment File: ${selectedApt?.tokenNumber}`} 
        maxWidth="max-w-lg"
      >
        {selectedApt && (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 font-sans">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 dark:text-white text-base">{selectedApt.studentName}</span>
                  {selectedApt.isBulk && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Group ({selectedApt.studentCount || selectedApt.students?.length} Students)</span>
                    </span>
                  )}
                </div>
                <StatusBadge status={selectedApt.status} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Reg: {selectedApt.registerNumber || 'N/A'} • {selectedApt.department} • {selectedApt.year}
              </p>
              {selectedApt.email && <p className="text-xs text-slate-500">Email: {selectedApt.email}</p>}
              {selectedApt.phone && <p className="text-xs text-slate-500">Phone: {selectedApt.phone}</p>}
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Category: {selectedApt.category}</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                Date & Time: <strong>{selectedApt.appointmentDate} at {selectedApt.appointmentTime}</strong>
              </p>
            </div>

            {/* Emergency Justification Banner if present */}
            {(selectedApt.emergencyJustification || selectedApt.isEmergency) && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border-2 border-rose-300 dark:border-rose-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Emergency Slot Justification (Pre-3:00 PM)</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    selectedApt.status === 'PENDING_APPROVAL' 
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                  }`}>
                    {selectedApt.status === 'PENDING_APPROVAL' ? 'Approval Required' : 'Validated'}
                  </span>
                </div>
                <div className="p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-rose-200 dark:border-rose-900 text-xs text-rose-950 dark:text-rose-100 italic">
                  "{selectedApt.emergencyJustification || 'Urgent pre-3:00 PM slot requested.'}"
                </div>

                {selectedApt.status === 'PENDING_APPROVAL' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        approveAppointment(selectedApt.id);
                        setSelectedApt(null);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Add to Active Queue</span>
                    </button>
                    <button
                      onClick={() => {
                        const target = selectedApt;
                        setSelectedApt(null);
                        setDenyTargetApt(target);
                      }}
                      className="py-2 px-3 rounded-lg bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-300 dark:border-rose-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Deny Request</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Query description */}
            <div className="space-y-1">
              <span className="font-bold text-slate-600 dark:text-slate-400 block uppercase tracking-wider">Query Description:</span>
              <p className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {selectedApt.description || 'No description provided.'}
              </p>
            </div>

            {/* Coordinator notes */}
            {selectedApt.notes && (
              <div className="space-y-1">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block uppercase tracking-wider">Coordinator Notes:</span>
                <p className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
                  {selectedApt.notes}
                </p>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {selectedApt.status !== 'COMPLETED' && selectedApt.status !== 'CANCELLED' && selectedApt.status !== 'PENDING_APPROVAL' && (
                  <>
                    <button
                      onClick={() => {
                        const target = selectedApt;
                        setSelectedApt(null);
                        setRescheduleTargetApt(target);
                      }}
                      className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/60 transition-colors flex items-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Edit Slot</span>
                    </button>
                    <button
                      onClick={() => {
                        const target = selectedApt;
                        setSelectedApt(null);
                        setPostponeTargetApt(target);
                      }}
                      className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/60 transition-colors flex items-center gap-1.5"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>Postpone</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    cancelAppointment(selectedApt.id);
                    setSelectedApt(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                >
                  Cancel Booking
                </button>
              </div>

              <button
                onClick={() => setSelectedApt(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
              >
                Close File
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DENY MODAL */}
      <Modal
        isOpen={!!denyTargetApt}
        onClose={() => setDenyTargetApt(null)}
        title="Deny Emergency Consultation Request"
        maxWidth="max-w-md"
      >
        {denyTargetApt && (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 font-sans">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl space-y-1">
              <p className="font-bold text-rose-950 dark:text-rose-200 text-sm">
                Student: {denyTargetApt.studentName} ({denyTargetApt.registerNumber || 'N/A'})
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Slot: {denyTargetApt.appointmentDate} at {denyTargetApt.appointmentTime}
              </p>
              {denyTargetApt.emergencyJustification && (
                <p className="text-[11px] text-rose-800 dark:text-rose-300 italic pt-1 border-t border-rose-200/60 dark:border-rose-900/60">
                  Justification: "{denyTargetApt.emergencyJustification}"
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Reason for Denial (Visible to student in tracking log)
              </label>
              <textarea
                rows="3"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 resize-none shadow-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDenyTargetApt(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  denyAppointment(denyTargetApt.id || denyTargetApt.tokenNumber, denyReason);
                  setDenyTargetApt(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Confirm Denial
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* EDIT SLOT & POSTPONE MODALS */}
      <RescheduleAppointmentModal
        isOpen={!!rescheduleTargetApt}
        onClose={() => setRescheduleTargetApt(null)}
        appointment={rescheduleTargetApt}
      />

      <PostponeAppointmentModal
        isOpen={!!postponeTargetApt}
        onClose={() => setPostponeTargetApt(null)}
        appointment={postponeTargetApt}
      />

    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT 1: MONTHLY CALENDAR GRID
// -------------------------------------------------------------
function MonthCalendarGrid({ currentDate, todayIso, appointmentsByDate, onSelectApt, onSelectDay }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDay = new Date(year, month, 1).getDay();
  // Total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();
  // Total days in previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Construct cells for 6 weeks (42 cells max) or 5 weeks
  const cells = [];

  // Trailing previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevDate = new Date(year, month - 1, dayNum);
    cells.push({
      date: prevDate,
      isoDate: toIsoDate(prevDate),
      dayNumber: dayNum,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const currDate = new Date(year, month, dayNum);
    cells.push({
      date: currDate,
      isoDate: toIsoDate(currDate),
      dayNumber: dayNum,
      isCurrentMonth: true
    });
  }

  // Leading next month days to complete 35 or 42 cells
  const remaining = (cells.length <= 35 ? 35 : 42) - cells.length;
  for (let dayNum = 1; dayNum <= remaining; dayNum++) {
    const nextDate = new Date(year, month + 1, dayNum);
    cells.push({
      date: nextDate,
      isoDate: toIsoDate(nextDate),
      dayNumber: dayNum,
      isCurrentMonth: false
    });
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-center py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
        {WEEKDAY_NAMES_SHORT.map((dayName, idx) => (
          <div key={dayName} className={idx === 0 || idx === 6 ? 'text-rose-500/80 dark:text-rose-400/80' : ''}>
            {dayName}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
        {cells.map((cell) => {
          const dayApts = appointmentsByDate.get(cell.isoDate) || [];
          const isToday = cell.isoDate === todayIso;
          const pendingCount = dayApts.filter(a => a.status === 'PENDING_APPROVAL').length;

          return (
            <div
              key={cell.isoDate}
              onClick={() => onSelectDay(cell.isoDate)}
              className={`min-h-[110px] p-2 transition-all flex flex-col justify-between cursor-pointer group ${
                cell.isCurrentMonth
                  ? isToday
                    ? 'bg-blue-50/50 dark:bg-blue-950/20'
                    : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  : 'bg-slate-50/40 dark:bg-slate-900/40 text-slate-400 dark:text-slate-600 hover:bg-slate-100/40'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isToday
                      ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                      : cell.isCurrentMonth
                      ? 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                <div className="flex items-center gap-1">
                  {pendingCount > 0 && (
                    <span 
                      className="h-2 w-2 rounded-full bg-rose-500 animate-ping" 
                      title={`${pendingCount} emergency approval required`} 
                    />
                  )}
                  {dayApts.length > 0 && (
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 px-1 rounded bg-slate-100 dark:bg-slate-800">
                      {dayApts.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Day appointment chips */}
              <div className="space-y-1 overflow-hidden flex-1">
                {dayApts.slice(0, 3).map((apt) => {
                  const isPending = apt.status === 'PENDING_APPROVAL';
                  const isCompleted = apt.status === 'COMPLETED';
                  const isCancelled = apt.status === 'CANCELLED';

                  let chipStyle = 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-900';
                  if (isPending) {
                    chipStyle = 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-800 font-bold';
                  } else if (isCompleted) {
                    chipStyle = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
                  } else if (isCancelled) {
                    chipStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through border-slate-200 dark:border-slate-700';
                  }

                  return (
                    <button
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectApt(apt);
                      }}
                      className={`w-full text-left p-1 rounded-md border text-[10px] truncate flex items-center justify-between gap-1 transition-all hover:scale-[1.02] shadow-2xs ${chipStyle}`}
                      title={`${apt.appointmentTime} - ${apt.studentName} (${apt.status})`}
                    >
                      <div className="flex items-center gap-1 min-w-0">
                        {isPending && <AlertTriangle className="w-2.5 h-2.5 text-rose-600 shrink-0" />}
                        <span className="font-mono font-bold shrink-0">{apt.appointmentTime?.split(' ')[0]}</span>
                        <span className="truncate">{apt.studentName}</span>
                      </div>
                      <span className="font-mono text-[9px] opacity-75 shrink-0">{apt.tokenNumber}</span>
                    </button>
                  );
                })}

                {dayApts.length > 3 && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block text-center pt-0.5">
                    +{dayApts.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT 2: WEEKLY CALENDAR VIEW
// -------------------------------------------------------------
function WeekCalendarView({ currentDate, todayIso, appointmentsByDate, onSelectApt, onApprove, onDeny }) {
  // Find Sunday of current week
  const dayOfWeek = currentDate.getDay();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    weekDays.push({
      date: d,
      isoDate: toIsoDate(d),
      weekdayShort: WEEKDAY_NAMES_SHORT[d.getDay()],
      dayNumber: d.getDate(),
      formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {weekDays.map((day) => {
        const dayApts = appointmentsByDate.get(day.isoDate) || [];
        const isToday = day.isoDate === todayIso;

        return (
          <div
            key={day.isoDate}
            className={`rounded-2xl border flex flex-col min-h-[420px] transition-all ${
              isToday
                ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            {/* Day Header */}
            <div className={`p-3 border-b text-center rounded-t-2xl ${
              isToday 
                ? 'bg-blue-600 text-white font-bold' 
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
            }`}>
              <span className="text-[11px] uppercase font-bold tracking-wider opacity-85 block">
                {day.weekdayShort}
              </span>
              <span className="text-base font-extrabold block">
                {day.formatted}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.2 rounded-full inline-block mt-0.5 ${
                isToday ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {dayApts.length} Slot{dayApts.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* List of Appointments in this Day */}
            <div className="p-2 space-y-2 flex-1 overflow-y-auto">
              {dayApts.map((apt) => {
                const isPending = apt.status === 'PENDING_APPROVAL';

                return (
                  <div
                    key={apt.id}
                    onClick={() => onSelectApt(apt)}
                    className={`p-2.5 rounded-xl border text-xs space-y-1.5 transition-all hover:shadow-xs cursor-pointer ${
                      isPending
                        ? 'bg-rose-50/80 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-[11px]">
                        {apt.appointmentTime}
                      </span>
                      <TokenBadge tokenNumber={apt.tokenNumber} size="small" variant={isPending ? 'orange' : 'blue'} />
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {apt.studentName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {apt.department}
                      </p>
                    </div>

                    {isPending && (
                      <div className="pt-1 border-t border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApprove(apt.id);
                          }}
                          className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center gap-0.5"
                        >
                          <Check className="w-2.5 h-2.5" /> Approve
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeny(apt);
                          }}
                          className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-700 font-bold text-[10px]"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {dayApts.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs italic">
                  No slots
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -------------------------------------------------------------
// SUBCOMPONENT 3: DAILY TIMELINE VIEW
// -------------------------------------------------------------
function DayCalendarView({ currentDate, todayIso, appointmentsByDate, onSelectApt, onReschedule, onPostpone, onApprove, onDeny }) {
  const dayIso = toIsoDate(currentDate);
  const dayApts = appointmentsByDate.get(dayIso) || [];
  const isToday = dayIso === todayIso;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5 md:p-6 space-y-6">
      
      {/* Day Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            {isToday && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                TODAY
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {dayApts.length} consultation appointment{dayApts.length === 1 ? '' : 's'} booked on this schedule.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Slots</span>
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{dayApts.length}</span>
          </div>
        </div>
      </div>

      {/* Appointment Timeline List */}
      <div className="space-y-3">
        {dayApts.map((apt, idx) => {
          const isPending = apt.status === 'PENDING_APPROVAL';

          return (
            <div
              key={apt.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:shadow-xs ${
                isPending
                  ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-center font-mono font-bold pt-1 shrink-0">
                  <span className="text-sm text-blue-700 dark:text-blue-400 block">{apt.appointmentTime}</span>
                  <span className="text-[10px] text-slate-400">Slot #{idx + 1}</span>
                </div>

                <TokenBadge tokenNumber={apt.tokenNumber} size="normal" variant={isPending ? 'orange' : 'blue'} />

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {apt.studentName}
                    </span>
                    {(apt.isEmergency || apt.emergencyJustification) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        <span>Pre-3 PM Emergency</span>
                      </span>
                    )}
                    {apt.isPriority && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        ⭐ #1 Priority
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Reg: <strong className="font-mono text-slate-800 dark:text-slate-200">{apt.registerNumber || 'N/A'}</strong> • {apt.department} • {apt.year}
                  </p>

                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Category: {apt.category}
                  </p>

                  {apt.emergencyJustification && (
                    <div className="mt-1 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 italic">
                      <strong className="not-italic text-rose-700 dark:text-rose-400 block font-bold text-[10px] uppercase">Emergency Justification:</strong>
                      "{apt.emergencyJustification}"
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <StatusBadge status={apt.status} />

                {isPending && (
                  <>
                    <button
                      onClick={() => onApprove(apt.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => onDeny(apt)}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Deny</span>
                    </button>
                  </>
                )}

                {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && !isPending && (
                  <>
                    <button
                      onClick={() => onReschedule(apt)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-700 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      Edit Slot
                    </button>
                    <button
                      onClick={() => onPostpone(apt)}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-300 hover:text-amber-700 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      Postpone
                    </button>
                  </>
                )}

                <button
                  onClick={() => onSelectApt(apt)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Inspect
                </button>
              </div>
            </div>
          );
        })}

        {dayApts.length === 0 && (
          <div className="py-16 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <CalendarDays className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm font-medium">No appointments booked for this day.</p>
            <p className="text-xs text-slate-400">Use the calendar navigation above to check other days.</p>
          </div>
        )}
      </div>

    </div>
  );
}
