import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './common/Header';
import BottomNav from './common/BottomNav';
import CustomerHomeMap from './customer/CustomerHomeMap';
import ProblemBookingModal from './customer/ProblemBookingModal';
import LiveJobTracker from './customer/LiveJobTracker';
import ProviderDashboard from './provider/ProviderDashboard';
import AdminDashboard from './admin/AdminDashboard';
import ActivityTab from './customer/ActivityTab';
import ProfileTab from './customer/ProfileTab';
import RoleSelectionModal from './common/RoleSelectionModal';
import PwaInstallPrompt from './common/PwaInstallPrompt';

function AppContent() {
  const { 
    userRole, 
    hasChosenRole, 
    selectRole, 
    activeJob, 
    createJobRequest 
  } = useApp();

  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showLiveTracker, setShowLiveTracker] = useState(false);

  // Keyboard accessibility: ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedCategory) setSelectedCategory(null);
        if (showLiveTracker && !activeJob) setShowLiveTracker(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCategory, showLiveTracker, activeJob]);

  // If a booking is submitted, broadcast request and open live tracker
  const handleBookingSubmitted = (bookingData) => {
    createJobRequest(bookingData);
    setSelectedCategory(null);
    setShowLiveTracker(true);
  };

  return (
    <div className="min-h-screen min-h-dvh bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-sans overflow-x-hidden">
      
      {/* Responsive Header (Mobile + Tablet + Desktop) */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Responsive View Container */}
      <main className="flex-1 flex flex-col relative w-full">
        
        {/* 1. ADMIN MODE */}
        {userRole === 'admin' ? (
          <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex-1 pb-safe">
            <AdminDashboard />
          </div>
        ) : userRole === 'provider' ? (
          /* 2. PROVIDER / PARTNER MODE */
          <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 flex-1 pb-safe">
            <ProviderDashboard />
          </div>
        ) : (
          /* 3. CUSTOMER EXPERIENCES (CUSTOMER-FIRST) */
          <>
            {/* TAB 1: HOME (MAP + CATEGORY SIDEBAR/BOTTOM SHEET) */}
            {activeTab === 'home' && (
              <div className="flex-1 w-full flex flex-col relative">
                <CustomerHomeMap
                  onSelectCategory={(cat) => setSelectedCategory(cat)}
                  onSelectProvider={(pro) => {
                    setSelectedCategory({
                      id: pro.category,
                      name_en: pro.category.replace('_', ' '),
                      name_hi: pro.category,
                      color: 'from-emerald-600 to-teal-600',
                      popularProblems: [
                        { id: 'general', label_en: `General ${pro.category} Inspection`, label_hi: 'सामान्य जांच व रिपेयर' }
                      ]
                    });
                  }}
                />
              </div>
            )}

            {/* TAB 2: ACTIVITY & BOOKINGS */}
            {activeTab === 'activity' && (
              <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 flex-1 pb-24 md:pb-12">
                <ActivityTab onOpenActiveJob={() => setShowLiveTracker(true)} />
              </div>
            )}

            {/* TAB 3: PROFILE & TRUST */}
            {activeTab === 'profile' && (
              <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 flex-1 pb-24 md:pb-12">
                <ProfileTab />
              </div>
            )}
          </>
        )}

      </main>

      {/* Customer Mobile Bottom Navigation Bar (Hidden on >= md) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* FAST 3-TAP BOOKING MODAL */}
      {selectedCategory && (
        <ProblemBookingModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          onBookingSubmitted={handleBookingSubmitted}
        />
      )}

      {/* MATCHED SCREEN & LIVE JOB TRACKER MODAL */}
      {(showLiveTracker || (activeJob && userRole === 'customer')) && (
        <LiveJobTracker />
      )}

      {/* ONE-TIME ROLE SELECTION MODAL (Customer vs Partner) */}
      {!hasChosenRole && (
        <RoleSelectionModal
          isOpen={!hasChosenRole}
          onSelect={(role) => selectRole(role)}
        />
      )}

      {/* PWA "Add to Home Screen" Trigger (appears after completed booking) */}
      <PwaInstallPrompt />

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
