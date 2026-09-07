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
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      label: 'In Queue',
      value: metrics.waitingCount,
      subtext: 'Waiting sequence',
      icon: Hourglass,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      label: 'Completed',
      value: metrics.completedCount,
      subtext: 'Consultations done',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Average Pace',
      value: `${metrics.avgDurationMinutes}m`,
      subtext: 'Per consultation',
      icon: Clock,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20'
    }
  ];

  return (
    <section className="py-7 bg-[#080c14] border-b border-slate-800/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-[#0b101b] p-4 sm:p-5 rounded-xl border border-slate-800/70 flex flex-col justify-between hover:border-slate-700 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </span>
                  <div className={`p-1.5 rounded-lg border ${stat.bg} ${stat.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
                    {stat.value}
                  </div>
                  <p className="text-[11px] text-slate-500">
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
