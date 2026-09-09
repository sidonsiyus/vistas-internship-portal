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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-[#090d16]/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Minimalist Top-Left Logo */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="p-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <GraduationCap className="w-4 h-4 shrink-0" />
            </div>
            <span className="font-bold text-sm text-white tracking-tight">Internship Portal</span>
          </div>

          {/* Desktop Navigation - Clean Minimalist Pills */}
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
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                      item.isAlertBadge
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
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
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800/80">
              <span className="text-[11px] text-slate-400">Desk:</span>
              <StatusBadge status={availability.status} size="small" />
            </div>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800/80'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Desk</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <StatusBadge status={availability.status} size="small" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800/60 bg-[#090d16] px-4 pt-2 pb-4 space-y-1 shadow-2xl">
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
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                    item.isAlertBadge
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2">
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md"
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
