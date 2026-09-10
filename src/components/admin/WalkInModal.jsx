import React, { useState } from 'react';
import Modal from '../common/Modal';
import { User, GraduationCap, Building, FileText, ArrowRight } from 'lucide-react';
import { DEPARTMENTS, QUERY_CATEGORIES } from '../../mock/sampleData';
import { useApp } from '../../context/AppContext';

export default function WalkInModal({ isOpen, onClose }) {
  const { addWalkInStudent } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    department: 'B.Sc Aeronautical Science',
    year: '3rd Year',
    category: 'Internship Opportunity',
    positionChoice: 'END_OF_QUEUE', // NEXT_AVAILABLE, END_OF_QUEUE, PRIORITY
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addWalkInStudent(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="➕ Add Walk-in Student to Queue" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
        
        {/* Student Name */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-700">Student Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Vikramaditya V"
            value={formData.name}
            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {/* Register Number */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-700">Register Number</label>
          <input
            type="text"
            placeholder="e.g. 21105541"
            value={formData.registerNumber}
            onChange={(e) => setFormData(p => ({ ...p, registerNumber: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-mono focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {/* Department */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-700">Department</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-700">Query Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
          >
            {QUERY_CATEGORIES.map(c => (
              <option key={c.id} value={c.label}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Position Choice */}
        <div className="space-y-1">
          <label className="block font-semibold text-blue-700">Where should student enter queue? *</label>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, positionChoice: 'END_OF_QUEUE' }))}
              className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                formData.positionChoice === 'END_OF_QUEUE'
                  ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              End of Queue
            </button>

            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, positionChoice: 'NEXT_AVAILABLE' }))}
              className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                formData.positionChoice === 'NEXT_AVAILABLE'
                  ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              Next Slot
            </button>

            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, positionChoice: 'PRIORITY' }))}
              className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                formData.positionChoice === 'PRIORITY'
                  ? 'bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              🚀 Priority
            </button>
          </div>
        </div>

        {/* Reason / Notes */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-700">Reason for Walk-in</label>
          <textarea
            rows="2"
            placeholder="e.g. Urgent document signoff needed before 1 PM deadline..."
            value={formData.description}
            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-3 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
          >
            INJECT WALK-IN TOKEN
          </button>
        </div>

      </form>
    </Modal>
  );
}
