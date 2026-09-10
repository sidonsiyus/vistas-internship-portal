import React from 'react';
import { Calendar, Ticket, Activity, UserCheck, ArrowRight } from 'lucide-react';
import { OFFICE_LOCATION } from '../../mock/sampleData';

export default function HowItWorks({ setActiveTab }) {
  const steps = [
    {
      step: '01',
      title: 'Book a Slot',
      description: 'Select your preferred date and 15-minute time slot (regular slots start after 3:00 PM).',
      icon: Calendar,
    },
    {
      step: '02',
      title: 'Get Your Token',
      description: 'Receive your unique digital consultation token (e.g. INT-001) instantly.',
      icon: Ticket,
    },
    {
      step: '03',
      title: 'Track the Queue',
      description: 'Monitor real-time queue position and estimated wait time on your phone.',
      icon: Activity,
    },
    {
      step: '04',
      title: 'Meet Coordinator',
      description: `Arrive at ${OFFICE_LOCATION} when your token is called.`,
      icon: UserCheck,
    }
  ];

  return (
    <section className="py-14 bg-slate-50/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            SIMPLE WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            How The Smart Token System Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            4 simple steps to get your internship queries resolved without waiting in unorganized queues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold font-mono text-slate-300 dark:text-slate-700">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Step {item.step}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => setActiveTab('book')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all"
          >
            <span>Ready to book your consultation slot?</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
