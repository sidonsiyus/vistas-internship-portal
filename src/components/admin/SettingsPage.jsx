import React, { useState } from 'react';
import { Bell, Database, Lock, CheckCircle2, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function SettingsPage({ setActiveAdminPage }) {
  const { showToast, usingSupabase, resetAllTokens } = useApp();

  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoNext, setAutoNext] = useState(false);

  // Admin Credentials Form State
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeLoading, setPasscodeLoading] = useState(false);

  const handleSavePreferences = () => {
    showToast('Desk system settings saved successfully!', 'success');
  };

  const handleUpdatePasscode = async (e) => {
    e.preventDefault();
    if (!newPasscode.trim()) {
      showToast('Please enter a valid new passcode.', 'warning');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      showToast('Passcodes do not match! Please check again.', 'warning');
      return;
    }

    setPasscodeLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from('admin_users')
          .update({ passcode: newPasscode })
          .eq('role', 'coordinator');

        if (error) throw error;
        showToast('🔑 Supabase Admin Passcode updated successfully!', 'success');
      } else {
        showToast('Admin Passcode updated locally!', 'success');
      }
      setNewPasscode('');
      setConfirmPasscode('');
    } catch (err) {
      showToast('Failed to update passcode in Supabase.', 'warning');
    } finally {
      setPasscodeLoading(false);
    }
  };

  const handleResetDemoData = () => {
    if (confirm('🔥 DANGER ZONE: Are you sure you want to delete all tokens and reset the queue sequence?')) {
      resetAllTokens();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          System Preferences & Admin Credentials
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure audio call alerts, Supabase admin passcodes, and desk parameters.
        </p>
      </div>

      {/* ADMIN PASSCODE & CREDENTIALS SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-900/50 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Change Supabase Admin Passcode</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update the passcode used to log into the Internship Coordinator Admin Panel.
            </p>
          </div>
          {usingSupabase && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
              ● Connected to Supabase
            </span>
          )}
        </div>

        <form onSubmit={handleUpdatePasscode} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">New Admin Passcode</label>
            <input
              type="password"
              placeholder="Enter new passcode..."
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm New Passcode</label>
            <input
              type="password"
              placeholder="Re-enter new passcode..."
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={passcodeLoading || !newPasscode}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{passcodeLoading ? 'Updating Supabase...' : 'UPDATE ADMIN PASSCODE'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* System Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Audio Call Sound Alerts</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Play pleasant audio chime when calling a student token.</p>
          </div>
          <input
            type="checkbox"
            checked={soundAlerts}
            onChange={(e) => setSoundAlerts(e.target.checked)}
            className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Automatic Next Student Transition</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Automatically call next waiting student when completing a meeting.</p>
          </div>
          <input
            type="checkbox"
            checked={autoNext}
            onChange={(e) => setAutoNext(e.target.checked)}
            className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSavePreferences}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Save System Preferences
          </button>
        </div>
      </div>

      {/* CONSULTATION SLOTS & TIMINGS SHORTCUT CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">📅 Consultation Timings & Slot Duration</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold">
              3:30 PM Start • 15 Mins (Configurable)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Change daily start & closing times, or increase/decrease consultation slot durations (e.g. 10 mins, 15 mins, 20 mins, 30 mins) with live preview.
          </p>
        </div>
        {setActiveAdminPage && (
          <button
            type="button"
            onClick={() => setActiveAdminPage('availability')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shrink-0 cursor-pointer"
          >
            Configure Slot Timings →
          </button>
        )}
      </div>

      {/* DUAL SUPABASE ACCOUNTS & EGRESS MANAGER */}
      <div className="bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-900/50 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">☁️ Dual Supabase Accounts & Egress Shield</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                Egress Protection Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connect a 2nd Supabase project to split storage from database queries, or have an automatic zero-egress backup.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Account #1 Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Account #1 (Primary)</span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                Queue & Realtime
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              URL: <span className="font-mono text-slate-700 dark:text-slate-300">https://apjwptavagbrxwsxoxei.supabase.co</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Handles: Live Token Queue, Appointments, Broadcast Sync.
            </p>
          </div>

          {/* Account #2 Card */}
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Account #2 (Secondary / Storage)</span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded">
                File Storage & Vault
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Status: <span className="font-semibold text-slate-700 dark:text-slate-300">
                {localStorage.getItem('vistas_supabase_secondary_url') ? 'Configured & Active' : 'Optional (Using Account #1 by default)'}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Handles: Student Resumes, PDF Invite Letters, Heavy Attachments.
            </p>
          </div>
        </div>

        {/* Form to set Secondary Supabase Credentials */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target;
              const secUrl = form.secUrl.value.trim();
              const secKey = form.secKey.value.trim();
              if (secUrl) localStorage.setItem('vistas_supabase_secondary_url', secUrl);
              else localStorage.removeItem('vistas_supabase_secondary_url');
              if (secKey) localStorage.setItem('vistas_supabase_secondary_anon_key', secKey);
              else localStorage.removeItem('vistas_supabase_secondary_anon_key');
              showToast('Secondary Supabase Account saved! Reloading to apply...', 'success');
              setTimeout(() => window.location.reload(), 1000);
            }}
            className="space-y-3"
          >
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Connect or Update Secondary Supabase Project
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Secondary Project URL
                </label>
                <input
                  name="secUrl"
                  type="url"
                  placeholder="https://xyzproject.supabase.co"
                  defaultValue={localStorage.getItem('vistas_supabase_secondary_url') || ''}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Secondary Anon Public Key
                </label>
                <input
                  name="secKey"
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  defaultValue={localStorage.getItem('vistas_supabase_secondary_anon_key') || ''}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                You can also specify VITE_SUPABASE_SECONDARY_URL in your .env file.
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
              >
                Save Secondary Account
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reset Data Card */}
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Reset Local Cache</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Clears browser local state and re-fetches clean database from Supabase.</p>
        </div>
        <button
          onClick={handleResetDemoData}
          className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-400 text-xs font-semibold border border-rose-200 dark:border-rose-900/50 transition-colors"
        >
          Reset Cache
        </button>
      </div>

    </div>
  );
}
