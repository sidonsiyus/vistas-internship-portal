import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  Send, 
  CheckCircle2, 
  Laptop, 
  AlertCircle, 
  Clock, 
  Mail, 
  Phone, 
  User, 
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

const STUDENT_PORTAL_FEATURES = [
  'Booking a Consultation Slot',
  'Live Token Tracker & Queue Status',
  'Uploading Internship Certificate / Document',
  'Viewing Internship Updates & PDF Downloads',
  'Mobile Layout / Buttons Display Cut Off',
  'Search & Profile Autocomplete',
  'Other Technical Issue'
];

export default function StudentBugReportModal({ isOpen, onClose }) {
  const { createTicket } = useApp();

  const [feature, setFeature] = useState(STUDENT_PORTAL_FEATURES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [studentName, setStudentName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Environment telemetry
  const [environment, setEnvironment] = useState({
    browser: '',
    screen: '',
    url: ''
  });

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setReproductionSteps('');
      setStudentName('');
      setRegisterNumber('');
      setContactInfo('');
      setSubmittedTicket(null);
      setFeature(STUDENT_PORTAL_FEATURES[0]);

      if (typeof window !== 'undefined') {
        const ua = navigator.userAgent;
        let b = 'Browser';
        if (ua.includes('Firefox')) b = 'Firefox';
        else if (ua.includes('Chrome')) b = 'Chrome';
        else if (ua.includes('Safari')) b = 'Safari';
        else if (ua.includes('Edge')) b = 'Edge';

        let os = 'Device';
        if (ua.includes('Mac')) os = 'macOS';
        else if (ua.includes('Win')) os = 'Windows';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

        setEnvironment({
          browser: `${b} on ${os}`,
          screen: `${window.innerWidth} x ${window.innerHeight}`,
          url: window.location.pathname || '/'
        });
      }
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !studentName.trim()) return;

    setIsSubmitting(true);
    try {
      const ticket = await createTicket({
        type: 'BUG_REPORT',
        title: `[Student Issue] ${title.trim()}`,
        category: feature,
        priority: 'HIGH',
        description: description.trim(),
        reproductionSteps: reproductionSteps.trim(),
        expectedBenefit: '',
        submitterRole: 'STUDENT',
        submitterName: studentName.trim(),
        submitterEmail: contactInfo.trim() || 'student@vistas.ac.in',
        studentRegisterNumber: registerNumber.trim(),
        environment
      });
      setSubmittedTicket(ticket);
    } catch (err) {
      console.error('Failed to submit student bug report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report an Issue with Portal Features"
      maxWidth="max-w-lg"
    >
      {submittedTicket ? (
        <div className="py-6 px-2 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Issue Report Logged!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your report has been saved under Ticket <strong className="font-mono text-blue-600 dark:text-blue-400">{submittedTicket.id}</strong>.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-left space-y-1.5 text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
              <Mail className="w-4 h-4" />
              <span>Email Notification Sent</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              An alert was automatically dispatched to developer & coordinator inbox (<span className="font-mono text-slate-700 dark:text-slate-200">siddarth@mhcglobal.info</span>) for rapid resolution.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            Done & Return to Portal
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200/80 dark:border-rose-900/40 flex items-start gap-2.5">
            <Bug className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-rose-900 dark:text-rose-300 leading-relaxed">
              Found a bug or something not working properly? Fill in the details below. An email alert will be dispatched to the technical coordinator (<strong className="font-mono">siddarth@mhcglobal.info</strong>) to investigate and fix.
            </p>
          </div>

          {/* Feature Dropdown */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Which feature is giving you trouble? *
            </label>
            <select
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {STUDENT_PORTAL_FEATURES.map((f) => (
                <option key={f} value={f} className="dark:bg-slate-800">{f}</option>
              ))}
            </select>
          </div>

          {/* Issue Summary */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Issue Summary (Brief title) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Upload Certificate button stays disabled or errors out"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What happened? (Describe what went wrong) *
            </label>
            <textarea
              required
              rows="3"
              placeholder="Tell us what you clicked, what screen you were on, and what error or unexpected behavior you saw..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Student Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vignesh M"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Register Number (Recommended)
              </label>
              <input
                type="text"
                placeholder="e.g. 25326101"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Optional Contact info */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Email or Phone (Optional, for resolution updates)
            </label>
            <input
              type="text"
              placeholder="e.g. student@gmail.com or 9876543210"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Auto-detected Diagnostics note */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-blue-500" />
              <span>{environment.browser}</span>
            </span>
            <span>Screen: {environment.screen}</span>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !description.trim() || !studentName.trim()}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending Alert...' : 'Report Issue'}</span>
            </button>
          </div>

        </form>
      )}
    </Modal>
  );
}
