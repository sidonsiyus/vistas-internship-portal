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
    <section className="py-14 bg-slate-50/60 border-b border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600">
            SIMPLE WORKFLOW
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How The Smart Token System Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            4 simple steps to get your internship queries resolved without waiting in unorganized queues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 p-5 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold font-mono text-slate-300">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Step {item.step}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => setActiveTab('book')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-blue-600 font-semibold text-xs border border-slate-200 hover:border-slate-300 shadow-sm transition-all"
          >
            <span>Ready to book your consultation slot?</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
