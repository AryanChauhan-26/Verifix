import React, { createContext, useContext, useState, useEffect } from 'react';
import { SEED_PROVIDERS } from '../data/seedProviders';
import { TRANSLATIONS } from '../data/translations';
import { generateOtp } from '../utils/helpers';
import { recordCompletedJobPrice } from '../services/priceEstimator';
import { realtimeSync } from '../services/realtimeSync';
import confetti from 'canvas-confetti';

const AppContext = createContext();

const LOCAL_STORAGE_ACTIVE_JOB = 'verifix_active_job_v1';
const LOCAL_STORAGE_PROVIDERS = 'verifix_providers_v1';
const LOCAL_STORAGE_USER_ROLE = 'verifix_user_role';
const LOCAL_STORAGE_ROLE_CHOSEN = 'verifix_user_role_chosen';
const LOCAL_STORAGE_CANCELLATIONS = 'verifix_cancellations_v1';

export function AppProvider({ children }) {
  // Role: 'customer' (default) | 'provider' | 'admin'
  const [userRole, setUserRoleState] = useState(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_USER_ROLE) || 'customer';
    } catch {
      return 'customer';
    }
  });

  // Track if user has answered the initial "I need a service" vs "I provide services" prompt
  const [hasChosenRole, setHasChosenRole] = useState(() => {
    try {
      return Boolean(localStorage.getItem(LOCAL_STORAGE_ROLE_CHOSEN));
    } catch {
      return true;
    }
  });

  const selectRole = (role) => {
    setUserRoleState(role);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_ROLE, role);
      localStorage.setItem(LOCAL_STORAGE_ROLE_CHOSEN, 'true');
    } catch (e) {
      console.warn('Could not save user role', e);
    }
    setHasChosenRole(true);
  };

  const setUserRole = (role) => {
    setUserRoleState(role);
    try {
      localStorage.setItem(LOCAL_STORAGE_USER_ROLE, role);
    } catch (e) {
      console.warn('Could not save user role', e);
    }
  };
  
  // Language: 'en' | 'hi'
  const [language, setLanguage] = useState('en');
  
  // Locality selection (Indiranagar default)
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [selectedLocality, setSelectedLocality] = useState('Indiranagar');

  // Customer Profile
  const [customerUser] = useState({
    id: 'cust-101',
    name: 'Rohan Verma',
    phone: '+91 98200 44551',
    locality: 'Indiranagar, Bengaluru'
  });

  // Providers List (persisted in local state)
  const [providers, setProviders] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROVIDERS);
      return saved ? JSON.parse(saved) : SEED_PROVIDERS;
    } catch {
      return SEED_PROVIDERS;
    }
  });

  // Active Provider (when in provider mode)
  const [currentProviderId, setCurrentProviderId] = useState('prov-001');
  const currentProvider = providers.find((p) => p.id === currentProviderId) || providers[0];

  // Provider Online Toggle
  const [isProviderOnline, setIsProviderOnline] = useState(true);

  // Active Job State
  const [activeJob, setActiveJob] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE_JOB);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Cancellations audit log
  const [cancellations, setCancellations] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CANCELLATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Live Provider Location coordinates (updated while On The Way)
  const [providerLocation, setProviderLocation] = useState({
    lat: currentProvider?.lat || 12.9784,
    lng: currentProvider?.lng || 77.6408,
    distanceKm: 1.2,
    etaMinutes: 6
  });

  // Toast / System Notification banner
  const [toast, setToast] = useState(null);

  // Past Bookings / Job History
  const [jobHistory, setJobHistory] = useState([
    {
      id: 'job-past-1',
      category: 'electrician',
      categoryName: 'Electrician',
      providerName: 'Amit Sharma',
      providerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      status: 'completed',
      date: '3 days ago',
      paidAmount: 320,
      rating: 5,
      otp: '4891',
      review: 'Quick service for MCB tripping. Very polite.',
      repeatCustomerCount: 62
    }
  ]);

  // Disputes raised
  const [disputes, setDisputes] = useState([]);

  // Sync active job to localStorage
  useEffect(() => {
    if (activeJob) {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_JOB, JSON.stringify(activeJob));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_JOB);
    }
  }, [activeJob]);

  // Sync providers to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PROVIDERS, JSON.stringify(providers));
  }, [providers]);

  // Sync cancellations to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_CANCELLATIONS, JSON.stringify(cancellations));
  }, [cancellations]);

  // -------------------------------------------------------------
  // REALTIME SYNCHRONIZATION LISTENERS (Supabase Realtime + Bus)
  // -------------------------------------------------------------
  useEffect(() => {
    // 1. Listen for status changes
    const unsubStatus = realtimeSync.subscribe('JOB_STATUS_CHANGE', ({ status, updatedJob }) => {
      setActiveJob((prev) => {
        if (!prev) return updatedJob || null;
        return { ...prev, ...updatedJob, status };
      });
    });

    // 2. Listen for provider location updates
    const unsubLocation = realtimeSync.subscribe('PROVIDER_LOCATION_UPDATE', (coords) => {
      if (coords && coords.providerId) {
        setProviders((prev) =>
          prev.map((p) =>
            p.id === coords.providerId
              ? { ...p, lat: coords.lat, lng: coords.lng, lastSeenAt: new Date().toISOString() }
              : p
          )
        );
      }
      setProviderLocation(coords);
    });

    // 3. Listen for provider online/offline status changes
    const unsubProviderStatus = realtimeSync.subscribe('PROVIDER_STATUS_CHANGE', ({ providerId, isOnline }) => {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId
            ? { ...p, isOnline, lastSeenAt: new Date().toISOString() }
            : p
        )
      );
    });

    // 4. Listen for final quote submissions
    const unsubQuote = realtimeSync.subscribe('QUOTE_SUBMITTED', (quoteObj) => {
      setActiveJob((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'quote_submitted',
          finalQuote: quoteObj
        };
      });
    });

    // 5. Listen for customer quote approval/rejection
    const unsubQuoteResponse = realtimeSync.subscribe('QUOTE_RESPONDED', ({ approved }) => {
      setActiveJob((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: approved ? 'in_progress' : 'cancelled',
          quoteApproved: approved
        };
      });
    });

    // 6. Listen for provider cancel & auto-rematch
    const unsubProviderCancel = realtimeSync.subscribe('PROVIDER_CANCELLED', ({ reason }) => {
      handleProviderCancellation(reason);
    });

    return () => {
      unsubStatus();
      unsubLocation();
      unsubProviderStatus();
      unsubQuote();
      unsubQuoteResponse();
      unsubProviderCancel();
    };
  }, []);

  // Notification helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Helper text translator
  const t = (key) => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  };

  // -------------------------------------------------------------
  // MATCHING LOGIC
  // When customer requests, find nearest online verified providers
  // of that category within search radius (5 km default).
  // -------------------------------------------------------------
  const createJobRequest = ({
    category,
    problemTitle,
    problemDescription,
    photoUrl = null,
    voiceNoteDuration = null,
    bookingType = 'emergency',
    scheduledTime = null,
    estimate
  }) => {
    const otp = generateOtp();
    
    // Find all online verified providers within 5 km matching this category
    const qualifyingProviders = providers.filter(
      (p) => (p.category === category || p.categories?.includes(category)) && 
             p.isOnline && 
             p.distanceKm <= 5.0
    );

    // If none online, fall back to default pro for seamless demo
    const assignedProvider = qualifyingProviders.length > 0 
      ? qualifyingProviders[0] 
      : providers.find((p) => p.category === category) || providers[0];

    const newJob = {
      id: 'job-' + Date.now().toString().slice(-6),
      customerId: customerUser.id,
      customerName: customerUser.name,
      customerPhone: customerUser.phone,
      locality: selectedLocality,
      category,
      problemTitle,
      problemDescription,
      photoUrl,
      voiceNoteDuration,
      bookingType,
      scheduledTime,
      estimate,
      otp, // 4-digit verification code
      status: 'requested', // requested -> accepted -> on_the_way -> arrived -> quote_submitted -> in_progress -> completed
      provider: assignedProvider,
      candidateProviderIds: qualifyingProviders.map((p) => p.id),
      excludedProviderIds: [],
      searchRadiusKm: 5.0,
      finalQuote: null,
      payment: null,
      createdAt: new Date().toISOString()
    };

    setActiveJob(newJob);

    // Broadcast across realtime sync
    realtimeSync.broadcast('JOB_BROADCAST', { job: newJob });

    showToast(
      language === 'hi'
        ? '5 किमी के दायरे में वेरिफाइड कारीगरों को रिक्वेस्ट भेजी गई!'
        : `Looking for nearest verified ${category} near you...`,
      'info'
    );

    // Auto-accept simulation after 3.2s
    setTimeout(() => {
      setActiveJob((prev) => {
        if (!prev || prev.status !== 'requested') return prev;
        const updated = { ...prev, status: 'accepted' };
        realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'accepted', updatedJob: updated });
        return updated;
      });
    }, 3200);

    return newJob;
  };

  // -------------------------------------------------------------
  // CANCEL AND FIND ANOTHER PROVIDER (Section 5 Requirement)
  // -------------------------------------------------------------
  
  // Option A: "Find another provider" (exclude current and immediately re-match)
  const findAnotherProvider = ({ reason = 'Provider is taking too long' }) => {
    if (!activeJob) return;

    const currentProId = activeJob.provider?.id;
    const currentProName = activeJob.provider?.name || 'Provider';
    const updatedExcluded = [...(activeJob.excludedProviderIds || [])];
    if (currentProId && !updatedExcluded.includes(currentProId)) {
      updatedExcluded.push(currentProId);
    }

    // 1. Record cancellation audit log
    const cancelRecord = {
      id: 'canc-' + Date.now(),
      jobId: activeJob.id,
      providerId: currentProId,
      providerName: currentProName,
      cancelledBy: 'customer',
      statusAtCancel: activeJob.status,
      reason,
      timestamp: new Date().toISOString()
    };
    setCancellations((prev) => [cancelRecord, ...prev]);

    // 2. Find next qualifying provider who is NOT excluded
    const radius = activeJob.searchRadiusKm || 5.0;
    const nextCandidates = providers.filter(
      (p) => (p.category === activeJob.category || p.categories?.includes(activeJob.category)) &&
             p.isOnline &&
             !updatedExcluded.includes(p.id) &&
             p.distanceKm <= radius
    );

    if (nextCandidates.length === 0) {
      // No other providers available right now
      const noProState = {
        ...activeJob,
        status: 'no_providers_available',
        excludedProviderIds: updatedExcluded
      };
      setActiveJob(noProState);
      realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'no_providers_available', updatedJob: noProState });
      showToast('No other providers available right now within search radius.', 'warning');
      return;
    }

    const nextProvider = nextCandidates[0];

    // 3. Re-assign to next provider and transition to 'requested'
    const rematchJob = {
      ...activeJob,
      status: 'requested',
      provider: nextProvider,
      excludedProviderIds: updatedExcluded
    };

    setActiveJob(rematchJob);
    realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'requested', updatedJob: rematchJob });
    showToast(
      language === 'hi'
        ? `नया कारीगर ढूंढा जा रहा है... (${reason})`
        : `Looking for another provider... (${reason})`,
      'info'
    );

    // Auto-accept by new provider after 2.8s
    setTimeout(() => {
      setActiveJob((prev) => {
        if (!prev || prev.status !== 'requested') return prev;
        const accepted = { ...prev, status: 'accepted' };
        realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'accepted', updatedJob: accepted });
        showToast(`${nextProvider.name} has accepted your request!`, 'success');
        return accepted;
      });
    }, 2800);
  };

  // Option B: "Cancel request" (completely close job and return home)
  const cancelJobRequest = ({ reason = 'Changed my mind' }) => {
    if (!activeJob) return;

    const cancelRecord = {
      id: 'canc-' + Date.now(),
      jobId: activeJob.id,
      providerId: activeJob.provider?.id,
      providerName: activeJob.provider?.name,
      cancelledBy: 'customer',
      statusAtCancel: activeJob.status,
      reason,
      timestamp: new Date().toISOString()
    };
    setCancellations((prev) => [cancelRecord, ...prev]);

    setActiveJob(null);
    realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: null, updatedJob: null });
    showToast(
      language === 'hi' ? 'रिक्वेस्ट रद्द कर दी गई।' : 'Request cancelled. Returning home.',
      'info'
    );
  };

  // Provider Cancel: automatically re-matches customer without customer action
  const handleProviderCancellation = (reason = 'Emergency delay') => {
    if (!activeJob) return;

    const currentProId = activeJob.provider?.id;
    const currentProName = activeJob.provider?.name || 'Provider';
    const updatedExcluded = [...(activeJob.excludedProviderIds || [])];
    if (currentProId && !updatedExcluded.includes(currentProId)) {
      updatedExcluded.push(currentProId);
    }

    // Record provider cancellation
    const cancelRecord = {
      id: 'canc-' + Date.now(),
      jobId: activeJob.id,
      providerId: currentProId,
      providerName: currentProName,
      cancelledBy: 'provider',
      statusAtCancel: activeJob.status,
      reason,
      timestamp: new Date().toISOString()
    };
    setCancellations((prev) => [cancelRecord, ...prev]);

    showToast(
      language === 'hi'
        ? `${currentProName} किसी कारणवश नहीं आ सकते। आपके लिए दूसरा कारीगर ढूंढा जा रहा है...`
        : `${currentProName} can't make it. Finding you another provider...`,
      'warning'
    );

    // Re-match logic
    const nextCandidates = providers.filter(
      (p) => (p.category === activeJob.category || p.categories?.includes(activeJob.category)) &&
             p.isOnline &&
             !updatedExcluded.includes(p.id)
    );

    if (nextCandidates.length === 0) {
      const noProState = {
        ...activeJob,
        status: 'no_providers_available',
        excludedProviderIds: updatedExcluded
      };
      setActiveJob(noProState);
      return;
    }

    const nextProvider = nextCandidates[0];
    const rematchJob = {
      ...activeJob,
      status: 'requested',
      provider: nextProvider,
      excludedProviderIds: updatedExcluded
    };

    setActiveJob(rematchJob);

    setTimeout(() => {
      setActiveJob((prev) => {
        if (!prev || prev.status !== 'requested') return prev;
        const accepted = { ...prev, status: 'accepted' };
        showToast(`${nextProvider.name} is on the way!`, 'success');
        return accepted;
      });
    }, 2500);
  };

  // "Widen search area" action when no providers available
  const widenSearchArea = () => {
    if (!activeJob) return;
    const widerRadius = 15.0; // expand from 5km to 15km
    showToast('Widening search radius to 15 km...', 'info');

    // Find any pro within 15 km
    const available = providers.find((p) => p.category === activeJob.category) || providers[0];
    const updated = {
      ...activeJob,
      status: 'requested',
      searchRadiusKm: widerRadius,
      provider: available,
      excludedProviderIds: []
    };
    setActiveJob(updated);

    setTimeout(() => {
      setActiveJob((prev) => {
        if (!prev || prev.status !== 'requested') return prev;
        const accepted = { ...prev, status: 'accepted' };
        showToast(`${available.name} accepted your request from ${available.locality}!`, 'success');
        return accepted;
      });
    }, 2800);
  };

  // "Try again" action when no providers available
  const tryAgainMatching = () => {
    if (!activeJob) return;
    showToast('Re-broadcasting request to all online verified providers...', 'info');
    const available = providers.find((p) => p.category === activeJob.category) || providers[0];
    const updated = {
      ...activeJob,
      status: 'requested',
      provider: available,
      excludedProviderIds: []
    };
    setActiveJob(updated);

    setTimeout(() => {
      setActiveJob((prev) => {
        if (!prev || prev.status !== 'requested') return prev;
        return { ...prev, status: 'accepted' };
      });
    }, 3000);
  };

  // 2. Provider moves to "On the way"
  const setProviderOnTheWay = () => {
    if (!activeJob) return;
    const updated = { ...activeJob, status: 'on_the_way' };
    setActiveJob(updated);
    realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'on_the_way', updatedJob: updated });
    showToast(
      language === 'hi'
        ? 'कारीगर आपके पते के लिए निकल चुका है!'
        : 'Provider is on the way! Live GPS location shared.',
      'info'
    );
  };

  // Live Location updater
  const updateProviderLocation = ({ lat, lng, distanceKm, etaMinutes }) => {
    const coords = { lat, lng, distanceKm, etaMinutes };
    setProviderLocation(coords);
    realtimeSync.broadcast('PROVIDER_LOCATION_UPDATE', coords);
  };

  // 3. Provider arrives at customer doorstep
  const setProviderArrived = () => {
    if (!activeJob) return;
    const updated = { ...activeJob, status: 'arrived' };
    setActiveJob(updated);
    realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'arrived', updatedJob: updated });
    showToast(
      language === 'hi'
        ? `कारीगर पहुंच गया है! काम शुरू कराने के लिए OTP ${activeJob.otp} बताएं।`
        : `Provider has arrived! Share OTP ${activeJob.otp} to verify arrival.`,
      'warning'
    );
  };

  // 4. Verify 4-digit OTP to start the job
  const verifyJobOtp = (inputOtp) => {
    if (!activeJob) return false;
    if (inputOtp.trim() === activeJob.otp) {
      const updated = { ...activeJob, status: 'quote_submitted', otpVerified: true };
      setActiveJob(updated);
      realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'quote_submitted', updatedJob: updated });
      showToast(
        language === 'hi'
          ? 'OTP वेरिफाइड! अब निरीक्षण कर फाइनल कोटेशन दें।'
          : 'OTP verified successfully! Physical arrival confirmed.',
        'success'
      );
      return true;
    }
    showToast(
      language === 'hi' ? 'गलत OTP कोड! कृपया दोबारा जांचें।' : 'Invalid OTP! Please check customer screen.',
      'error'
    );
    return false;
  };

  // 5. Provider submits final quote
  const submitFinalQuote = ({ labor, materials = 0, breakdown = '' }) => {
    if (!activeJob) return;
    const total = Number(labor) + Number(materials);
    const quoteObj = {
      labor: Number(labor),
      materials: Number(materials),
      total,
      breakdown,
      submittedAt: new Date().toISOString()
    };
    const updated = {
      ...activeJob,
      finalQuote: quoteObj,
      status: 'quote_submitted'
    };
    setActiveJob(updated);
    realtimeSync.broadcast('QUOTE_SUBMITTED', quoteObj);
    showToast(
      language === 'hi'
        ? `फाइनल कोटेशन ₹${total} ग्राहक को भेजा गया!`
        : `Final quote of ₹${total} sent to customer for in-app approval!`,
      'info'
    );
  };

  // 6. Customer Approves or Rejects Final Quote
  const respondToFinalQuote = (approved) => {
    if (!activeJob) return;
    if (approved) {
      const updated = {
        ...activeJob,
        status: 'in_progress',
        quoteApproved: true
      };
      setActiveJob(updated);
      realtimeSync.broadcast('QUOTE_RESPONDED', { approved: true });
      showToast(
        language === 'hi'
          ? 'कोटेशन स्वीकृत! कारीगर ने काम शुरू कर दिया है।'
          : 'Quote approved! Provider has commenced work.',
        'success'
      );
    } else {
      const updated = {
        ...activeJob,
        status: 'cancelled',
        cancelReason: 'Quote rejected by customer'
      };
      setActiveJob(updated);
      realtimeSync.broadcast('QUOTE_RESPONDED', { approved: false });
      showToast(
        language === 'hi' ? 'कोटेशन अस्वीकार कर दिया गया।' : 'Quote declined. Job cancelled with zero charges.',
        'error'
      );
    }
  };

  // 7. Complete Job & Payment
  const completeJob = (paymentMethod = 'UPI') => {
    if (!activeJob) return;
    const finalAmount = activeJob.finalQuote?.total || activeJob.estimate?.min_price || 299;
    
    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }

    const completed = {
      ...activeJob,
      status: 'completed',
      payment: {
        method: paymentMethod,
        amount: finalAmount,
        paidAt: new Date().toISOString()
      }
    };

    setActiveJob(completed);
    realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'completed', updatedJob: completed });
    
    // Record into local price history for AI training
    recordCompletedJobPrice({
      category: activeJob.category,
      locality: activeJob.locality,
      problemType: activeJob.problemTitle,
      finalPrice: finalAmount,
      estimatedMidpoint: Math.round(
        (activeJob.estimate.min_price + activeJob.estimate.max_price) / 2
      )
    });

    showToast(
      language === 'hi'
        ? `काम पूरा हुआ! भुगतान: ₹${finalAmount} (${paymentMethod})`
        : `Job Completed! Payment of ₹${finalAmount} recorded via ${paymentMethod}.`,
      'success'
    );
  };

  // 8. Submit Review & Update Provider Reputation (Repeat Customer Logic)
  const submitReview = ({ rating, comment, wouldHireAgain }) => {
    if (!activeJob || !activeJob.provider) return;

    const providerId = activeJob.provider.id;
    
    // Update provider in state
    setProviders((prevList) =>
      prevList.map((p) => {
        if (p.id !== providerId) return p;
        
        const newTotalReviews = p.totalReviews + 1;
        const newRating = Number(
          ((p.rating * p.totalReviews + rating) / newTotalReviews).toFixed(2)
        );
        const newRepeatCount = wouldHireAgain ? p.repeatCustomers + 1 : p.repeatCustomers;
        const newJobsCount = p.totalJobsCompleted + 1;

        const newReviewObj = {
          id: 'rev-' + Date.now(),
          customerName: customerUser.name,
          rating,
          date: 'Just now',
          comment: comment || 'Verified job completed smoothly.',
          verifiedJobOtp: true,
          wouldHireAgain: Boolean(wouldHireAgain)
        };

        return {
          ...p,
          rating: newRating,
          totalReviews: newTotalReviews,
          repeatCustomers: newRepeatCount,
          totalJobsCompleted: newJobsCount,
          recentReviews: [newReviewObj, ...(p.recentReviews || [])]
        };
      })
    );

    // Save to past history
    setJobHistory((prev) => [
      {
        id: activeJob.id,
        category: activeJob.category,
        categoryName: activeJob.category,
        providerName: activeJob.provider.name,
        providerAvatar: activeJob.provider.avatar,
        status: 'completed',
        date: 'Today',
        paidAmount: activeJob.payment?.amount || activeJob.finalQuote?.total || 350,
        rating,
        otp: activeJob.otp,
        review: comment,
        repeatCustomerCount: wouldHireAgain
          ? activeJob.provider.repeatCustomers + 1
          : activeJob.provider.repeatCustomers
      },
      ...prev
    ]);

    showToast(
      language === 'hi'
        ? 'धन्यवाद! आपकी समीक्षा और ट्रस्ट स्कोर अपडेट कर दिया गया है।'
        : 'Thank you! Your verified review and repeat customer score are updated.',
      'success'
    );

    setActiveJob(null);
  };

  // 9. Raise Dispute
  const raiseDispute = ({ reason, details = '' }) => {
    if (!activeJob) return;
    const newDispute = {
      id: 'disp-' + Date.now(),
      jobId: activeJob.id,
      providerId: activeJob.provider?.id,
      providerName: activeJob.provider?.name,
      reason,
      details,
      status: 'under_review',
      createdAt: new Date().toISOString()
    };
    setDisputes((prev) => [newDispute, ...prev]);
    showToast(
      language === 'hi'
        ? 'डिस्प्यूट दर्ज हुआ। हमारी टीम 2 घंटे में संपर्क करेगी।'
        : 'Dispute recorded. Our trust officer will contact you within 2 hours.',
      'warning'
    );
  };

  // 10. Fast forward demo state for testing all steps in 1-click
  const fastForwardDemoState = () => {
    if (!activeJob) return;
    const current = activeJob.status;
    if (current === 'requested') {
      const u = { ...activeJob, status: 'accepted' };
      setActiveJob(u);
      realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'accepted', updatedJob: u });
    } else if (current === 'accepted') {
      const u = { ...activeJob, status: 'on_the_way' };
      setActiveJob(u);
      realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'on_the_way', updatedJob: u });
    } else if (current === 'on_the_way') {
      const u = { ...activeJob, status: 'arrived' };
      setActiveJob(u);
      realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'arrived', updatedJob: u });
    } else if (current === 'arrived') {
      const quoteObj = {
        labor: activeJob.estimate?.min_price || 280,
        materials: 120,
        total: (activeJob.estimate?.min_price || 280) + 120,
        breakdown: 'Standard valve replace & labor inspection'
      };
      const u = {
        ...activeJob,
        status: 'quote_submitted',
        otpVerified: true,
        finalQuote: quoteObj
      };
      setActiveJob(u);
      realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'quote_submitted', updatedJob: u });
    } else if (current === 'quote_submitted') {
      const u = { ...activeJob, status: 'in_progress', quoteApproved: true };
      setActiveJob(u);
      realtimeSync.broadcast('JOB_STATUS_CHANGE', { status: 'in_progress', updatedJob: u });
    } else if (current === 'in_progress') {
      completeJob('UPI');
    }
  };

  const cancelActiveJob = () => {
    cancelJobRequest({ reason: 'User initiated cancel' });
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        hasChosenRole,
        selectRole,
        language,
        setLanguage,
        selectedCity,
        setSelectedCity,
        selectedLocality,
        setSelectedLocality,
        customerUser,
        currentProvider,
        currentProviderId,
        setCurrentProviderId,
        isProviderOnline,
        setIsProviderOnline,
        providers,
        activeJob,
        setActiveJob,
        cancellations,
        providerLocation,
        updateProviderLocation,
        jobHistory,
        disputes,
        toast,
        showToast,
        t,
        createJobRequest,
        findAnotherProvider,
        cancelJobRequest,
        providerCancelJob: handleProviderCancellation,
        widenSearchArea,
        tryAgainMatching,
        setProviderOnTheWay,
        setProviderArrived,
        verifyJobOtp,
        submitFinalQuote,
        respondToFinalQuote,
        completeJob,
        submitReview,
        raiseDispute,
        fastForwardDemoState,
        cancelActiveJob
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
