import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/helpers';
import { realtimeSync } from '../services/realtimeSync';
import TrustBadge from '../common/TrustBadge';
import ProviderEarnings from './ProviderEarnings';
import ProviderOnboardingModal from './ProviderOnboardingModal';
import MapView from '../common/MapView';
import { 
  Power, 
  Clock, 
  MapPin, 
  Navigation, 
  Star, 
  Repeat, 
  CheckCircle2, 
  KeyRound, 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck,
  Phone,
  Camera,
  Play,
  RotateCcw,
  Sparkles,
  UserCheck,
  UserPlus
} from 'lucide-react';

export default function ProviderDashboard() {
  const { 
    currentProvider, 
    setCurrentProviderId,
    providers,
    isProviderOnline, 
    setIsProviderOnline, 
    activeJob, 
    setProviderOnTheWay,
    setProviderArrived,
    verifyJobOtp,
    submitFinalQuote,
    completeJob, 
    language, 
    t,
    showToast,
    updateProviderLocation
  } = useApp();

  // Dashboard Tab: 'radar' | 'earnings'
  const [activeTab, setActiveTab] = useState('radar');

  // Provider Onboarding Modal state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // 30s Countdown timer for incoming request
  const [timerSeconds, setTimerSeconds] = useState(30);

  // Doorstep OTP Entry
  const [otpInput, setOtpInput] = useState('');

  // Final Quote Form
  const [laborCharge, setLaborCharge] = useState(
    activeJob?.estimate ? activeJob.estimate.min_price : 280
  );
  const [partsCharge, setPartsCharge] = useState(0);
  const [quoteNotes, setQuoteNotes] = useState('Standard labor and minor seal replacement');

  // Simulated GPS Transit when "On The Way"
  const [simulatedTransitActive, setSimulatedTransitActive] = useState(false);
  const [liveDistanceKm, setLiveDistanceKm] = useState(1.4);
  const [liveEtaMins, setLiveEtaMins] = useState(8);

  // 30s timer countdown
  useEffect(() => {
    let interval = null;
    if (activeJob && activeJob.status === 'requested') {
      setTimerSeconds(30);
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeJob]);

  // GPS Transit Simulation
  useEffect(() => {
    let transitTimer = null;
    if (activeJob && (activeJob.status === 'on_the_way' || activeJob.status === 'accepted') && simulatedTransitActive) {
      transitTimer = setInterval(() => {
        setLiveDistanceKm((prevDist) => {
          if (prevDist <= 0.2) {
            clearInterval(transitTimer);
            setSimulatedTransitActive(false);
            setProviderArrived();
            showToast('GPS: Provider has arrived at customer doorstep!', 'success');
            return 0.1;
          }
          const nextDist = Math.max(0.1, Number((prevDist - 0.2).toFixed(1)));
          setLiveEtaMins(Math.max(1, Math.round(nextDist * 5)));
          return nextDist;
        });
      }, 2000);
    }

    return () => clearInterval(transitTimer);
  }, [activeJob?.status, simulatedTransitActive]);

  // Handle OTP verification
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    verifyJobOtp(otpInput);
  };

  // Handle Quote submission
  const handleSendQuote = (e) => {
    e.preventDefault();
    submitFinalQuote({
      labor: Number(laborCharge),
      materials: Number(partsCharge),
      breakdown: quoteNotes
    });
  };

  // Start Navigation and start GPS simulation
  const handleStartNavigation = () => {
    setProviderOnTheWay();
    setSimulatedTransitActive(true);
    showToast('GPS Navigation Started: Sharing live location with customer', 'info');
  };

  // Realtime Provider Location Broadcasting (every 12s while Online)
  useEffect(() => {
    if (!isProviderOnline) return;

    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = {
              providerId: currentProvider.id,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              distanceKm: liveDistanceKm,
              etaMinutes: liveEtaMins
            };
            if (updateProviderLocation) updateProviderLocation(coords);
            realtimeSync.broadcast('PROVIDER_LOCATION_UPDATE', coords);
          },
          () => {},
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [isProviderOnline, currentProvider.id, liveDistanceKm, liveEtaMins, updateProviderLocation]);

  const handleToggleOnline = () => {
    const nextStatus = !isProviderOnline;
    setIsProviderOnline(nextStatus);
    realtimeSync.broadcast('PROVIDER_STATUS_CHANGE', {
      providerId: currentProvider.id,
      isOnline: nextStatus
    });
    showToast(nextStatus ? 'You are now ONLINE and accepting nearby requests!' : 'You are now OFFLINE', 'info');
  };

  const isPendingVerification = currentProvider?.verificationStatus === 'pending_verification';

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      
      {/* 1. TOP PROVIDER PROFILE & ONLINE TOGGLE */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={currentProvider.avatar}
              alt={currentProvider.name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base text-slate-900">{currentProvider.name}</h3>
                <TrustBadge provider={currentProvider} size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-medium capitalize">
                {currentProvider.category.replace('_', ' ')} Specialist • {currentProvider.locality}
              </p>
            </div>
          </div>

          {/* Large Go Online / Offline Toggle (min 48px touch target) */}
          <button
            onClick={handleToggleOnline}
            disabled={isPendingVerification}
            className={`min-h-[52px] h-[52px] px-6 rounded-2xl font-black text-xs transition active:scale-95 shadow-md flex items-center justify-center gap-2 touch-manipulation ${
              isPendingVerification
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isProviderOnline
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/25 ring-4 ring-emerald-100'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isProviderOnline ? 'ONLINE • ACCEPTING JOBS' : 'OFFLINE • TAP TO GO ONLINE'}</span>
          </button>
        </div>

        {/* PENDING VERIFICATION NOTICE BANNER */}
        {isPendingVerification && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center justify-between font-extrabold">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Verification Status: Under Audit</span>
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                Pending ID & Calls
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Our compliance team is auditing your uploaded Govt ID and contacting your 3 past customer references.
            </p>
            
            {/* Quick Demo Approval Button */}
            <div className="pt-2 flex items-center justify-between border-t border-amber-200/80">
              <span className="text-[10px] text-amber-700 font-semibold">Demo Evaluation Tool:</span>
              <button
                onClick={() => {
                  currentProvider.verificationStatus = 'verified';
                  currentProvider.isVerified = true;
                  setIsProviderOnline(true);
                  showToast('Provider verified! ID & 3 customer references confirmed.', 'success');
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Admin Quick-Approve ✓
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher: Active Jobs & Radar vs Earnings */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${
              activeTab === 'radar'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Jobs & Dispatch Radar
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition ${
              activeTab === 'earnings'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Earnings & Reputation
          </button>
        </div>
      </div>

      {/* 2. TAB: EARNINGS & REPUTATION */}
      {activeTab === 'earnings' && (
        <ProviderEarnings provider={currentProvider} />
      )}

      {/* 3. TAB: RADAR & INCOMING MATCHING (Desktop 2-column layout) */}
      {activeTab === 'radar' && (
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start space-y-6 lg:space-y-0">
          
          {/* Left Column (lg:col-span-6): Job Requests, Alerts, OTP, and Forms */}
          <div className="lg:col-span-6 space-y-5">
            
            {/* OFFLINE CALLOUT */}
            {!isProviderOnline && !isPendingVerification && (
              <div className="bg-slate-100 border border-slate-300/80 rounded-3xl p-8 text-center space-y-3">
                <Power className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="font-extrabold text-base text-slate-800">You Are Currently Offline</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Toggle the switch above to go online and receive nearby service requests within 5 km of {currentProvider.locality}.
                </p>
                <button
                  onClick={() => setIsProviderOnline(true)}
                  className="mt-2 h-[52px] px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-2xl shadow-md transition active:scale-95 touch-manipulation"
                >
                  Go Online Now
                </button>
              </div>
            )}

            {/* INCOMING REQUEST WITH 30s COUNTDOWN */}
            {activeJob && activeJob.status === 'requested' && isProviderOnline && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-400 rounded-3xl p-5 shadow-xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                    <span className="font-black text-xs uppercase tracking-wider text-amber-900">
                      {t('incomingRequest')}
                    </span>
                  </div>

                  {/* Circular Countdown Badge */}
                  <div className="flex items-center gap-1.5 bg-amber-500 text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timerSeconds}s</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-amber-200 space-y-3 mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">{activeJob.problemTitle}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{activeJob.problemDescription}</p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {activeJob.bookingType === 'emergency' ? '⚡ Instant Call' : 'Scheduled'}
                    </span>
                  </div>

                  {/* Problem photo if attached */}
                  {activeJob.photoUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <img
                        src={activeJob.photoUrl}
                        alt="Customer issue"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Customer Attached Photo</span>
                        <span className="text-[10px] text-slate-500">Tap to inspect details</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="flex items-center gap-1 text-slate-600 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{activeJob.locality} (1.2 km away)</span>
                    </span>
                    <span className="font-black text-emerald-800">
                      Est: {formatINR(activeJob.estimate?.min_price)} - {formatINR(activeJob.estimate?.max_price)}
                    </span>
                  </div>
                </div>

                {/* Accept & Decline Buttons (Minimum 52px touch target) */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      showToast('Job request declined.', 'info');
                    }}
                    className="h-[52px] min-h-[52px] px-4 rounded-2xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-white active:scale-95 transition touch-manipulation"
                  >
                    {t('declineJob')}
                  </button>
                  <button
                    onClick={handleStartNavigation}
                    className="h-[52px] min-h-[52px] px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-lg shadow-emerald-700/30 active:scale-95 transition flex items-center justify-center gap-1.5 touch-manipulation"
                  >
                    <span>{t('acceptJob')}</span>
                    <Play className="w-4 h-4 fill-white" />
                  </button>
                </div>
              </div>
            )}

            {/* ACTIVE ASSIGNED JOB DETAILS */}
            {activeJob && activeJob.status !== 'requested' && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                
                {/* Customer Contact Card */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                      Active Assignment • Stage: {activeJob.status.replace(/_/g, ' ')}
                    </span>
                    <h4 className="font-extrabold text-base text-slate-900">{activeJob.customerName}</h4>
                    <p className="text-xs text-slate-500">{activeJob.locality} • Flat 302, Palm Grove</p>
                  </div>
                  <a
                    href={`tel:${activeJob.customerPhone}`}
                    className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center justify-center font-bold shadow-xs active:scale-95 transition touch-manipulation"
                    title="Call Customer"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>

                {/* ON THE WAY: ARRIVAL ACTION */}
                {(activeJob.status === 'accepted' || activeJob.status === 'on_the_way') && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-emerald-700 animate-pulse" />
                        <span>Live GPS Sharing Active</span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                        ETA ~{liveEtaMins} mins ({liveDistanceKm} km)
                      </span>
                    </div>

                    <button
                      onClick={setProviderArrived}
                      className="w-full h-[52px] min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition flex items-center justify-center gap-2 touch-manipulation"
                    >
                      <span>I Have Arrived at Doorstep</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* DOORSTEP OTP VERIFICATION */}
                {activeJob.status === 'arrived' && (
                  <form onSubmit={handleVerifyOtp} className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center space-y-3">
                    <KeyRound className="w-8 h-8 text-emerald-700 mx-auto" />
                    <h4 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wide">
                      {t('enterOtpPrompt')}
                    </h4>
                    <p className="text-[11px] text-emerald-800 max-w-xs mx-auto">
                      Ask customer for the 4-digit verification OTP on their app screen to confirm physical presence:
                    </p>
                    
                    <div className="flex justify-center">
                      <input
                        type="text"
                        maxLength={4}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="e.g. 1234"
                        className="w-48 text-center text-3xl font-mono font-black tracking-widest py-2.5 rounded-2xl border-2 border-emerald-600 focus:outline-none bg-white text-slate-900 shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={otpInput.length < 4}
                      className="w-full h-[52px] min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs disabled:opacity-50 active:scale-95 transition touch-manipulation"
                    >
                      Verify Handshake & Unlock Quote Form
                    </button>
                  </form>
                )}

                {/* PROVIDER QUOTE SUBMISSION */}
                {activeJob.status === 'quote_submitted' && !activeJob.quoteApproved && (
                  <form onSubmit={handleSendQuote} className="space-y-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <h4 className="font-extrabold text-xs text-slate-900 uppercase">
                        {t('submitFinalQuoteTitle')}
                      </h4>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        {t('laborCharge')}
                      </label>
                      <input
                        type="number"
                        value={laborCharge}
                        onChange={(e) => setLaborCharge(e.target.value)}
                        className="w-full text-base md:text-sm p-3 rounded-xl border border-slate-200 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        {t('materialsCharge')}
                      </label>
                      <input
                        type="number"
                        value={partsCharge}
                        onChange={(e) => setPartsCharge(e.target.value)}
                        className="w-full text-base md:text-sm p-3 rounded-xl border border-slate-200 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Inspection Notes / Spare Parts
                      </label>
                      <input
                        type="text"
                        value={quoteNotes}
                        onChange={(e) => setQuoteNotes(e.target.value)}
                        className="w-full text-base md:text-sm p-3 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs font-black">
                      <span>{t('totalQuote')}</span>
                      <span className="text-emerald-700 text-base font-extrabold">
                        {formatINR(Number(laborCharge) + Number(partsCharge))}
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-[52px] min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/25 active:scale-95 transition touch-manipulation"
                    >
                      {t('sendQuoteToCustomer')}
                    </button>
                  </form>
                )}

                {/* WORK IN PROGRESS */}
                {activeJob.status === 'in_progress' && (
                  <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="font-extrabold text-sm text-emerald-950 uppercase">
                      Work In Progress (Approved: {formatINR(activeJob.finalQuote?.total)})
                    </h4>
                    <p className="text-xs text-slate-600">
                      Customer has approved your quote in-app. Perform the service according to quality standards.
                    </p>
                    <button
                      onClick={() => completeJob('UPI')}
                      className="w-full h-[52px] min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/25 active:scale-95 transition touch-manipulation"
                    >
                      Mark Job Completed
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* ONBOARDING REGISTRATION BANNER */}
            <div className="bg-slate-50 rounded-3xl p-4 border border-slate-200/90 flex items-center justify-between">
              <div>
                <h5 className="font-extrabold text-xs text-slate-900">Partner Onboarding Profile</h5>
                <p className="text-[11px] text-slate-500">Aadhaar verified • 3 references audited</p>
              </div>
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Audit Details</span>
              </button>
            </div>

          </div>

          {/* Right Column (lg:col-span-6): Live Map & Navigation Radar on Desktop */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Live Service Dispatch Map</h4>
                  <p className="text-xs text-slate-500">Realtime customer doorstep & transit GPS tracker</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {isProviderOnline ? 'GPS Active' : 'Offline'}
                </span>
              </div>

              <MapView
                providerLat={currentProvider.lat}
                providerLng={currentProvider.lng}
                providerName={currentProvider.name}
                distanceKm={liveDistanceKm}
                etaMinutes={liveEtaMins}
                height="380px"
              />

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Coverage Zone: <strong>{currentProvider.locality} (5 km)</strong></span>
                <span>Active Specialists: <strong>{providers.length}</strong></span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Onboarding Modal */}
      <ProviderOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(newProfile) => {
          setIsOnboardingOpen(false);
          setCurrentProviderId(newProfile.id);
        }}
      />

    </div>
  );
}
