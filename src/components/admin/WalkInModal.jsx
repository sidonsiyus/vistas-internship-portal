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
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-200">
        
        {/* Student Name */}
        <div className="space-y-1">
          <label className="block font-semibold">Student Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Vikramaditya V"
            value={formData.name}
            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Register Number */}
        <div className="space-y-1">
          <label className="block font-semibold">Register Number</label>
          <input
            type="text"
            placeholder="e.g. 21105541"
            value={formData.registerNumber}
            onChange={(e) => setFormData(p => ({ ...p, registerNumber: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Department */}
        <div className="space-y-1">
          <label className="block font-semibold">Department</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="block font-semibold">Query Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {QUERY_CATEGORIES.map(c => (
              <option key={c.id} value={c.label}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Position Choice */}
        <div className="space-y-1">
          <label className="block font-semibold text-blue-400">Where should student enter queue? *</label>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, positionChoice: 'END_OF_QUEUE' }))}
              className={`p-2.5 rounded-xl border text-center font-bold ${
                formData.positionChoice === 'END_OF_QUEUE'
                  ? 'bg-blue-600/20 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              End of Queue
            </button>

            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, positionChoice: 'NEXT_AVAILABLE' }))}
              className={`p-2.5 rounded-xl border text-center font-bold ${
                formData.positionChoice === 'NEXT_AVAILABLE'
                  ? 'bg-amber-600/20 border-amber-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              Next Slot
            </button>

            <button
              type="button"
              onClick={() => setFormData(p => ({ ...p, positionChoice: 'PRIORITY' }))}
              className={`p-2.5 rounded-xl border text-center font-bold ${
                formData.positionChoice === 'PRIORITY'
                  ? 'bg-rose-600/20 border-rose-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              🚀 Urgent Priority
            </button>
          </div>
        </div>

        {/* Reason / Notes */}
        <div className="space-y-1">
          <label className="block font-semibold">Reason for Walk-in</label>
          <textarea
            rows="2"
            placeholder="e.g. Urgent document signoff needed before 1 PM deadline..."
            value={formData.description}
            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg"
          >
            INJECT WALK-IN TOKEN
          </button>
        </div>

      </form>
    </Modal>
  );
}
