import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  UserX,
  PieChart as PieIcon
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
  Line 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { calculateQueueMetrics } from '../../utils/tokenGenerator';

export default function AnalyticsReports() {
  const { appointments } = useApp();
  const metrics = calculateQueueMetrics(appointments);

  // Sample data for charts
  const categoryData = [
    { name: 'Opportunity', value: 35, color: '#2563EB' },
    { name: 'Approval (NOC)', value: 28, color: '#10B981' },
    { name: 'Recommendation', value: 18, color: '#8B5CF6' },
    { name: 'Documents', value: 12, color: '#F59E0B' },
    { name: 'Certificate', value: 7, color: '#06B6D4' },
  ];

  const hourlyData = [
    { hour: '10 AM', count: 6 },
    { hour: '11 AM', count: 8 },
    { hour: '12 PM', count: 5 },
    { hour: '02 PM', count: 7 },
    { hour: '03 PM', count: 4 },
  ];

  const durationTrendData = [
    { day: 'Mon', duration: 11 },
    { day: 'Tue', duration: 13 },
    { day: 'Wed', duration: 10 },
    { day: 'Thu', duration: 12 },
    { day: 'Fri', duration: 9 },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Consultation Reports & Operations Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Performance metrics, peak hour density, query category distributions, and duration trends.
        </p>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">TOTAL APPOINTMENTS</span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono mt-1">{metrics.totalToday}</div>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +14% vs last week
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">COMPLETION RATE</span>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono mt-1">
            {metrics.totalToday > 0 ? Math.round((metrics.completedCount / metrics.totalToday) * 100) : 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{metrics.completedCount} completed today</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">AVG CONSULTATION TIME</span>
          <div className="text-3xl font-extrabold text-blue-600 font-mono mt-1">
            {metrics.avgDurationMinutes} Mins
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Target: 15 Mins / slot</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">NO-SHOW STUDENTS</span>
          <div className="text-3xl font-extrabold text-rose-600 font-mono mt-1">
            {metrics.noShowCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Automatically unqueued</p>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Peak Hours Breakdown */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Peak Consultation Hours Density</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Query Categories Distribution */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            <span>Query Category Share (%)</span>
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600">
            {categoryData.map(c => (
              <span key={c.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
            ))}
          </div>
        </div>

        {/* Chart 3: Duration Trend */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Average Meeting Duration Trend (Minutes per day)</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={durationTrendData}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="duration" stroke="#0284C7" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
