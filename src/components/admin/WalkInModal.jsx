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
  Sparkles
} from 'lucide-react';
import { DEPARTMENTS, QUERY_CATEGORIES } from '../../mock/sampleData';
import { useApp } from '../../context/AppContext';

export default function WalkInModal({ isOpen, onClose }) {
  const { addWalkInStudent, students = [] } = useApp();

  // Mode: 'DIRECTORY' | 'MANUAL'
  const [entryMode, setEntryMode] = useState('DIRECTORY');

  // Directory Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Common Form State
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    department: 'B.Sc Aeronautical Science',
    year: '3rd Year',
    phone: '',
    email: '',
    category: 'Internship Opportunity',
    positionChoice: 'END_OF_QUEUE', // NEXT_AVAILABLE, END_OF_QUEUE, PRIORITY
    description: ''
  });

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setEntryMode('DIRECTORY');
      setSearchQuery('');
      setSelectedStudent(null);
      setFormData({
        name: '',
        registerNumber: '',
        department: 'B.Sc Aeronautical Science',
        year: '3rd Year',
        phone: '',
        email: '',
        category: 'Internship Opportunity',
        positionChoice: 'END_OF_QUEUE',
        description: ''
      });
    }
  }, [isOpen]);

  // Filter students from directory
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || selectedStudent) return [];

    return students.filter(s => {
      const name = String(s.name || '').toLowerCase();
      const reg = String(s.registerNumber || '').toLowerCase();
      const dept = String(s.department || '').toLowerCase();
      return name.includes(q) || reg.includes(q) || dept.includes(q);
    }).slice(0, 8); // Top 8 matches
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addWalkInStudent(formData);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="➕ Add Walk-in Student to Queue" 
      subtitle="Inject an urgent student consultation into today's queue sequence"
      maxWidth="max-w-xl"
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
            onClick={() => {
              setEntryMode('MANUAL');
              if (selectedStudent) {
                // Keep the fields if switching to manual for further editing
              }
            }}
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
                      onFocus={() => setIsSearchFocused(true)}
                      placeholder="Start typing student name, reg no (e.g. 2515...), or department..."
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
                            className="w-full text-left p-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center justify-between group"
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
                            className="block mx-auto mt-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
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
                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shrink-0"
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
                Where should student enter queue? *
              </label>
              <div className="grid grid-cols-3 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, positionChoice: 'END_OF_QUEUE' }))}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    formData.positionChoice === 'END_OF_QUEUE'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  End of Queue
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, positionChoice: 'NEXT_AVAILABLE' }))}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    formData.positionChoice === 'NEXT_AVAILABLE'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  Next Slot
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, positionChoice: 'PRIORITY' }))}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    formData.positionChoice === 'PRIORITY'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  🚀 Priority
                </button>
              </div>
            </div>

            {/* Reason / Notes */}
            <div className="space-y-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Reason for Walk-in (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Urgent document signoff needed before 1 PM deadline..."
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

          </div>

          {/* Submit & Cancel */}
          <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Inject into Live Queue</span>
            </button>
          </div>

        </form>
      </div>
    </Modal>
  );
}
