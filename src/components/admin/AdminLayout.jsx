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
  UserCheck,
  Megaphone,
  Sun,
  Moon,
  FolderGit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminLayout({ activeAdminPage, setActiveAdminPage, children }) {
  const { logoutAdmin, availability, updateAvailabilityStatus, toastNotification, announcements, documents = [], theme, toggleTheme } = useApp();

  const pendingDocsCount = documents.filter(d => d.status === 'Under Review' || d.status === 'Uploaded' || d.status === 'Replacement Required').length;

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-queue', label: 'Live Queue', icon: ListOrdered, badge: 'Live' },
    { id: 'announcements', label: 'Updates & Notices', icon: Megaphone, badge: announcements?.filter(a => a.isActive !== false).length ? `${announcements.filter(a => a.isActive !== false).length}` : null },
    { id: 'appointments', label: 'Appointments', icon: CalendarDays },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'students', label: 'Students Directory', icon: Users },
    { id: 'documents', label: 'Document Vault', icon: FolderGit2, badge: pendingDocsCount > 0 ? `${pendingDocsCount} Review` : null },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Toast Notification Container (Bottom-Right Positioned) */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-xl shadow-lg ring-1 ring-slate-950/5 flex items-center gap-3 max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 live-pulse shrink-0" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug">{toastNotification.message}</span>
        </div>
      )}

      {/* LEFT SIDEBAR (Desktop) */}
      <aside className="w-full md:w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 shadow-sm transition-colors duration-200">
        <div>
          {/* Top-Left Sidebar Branding */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              <GraduationCap className="w-4 h-4 shrink-0" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight leading-none">Coordinator Desk</h2>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Admin Control Panel</span>
            </div>
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
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Profile */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
              IC
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Coordinator Desk</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">VISTAS Hi-Tech</p>
            </div>
          </div>

          <button
            onClick={logoutAdmin}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Desk</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        
        {/* Top Header */}
        <header className="h-15 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors duration-200">
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight capitalize">
              {activeAdminPage.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 animate-in spin-in-90 duration-200" />
              )}
            </button>

            {/* Availability Status Quick Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-1.5">Desk:</span>
              <button
                onClick={() => updateAvailabilityStatus('AVAILABLE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  availability.status === 'AVAILABLE'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                AVAILABLE
              </button>
              <button
                onClick={() => updateAvailabilityStatus('ON_BREAK')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  availability.status === 'ON_BREAK'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                BREAK
              </button>
              <button
                onClick={() => updateAvailabilityStatus('UNAVAILABLE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  availability.status === 'UNAVAILABLE'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
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
