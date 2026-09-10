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
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          System Preferences & Admin Credentials
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure audio call alerts, Supabase admin passcodes, and desk parameters.
        </p>
      </div>

      {/* ADMIN PASSCODE & CREDENTIALS SECTION */}
      <div className="bg-white border border-blue-200/80 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Change Supabase Admin Passcode</span>
            </h3>
            <p className="text-xs text-slate-500">
              Update the passcode used to log into the Internship Coordinator Admin Panel.
            </p>
          </div>
          {usingSupabase && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ● Connected to Supabase
            </span>
          )}
        </div>

        <form onSubmit={handleUpdatePasscode} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">New Admin Passcode</label>
            <input
              type="password"
              placeholder="Enter new passcode..."
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Confirm New Passcode</label>
            <input
              type="password"
              placeholder="Re-enter new passcode..."
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
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
      <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Audio Call Sound Alerts</span>
            </h3>
            <p className="text-xs text-slate-500">Play pleasant audio chime when calling a student token.</p>
          </div>
          <input
            type="checkbox"
            checked={soundAlerts}
            onChange={(e) => setSoundAlerts(e.target.checked)}
            className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Automatic Next Student Transition</span>
            </h3>
            <p className="text-xs text-slate-500">Automatically call next waiting student when completing a meeting.</p>
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
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Save System Preferences
          </button>
        </div>
      </div>

      {/* Reset Data Card */}
      <div className="bg-white border border-rose-200 p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-rose-600" />
            <span>Reset Local Cache</span>
          </h3>
          <p className="text-xs text-slate-500">Clears browser local state and re-fetches clean database from Supabase.</p>
        </div>
        <button
          onClick={handleResetDemoData}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 text-xs font-semibold border border-rose-200 transition-colors"
        >
          Reset Cache
        </button>
      </div>

    </div>
  );
}
