import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../common/Modal';
import { 
  User, 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  X, 
  UserCheck, 
  Edit3, 
  AlertCircle,
  Building2,
  Clock,
  Sparkles,
  Calendar,
  Sun,
  Sunset,
  Sunrise,
  Zap
} from 'lucide-react';
import { DEPARTMENTS, QUERY_CATEGORIES } from '../../mock/sampleData';
import { useApp } from '../../context/AppContext';
import { getAllDaySlotPresets, formatTimeDisplay } from '../../utils/slotGenerator';

export default function WalkInModal({ isOpen, onClose, initialDate = null, initialStudent = null }) {
  const { addWalkInStudent, students = [] } = useApp();

  const todayIso = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const tomorrowIso = useMemo(() => {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    const y = tom.getFullYear();
    const m = String(tom.getMonth() + 1).padStart(2, '0');
    const d = String(tom.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Mode: 'DIRECTORY' | 'MANUAL'
  const [entryMode, setEntryMode] = useState('DIRECTORY');

  // Directory Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Time Category Tab: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'CUSTOM' | 'NOW'
  const [timeCategoryTab, setTimeCategoryTab] = useState('AFTERNOON');

  // Common Form State
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    department: 'B.Sc Aeronautical Science',
    year: '3rd Year',
    phone: '',
    email: '',
    category: 'Internship Opportunity',
    positionChoice: 'END_OF_QUEUE', // NEXT_AVAILABLE, END_OF_QUEUE, PRIORITY, SCHEDULED
    date: todayIso,
    timeSlot: '02:00 PM',
    customTime: '',
    timeMode: 'PRESET', // 'PRESET' | 'CUSTOM' | 'NOW'
    description: ''
  });

  const slotPresets = useMemo(() => getAllDaySlotPresets(), []);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setEntryMode('DIRECTORY');
      setSearchQuery('');
      setSelectedStudent(initialStudent || null);

      const targetDate = initialDate || todayIso;
      const initialSlot = '02:00 PM'; // Afternoon before 3:30 PM default

      setFormData({
        name: initialStudent?.name || '',
        registerNumber: initialStudent?.registerNumber || '',
        department: initialStudent?.department || 'B.Sc Aeronautical Science',
        year: initialStudent?.year || '3rd Year',
        phone: initialStudent?.phone || '',
        email: initialStudent?.email || '',
        category: 'Internship Opportunity',
        positionChoice: 'END_OF_QUEUE',
        date: targetDate,
        timeSlot: initialSlot,
        customTime: '',
        timeMode: 'PRESET',
        description: ''
      });

      if (initialStudent) {
        setSearchQuery(initialStudent.name);
      }
    }
  }, [isOpen, initialDate, initialStudent, todayIso]);

  // Filter students from directory
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || selectedStudent) return [];

    return students.filter(s => {
      const name = String(s.name || '').toLowerCase();
      const reg = String(s.registerNumber || '').toLowerCase();
      const dept = String(s.department || '').toLowerCase();
      return name.includes(q) || reg.includes(q) || dept.includes(q);
    }).slice(0, 8);
  }, [students, searchQuery, selectedStudent]);

  // Handle selecting a student from directory
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchQuery(student.name);
    setFormData(prev => ({
      ...prev,
      name: student.name,
      registerNumber: student.registerNumber,
      department: student.department || prev.department,
      year: student.year || prev.year,
      phone: student.phone || '',
      email: student.email || `${student.registerNumber}@velshitech.edu.in`
    }));
  };

  // Clear selected student
  const handleClearSelectedStudent = () => {
    setSelectedStudent(null);
    setSearchQuery('');
    setFormData(prev => ({
      ...prev,
      name: '',
      registerNumber: '',
      department: 'B.Sc Aeronautical Science',
      year: '3rd Year',
      phone: '',
      email: ''
    }));
  };

  // Get current active time string
  const currentTimeDisplay = useMemo(() => {
    if (formData.timeMode === 'NOW') {
      return 'Current Clock Time (Live)';
    }
    if (formData.timeMode === 'CUSTOM') {
      return formData.customTime ? formatTimeDisplay(formData.customTime) : 'Custom Time';
    }
    return formData.timeSlot || '02:00 PM';
  }, [formData.timeMode, formData.customTime, formData.timeSlot]);

  // Determine Time of Day tag
  const timePeriodTag = useMemo(() => {
    if (formData.timeMode === 'NOW') {
      return { label: '⚡ Live / Right Now', color: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200' };
    }
    const t = currentTimeDisplay;
    if (t.includes('AM')) {
      return { label: '🌅 Morning Session', color: 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200' };
    }
    const hourNum = parseInt(t.split(':')[0], 10);
    const minNum = parseInt(t.split(':')[1] || '0', 10);
    if (hourNum === 12 || hourNum < 3 || (hourNum === 3 && minNum < 30)) {
      return { label: '☀️ Afternoon (Before 3:30 PM)', color: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200' };
    }
    return { label: '🌆 Evening / Regular Hours (3:30 PM+)', color: 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200' };
  }, [currentTimeDisplay, formData.timeMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let finalTime = formData.timeSlot;

    if (formData.timeMode === 'NOW') {
      finalTime = timeNow;
    } else if (formData.timeMode === 'CUSTOM' && formData.customTime) {
      finalTime = formatTimeDisplay(formData.customTime);
    }

    addWalkInStudent({
      ...formData,
      appointmentDate: formData.date || todayIso,
      appointmentTime: finalTime,
      injectedByAdmin: true,
      byAdmin: true
    });

    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="⚡ Inject Appointment & Consultation" 
      subtitle="Schedule or inject a consultation for anytime in the day (morning, afternoon, or evening) with instant queue injection."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 font-sans text-xs">
        
        {/* Mode Selector Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setEntryMode('DIRECTORY')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${
              entryMode === 'DIRECTORY'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Student Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('MANUAL')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${
              entryMode === 'MANUAL'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* MODE 1: DIRECTORY SEARCH */}
          {entryMode === 'DIRECTORY' && (
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Find Student in University Directory *
              </label>

              {!selectedStudent ? (
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Start typing student name, reg no (e.g. 21105...), or department..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Suggestions Dropdown */}
                  {searchQuery.trim().length > 0 && (
                    <div className="mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 z-20">
                      {searchResults.length > 0 ? (
                        searchResults.map((std) => (
                          <button
                            key={std.registerNumber}
                            type="button"
                            onClick={() => handleSelectStudent(std)}
                            className="w-full text-left p-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-600 shrink-0">
                                <GraduationCap className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                  {std.name}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                                  <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{std.registerNumber}</span>
                                  <span>•</span>
                                  <span className="truncate">{std.department}</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                              Select ↵
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-slate-400 text-xs">
                          No matching students found for "{searchQuery}".
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(p => ({ ...p, name: searchQuery }));
                              setEntryMode('MANUAL');
                            }}
                            className="block mx-auto mt-1 text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                          >
                            Switch to Manual Entry with "{searchQuery}" →
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Selected Student Card */
                <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {selectedStudent.name}
                        </span>
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-semibold text-blue-700 dark:text-blue-300">{selectedStudent.registerNumber}</span>
                        <span>•</span>
                        <span className="truncate">{selectedStudent.department}</span>
                        {selectedStudent.year && (
                          <>
                            <span>•</span>
                            <span>{selectedStudent.year}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearSelectedStudent}
                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
                    title="Change Student"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: MANUAL ENTRY */}
          {entryMode === 'MANUAL' && (
            <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Manual Student Credentials
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya V"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Register Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 21105541 or WALK-IN"
                    value={formData.registerNumber}
                    onChange={(e) => setFormData(p => ({ ...p, registerNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d} className="dark:bg-slate-800">{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">Year of Study</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData(p => ({ ...p, year: e.target.value }))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* DATE & TIME SLOT CONFIGURATION (ANYTIME IN THE DAY) */}
          <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
            
            {/* Header: Date & Selected Time Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Appointment Date & Time (Anytime in the Day)
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${timePeriodTag.color}`}>
                {timePeriodTag.label}
              </span>
            </div>

            {/* Date Selection */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                Target Date
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, date: todayIso }))}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.date === todayIso
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  Today ({todayIso})
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, date: tomorrowIso }))}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.date === tomorrowIso
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  Tomorrow ({tomorrowIso})
                </button>

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[10px] text-slate-500 font-medium">Custom:</span>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Time Slot Tabs (Morning, Afternoon, Evening, Right Now, Custom) */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                  Select Time of Day:
                </label>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <span className="text-slate-500">Active Time:</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-bold">{currentTimeDisplay}</strong>
                </div>
              </div>

              {/* Day Period Nav Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setTimeCategoryTab('MORNING');
                    setFormData(p => ({ ...p, timeMode: 'PRESET', timeSlot: '10:00 AM' }));
                  }}
                  className={`py-1.5 px-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    timeCategoryTab === 'MORNING' && formData.timeMode === 'PRESET'
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 text-sky-800 dark:text-sky-200 ring-1 ring-sky-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <Sunrise className="w-3 h-3 text-sky-500" />
                  <span>Morning</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimeCategoryTab('AFTERNOON');
                    setFormData(p => ({ ...p, timeMode: 'PRESET', timeSlot: '02:00 PM' }));
                  }}
                  className={`py-1.5 px-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    timeCategoryTab === 'AFTERNOON' && formData.timeMode === 'PRESET'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <Sun className="w-3 h-3 text-emerald-500" />
                  <span>Afternoon</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTimeCategoryTab('EVENING');
                    setFormData(p => ({ ...p, timeMode: 'PRESET', timeSlot: '03:30 PM' }));
                  }}
                  className={`py-1.5 px-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    timeCategoryTab === 'EVENING' && formData.timeMode === 'PRESET'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 text-blue-800 dark:text-blue-200 ring-1 ring-blue-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <Sunset className="w-3 h-3 text-blue-500" />
                  <span>3:30 PM+</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData(p => ({ ...p, timeMode: 'NOW' }));
                  }}
                  className={`py-1.5 px-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    formData.timeMode === 'NOW'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-200 ring-1 ring-amber-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>Right Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData(p => ({ ...p, timeMode: 'CUSTOM' }));
                  }}
                  className={`py-1.5 px-2 rounded-lg border text-center font-bold text-[11px] transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    formData.timeMode === 'CUSTOM'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-800 dark:text-purple-200 ring-1 ring-purple-400'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <Clock className="w-3 h-3 text-purple-500" />
                  <span>Custom</span>
                </button>
              </div>

              {/* Slot Grid for Active Tab */}
              {formData.timeMode === 'PRESET' && (
                <div className="pt-1.5">
                  {timeCategoryTab === 'MORNING' && (
                    <div>
                      <div className="text-[10px] text-sky-700 dark:text-sky-300 font-semibold mb-1 flex items-center gap-1">
                        <span>🌅 Morning Slots (09:00 AM – 12:00 PM):</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {slotPresets.morning.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, timeSlot: slot }))}
                            className={`py-2 px-2 rounded-lg text-center font-mono font-bold text-xs border transition-all cursor-pointer ${
                              formData.timeSlot === slot
                                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-300'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {timeCategoryTab === 'AFTERNOON' && (
                    <div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                        <span>☀️ Afternoon Slots Before 3:30 PM (12:00 PM – 03:00 PM):</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5">
                        {slotPresets.afternoon.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, timeSlot: slot }))}
                            className={`py-2 px-2 rounded-lg text-center font-mono font-bold text-xs border transition-all cursor-pointer ${
                              formData.timeSlot === slot
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-300'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {timeCategoryTab === 'EVENING' && (
                    <div>
                      <div className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold mb-1 flex items-center gap-1">
                        <span>🌆 Regular Consultation Slots (03:30 PM – 05:30 PM):</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
                        {slotPresets.evening.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, timeSlot: slot }))}
                            className={`py-2 px-1 rounded-lg text-center font-mono font-bold text-[11px] border transition-all cursor-pointer ${
                              formData.timeSlot === slot
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Time Input */}
              {formData.timeMode === 'CUSTOM' && (
                <div className="pt-1 flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="time"
                      value={formData.customTime}
                      onChange={(e) => setFormData(p => ({ ...p, customTime: e.target.value }))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Enter any exact campus consultation hour (e.g. 10:15 AM or 02:20 PM)
                  </span>
                </div>
              )}

              {/* Right Now Live Banner */}
              {formData.timeMode === 'NOW' && (
                <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Injecting with current real-time clock timestamp ({new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                  </div>
                  <span className="font-bold text-[10px] bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded font-mono">LIVE STAMP</span>
                </div>
              )}

            </div>
          </div>

          {/* CONSULTATION & QUEUE CONFIGURATION */}
          <div className="space-y-3 pt-1">
            
            {/* Category */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">Query Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {QUERY_CATEGORIES.map(c => (
                  <option key={c.id} value={c.label} className="dark:bg-slate-800">{c.label}</option>
                ))}
              </select>
            </div>

            {/* Position Choice */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Queue Placement & Priority:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, positionChoice: 'PRIORITY' }))}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    formData.positionChoice === 'PRIORITY'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  🚀 Priority (#1 Next)
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, positionChoice: 'NEXT_AVAILABLE' }))}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    formData.positionChoice === 'NEXT_AVAILABLE'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  ⏩ Next Up in Queue
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, positionChoice: 'END_OF_QUEUE' }))}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    formData.positionChoice === 'END_OF_QUEUE'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  📌 End of Queue
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, positionChoice: 'SCHEDULED' }))}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    formData.positionChoice === 'SCHEDULED'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  📅 Scheduled Slot
                </button>
              </div>
            </div>

            {/* Reason / Notes */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Coordinator Consultation Notes (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Injected by Coordinator for morning internship briefing / urgent NOC verification..."
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

          </div>

          {/* Submit & Cancel */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">
              Directly confirmed by Coordinator • No emergency approval block
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.name.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Inject Appointment Now</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </Modal>
  );
}
