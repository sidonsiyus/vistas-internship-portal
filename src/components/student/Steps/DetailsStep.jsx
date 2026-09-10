import React, { useState } from 'react';
import { User, FileText, Phone, Mail, Building, GraduationCap, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { QUERY_CATEGORIES, DEPARTMENTS } from '../../../mock/sampleData';
import { useApp } from '../../../context/AppContext';
import studentsDatabase from '../../../data/studentsDatabase.json';

export default function DetailsStep({ formData, setFormData, onSubmit, onBack }) {
  const { appointments } = useApp();
  const [errors, setErrors] = useState({});
  const [matchedStudent, setMatchedStudent] = useState(() => {
    if (formData.registerNumber) {
      return studentsDatabase.find(s => s.registerNumber.toLowerCase() === formData.registerNumber.toLowerCase().trim()) || null;
    }
    return null;
  });

  const handleRegisterNumberChange = (value) => {
    const clean = value.trim();
    setFormData(prev => ({ ...prev, registerNumber: value }));

    if (errors.registerNumber) {
      setErrors(prev => ({ ...prev, registerNumber: null }));
    }

    if (clean.length >= 4) {
      const match = studentsDatabase.find(s => s.registerNumber.toLowerCase() === clean.toLowerCase());
      if (match) {
        setMatchedStudent(match);
        setFormData(prev => ({
          ...prev,
          registerNumber: value,
          name: match.name,
          department: match.department,
          year: match.year,
          email: prev.email || match.email
        }));
        // clear errors for auto-filled fields
        setErrors(prev => ({
          ...prev,
          name: null,
          department: null,
          year: null,
          email: null
        }));
        return;
      }
    }
    setMatchedStudent(null);
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

    if (!formData.registerNumber.trim()) newErrors.registerNumber = 'Register Number is required';
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.department) newErrors.department = 'Department selection is required';
    if (!formData.year) newErrors.year = 'Year of study is required';
    if (!formData.phone.trim()) newErrors.phone = 'Mobile number is required for updates';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid university email is required';
    if (!formData.category) newErrors.category = 'Query category is required';

    // Duplicate active booking check
    const existingActive = appointments.find(
      a => a.registerNumber.toLowerCase() === formData.registerNumber.toLowerCase() &&
           (a.status === 'WAITING' || a.status === 'CALLED' || a.status === 'IN_PROGRESS')
    );

    if (existingActive) {
      newErrors.registerNumber = `Duplicate Booking! Active Token ${existingActive.tokenNumber} already exists for this Register Number today.`;
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
          Type your University Register Number to auto-fill your verified student record.
        </p>
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
        
        {/* Register Number (First for Auto-Fill) */}
        <div className="space-y-1 sm:col-span-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              University Register Number <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-blue-700 dark:text-blue-400 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>Auto-detects from official 26-27 student list</span>
            </span>
          </div>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. 25326101 or 24156101"
              value={formData.registerNumber}
              onChange={(e) => handleRegisterNumberChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-mono tracking-wide shadow-sm"
            />
          </div>
          {errors.registerNumber && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {errors.registerNumber}
            </p>
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
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono">
              OFFICIAL RECORD
            </span>
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. Rahul Kumar"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm"
            />
          </div>
          {errors.name && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errors.name}</p>}
        </div>

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
            Mobile Number (For Live Updates) <span className="text-rose-500">*</span>
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
            University Email Address <span className="text-rose-500">*</span>
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
