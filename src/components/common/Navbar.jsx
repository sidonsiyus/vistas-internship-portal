import React, { useState } from 'react';
import { GraduationCap, Menu, X, Shield, Clock, Ticket, UserCheck, Building2, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from './StatusBadge';

export default function Navbar({ activeTab, setActiveTab, onBookClick }) {
  const { availability, trackedToken, unreadCount } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id) => {
    if (id === 'book' && onBookClick) {
      onBookClick();
    } else {
      setActiveTab(id);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: GraduationCap },
    { 
      id: 'updates', 
      label: 'Internship Updates', 
      icon: Building2, 
      badge: unreadCount > 0 ? `${unreadCount} New` : null,
      isAlertBadge: unreadCount > 0
    },
    { id: 'book', label: 'Book Slot', icon: Clock },
    { id: 'track', label: 'Track Token', icon: Ticket, badge: trackedToken },
    { id: 'status', label: 'Desk Status', icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          
          {/* Top-Left Logo & Title */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shadow-sm">
              <GraduationCap className="w-4 h-4 shrink-0" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-900 tracking-tight leading-none">VISTAS Internship Portal</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-normal mt-0.5">Coordinator Desk</span>
            </div>
          </div>

          {/* Desktop Navigation - Clean SaaS Pills */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                      item.isAlertBadge
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Status Indicator & Admin Button */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium">Desk:</span>
              <StatusBadge status={availability.status} size="small" />
            </div>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>Admin Desk</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <StatusBadge status={availability.status} size="small" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleNavClick(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    item.isAlertBadge
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Desk Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
