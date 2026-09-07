import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminLogin({ onLoginSuccess }) {
  const { loginAdmin, usingSupabase } = useApp();
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!passcode.trim()) {
      setError('Please enter your passcode.');
      return;
    }

    setLoading(true);

    try {
      const success = await loginAdmin('coordinator@velshitech.edu.in', passcode.trim());
      if (success) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setError('Invalid passcode. Access denied.');
      }
    } catch (err) {
      setError('Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mx-auto flex items-center justify-center shadow-md">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Coordinator Desk Access
          </h2>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            {usingSupabase ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Supabase Cloud Auth Active
              </span>
            ) : (
              <span>Authorized Queue Control Panel</span>
            )}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-400 font-semibold text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              Desk Access Passcode
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="Enter passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Verifying Passcode...</span>
            ) : (
              <>
                <span>ENTER DESK PANEL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
