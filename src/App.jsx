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
import AnnouncementBanner from './components/student/AnnouncementBanner';
import InternshipUpdatesView from './components/student/InternshipUpdatesView';
import PreBookingModal from './components/student/PreBookingModal';

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
import AnnouncementsManager from './components/admin/AnnouncementsManager';
import GlobalDocumentManagement from './components/admin/GlobalDocumentManagement';

function AppContent() {
  const { adminAuth, toastNotification } = useApp();

  // Top level navigation state: 'home', 'updates', 'book', 'track', 'status', 'admin'
  const [activeTab, setActiveTab] = useState('home');

  // Pre-booking advisory modal state
  const [isPreBookingModalOpen, setIsPreBookingModalOpen] = useState(false);

  // Admin sub-page state: 'overview', 'live-queue', 'announcements', 'appointments', 'availability', 'students', 'reports', 'settings'
  const [activeAdminPage, setActiveAdminPage] = useState('overview');

  const handleBookTrigger = () => {
    try {
      const suppressed = localStorage.getItem('vistas_suppress_prebooking_advisory');
      if (suppressed === 'true') {
        setActiveTab('book');
        return;
      }
    } catch (e) {}
    setIsPreBookingModalOpen(true);
  };

  // Render Admin View
  if (activeTab === 'admin') {
    if (!adminAuth?.isAuthenticated) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onBookClick={handleBookTrigger} />
          <AdminLogin onLoginSuccess={() => setActiveAdminPage('overview')} />
          <Footer setActiveTab={setActiveTab} />
        </div>
      );
    }

    return (
      <AdminLayout activeAdminPage={activeAdminPage} setActiveAdminPage={setActiveAdminPage}>
        {activeAdminPage === 'overview' && <OverviewDashboard setActiveAdminPage={setActiveAdminPage} />}
        {activeAdminPage === 'live-queue' && <LiveQueueManager />}
        {activeAdminPage === 'announcements' && <AnnouncementsManager />}
        {activeAdminPage === 'appointments' && <AppointmentsTable />}
        {activeAdminPage === 'availability' && <AvailabilityConfig />}
        {activeAdminPage === 'students' && <StudentDirectory />}
        {activeAdminPage === 'documents' && <GlobalDocumentManagement />}
        {activeAdminPage === 'reports' && <AnalyticsReports />}
        {activeAdminPage === 'settings' && <SettingsPage />}
      </AdminLayout>
    );
  }

  // Render Student Portal Views
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Toast Notification (Bottom-Right Positioned, Modern SaaS) */}
      {toastNotification && (
        <div className="fixed bottom-5 right-5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-xl shadow-lg ring-1 ring-slate-950/5 flex items-center gap-3 max-w-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 live-pulse shrink-0" />
          <span className="text-xs font-medium leading-snug text-slate-700 dark:text-slate-300">{toastNotification.message}</span>
        </div>
      )}

      {/* Pre-Booking Gatekeeper Advisory Modal */}
      <PreBookingModal
        isOpen={isPreBookingModalOpen}
        onClose={() => setIsPreBookingModalOpen(false)}
        onProceedToBooking={() => {
          setIsPreBookingModalOpen(false);
          setActiveTab('book');
        }}
        onNavigateToUpdates={() => {
          setIsPreBookingModalOpen(false);
          setActiveTab('updates');
        }}
      />

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onBookClick={handleBookTrigger} />

      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <AnnouncementBanner setActiveTab={setActiveTab} />
            <HeroSection setActiveTab={setActiveTab} onBookClick={handleBookTrigger} />
            <QuickStats />
            <HowItWorks setActiveTab={setActiveTab} />
            <div className="py-8">
              <CoordinatorStatusView setActiveTab={setActiveTab} />
            </div>
          </>
        )}

        {activeTab === 'updates' && <InternshipUpdatesView setActiveTab={setActiveTab} />}

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
