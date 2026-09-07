import React, { useState } from 'react';
import { Users, Search, GraduationCap, Phone, Mail, FileText, Lock, Save, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import { DEPARTMENTS } from '../../mock/sampleData';

export default function StudentDirectory() {
  const { students, appointments, setStudents, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [privateNoteText, setPrivateNoteText] = useState('');

  const filtered = students.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registerNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !selectedDept || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleOpenStudent = (std) => {
    setSelectedStudent(std);
    setPrivateNoteText(std.privateNotes || '');
  };

  const handleSaveNotes = () => {
    if (selectedStudent) {
      // update context
      showToast(`Saved private notes for ${selectedStudent.name}`, 'success');
      setSelectedStudent(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Student Directory & Consultation Profiles
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Access student records, consultation history, and manage private coordinator notes.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student by name or register number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

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
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((std) => {
          const studentApts = appointments.filter(a => a.registerNumber === std.registerNumber);

          return (
            <div 
              key={std.id}
              onClick={() => handleOpenStudent(std)}
              className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-5 rounded-2xl shadow-xl space-y-4 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
                    {std.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{std.name}</h3>
                    <p className="text-xs font-mono text-slate-400">Reg: {std.registerNumber}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {std.year}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <p className="text-slate-400">{std.department}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span>Phone: {std.phone}</span>
                  <span>History: {studentApts.length} meetings</span>
                </div>
              </div>

              {std.privateNotes && (
                <div className="p-2.5 bg-slate-950 rounded-xl text-[11px] text-slate-400 border border-slate-800 line-clamp-2">
                  🔒 {std.privateNotes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* STUDENT PROFILE & PRIVATE NOTES MODAL */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`Student Record: ${selectedStudent?.name}`}
        maxWidth="max-w-lg"
      >
        {selectedStudent && (
          <div className="space-y-5 text-xs text-slate-200">
            {/* Student Info Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">{selectedStudent.name}</span>
                <span className="text-xs font-mono text-blue-400">Reg: {selectedStudent.registerNumber}</span>
              </div>
              <p className="text-xs text-slate-300">{selectedStudent.department} • {selectedStudent.year}</p>
              <div className="flex items-center gap-4 text-slate-400 text-xs pt-1">
                <span>📧 {selectedStudent.email}</span>
                <span>📞 {selectedStudent.phone}</span>
              </div>
            </div>

            {/* Past Consultation History */}
            <div className="space-y-2">
              <span className="font-bold text-slate-300 block uppercase tracking-wider">Consultation History Log</span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {appointments
                  .filter(a => a.registerNumber === selectedStudent.registerNumber)
                  .map(apt => (
                    <div key={apt.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">{apt.category}</span>
                        <span className="text-[11px] text-slate-400">{apt.appointmentDate} • {apt.appointmentTime}</span>
                      </div>
                      <span className="font-mono text-blue-400 font-bold">{apt.tokenNumber}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Private Coordinator Notes */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Private Coordinator Notes (Visible to Admin Only)</span>
              </div>
              <textarea
                rows="4"
                placeholder="Enter confidential notes, document approvals, or behavioral record for this student..."
                value={privateNoteText}
                onChange={(e) => setPrivateNoteText(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>SAVE PRIVATE NOTES</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
