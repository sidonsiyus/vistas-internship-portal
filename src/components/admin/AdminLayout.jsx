import React from 'react';
import { 
  LayoutDashboard, 
  ListOrdered, 
  CalendarDays, 
  Clock, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  GraduationCap, 
  Bell, 
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminLayout({ activeAdminPage, setActiveAdminPage, children }) {
  const { logoutAdmin, availability, updateAvailabilityStatus, toastNotification } = useApp();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-queue', label: 'Live Queue', icon: ListOrdered, badge: 'Live' },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'students', label: 'Students Directory', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100 font-sans">
      
      {/* Toast Notification Container (Bottom-Right Positioned) */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border-2 border-blue-500 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-bounce flex items-center gap-3 max-w-sm">
          <span className="h-3 w-3 rounded-full bg-blue-400 live-pulse shrink-0" />
          <span className="text-xs font-bold leading-snug">{toastNotification.message}</span>
        </div>
      )}

      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="w-full md:w-60 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Plain & Simple Top-Left Sidebar Branding */}
          <div className="p-4 border-b border-slate-800 flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-blue-500 shrink-0" />
            <h2 className="font-bold text-sm text-white tracking-tight">Internship Desk</h2>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeAdminPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveAdminPage(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
              IC
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Internship Coordinator</p>
            </div>
          </div>

          <button
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-950 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 text-xs font-semibold border border-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-900/80 px-6 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight capitalize">
              {activeAdminPage.replace('-', ' ')}
            </h1>
          </div>

          {/* Availability Status Quick Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium px-1">Desk:</span>
              <button
                onClick={() => updateAvailabilityStatus('AVAILABLE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  availability.status === 'AVAILABLE'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AVAILABLE
              </button>
              <button
                onClick={() => updateAvailabilityStatus('ON_BREAK')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  availability.status === 'ON_BREAK'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                BREAK
              </button>
              <button
                onClick={() => updateAvailabilityStatus('UNAVAILABLE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  availability.status === 'UNAVAILABLE'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                OFF
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
