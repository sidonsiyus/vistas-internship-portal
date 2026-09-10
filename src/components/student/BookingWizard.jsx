import React, { useState } from 'react';
import { Calendar, Clock, User, CheckCircle2 } from 'lucide-react';
import DateStep from './Steps/DateStep';
import TimeStep from './Steps/TimeStep';
import DetailsStep from './Steps/DetailsStep';
import ConfirmationStep from './Steps/ConfirmationStep';
import { useApp } from '../../context/AppContext';

const getTodayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BookingWizard({ setActiveTab }) {
  const { bookAppointment } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(getTodayIso);
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    department: '',
    year: '3rd Year',
    phone: '',
    email: '',
    category: 'Internship Opportunity',
    description: ''
  });

  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  const steps = [
    { number: 1, title: 'Date', icon: Calendar },
    { number: 2, title: 'Time', icon: Clock },
    { number: 3, title: 'Details', icon: User },
    { number: 4, title: 'Confirmation', icon: CheckCircle2 },
  ];

  const handleBookingSubmit = async () => {
    const bookingPayload = {
      ...formData,
      date: selectedDate,
      timeSlot: selectedTime
    };

    const created = await bookAppointment(bookingPayload);
    setConfirmedAppointment(created);
    setCurrentStep(4);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Wizard Card Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-10 space-y-8">
        
        {/* Progress Step Bar */}
        <div className="border-b border-slate-100 pb-6">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isCompleted = currentStep > s.number;
              const isCurrent = currentStep === s.number;

              return (
                <div key={s.number} className="flex flex-col items-center relative flex-1">
                  {/* Step Connector Line */}
                  {idx !== steps.length - 1 && (
                    <div 
                      className={`absolute top-5 left-1/2 w-full h-0.5 z-0 transition-colors ${
                        currentStep > s.number ? 'bg-blue-600' : 'bg-slate-200'
                      }`} 
                    />
                  )}

                  <div 
                    className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                      isCompleted
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-600 shadow-sm'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : s.number}
                  </div>

                  <span className={`text-xs font-semibold mt-2 hidden sm:block ${
                    isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Views */}
        <div className="pt-2">
          {currentStep === 1 && (
            <DateStep
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <TimeStep
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <DetailsStep
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleBookingSubmit}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <ConfirmationStep
              appointment={confirmedAppointment}
              onTrackToken={() => setActiveTab('track')}
              onCancel={() => setCurrentStep(1)}
            />
          )}
        </div>

      </div>
    </div>
  );
}
