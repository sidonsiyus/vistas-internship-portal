import React from 'react';
import { Users, Clock, CheckCircle2, Hourglass } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateQueueMetrics } from '../../utils/tokenGenerator';

export default function QuickStats() {
  const { appointments } = useApp();
  const metrics = calculateQueueMetrics(appointments);

  const stats = [
    {
      label: 'Students Booked Today',
      value: metrics.totalToday,
      subtext: 'Across all departments',
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      label: 'Currently Waiting',
      value: metrics.waitingCount,
      subtext: 'In queue sequence',
      icon: Hourglass,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      label: 'Completed Consultations',
      value: metrics.completedCount,
      subtext: 'Processed today',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Average Consultation Time',
      value: `${metrics.avgDurationMinutes} Mins`,
      subtext: 'Based on live pace',
      icon: Clock,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20'
    }
  ];

  return (
    <section className="py-8 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-xl border ${stat.bg} ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                    {stat.value}
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {stat.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
