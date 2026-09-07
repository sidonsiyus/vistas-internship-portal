import React, { useState } from 'react';
import { User, FileText, Phone, Mail, Building, GraduationCap, AlertTriangle } from 'lucide-react';
import { QUERY_CATEGORIES, DEPARTMENTS } from '../../../mock/sampleData';
import { useApp } from '../../../context/AppContext';

export default function DetailsStep({ formData, setFormData, onSubmit, onBack }) {
  const { appointments } = useApp();
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateAndSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.registerNumber.trim()) newErrors.registerNumber = 'Register Number is required';
    if (!formData.department) newErrors.department = 'Department selection is required';
    if (!formData.year) newErrors.year = 'Year of study is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
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
    <form onSubmit={validateAndSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          <span>Step 3: Student Consultation Details</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Provide your official university details so the Internship Coordinator can prepare your file.
        </p>
      </div>

      {/* Query Categories Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Internship Query Category <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {QUERY_CATEGORIES.map((cat) => {
            const isSelected = formData.category === cat.label;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => handleChange('category', cat.label)}
                className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold ring-2 ring-blue-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full bg-${cat.color}-400 shrink-0`} />
                <span className="text-xs truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
        {errors.category && (
          <p className="text-xs text-rose-400 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> {errors.category}
          </p>
        )}
      </div>

      {/* Primary Input Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. Rahul Kumar"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {errors.name && <p className="text-xs text-rose-400 font-medium">{errors.name}</p>}
        </div>

        {/* Register Number */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">
            University Register Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. 22104821"
              value={formData.registerNumber}
              onChange={(e) => handleChange('registerNumber', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>
          {errors.registerNumber && (
            <p className="text-xs text-rose-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {errors.registerNumber}
            </p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">
            Department / Course <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <select
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Select Department --</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          {errors.department && <p className="text-xs text-rose-400 font-medium">{errors.department}</p>}
        </div>

        {/* Year of Study */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">
            Year of Study <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.year}
            onChange={(e) => handleChange('year', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- Select Year --</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year (Final Year)</option>
          </select>
          {errors.year && <p className="text-xs text-rose-400 font-medium">{errors.year}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">
            Mobile Number (For Live Updates) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {errors.phone && <p className="text-xs text-rose-400 font-medium">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">
            University Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="email"
              placeholder="student@vistas.edu.in"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {errors.email && <p className="text-xs text-rose-400 font-medium">{errors.email}</p>}
        </div>
      </div>

      {/* Query Description (Optional) */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-300">
          Query Details / Specific Questions <span className="text-slate-500">(Optional)</span>
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <textarea
            rows="3"
            placeholder="Briefly describe what you need assistance with (e.g. NOC approval, LOR request, company recommendation)..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm border border-slate-800 transition-all"
        >
          ← Back to Time
        </button>

        <button
          type="submit"
          className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          GENERATE TOKEN & BOOK NOW →
        </button>
      </div>
    </form>
  );
}
