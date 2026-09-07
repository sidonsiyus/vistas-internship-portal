import React, { useState } from 'react';
import { 
  CalendarDays, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  UserX
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import TokenBadge from '../common/TokenBadge';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { DEPARTMENTS, QUERY_CATEGORIES } from '../../mock/sampleData';

export default function AppointmentsTable() {
  const { appointments, markNoShow, cancelAppointment, endMeeting } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [selectedApt, setSelectedApt] = useState(null);

  // Filter appointments
  const filtered = appointments.filter(apt => {
    const matchesSearch = 
      apt.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = !selectedDept || apt.department === selectedDept;
    const matchesCategory = !selectedCategory || apt.category === selectedCategory;
    const matchesStatus = !selectedStatus || apt.status === selectedStatus;

    return matchesSearch && matchesDept && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Appointments & Consultation Log
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, filter, and audit all consultation bookings across departments.
          </p>
        </div>

        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appointments, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `VISTAS_Appointments_Log_${Date.now()}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800 flex items-center gap-2 transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>Export JSON Log</span>
        </button>
      </div>

      {/* SEARCH AND FILTER CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-3">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name, register number, or token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Dept Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
        >
          <option value="">All Query Categories</option>
          {QUERY_CATEGORIES.map(c => (
            <option key={c.id} value={c.label}>{c.label}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="WAITING">WAITING</option>
          <option value="CALLED">CALLED</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="NO_SHOW">NO_SHOW</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

      </div>

      {/* APPOINTMENTS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-4">Token</th>
                <th className="p-4">Student</th>
                <th className="p-4">Department</th>
                <th className="p-4">Time Slot</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((apt) => (
                <tr key={apt.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <TokenBadge tokenNumber={apt.tokenNumber} size="small" variant="blue" />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{apt.studentName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Reg: {apt.registerNumber}</div>
                  </td>
                  <td className="p-4 text-slate-300">
                    <div>{apt.department}</div>
                    <div className="text-[10px] text-slate-500">{apt.year}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-blue-400">
                    {apt.appointmentTime}
                  </td>
                  <td className="p-4 font-semibold text-slate-300">
                    {apt.category}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={apt.status} size="normal" />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedApt(apt)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                    >
                      Inspect Details
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500 text-xs">
                    No matching appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL INSPECT MODAL */}
      <Modal 
        isOpen={!!selectedApt} 
        onClose={() => setSelectedApt(null)} 
        title={`Appointment File: ${selectedApt?.tokenNumber}`} 
        maxWidth="max-w-lg"
      >
        {selectedApt && (
          <div className="space-y-4 text-xs text-slate-200">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-base">{selectedApt.studentName}</span>
                <StatusBadge status={selectedApt.status} />
              </div>
              <p className="text-xs text-slate-400">Reg: {selectedApt.registerNumber} • {selectedApt.department}</p>
              <p className="text-xs text-blue-400 font-semibold">Category: {selectedApt.category}</p>
              <p className="text-xs text-slate-300">Slot: {selectedApt.appointmentDate} at {selectedApt.appointmentTime}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-400 block uppercase tracking-wider">Query Description:</span>
              <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                {selectedApt.description || 'No specific description provided.'}
              </p>
            </div>

            {selectedApt.notes && (
              <div className="space-y-1">
                <span className="font-bold text-emerald-400 block uppercase tracking-wider">Coordinator Notes:</span>
                <p className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300">
                  {selectedApt.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    markNoShow(selectedApt.id);
                    setSelectedApt(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold border border-rose-500/20"
                >
                  Mark No-Show
                </button>
                <button
                  onClick={() => {
                    cancelAppointment(selectedApt.id);
                    setSelectedApt(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <button
                onClick={() => setSelectedApt(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                Close File
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
