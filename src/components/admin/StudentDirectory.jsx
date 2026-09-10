import React, { useState } from 'react';
import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import { DEPARTMENTS } from '../../mock/sampleData';

const PAGE_SIZE = 24;

export default function StudentDirectory() {
  const { students, appointments, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [privateNoteText, setPrivateNoteText] = useState('');

  const filtered = (students || []).filter(s => {
    if (!s) return false;
    const nameStr = String(s.name || '').toLowerCase();
    const regStr = String(s.registerNumber || '').toLowerCase();
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || nameStr.includes(q) || regStr.includes(q);
    const matchesDept = !selectedDept || s.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedStudents = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleDeptChange = (val) => {
    setSelectedDept(val);
    setCurrentPage(1);
  };

  const handleOpenStudent = (std) => {
    setSelectedStudent(std);
    setPrivateNoteText(std.privateNotes || '');
  };

  const handleSaveNotes = () => {
    if (selectedStudent) {
      showToast(`Saved private notes for ${selectedStudent.name}`, 'success');
      setSelectedStudent(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Official Student Directory (AY 26-27)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified student records, consultation history, and coordinator notes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 text-xs font-semibold self-start sm:self-auto">
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{(students || []).length} Total Enrolled Students</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name or register number (e.g. 25326101)..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => handleDeptChange(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800"
        >
          <option value="">All Departments ({(students || []).length})</option>
          {DEPARTMENTS.map(d => {
            const count = (students || []).filter(s => s.department === d).length;
            return (
              <option key={d} value={d}>
                {d} {count > 0 ? `(${count})` : ''}
              </option>
            );
          })}
        </select>
      </div>

      {/* Pagination Bar Top */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Showing <strong className="text-slate-800 dark:text-slate-200">{filtered.length > 0 ? startIndex + 1 : 0}</strong> – <strong className="text-slate-800 dark:text-slate-200">{Math.min(startIndex + PAGE_SIZE, filtered.length)}</strong> of <strong className="text-blue-600 dark:text-blue-400">{filtered.length}</strong> matching students
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 shadow-sm transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-600 dark:text-slate-300 text-xs px-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 shadow-sm transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">No student records found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or clear the department filter to view all enrolled students.
          </p>
          {(searchTerm || selectedDept) && (
            <button
              onClick={() => { setSearchTerm(''); setSelectedDept(''); setCurrentPage(1); }}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {paginatedStudents.map((std) => {
          const studentApts = appointments.filter(a => a.registerNumber === std.registerNumber);

          return (
            <div 
              key={std.id || std.registerNumber}
              onClick={() => handleOpenStudent(std)}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md p-4 rounded-xl space-y-3 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400 text-xs shrink-0">
                    {String(std.name || 'S').charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs truncate max-w-[160px]">{std.name}</h3>
                    <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Reg: {std.registerNumber}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                  {std.year}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">{std.department}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-[10px] truncate max-w-[140px]">{std.email}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium shrink-0">{studentApts.length} meetings</span>
                </div>
              </div>

              {std.privateNotes && (
                <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 line-clamp-2">
                  🔒 {std.privateNotes}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination Bar Bottom */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs text-slate-600 dark:text-slate-300 shadow-sm transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs text-slate-600 dark:text-slate-300 shadow-sm transition-colors flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* STUDENT PROFILE & PRIVATE NOTES MODAL */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={`Student Profile: ${selectedStudent?.name}`}
        maxWidth="max-w-lg"
      >
        {selectedStudent && (
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-200">
            {/* Student Info Card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedStudent.name}</span>
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">Reg: {selectedStudent.registerNumber}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{selectedStudent.department} • {selectedStudent.year}</p>
              <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-xs pt-1">
                <span>📧 {selectedStudent.email}</span>
                {selectedStudent.section && <span>Class/Sec: {selectedStudent.section}</span>}
              </div>
            </div>

            {/* Past Consultation History */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block uppercase tracking-wider text-[11px]">Consultation History Log</span>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {appointments
                  .filter(a => a.registerNumber === selectedStudent.registerNumber)
                  .map(apt => (
                    <div key={apt.id} className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between shadow-xs">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">{apt.category}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">{apt.appointmentDate} • {apt.appointmentTime}</span>
                      </div>
                      <span className="text-blue-600 dark:text-blue-400 font-mono text-xs font-bold">{apt.tokenNumber}</span>
                    </div>
                  ))}
                {appointments.filter(a => a.registerNumber === selectedStudent.registerNumber).length === 0 && (
                  <p className="text-slate-400 italic py-2 text-center">No past consultations recorded yet.</p>
                )}
              </div>
            </div>

            {/* Private Coordinator Notes */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold text-xs">
                Private Coordinator Notes (Confidential)
              </label>
              <textarea
                rows="3"
                placeholder="Add confidential notes on student internship eligibility, recommendations, NOC status..."
                value={privateNoteText}
                onChange={(e) => setPrivateNoteText(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveNotes}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
