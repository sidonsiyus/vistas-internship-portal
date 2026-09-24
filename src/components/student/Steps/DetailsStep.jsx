import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Users, FileText, Phone, Mail, Building, GraduationCap, AlertTriangle, CheckCircle2, Sparkles, Search, X, Plus, Trash2, Building2 } from 'lucide-react';
import { QUERY_CATEGORIES, DEPARTMENTS } from '../../../mock/sampleData';
import { useApp } from '../../../context/AppContext';
import studentsDatabase from '../../../data/studentsDatabase.json';

export default function DetailsStep({ formData, setFormData, onSubmit, onBack }) {
  const { appointments, students: contextStudents = [] } = useApp();
  const [errors, setErrors] = useState({});

  // Unified student pool combining studentsDatabase and live context students
  const studentPool = useMemo(() => {
    const map = new Map();
    if (Array.isArray(studentsDatabase)) {
      studentsDatabase.forEach(s => {
        if (s && s.registerNumber) map.set(s.registerNumber.toLowerCase().trim(), s);
      });
    }
    if (Array.isArray(contextStudents)) {
      contextStudents.forEach(s => {
        if (s && s.registerNumber && !String(s.registerNumber).startsWith('__SYS_')) {
          const key = s.registerNumber.toLowerCase().trim();
          map.set(key, { ...(map.get(key) || {}), ...s });
        }
      });
    }
    return Array.from(map.values());
  }, [contextStudents]);

  const [matchedStudent, setMatchedStudent] = useState(() => {
    if (formData.registerNumber) {
      return studentPool.find(s => s.registerNumber.toLowerCase() === formData.registerNumber.toLowerCase().trim()) || null;
    }
    if (formData.name) {
      return studentPool.find(s => s.name.toLowerCase() === formData.name.toLowerCase().trim()) || null;
    }
    return null;
  });

  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(false);
  const [regSuggestions, setRegSuggestions] = useState([]);
  const [isRegDropdownOpen, setIsRegDropdownOpen] = useState(false);

  const nameContainerRef = useRef(null);
  const regContainerRef = useRef(null);

  // Co-Attendee Search & State for Bulk Meetings
  const [coAttendeeQuery, setCoAttendeeQuery] = useState('');
  const [coAttendeeSuggestions, setCoAttendeeSuggestions] = useState([]);
  const [isCoDropdownOpen, setIsCoDropdownOpen] = useState(false);
  const coContainerRef = useRef(null);

  // Manual entry modal/toggle for co-attendee not in database
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [manualStudent, setManualStudent] = useState({
    name: '',
    registerNumber: '',
    department: formData.department || 'B.Tech Information Technology',
    year: formData.year || '3rd Year'
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (nameContainerRef.current && !nameContainerRef.current.contains(e.target)) {
        setIsNameDropdownOpen(false);
      }
      if (regContainerRef.current && !regContainerRef.current.contains(e.target)) {
        setIsRegDropdownOpen(false);
      }
      if (coContainerRef.current && !coContainerRef.current.contains(e.target)) {
        setIsCoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddCoAttendee = (student) => {
    if (!student || !student.registerNumber) return;
    const cleanReg = student.registerNumber.toLowerCase().trim();

    // Check if same as lead student
    if (formData.registerNumber && formData.registerNumber.toLowerCase().trim() === cleanReg) {
      setErrors(prev => ({ ...prev, coAttendees: 'Cannot add the lead student as a co-attendee.' }));
      return;
    }

    // Check if already added
    const currentList = Array.isArray(formData.coAttendees) ? formData.coAttendees : [];
    if (currentList.some(c => c.registerNumber.toLowerCase().trim() === cleanReg)) {
      setErrors(prev => ({ ...prev, coAttendees: `${student.name} (${student.registerNumber}) is already in this group.` }));
      return;
    }

    const updated = [...currentList, {
      name: student.name || 'Student',
      registerNumber: student.registerNumber,
      department: student.department || formData.department || 'Engineering',
      year: student.year || formData.year || '3rd Year',
      email: student.email || (student.registerNumber ? `${student.registerNumber}@velshitech.edu.in` : '')
    }];

    setFormData(prev => ({ ...prev, coAttendees: updated }));
    setCoAttendeeQuery('');
    setCoAttendeeSuggestions([]);
    setIsCoDropdownOpen(false);
    setErrors(prev => ({ ...prev, coAttendees: null }));
  };

  const handleRemoveCoAttendee = (indexToRemove) => {
    const currentList = Array.isArray(formData.coAttendees) ? formData.coAttendees : [];
    const updated = currentList.filter((_, idx) => idx !== indexToRemove);
    setFormData(prev => ({ ...prev, coAttendees: updated }));
  };

  const handleCoAttendeeSearch = (val) => {
    setCoAttendeeQuery(val);
    const clean = val.trim().toLowerCase();
    if (clean.length >= 1) {
      const leadReg = (formData.registerNumber || '').toLowerCase().trim();
      const currentRegs = new Set(
        (Array.isArray(formData.coAttendees) ? formData.coAttendees : []).map(c => c.registerNumber.toLowerCase().trim())
      );
      if (leadReg) currentRegs.add(leadReg);

      const matches = studentPool
        .filter(s => 
          !currentRegs.has((s.registerNumber || '').toLowerCase().trim()) && (
            (s.name && s.name.toLowerCase().includes(clean)) ||
            (s.registerNumber && s.registerNumber.toLowerCase().includes(clean))
          )
        )
        .slice(0, 6);

      setCoAttendeeSuggestions(matches);
      setIsCoDropdownOpen(true);
    } else {
      setCoAttendeeSuggestions([]);
      setIsCoDropdownOpen(false);
    }
  };

  const handleSelectStudent = (student) => {
    setMatchedStudent(student);
    setFormData(prev => ({
      ...prev,
      name: student.name || '',
      registerNumber: student.registerNumber || '',
      department: student.department || prev.department,
      year: student.year || prev.year,
      email: prev.email || student.email || (student.registerNumber ? `${student.registerNumber}@velshitech.edu.in` : '')
    }));

    setErrors(prev => ({
      ...prev,
      name: null,
      registerNumber: null,
      department: null,
      year: null,
      email: null
    }));

    setIsNameDropdownOpen(false);
    setIsRegDropdownOpen(false);
  };

  const handleClearStudent = () => {
    setMatchedStudent(null);
    setFormData(prev => ({
      ...prev,
      name: '',
      registerNumber: '',
      department: '',
      year: '3rd Year'
    }));
  };

  const handleNameChange = (value) => {
    setFormData(prev => ({ ...prev, name: value }));
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: null }));
    }

    const clean = value.trim().toLowerCase();
    if (clean.length >= 2) {
      const matches = studentPool
        .filter(s => s.name && s.name.toLowerCase().includes(clean))
        .slice(0, 6);
      setNameSuggestions(matches);
      setIsNameDropdownOpen(matches.length > 0);

      // Check exact match
      const exact = matches.find(s => s.name && s.name.toLowerCase() === clean);
      if (exact && !formData.registerNumber) {
        handleSelectStudent(exact);
      }
    } else {
      setNameSuggestions([]);
      setIsNameDropdownOpen(false);
    }
  };

  const handleRegisterNumberChange = (value) => {
    const clean = value.trim();
    setFormData(prev => ({ ...prev, registerNumber: value }));

    if (errors.registerNumber) {
      setErrors(prev => ({ ...prev, registerNumber: null }));
    }

    if (clean.length >= 2) {
      const matches = studentPool
        .filter(s => s.registerNumber && s.registerNumber.toLowerCase().includes(clean.toLowerCase()))
        .slice(0, 6);
      setRegSuggestions(matches);
      setIsRegDropdownOpen(matches.length > 0);

      const exact = studentPool.find(s => s.registerNumber && s.registerNumber.toLowerCase() === clean.toLowerCase());
      if (exact) {
        handleSelectStudent(exact);
      }
    } else {
      setRegSuggestions([]);
      setIsRegDropdownOpen(false);
      setMatchedStudent(null);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateAndSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    const isBulk = formData.bookingType === 'BULK';

    if (!formData.registerNumber.trim()) newErrors.registerNumber = 'Register Number is required';
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.department) newErrors.department = 'Department selection is required';
    if (!formData.year) newErrors.year = 'Year of study is required';
    if (!formData.category) newErrors.category = 'Query category is required';

    if (isBulk && (!formData.coAttendees || formData.coAttendees.length === 0)) {
      newErrors.coAttendees = 'Please add at least 1 group member / co-attendee to this bulk consultation (or switch to Individual Booking).';
    }

    // Email is optional, but if entered, validate format
    if (formData.email && formData.email.trim() && !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid university email address';
    }

    // Helper to check active appointment
    const isActiveApt = (a) => a.status === 'WAITING' || a.status === 'CALLED' || a.status === 'IN_PROGRESS';

    // Duplicate active booking check for lead student
    const leadReg = formData.registerNumber.toLowerCase().trim();
    const existingActiveLead = appointments.find(a => 
      isActiveApt(a) && (
        (a.registerNumber && a.registerNumber.toLowerCase().trim() === leadReg) ||
        (Array.isArray(a.students) && a.students.some(s => s.registerNumber && s.registerNumber.toLowerCase().trim() === leadReg))
      )
    );

    if (existingActiveLead) {
      newErrors.registerNumber = `Duplicate Booking! Active Token ${existingActiveLead.tokenNumber} already exists today for this Register Number.`;
    }

    // Duplicate active booking check for co-attendees
    if (isBulk && Array.isArray(formData.coAttendees)) {
      for (const member of formData.coAttendees) {
        const memReg = (member.registerNumber || '').toLowerCase().trim();
        const existingActiveMem = appointments.find(a => 
          isActiveApt(a) && (
            (a.registerNumber && a.registerNumber.toLowerCase().trim() === memReg) ||
            (Array.isArray(a.students) && a.students.some(s => s.registerNumber && s.registerNumber.toLowerCase().trim() === memReg))
          )
        );
        if (existingActiveMem) {
          newErrors.coAttendees = `Student ${member.name} (${member.registerNumber}) already has active Token ${existingActiveMem.tokenNumber} in the queue today.`;
          break;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit();
  };

  return (
    <form onSubmit={validateAndSubmit} className="space-y-6 font-sans transition-colors duration-200">
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Step 3: Student Consultation Details</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          Search by your <strong>Name</strong> or <strong>Register Number</strong> to auto-fill your verified student record.
        </p>
      </div>

      {/* Consultation Mode Selector: Individual vs Bulk Group */}
      <div className="space-y-1.5 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Consultation Mode <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => handleChange('bookingType', 'INDIVIDUAL')}
            className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              formData.bookingType !== 'BULK'
                ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 text-blue-900 dark:text-blue-100 shadow-xs ring-2 ring-blue-500/10'
                : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${formData.bookingType !== 'BULK' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Individual Student</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">1 Slot</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                One-on-one consultation with the Coordinator for individual questions.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChange('bookingType', 'BULK')}
            className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              formData.bookingType === 'BULK'
                ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 text-blue-900 dark:text-blue-100 shadow-xs ring-2 ring-blue-500/10'
                : 'bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${formData.bookingType === 'BULK' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Bulk / Group Meeting</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">Same Company</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Multiple students going for the same company/internship book in 1 shared slot (2, 5, or more).
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Query Categories Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Internship Query Category <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUERY_CATEGORIES.map((cat) => {
            const isSelected = formData.category === cat.label;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleChange('category', cat.label)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-600 text-blue-900 dark:text-blue-200 font-semibold ring-2 ring-blue-500/10 shadow-sm'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                <span className="text-xs truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
        {errors.category && (
          <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> {errors.category}
          </p>
        )}
      </div>

      {/* Primary Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* Full Name with Autocomplete Search */}
        <div className="space-y-1 relative" ref={nameContainerRef}>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-blue-700 dark:text-blue-400 flex items-center gap-1 font-semibold">
              <Search className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Searchable by name</span>
            </span>
          </div>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. Rahul Kumar (type to search)"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => {
                if (nameSuggestions.length > 0) setIsNameDropdownOpen(true);
              }}
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
            />
          </div>
          {errors.name && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.name}</p>}

          {/* Name Search Suggestions Dropdown */}
          {isNameDropdownOpen && nameSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Matching Students ({nameSuggestions.length})</span>
                <span className="text-[9px] lowercase font-normal">Click to auto-fill</span>
              </div>
              {nameSuggestions.map((std) => (
                <button
                  type="button"
                  key={std.registerNumber || std.id}
                  onClick={() => handleSelectStudent(std)}
                  className="w-full p-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {std.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {std.department} • {std.year}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold shrink-0">
                    {std.registerNumber}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Register Number with Autocomplete Search */}
        <div className="space-y-1 relative" ref={regContainerRef}>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              University Register Number <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-blue-700 dark:text-blue-400 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Official 26-27 list</span>
            </span>
          </div>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. 25326101 or 24156101"
              value={formData.registerNumber}
              onChange={(e) => handleRegisterNumberChange(e.target.value)}
              onFocus={() => {
                if (regSuggestions.length > 0) setIsRegDropdownOpen(true);
              }}
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-mono tracking-wide shadow-sm"
            />
          </div>
          {errors.registerNumber && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {errors.registerNumber}
            </p>
          )}

          {/* Register Number Search Suggestions Dropdown */}
          {isRegDropdownOpen && regSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
              <div className="p-2 bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Matching Register Numbers ({regSuggestions.length})</span>
                <span className="text-[9px] lowercase font-normal">Click to auto-fill</span>
              </div>
              {regSuggestions.map((std) => (
                <button
                  type="button"
                  key={std.registerNumber || std.id}
                  onClick={() => handleSelectStudent(std)}
                  className="w-full p-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {std.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {std.department} • {std.year}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold shrink-0">
                    {std.registerNumber}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Verified Student Banner if Matched */}
        {matchedStudent && (
          <div className="sm:col-span-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-fadeIn shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Verified Enrolled Student:</strong> {matchedStudent.name} ({matchedStudent.department} • {matchedStudent.year})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
                OFFICIAL RECORD
              </span>
              <button
                type="button"
                onClick={handleClearStudent}
                title="Clear selected student"
                className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Department */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Department / Course <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <select
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
            >
              <option value="">-- Select Department --</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          {errors.department && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.department}</p>}
        </div>

        {/* Year of Study */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Year of Study <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.year}
            onChange={(e) => handleChange('year', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
          >
            <option value="">-- Select Year --</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year (Final Year)">4th Year (Final Year)</option>
          </select>
          {errors.year && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.year}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Mobile Number <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
            />
          </div>
          {errors.phone && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1 sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            University Email Address <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              placeholder="student@velshitech.edu.in"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
            />
          </div>
          {errors.email && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.email}</p>}
        </div>
      </div>

      {/* BULK / GROUP ATTENDEES SECTION */}
      {formData.bookingType === 'BULK' && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Group Members / Co-Attendees (Same Internship)
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Add students applying for the same company or opportunity. No limit on group size.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-xs">
              <span>Total: {1 + (formData.coAttendees?.length || 0)} Students</span>
            </div>
          </div>

          {/* Shared Target Company (Optional) */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Company / Internship Title <span className="text-slate-400 font-normal">(Shared by this group)</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Kaar Technologies, Zoho Corporation, TCS, Amazon..."
                value={formData.companyName || ''}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
              />
            </div>
          </div>

          {/* Co-Attendee Quick Search Box */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Add Student to this Meeting
              </label>
              <button
                type="button"
                onClick={() => setIsManualAddOpen(!isManualAddOpen)}
                className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isManualAddOpen ? '✕ Use Search Instead' : '+ Enter Manually'}</span>
              </button>
            </div>

            {!isManualAddOpen ? (
              <div className="relative z-30" ref={coContainerRef}>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search classmate by Name or Register Number to add..."
                    value={coAttendeeQuery}
                    onChange={(e) => handleCoAttendeeSearch(e.target.value)}
                    onFocus={() => {
                      if (coAttendeeSuggestions.length > 0) setIsCoDropdownOpen(true);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-xs"
                  />
                  {coAttendeeQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setCoAttendeeQuery('');
                        setCoAttendeeSuggestions([]);
                        setIsCoDropdownOpen(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Suggestions Dropdown */}
                {isCoDropdownOpen && coAttendeeSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/90 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Students Found ({coAttendeeSuggestions.length})</span>
                      <span className="text-[9px] text-blue-600 font-semibold normal-case">Click to add to slot</span>
                    </div>
                    {coAttendeeSuggestions.map((std) => (
                      <button
                        type="button"
                        key={std.registerNumber || std.id}
                        onClick={() => handleAddCoAttendee(std)}
                        className="w-full p-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-950/60 flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {std.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {std.department} • {std.year}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                            {std.registerNumber}
                          </span>
                          <span className="p-1 rounded-md bg-blue-600 text-white text-[10px] font-bold">
                            + Add
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Manual Student Add Form */
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Student Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma"
                      value={manualStudent.name}
                      onChange={(e) => setManualStudent(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Register Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 25326115"
                      value={manualStudent.registerNumber}
                      onChange={(e) => setManualStudent(prev => ({ ...prev, registerNumber: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Department</label>
                    <select
                      value={manualStudent.department}
                      onChange={(e) => setManualStudent(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    >
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5">Year</label>
                    <select
                      value={manualStudent.year}
                      onChange={(e) => setManualStudent(prev => ({ ...prev, year: e.target.value }))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year (Final Year)">4th Year (Final Year)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsManualAddOpen(false)}
                    className="px-3 py-1 rounded-lg text-xs text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!manualStudent.name.trim() || !manualStudent.registerNumber.trim()) {
                        setErrors(prev => ({ ...prev, coAttendees: 'Name and Register Number are required.' }));
                        return;
                      }
                      handleAddCoAttendee(manualStudent);
                      setManualStudent({
                        name: '',
                        registerNumber: '',
                        department: formData.department || 'B.Tech Information Technology',
                        year: formData.year || '3rd Year'
                      });
                      setIsManualAddOpen(false);
                    }}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Add to Group
                  </button>
                </div>
              </div>
            )}

            {/* Error banner for coAttendees */}
            {errors.coAttendees && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 pt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.coAttendees}</span>
              </p>
            )}

            {/* List of Added Co-Attendees */}
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Co-Attendees in this Slot ({formData.coAttendees?.length || 0})
              </span>

              {(!formData.coAttendees || formData.coAttendees.length === 0) ? (
                <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500">
                  No additional students added yet. Use the search box above to add your group members.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.coAttendees.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {member.name ? member.name.charAt(0).toUpperCase() : (idx + 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {member.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                            {member.registerNumber} • {member.department}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCoAttendee(idx)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                        title="Remove student from group"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Query Description (Optional) */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Query Details / Specific Questions <span className="text-slate-400 dark:text-slate-500 font-normal">(Optional)</span>
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
          <textarea
            rows="2"
            placeholder="Briefly describe what you need assistance with (e.g. NOC approval, LOR request, company recommendation)..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none shadow-sm"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
        >
          ← Back to Time
        </button>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all transform hover:-translate-y-0.5"
        >
          GENERATE TOKEN & BOOK NOW →
        </button>
      </div>
    </form>
  );
}
