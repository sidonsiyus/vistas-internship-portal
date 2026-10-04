import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Check, Users, GraduationCap, Building2 } from 'lucide-react';
import Modal from '../../common/Modal';
import { useApp } from '../../../context/AppContext';

export default function AddStudentToClassModal({ isOpen, onClose, targetClass }) {
  const { students = [], internshipRecords = [], addStudentToClass } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [addedIds, setAddedIds] = useState(new Set());

  // Build a lookup of current class for every regNo in internshipRecords
  const studentCurrentClassMap = useMemo(() => {
    const map = {};
    internshipRecords.forEach(r => {
      if (r.regNo) {
        map[String(r.regNo).trim()] = r.className;
      }
    });
    return map;
  }, [internshipRecords]);

  // Filter students from the master database based on searchTerm
  const searchResults = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) {
      // Show first 20 students by default if no query
      return students.slice(0, 20);
    }
    return students.filter(s => {
      const name = String(s.name || '').toLowerCase();
      const reg = String(s.registerNumber || '').toLowerCase();
      const dept = String(s.department || '').toLowerCase();
      return name.includes(q) || reg.includes(q) || dept.includes(q);
    }).slice(0, 50); // limit to 50 for fast rendering
  }, [students, searchTerm]);

  const handleAdd = (student) => {
    addStudentToClass(student, targetClass);
    setAddedIds(prev => new Set(prev).add(student.registerNumber));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Student to ${targetClass || 'Class'}`}
      subtitle="Search the master university database to enroll students missing from this class section"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student by name, register number (e.g. 25153101), or department..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {/* Results List */}
        <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {searchResults.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
              No students found matching "{searchTerm}". Check the register number or spelling.
            </div>
          ) : (
            searchResults.map((std) => {
              const cleanReg = String(std.registerNumber).trim();
              const currentClass = studentCurrentClassMap[cleanReg];
              const isInTargetClass = currentClass === targetClass || addedIds.has(cleanReg);

              return (
                <div
                  key={std.registerNumber}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {std.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">{std.registerNumber}</span>
                        <span>•</span>
                        <span className="truncate">{std.department || 'Aviation / Aero'}</span>
                        {std.year && (
                          <>
                            <span>•</span>
                            <span>{std.year}</span>
                          </>
                        )}
                      </div>
                      {currentClass && currentClass !== targetClass && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                          Currently assigned to: <span className="font-bold">{currentClass}</span> (Will be reassigned)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isInTargetClass ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3.5 h-3.5" />
                        <span>Enrolled in {targetClass}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAdd(std)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add to {targetClass}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl shadow-xs transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </Modal>
  );
}
