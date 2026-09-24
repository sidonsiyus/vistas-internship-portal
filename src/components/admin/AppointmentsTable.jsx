import React, { useState, useMemo } from 'react';
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
  UserX,
  Users
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

  // Helper to extract student list for an appointment
  const getAppointmentStudents = (apt) => {
    if (Array.isArray(apt.students) && apt.students.length > 0) {
      return apt.students;
    }
    // If students array wasn't cached, check if comma-separated studentName exists
    if (typeof apt.studentName === 'string' && apt.studentName.includes(',')) {
      return apt.studentName.split(',').map((name, i) => ({
        name: name.trim(),
        registerNumber: i === 0 ? apt.registerNumber : '',
        department: apt.department,
        year: apt.year,
        isLead: i === 0
      }));
    }
    return [{
      name: apt.studentName,
      registerNumber: apt.registerNumber,
      department: apt.department,
      year: apt.year,
      email: apt.email,
      phone: apt.phone,
      isLead: true
    }];
  };

  // Expand bulk appointments into individual student entries
  const expandedAppointments = useMemo(() => {
    const list = [];
    (appointments || []).forEach(apt => {
      const studentsList = getAppointmentStudents(apt);
      const isMulti = apt.isBulk || studentsList.length > 1;

      if (isMulti && studentsList.length > 1) {
        studentsList.forEach((std, index) => {
          list.push({
            ...apt,
            uniqueRowId: `${apt.id || apt.tokenNumber}-std-${std.registerNumber || index}`,
            studentName: std.name || apt.studentName,
            registerNumber: std.registerNumber || apt.registerNumber,
            department: std.department || apt.department,
            year: std.year || apt.year,
            email: std.email || apt.email,
            phone: std.phone || apt.phone,
            isGroupMember: true,
            isLeadStudent: !!std.isLead || index === 0,
            groupMemberIndex: index + 1,
            groupTotalCount: studentsList.length,
            groupStudents: studentsList,
            parentAppointment: apt
          });
        });
      } else {
        const std = studentsList[0] || {};
        list.push({
          ...apt,
          uniqueRowId: apt.id || apt.tokenNumber,
          studentName: std.name || apt.studentName,
          registerNumber: std.registerNumber || apt.registerNumber,
          department: std.department || apt.department,
          year: std.year || apt.year,
          email: std.email || apt.email,
          phone: std.phone || apt.phone,
          isGroupMember: false,
          isLeadStudent: true,
          groupMemberIndex: 1,
          groupTotalCount: 1,
          groupStudents: [std],
          parentAppointment: apt
        });
      }
    });
    return list;
  }, [appointments]);

  // Filter individual student entries
  const filtered = useMemo(() => {
    return expandedAppointments.filter(apt => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = !q ||
        (apt.studentName && apt.studentName.toLowerCase().includes(q)) ||
        (apt.tokenNumber && apt.tokenNumber.toLowerCase().includes(q)) ||
        (apt.registerNumber && String(apt.registerNumber).toLowerCase().includes(q)) ||
        (apt.companyName && apt.companyName.toLowerCase().includes(q)) ||
        (apt.parentAppointment?.studentName && apt.parentAppointment.studentName.toLowerCase().includes(q));

      const matchesDept = !selectedDept || apt.department === selectedDept;
      const matchesCategory = !selectedCategory || apt.category === selectedCategory;
      const matchesStatus = !selectedStatus || apt.status === selectedStatus;

      return matchesSearch && matchesDept && matchesCategory && matchesStatus;
    });
  }, [expandedAppointments, searchTerm, selectedDept, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Appointments & Consultation Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search, filter, and audit all consultation bookings across departments ({filtered.length} individual student {filtered.length === 1 ? 'entry' : 'entries'}).
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
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Export JSON Log</span>
        </button>
      </div>

      {/* SEARCH AND FILTER CONTROLS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-3">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name, register number, or token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800"
          />
        </div>

        {/* Dept Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800"
        >
          <option value="" className="dark:bg-slate-800">All Departments</option>
          {DEPARTMENTS.map(d => (
            <option key={d} value={d} className="dark:bg-slate-800">{d}</option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800"
        >
          <option value="" className="dark:bg-slate-800">All Query Categories</option>
          {QUERY_CATEGORIES.map(c => (
            <option key={c.id} value={c.label} className="dark:bg-slate-800">{c.label}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full md:w-auto px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800"
        >
          <option value="" className="dark:bg-slate-800">All Statuses</option>
          <option value="WAITING" className="dark:bg-slate-800">WAITING</option>
          <option value="CALLED" className="dark:bg-slate-800">CALLED</option>
          <option value="IN_PROGRESS" className="dark:bg-slate-800">IN_PROGRESS</option>
          <option value="COMPLETED" className="dark:bg-slate-800">COMPLETED</option>
          <option value="NO_SHOW" className="dark:bg-slate-800">NO_SHOW</option>
          <option value="CANCELLED" className="dark:bg-slate-800">CANCELLED</option>
        </select>

      </div>

      {/* APPOINTMENTS TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((apt) => (
                <tr key={apt.uniqueRowId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <TokenBadge tokenNumber={apt.tokenNumber} size="small" variant="blue" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{apt.studentName}</span>
                      {apt.isGroupMember && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{apt.isLeadStudent ? 'Group Lead' : `Group (${apt.groupMemberIndex}/${apt.groupTotalCount})`}</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Reg: {apt.registerNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    <div>{apt.department}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{apt.year}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {apt.appointmentTime}
                  </td>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-400">
                    {apt.category}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={apt.status} size="normal" />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedApt(apt)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Inspect Details
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                    No matching consultation records found.
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
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 dark:text-white text-base">{selectedApt.studentName}</span>
                  {selectedApt.isGroupMember && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{selectedApt.isLeadStudent ? 'Group Lead Booker' : `Group Member (${selectedApt.groupMemberIndex}/${selectedApt.groupTotalCount})`}</span>
                    </span>
                  )}
                </div>
                <StatusBadge status={selectedApt.status} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Reg: {selectedApt.registerNumber || 'N/A'} • {selectedApt.department} • {selectedApt.year}</p>
              {selectedApt.email && <p className="text-xs text-slate-500">Email: {selectedApt.email}</p>}
              {selectedApt.phone && <p className="text-xs text-slate-500">Phone: {selectedApt.phone}</p>}
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Category: {selectedApt.category}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Slot: {selectedApt.appointmentDate} at {selectedApt.appointmentTime}</p>
            </div>

            {/* If Group Appointment: Show all attendees */}
            {(selectedApt.isGroupMember || selectedApt.isBulk || (selectedApt.groupStudents && selectedApt.groupStudents.length > 1) || (selectedApt.students && selectedApt.students.length > 1)) && (
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    <span>All Group Meeting Attendees ({selectedApt.groupTotalCount || selectedApt.groupStudents?.length || selectedApt.students?.length} Students)</span>
                  </span>
                  {selectedApt.companyName && (
                    <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                      Target: {selectedApt.companyName}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(selectedApt.groupStudents && selectedApt.groupStudents.length > 0
                    ? selectedApt.groupStudents
                    : selectedApt.students && selectedApt.students.length > 0
                    ? selectedApt.students
                    : [{ name: selectedApt.studentName, registerNumber: selectedApt.registerNumber, department: selectedApt.department, year: selectedApt.year, isLead: true }]
                  ).map((std, idx) => {
                    const isCurrentInspect = String(std.registerNumber || '').trim().toLowerCase() === String(selectedApt.registerNumber || '').trim().toLowerCase() && std.name === selectedApt.studentName;
                    return (
                      <div 
                        key={idx} 
                        className={`p-2 rounded-lg border flex items-center justify-between ${
                          isCurrentInspect 
                            ? 'bg-blue-100/70 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700' 
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 dark:text-white text-xs truncate block">
                              {std.name} {std.isLead ? '(Lead Booker)' : ''} {isCurrentInspect ? '• Currently Viewing' : ''}
                            </span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {std.department || selectedApt.department} • {std.year || selectedApt.year}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shrink-0 ml-2">
                          {std.registerNumber || 'N/A'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <span className="font-bold text-slate-600 dark:text-slate-400 block uppercase tracking-wider">Query Description:</span>
              <p className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {selectedApt.description || 'No specific description provided.'}
              </p>
            </div>

            {selectedApt.notes && (
              <div className="space-y-1">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block uppercase tracking-wider">Coordinator Notes:</span>
                <p className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
                  {selectedApt.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const targetId = selectedApt.parentAppointment?.id || selectedApt.id;
                    markNoShow(targetId);
                    setSelectedApt(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-900/50 transition-colors"
                >
                  Mark No-Show
                </button>
                <button
                  onClick={() => {
                    const targetId = selectedApt.parentAppointment?.id || selectedApt.id;
                    cancelAppointment(targetId);
                    setSelectedApt(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                >
                  Cancel Booking
                </button>
              </div>

              <button
                onClick={() => setSelectedApt(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
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
