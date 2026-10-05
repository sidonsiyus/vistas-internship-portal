import React, { useState, useMemo, useRef } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  UserX,
  PieChart as PieIcon,
  Calendar,
  CalendarRange,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Award,
  Briefcase,
  FileText,
  ArrowUpRight,
  Sparkles,
  Building2,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Legend,
  CartesianGrid
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { 
  generateReportData, 
  toDateString, 
  getWeekBounds,
  CATEGORY_LABELS,
  CATEGORY_COLORS 
} from '../../utils/reportDataGenerator';
import { exportReportToExcel, exportReportToPNG } from '../../utils/reportExporter';
import { DEPARTMENTS, QUERY_CATEGORIES } from '../../mock/sampleData';

export default function AnalyticsReports() {
  const { appointments = [], internshipRecords = [], showToast } = useApp();
  const reportCaptureRef = useRef(null);

  // Timeframe state: 'daily' | 'weekly' | 'monthly'
  const [reportType, setReportType] = useState('daily');
  
  // Date states
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedWeekDate, setSelectedWeekDate] = useState(todayStr);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed (9 = Oct)

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sessionSearch, setSessionSearch] = useState('');

  // Export Loading States
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Generate complete report dataset dynamically
  const reportData = useMemo(() => {
    return generateReportData({
      reportType,
      selectedDate,
      selectedWeekDate,
      selectedYear,
      selectedMonth,
      appointments,
      internshipRecords,
      departmentFilter,
      categoryFilter
    });
  }, [
    reportType,
    selectedDate,
    selectedWeekDate,
    selectedYear,
    selectedMonth,
    appointments,
    internshipRecords,
    departmentFilter,
    categoryFilter
  ]);

  const {
    periodLabel,
    subLabel,
    metrics,
    hourlySlots,
    dailyBreakdown,
    weeklyBreakdown,
    categoryData,
    departmentData,
    classProgressData,
    sessions
  } = reportData;

  // Filtered session records for table search
  const displayedSessions = useMemo(() => {
    if (!sessionSearch.trim()) return sessions;
    const q = sessionSearch.toLowerCase().trim();
    return sessions.filter(s => 
      (s.studentName || '').toLowerCase().includes(q) ||
      (s.registerNumber || '').toLowerCase().includes(q) ||
      (s.tokenNumber || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q) ||
      (s.companyName || '').toLowerCase().includes(q)
    );
  }, [sessions, sessionSearch]);

  // Date Navigation Handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateString(d));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(toDateString(d));
  };

  const handlePrevWeek = () => {
    const d = new Date(selectedWeekDate);
    d.setDate(d.getDate() - 7);
    setSelectedWeekDate(toDateString(d));
  };

  const handleNextWeek = () => {
    const d = new Date(selectedWeekDate);
    d.setDate(d.getDate() + 7);
    setSelectedWeekDate(toDateString(d));
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Export to Excel Handler
  const handleExportExcel = () => {
    setIsExportingExcel(true);
    try {
      const filename = `VISTAS_${reportType.toUpperCase()}_REPORT_${periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
      exportReportToExcel(reportData, filename);
      if (showToast) showToast(`Exported ${reportType} report to Excel successfully!`, 'success');
    } catch (err) {
      console.error('Excel Export failed:', err);
      if (showToast) showToast('Failed to export Excel report: ' + err.message, 'error');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export to PNG Handler
  const handleExportPNG = async () => {
    if (!reportCaptureRef.current) return;
    setIsExportingPNG(true);
    try {
      const filename = `VISTAS_${reportType.toUpperCase()}_REPORT_${periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      await exportReportToPNG(reportCaptureRef.current, filename);
      if (showToast) showToast(`Exported ${reportType} report as high-res PNG image!`, 'success');
    } catch (err) {
      console.error('PNG Export failed:', err);
      if (showToast) showToast('Failed to export PNG: ' + err.message, 'error');
    } finally {
      setIsExportingPNG(false);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER & EXPORT ACTION BUTTONS                     */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Reports & Operations Analytics
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate and export daily per-day, weekly, and monthly consultation footfall & internship records.
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPNG}
            disabled={isExportingPNG}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm disabled:opacity-50"
            title="Export visual report dashboard as high-resolution PNG image"
          >
            {isExportingPNG ? (
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            ) : (
              <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
            <span>{isExportingPNG ? 'Rendering PNG...' : 'Export PNG'}</span>
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm hover:shadow disabled:opacity-50"
            title="Download complete multi-sheet Excel spreadsheet with full data logs"
          >
            {isExportingExcel ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-white" />
            )}
            <span>{isExportingExcel ? 'Exporting...' : 'Export Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TIMEFRAME SELECTOR TABS & NAVIGATION CONTROLS          */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-4">
        
        {/* Row 1: Timeframe Switcher & Date Picker */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Daily / Weekly / Monthly Pills */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start">
            <button
              onClick={() => setReportType('daily')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                reportType === 'daily'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Daily (Per Day)</span>
            </button>

            <button
              onClick={() => setReportType('weekly')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                reportType === 'weekly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5 text-emerald-500" />
              <span>Weekly Report</span>
            </button>

            <button
              onClick={() => setReportType('monthly')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                reportType === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-500" />
              <span>Monthly Report</span>
            </button>
          </div>

          {/* Timeframe Navigator */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* DAILY NAVIGATOR */}
            {reportType === 'daily' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevDay}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />

                <button
                  onClick={handleNextDay}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    selectedDate === todayStr
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Today
                </button>
              </div>
            )}

            {/* WEEKLY NAVIGATOR */}
            {reportType === 'weekly' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevWeek}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <input
                  type="date"
                  value={selectedWeekDate}
                  onChange={(e) => setSelectedWeekDate(e.target.value)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

                <button
                  onClick={handleNextWeek}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Next Week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedWeekDate(todayStr)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    selectedWeekDate === todayStr
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Current Week
                </button>
              </div>
            )}

            {/* MONTHLY NAVIGATOR */}
            {reportType === 'monthly' && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  {monthNames.map((name, idx) => (
                    <option key={name} value={idx}>{name}</option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>

                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Row 2: Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </span>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Query Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Query Categories</option>
            {QUERY_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {(departmentFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button
              onClick={() => {
                setDepartmentFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Reset Filters
            </button>
          )}

          <div className="ml-auto text-xs text-slate-500 dark:text-slate-400 font-mono">
            <strong>{metrics.totalCount}</strong> sessions in active view
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. CAPTURABLE REPORT CANVAS (Exported to PNG & Viewed)     */}
      {/* ========================================================= */}
      <div 
        ref={reportCaptureRef} 
        data-report-capture="true"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-2xl shadow-sm space-y-8"
      >
        
        {/* Formal Institutional Report Header (Included in PNG) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
              V
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                VELS INSTITUTE OF SCIENCE, TECHNOLOGY & ADVANCED STUDIES (VISTAS)
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                {reportType === 'daily' && 'Daily Desk Operations Report'}
                {reportType === 'weekly' && 'Weekly Consolidated Internship Report'}
                {reportType === 'monthly' && 'Monthly Placement & Internship Executive Report'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Period: <span className="font-semibold text-slate-700 dark:text-slate-200">{periodLabel}</span> • Generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="text-right sm:self-center shrink-0">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
              {reportType.toUpperCase()} ARCHIVE
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* KPI OVERVIEW CARDS                                        */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Total Footfall */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>TOTAL SESSIONS</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-1">
              {metrics.totalCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{metrics.walkInCount} Walk-ins</span>
              <span>•</span>
              <span>{metrics.preBookedCount} Booked</span>
            </div>
          </div>

          {/* Card 2: Completion Rate */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>COMPLETION RATE</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {metrics.completionRate}%
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {metrics.completedCount} of {metrics.totalCount} resolved
            </div>
          </div>

          {/* Card 3: Avg Duration */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>AVG CONSULT TIME</span>
              <Clock className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono mt-1">
              {metrics.avgDuration} <span className="text-sm font-normal">Mins</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Target: 15 Mins / slot
            </div>
          </div>

          {/* Card 4: No-Show Rate */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-4 rounded-xl">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>NO-SHOW STUDENTS</span>
              <UserX className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-1">
              {metrics.noShowCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {metrics.totalCount > 0 ? Math.round((metrics.noShowCount / metrics.totalCount) * 100) : 0}% uncalled / absent
            </div>
          </div>

          {/* Card 5: Peak Hour or Busiest Slot */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 p-4 rounded-xl col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>PEAK TRAFFIC</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-amber-700 dark:text-amber-400 mt-2 truncate">
              {metrics.peakHour}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Highest student density
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE CHARTS GRID                                   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Chart 1: Timeframe-specific Primary Visual */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>
                  {reportType === 'daily' && 'Hourly Consultation Traffic Density'}
                  {reportType === 'weekly' && 'Day-by-Day Footfall Comparison'}
                  {reportType === 'monthly' && 'Weekly Progression Across the Month'}
                </span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Total Volume</span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {reportType === 'daily' ? (
                  <BarChart data={hourlySlots}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#F8FAFC' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="scheduled" name="Pre-Booked" fill="#3B82F6" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="walkIn" name="Walk-Ins" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                ) : reportType === 'weekly' ? (
                  <BarChart data={dailyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#F8FAFC' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="walkIns" name="Walk-Ins" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="noShow" name="No-Shows" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <BarChart data={weeklyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="week" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#F8FAFC' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="walkIn" name="Walk-Ins" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Query Category Share (Donut Chart) */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Query Categories Breakdown</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Distribution %</span>
            </div>

            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cat-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#F8FAFC' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-600 dark:text-slate-400 max-h-16 overflow-y-auto">
              {categoryData.slice(0, 6).map(c => (
                <span key={c.name} className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span>{c.name}: <strong>{c.value}</strong> ({c.percentage}%)</span>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* SUMMARY BREAKDOWN TABLE (Hourly/Daily/Weekly Summary)      */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {reportType === 'daily' && 'Hourly Footfall Summary Matrix'}
                {reportType === 'weekly' && 'Day-by-Day Consolidated Footfall Ledger'}
                {reportType === 'monthly' && 'Weekly Performance Audit Matrix'}
              </span>
            </h3>
            <span className="text-xs text-slate-400">Official Placement Log</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                {reportType === 'daily' ? (
                  <tr>
                    <th className="px-4 py-3">Hour Slot</th>
                    <th className="px-4 py-3">Pre-Booked</th>
                    <th className="px-4 py-3">Walk-ins</th>
                    <th className="px-4 py-3">Total Volume</th>
                    <th className="px-4 py-3">Share %</th>
                  </tr>
                ) : reportType === 'weekly' ? (
                  <tr>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Scheduled</th>
                    <th className="px-4 py-3">Walk-ins</th>
                    <th className="px-4 py-3">Completed</th>
                    <th className="px-4 py-3">No-Shows</th>
                    <th className="px-4 py-3">Completion Rate</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3">Week Block</th>
                    <th className="px-4 py-3">Date Range</th>
                    <th className="px-4 py-3">Total Consultations</th>
                    <th className="px-4 py-3">Completed</th>
                    <th className="px-4 py-3">Walk-ins</th>
                    <th className="px-4 py-3">No-Shows</th>
                    <th className="px-4 py-3">Performance %</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {reportType === 'daily' && hourlySlots.map((h, i) => (
                  <tr key={h.hour} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-850/50'}>
                    <td className="px-4 py-2.5 font-bold font-mono text-slate-900 dark:text-white">{h.hour}</td>
                    <td className="px-4 py-2.5 font-mono">{h.scheduled}</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{h.walkIn}</td>
                    <td className="px-4 py-2.5 font-mono font-bold">{h.total}</td>
                    <td className="px-4 py-2.5">
                      {metrics.totalCount > 0 ? Math.round((h.total / metrics.totalCount) * 100) : 0}%
                    </td>
                  </tr>
                ))}

                {reportType === 'weekly' && dailyBreakdown.map((d, i) => (
                  <tr key={d.day} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-850/50'}>
                    <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{d.day}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">{d.date}</td>
                    <td className="px-4 py-2.5 font-mono">{d.scheduled}</td>
                    <td className="px-4 py-2.5 font-mono text-blue-600 dark:text-blue-400">{d.walkIns}</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{d.completed}</td>
                    <td className="px-4 py-2.5 font-mono text-rose-600 dark:text-rose-400">{d.noShow}</td>
                    <td className="px-4 py-2.5 font-bold">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        {d.rate}%
                      </span>
                    </td>
                  </tr>
                ))}

                {reportType === 'monthly' && weeklyBreakdown.map((w, i) => (
                  <tr key={w.week} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-850/50'}>
                    <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{w.week}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-500">{w.range}</td>
                    <td className="px-4 py-2.5 font-mono font-bold">{w.total}</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{w.completed}</td>
                    <td className="px-4 py-2.5 font-mono text-blue-600 dark:text-blue-400">{w.walkIn}</td>
                    <td className="px-4 py-2.5 font-mono text-rose-600 dark:text-rose-400">{w.noShow}</td>
                    <td className="px-4 py-2.5 font-bold">
                      {w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DETAILED STUDENT SESSIONS ROSTER (Live Table)             */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Student Consultation Session Logs ({displayedSessions.length})</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Detailed record of all student appointments and desk walk-ins for this period.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                placeholder="Search student, reg #, dept..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px] sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3.5 py-2.5">Token</th>
                  <th className="px-3.5 py-2.5">Time</th>
                  <th className="px-3.5 py-2.5">Student Name</th>
                  <th className="px-3.5 py-2.5">Reg Number</th>
                  <th className="px-3.5 py-2.5">Department</th>
                  <th className="px-3.5 py-2.5">Query Category</th>
                  <th className="px-3.5 py-2.5">Mode</th>
                  <th className="px-3.5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {displayedSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      No consultation records found matching current query or filters.
                    </td>
                  </tr>
                ) : (
                  displayedSessions.slice(0, 100).map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-3.5 py-2 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {s.tokenNumber || 'INT-000'}
                      </td>
                      <td className="px-3.5 py-2 font-mono text-slate-500">
                        {s.appointmentTime || '10:00'}
                      </td>
                      <td className="px-3.5 py-2 font-bold text-slate-900 dark:text-white">
                        {s.studentName || s.leadStudentName || 'Student'}
                      </td>
                      <td className="px-3.5 py-2 font-mono text-slate-500">
                        {s.registerNumber || '-'}
                      </td>
                      <td className="px-3.5 py-2 truncate max-w-[160px]" title={s.department}>
                        {s.department || 'Aviation'}
                      </td>
                      <td className="px-3.5 py-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <span 
                            className="w-1.5 h-1.5 rounded-full" 
                            style={{ backgroundColor: CATEGORY_COLORS[s.category] || '#64748B' }} 
                          />
                          {CATEGORY_LABELS[s.category] || s.category}
                        </span>
                      </td>
                      <td className="px-3.5 py-2">
                        {s.isWalkIn ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            Walk-In
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                            Pre-Booked
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2">
                        {s.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        ) : s.status === 'NO_SHOW' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                            <UserX className="w-3.5 h-3.5" /> Absent
                          </span>
                        ) : s.status === 'CANCELLED' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <XCircle className="w-3.5 h-3.5" /> Cancelled
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            Waiting
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERNSHIP CLASS PROGRESS TABLE                           */}
        {/* ========================================================= */}
        {classProgressData && classProgressData.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Class-Wise Student Internship Completion Status ({classProgressData.length} Classes)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Master Roster</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Class / Section</th>
                    <th className="px-4 py-2.5">Total Students</th>
                    <th className="px-4 py-2.5">Completed</th>
                    <th className="px-4 py-2.5">Ongoing</th>
                    <th className="px-4 py-2.5">Not Started</th>
                    <th className="px-4 py-2.5">Certs Collected</th>
                    <th className="px-4 py-2.5">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {classProgressData.map((c, idx) => (
                    <tr key={c.className} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-850/50'}>
                      <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{c.className}</td>
                      <td className="px-4 py-2.5 font-mono">{c.total}</td>
                      <td className="px-4 py-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{c.completed}</td>
                      <td className="px-4 py-2.5 font-mono text-blue-600 dark:text-blue-400">{c.ongoing}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-400">{c.notStarted}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-purple-600 dark:text-purple-400">{c.certsCollected}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all" 
                              style={{ width: `${c.completionRate}%` }} 
                            />
                          </div>
                          <span className="font-mono text-[11px] font-bold">{c.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Institution Sign-off Footer in PNG */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
          <span>Official Report Generated by VISTAS Internship & Placement Portal</span>
          <span>Dean / Placement Coordinator Desk • Confidential Institutional Record</span>
        </div>

      </div>

    </div>
  );
}
