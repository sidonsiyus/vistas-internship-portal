import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  Lightbulb, 
  Wrench, 
  AlertTriangle, 
  Send, 
  Laptop, 
  CheckCircle2, 
  X,
  Info
} from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

const CATEGORIES = [
  'Appointments & Queue',
  'Student Directory & Search',
  'Documentation Vault & Uploads',
  'Updates & Announcements',
  'Availability & Scheduling',
  'UI / Mobile Display & Theme',
  'Performance & Connectivity',
  'General & Other'
];

export default function CreateTicketModal({ isOpen, onClose, initialType = 'BUG_REPORT' }) {
  const { createTicket, adminAuth } = useApp();

  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Appointments & Queue');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [expectedBenefit, setExpectedBenefit] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);

  // Auto-detect environment
  const [environment, setEnvironment] = useState({
    browser: '',
    screen: '',
    url: '',
    platform: ''
  });

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setTitle('');
      setDescription('');
      setReproductionSteps('');
      setExpectedBenefit('');
      setCategory('Appointments & Queue');
      setPriority(initialType === 'BUG_REPORT' ? 'HIGH' : 'MEDIUM');
      setSubmitterName(adminAuth?.name || 'Placement Coordinator');
      setSubmitterEmail(adminAuth?.email || 'coordinator.internship@vistas.ac.in');

      if (typeof window !== 'undefined') {
        const ua = navigator.userAgent;
        let browserName = 'Browser';
        if (ua.includes('Firefox')) browserName = 'Firefox';
        else if (ua.includes('Chrome')) browserName = 'Chrome';
        else if (ua.includes('Safari')) browserName = 'Safari';
        else if (ua.includes('Edge')) browserName = 'Edge';

        let osName = 'Desktop';
        if (ua.includes('Mac')) osName = 'macOS';
        else if (ua.includes('Win')) osName = 'Windows';
        else if (ua.includes('Linux')) osName = 'Linux';
        else if (ua.includes('Android')) osName = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS';

        setEnvironment({
          browser: `${browserName} on ${osName}`,
          screen: `${window.innerWidth} x ${window.innerHeight}`,
          url: window.location.pathname || '/',
          platform: navigator.platform || 'Unknown'
        });
      }
    }
  }, [isOpen, initialType, adminAuth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await createTicket({
        type,
        title,
        category,
        priority,
        description,
        reproductionSteps,
        expectedBenefit,
        submitterName,
        submitterEmail,
        environment
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Raise Ticket or Feature Request"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        
        {/* Type Selector Tabs */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Ticket Category *
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setType('BUG_REPORT');
                if (priority === 'LOW') setPriority('MEDIUM');
              }}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                type === 'BUG_REPORT'
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bug className="w-4 h-4 text-rose-500" />
              <span className="font-bold">Bug Report</span>
            </button>

            <button
              type="button"
              onClick={() => setType('FEATURE_REQUEST')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                type === 'FEATURE_REQUEST'
                  ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-purple-500" />
              <span className="font-bold">Feature Request</span>
            </button>

            <button
              type="button"
              onClick={() => setType('ENHANCEMENT')}
              className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                type === 'ENHANCEMENT'
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4 text-blue-500" />
              <span className="font-bold">Enhancement</span>
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {type === 'BUG_REPORT' ? 'Bug Summary *' : 'Feature Summary *'}
          </label>
          <input
            type="text"
            required
            placeholder={
              type === 'BUG_REPORT'
                ? 'e.g. Appointment status does not update on mobile view'
                : 'e.g. Add 1-click attendance export to CSV for Dean review'
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {/* Category & Priority in 2 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Portal Module / Area *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="dark:bg-slate-800">{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Severity / Priority *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="LOW" className="dark:bg-slate-800">🟢 Low — Minor / Nice to have</option>
              <option value="MEDIUM" className="dark:bg-slate-800">🟡 Medium — Normal impact</option>
              <option value="HIGH" className="dark:bg-slate-800">🟠 High — Important workflow impact</option>
              <option value="CRITICAL" className="dark:bg-slate-800">🔴 Critical — Urgent / System blocking</option>
            </select>
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Detailed Description *
          </label>
          <textarea
            required
            rows="3"
            placeholder={
              type === 'BUG_REPORT'
                ? 'Describe what happened, what you were doing when it occurred, and what you expected to happen instead...'
                : 'Explain what new functionality is needed and how coordinators or students would use it...'
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none"
          />
        </div>

        {/* Dynamic Context Field based on Type */}
        {type === 'BUG_REPORT' ? (
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Steps to Reproduce (Optional but Recommended)
            </label>
            <textarea
              rows="2"
              placeholder="1. Go to Appointments&#10;2. Click on 'Inspect Details'&#10;3. See error..."
              value={reproductionSteps}
              onChange={(e) => setReproductionSteps(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none font-mono"
            />
          </div>
        ) : (
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expected Workflow Benefit (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="e.g. How does this save time or improve the student consultation experience?"
              value={expectedBenefit}
              onChange={(e) => setExpectedBenefit(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none"
            />
          </div>
        )}

        {/* Telemetry info auto-capture badge */}
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5">
          <div 
            onClick={() => setShowTelemetry(!showTelemetry)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-[11px]">
              <Laptop className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Auto-captured Device Telemetry (Included for Developers)</span>
            </div>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              {showTelemetry ? 'Hide' : 'View'}
            </span>
          </div>
          {showTelemetry && (
            <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700 grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <div>Browser: {environment.browser}</div>
              <div>Screen: {environment.screen}</div>
              <div>Page: {environment.url}</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
            </div>
          )}
        </div>

        {/* Footer actions */}
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
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
}
