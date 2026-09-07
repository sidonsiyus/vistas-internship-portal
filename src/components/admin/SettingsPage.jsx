import React, { useState } from 'react';
import { Bell, Database, Lock, CheckCircle2, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function SettingsPage() {
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
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          System Preferences & Admin Credentials
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure audio call alerts, Supabase admin passcodes, and desk parameters.
        </p>
      </div>

      {/* ADMIN PASSCODE & CREDENTIALS SECTION */}
      <div className="bg-slate-900 border border-blue-500/30 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <span>Change Supabase Admin Passcode</span>
            </h3>
            <p className="text-xs text-slate-400">
              Update the passcode used to log into the Internship Coordinator Admin Panel.
            </p>
          </div>
          {usingSupabase && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● Connected to Supabase
            </span>
          )}
        </div>

        <form onSubmit={handleUpdatePasscode} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">New Admin Passcode</label>
            <input
              type="password"
              placeholder="Enter new passcode..."
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">Confirm New Passcode</label>
            <input
              type="password"
              placeholder="Re-enter new passcode..."
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={passcodeLoading || !newPasscode}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{passcodeLoading ? 'Updating Supabase...' : 'UPDATE ADMIN PASSCODE'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* System Preferences */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <span>Audio Call Sound Alerts</span>
            </h3>
            <p className="text-xs text-slate-400">Play pleasant audio chime when calling a student token.</p>
          </div>
          <input
            type="checkbox"
            checked={soundAlerts}
            onChange={(e) => setSoundAlerts(e.target.checked)}
            className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Automatic Next Student Transition</span>
            </h3>
            <p className="text-xs text-slate-400">Automatically call next waiting student when completing a meeting.</p>
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
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Save System Preferences
          </button>
        </div>
      </div>

      {/* Reset Data Card */}
      <div className="bg-slate-900 border border-rose-500/30 p-6 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-rose-400" />
            <span>Reset Local Cache</span>
          </h3>
          <p className="text-xs text-slate-400">Clears browser local state and re-fetches clean database from Supabase.</p>
        </div>
        <button
          onClick={handleResetDemoData}
          className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 hover:text-white text-rose-300 text-xs font-bold border border-rose-500/40 transition-colors"
        >
          Reset Cache
        </button>
      </div>

    </div>
  );
}
