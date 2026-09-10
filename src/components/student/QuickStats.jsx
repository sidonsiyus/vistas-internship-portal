import React from 'react';
import { Users, Clock, CheckCircle2, Hourglass } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateQueueMetrics } from '../../utils/tokenGenerator';

export default function QuickStats() {
  const { appointments } = useApp();
  const metrics = calculateQueueMetrics(appointments);

  const stats = [
    {
      label: 'Booked Today',
      value: metrics.totalToday,
      subtext: 'Across all departments',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800'
    },
    {
      label: 'In Queue',
      value: metrics.waitingCount,
      subtext: 'Waiting sequence',
      icon: Hourglass,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
    },
    {
      label: 'Completed',
      value: metrics.completedCount,
      subtext: 'Consultations done',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
    },
    {
      label: 'Average Pace',
      value: `${metrics.avgDurationMinutes}m`,
      subtext: 'Per consultation',
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800'
    }
  ];

  return (
    <section className="py-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/60 dark:bg-slate-800/50 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </span>
                  <div className={`p-1.5 rounded-lg border ${stat.bg} ${stat.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
                    {stat.value}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
