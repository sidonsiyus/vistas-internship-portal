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
      color: 'from-blue-500 to-sky-500'
    },
    {
      step: '02',
      title: 'Get Your Token',
      description: 'Receive your unique digital token (e.g. INT-001) for your consultation session.',
      icon: Ticket,
      color: 'from-sky-500 to-indigo-500'
    },
    {
      step: '03',
      title: 'Track the Queue',
      description: 'Monitor real-time queue position and estimated wait time on your phone.',
      icon: Activity,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      step: '04',
      title: 'Meet Coordinator',
      description: `Arrive at ${OFFICE_LOCATION} when your token is called for your 15-minute meeting.`,
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-500'
    }
  ];

  return (
    <section className="py-16 bg-slate-950 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-400">
            SIMPLE & STRUCTURED WORKFLOW
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            How The Smart Token System Works
          </h2>
          <p className="text-sm text-slate-400">
            4 simple steps to get your queries resolved efficiently without waiting in unorganized queues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800/80 p-6 rounded-2xl relative group hover:border-slate-700 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between"
              >
                {/* Step badge */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} p-0.5 shadow-lg`}>
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-white">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <span className="text-2xl font-black font-mono text-slate-700 group-hover:text-blue-500 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                  <span>Step {item.step}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => setActiveTab('book')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 font-bold text-sm border border-slate-800 hover:border-slate-700 transition-all shadow-lg"
          >
            <span>Ready to book your consultation slot?</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
