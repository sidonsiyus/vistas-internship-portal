import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Student views
import HeroSection from './components/student/HeroSection';
import QuickStats from './components/student/QuickStats';
import HowItWorks from './components/student/HowItWorks';
import BookingWizard from './components/student/BookingWizard';
import LiveTokenTracker from './components/student/LiveTokenTracker';
import CoordinatorStatusView from './components/student/CoordinatorStatusView';

// Admin views
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import OverviewDashboard from './components/admin/OverviewDashboard';
import LiveQueueManager from './components/admin/LiveQueueManager';
import AppointmentsTable from './components/admin/AppointmentsTable';
import AvailabilityConfig from './components/admin/AvailabilityConfig';
import StudentDirectory from './components/admin/StudentDirectory';
import AnalyticsReports from './components/admin/AnalyticsReports';
import SettingsPage from './components/admin/SettingsPage';

function AppContent() {
  const { adminAuth, toastNotification } = useApp();

  // Top level navigation state: 'home', 'book', 'track', 'status', 'admin'
  const [activeTab, setActiveTab] = useState('home');

  // Admin sub-page state: 'overview', 'live-queue', 'appointments', 'availability', 'students', 'reports', 'settings'
  const [activeAdminPage, setActiveAdminPage] = useState('overview');

  // Render Admin View
  if (activeTab === 'admin') {
    if (!adminAuth?.isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
          <AdminLogin onLoginSuccess={() => setActiveAdminPage('overview')} />
          <Footer setActiveTab={setActiveTab} />
        </div>
      );
    }

    return (
      <AdminLayout activeAdminPage={activeAdminPage} setActiveAdminPage={setActiveAdminPage}>
        {activeAdminPage === 'overview' && <OverviewDashboard setActiveAdminPage={setActiveAdminPage} />}
        {activeAdminPage === 'live-queue' && <LiveQueueManager />}
        {activeAdminPage === 'appointments' && <AppointmentsTable />}
        {activeAdminPage === 'availability' && <AvailabilityConfig />}
        {activeAdminPage === 'students' && <StudentDirectory />}
        {activeAdminPage === 'reports' && <AnalyticsReports />}
        {activeAdminPage === 'settings' && <SettingsPage />}
      </AdminLayout>
    );
  }

  // Render Student Portal Views
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans">
      
      {/* Toast Notification (Bottom-Right Positioned, Minimalist) */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0e1422] border border-blue-500/40 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 max-w-sm">
          <span className="h-2 w-2 rounded-full bg-blue-400 live-pulse shrink-0" />
          <span className="text-xs font-semibold leading-snug">{toastNotification.message}</span>
        </div>
      )}

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <HeroSection setActiveTab={setActiveTab} />
            <QuickStats />
            <HowItWorks setActiveTab={setActiveTab} />
            <div className="py-8">
              <CoordinatorStatusView setActiveTab={setActiveTab} />
            </div>
          </>
        )}

        {activeTab === 'book' && <BookingWizard setActiveTab={setActiveTab} />}

        {activeTab === 'track' && <LiveTokenTracker setActiveTab={setActiveTab} />}

        {activeTab === 'status' && <CoordinatorStatusView setActiveTab={setActiveTab} />}
      </main>

      <Footer setActiveTab={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
