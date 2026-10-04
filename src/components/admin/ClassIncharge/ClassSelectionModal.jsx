import React, { useState } from 'react';
import { GraduationCap, Search, Users, ChevronRight, CheckCircle2 } from 'lucide-react';
import Modal from '../../common/Modal';
import { CLASS_GROUPS, ALL_CLASSES } from '../../../utils/internshipExcelSync';

export default function ClassSelectionModal({ isOpen, onClose, selectedClass, onSelectClass, records = [] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate student count per class from records
  const classCountMap = {};
  records.forEach(r => {
    const c = (r.className || '').trim().toUpperCase();
    classCountMap[c] = (classCountMap[c] || 0) + 1;
  });

  const matchesSearch = (cls) => {
    if (!searchTerm.trim()) return true;
    return cls.toLowerCase().includes(searchTerm.toLowerCase().trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Your Class & Section"
      subtitle="Choose your assigned class to manage student internship records and track documentation"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        
        {/* Search Filter */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search class (e.g. AERO 2A, BSC 3B, BBA)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {/* Grouped Classes Grid */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {CLASS_GROUPS.map((group) => {
            const visibleClasses = group.classes.filter(matchesSearch);
            if (visibleClasses.length === 0) return null;

            return (
              <div key={group.category} className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
                  {group.category}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {visibleClasses.map((cls) => {
                    const isSelected = selectedClass === cls;
                    const count = classCountMap[cls] || 0;

                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          onSelectClass(cls);
                          onClose();
                        }}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                          isSelected
                            ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 shadow-sm ring-1 ring-blue-500/20'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            isSelected 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                          }`}>
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {cls}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Users className="w-3 h-3" />
                              <span>{count} students</span>
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </Modal>
  );
}
