import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/helpers';
import TrustBadge from '../common/TrustBadge';
import MapView from '../common/MapView';
import ReviewModal from '../reviews/ReviewModal';
import { 
  ShieldCheck, 
  Phone, 
  Clock, 
  Repeat, 
  Star, 
  CheckCircle2, 
  KeyRound, 
  QrCode, 
  Banknote, 
  FileText,
  X,
  AlertTriangle,
  RotateCcw,
  Compass,
  ExternalLink,
  Copy
} from 'lucide-react';

export default function LiveJobTracker() {
  const { 
    activeJob, 
    cancelActiveJob, 
    findAnotherProvider,
    cancelJobRequest,
    widenSearchArea,
    tryAgainMatching,
    respondToFinalQuote, 
    completeJob, 
    raiseDispute,
    providerLocation,
    showToast 
  } = useApp();

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('UPI'); // 'UPI' | 'Cash'
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState('Provider is taking too long');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [showDisputeInput, setShowDisputeInput] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!activeJob) return null;

  const { status, provider, estimate, otp, finalQuote } = activeJob;

  const CANCEL_REASONS = [
    'Provider is taking too long',
    'Provider asked for extra money',
    'Changed my mind',
    'Found another provider',
    'Other'
  ];

  const STATUS_STEPS = [
    { key: 'requested', label: 'Requested' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'on_the_way', label: 'On Way' },
    { key: 'arrived', label: 'Arrived' },
    { key: 'quote_submitted', label: 'Price Quote' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Done' }
  ];

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === status);

  const handleConfirmFindAnother = () => {
    const finalReason = selectedCancelReason === 'Other' && customCancelReason 
      ? customCancelReason 
      : selectedCancelReason;
    setShowCancelSheet(false);
    findAnotherProvider({ reason: finalReason });
  };

  const handleConfirmCancelRequest = () => {
    const finalReason = selectedCancelReason === 'Other' && customCancelReason 
      ? customCancelReason 
      : selectedCancelReason;
    setShowCancelSheet(false);
    cancelJobRequest({ reason: finalReason });
  };

  const paymentAmount = activeJob.payment?.amount || finalQuote?.total || 350;
  const upiIntentUrl = `upi://pay?pa=verifix.pay@icici&pn=Verifix%20Services&am=${paymentAmount}&cu=INR&tn=Job%20${activeJob.id}`;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText('verifix.pay@icici');
    setCopiedUpi(true);
    showToast('UPI ID copied: verifix.pay@icici', 'success');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center items-center bg-black/60 backdrop-blur-xs p-0 md:p-4 animate-in fade-in duration-200">
      <div className="w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[94dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 md:zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              {status === 'requested' && 'Finding Nearest Verified Specialist...'}
              {status === 'accepted' && `${provider?.name} Accepted Your Request`}
              {status === 'on_the_way' && `${provider?.name} is on the way`}
              {status === 'arrived' && `${provider?.name} has arrived at your door`}
              {status === 'quote_submitted' && 'Review & Approve Upfront Quote'}
              {status === 'in_progress' && 'Service in Progress'}
              {status === 'completed' && 'Service Completed & Verified'}
            </h3>
          </div>

          {/* Minimize / Close (only allowed if completed or requested) */}
          {(status === 'completed' || status === 'requested' || status === 'no_providers_available') && (
            <button
              onClick={() => cancelActiveJob()}
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 active:scale-95 transition"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 7-Step Visual Progress Stepper */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center justify-between min-w-[340px] text-center">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {idx > 0 && (
                    <div 
                      className={`absolute top-2.5 right-1/2 left-[-50%] h-0.5 -z-0 transition-all ${
                        isPast ? 'bg-emerald-600' : 'bg-slate-200'
                      }`} 
                    />
                  )}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-all ${
                      isPast
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-emerald-700 text-white ring-4 ring-emerald-100 shadow-sm scale-110'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : idx + 1}
                  </div>
                  <span className={`text-[10px] mt-1 font-bold truncate max-w-[55px] ${isCurrent ? 'text-emerald-800' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* 1. MATCHING RADAR (Pulse Animation) */}
          {status === 'requested' && (
            <div className="py-8 text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75" />
                <span className="absolute inset-2 rounded-full bg-emerald-200 animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-lg">
                  <Clock className="w-8 h-8 animate-spin" />
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900">
                  Broadcasting to Verified {activeJob.category.replace('_', ' ')}s
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Connecting with background-audited providers within 5 km of your location.
                </p>
              </div>

              {/* Price Estimate Reference */}
              {estimate && (
                <div className="inline-block bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold text-emerald-900">
                  Estimated range: {formatINR(estimate.min_price)} - {formatINR(estimate.max_price)}
                </div>
              )}

              {/* Cancel Request Button */}
              <div className="pt-2">
                <button
                  onClick={() => setShowCancelSheet(true)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 p-2"
                >
                  Cancel search request
                </button>
              </div>
            </div>
          )}

          {/* 2. NO PROVIDERS AVAILABLE / RADIUS WIDEN */}
          {status === 'no_providers_available' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900">
                  No Verified Specialists Available Right Now
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  All verified specialists nearby are currently on active jobs. You can widen the search radius or retry.
                </p>
              </div>

              <div className="space-y-2 max-w-xs mx-auto">
                <button
                  onClick={widenSearchArea}
                  className="w-full h-[52px] min-h-[52px] px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/25 active:scale-95 transition flex items-center justify-center gap-2 touch-manipulation"
                >
                  <Compass className="w-4 h-4" />
                  <span>Widen search area (up to 15 km)</span>
                </button>

                <button
                  onClick={tryAgainMatching}
                  className="w-full h-[48px] min-h-[48px] px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs active:scale-95 transition flex items-center justify-center gap-2 touch-manipulation"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600" />
                  <span>Try again</span>
                </button>

                <button
                  onClick={() => cancelActiveJob()}
                  className="w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel and return home
                </button>
              </div>
            </div>
          )}

          {/* 3. MATCHED PROVIDER SLIDE-UP CARD & LIVE MAP */}
          {provider && status !== 'requested' && status !== 'no_providers_available' && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500 shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-slate-900">{provider.name}</h4>
                      <TrustBadge provider={provider} size="sm" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                      <span className="flex items-center text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 mr-0.5" />
                        {provider.rating}
                      </span>
                      <span>•</span>
                      <span className="font-extrabold text-emerald-700 flex items-center gap-0.5">
                        <Repeat className="w-3 h-3" />
                        {provider.repeatCustomers} repeat customers
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      {provider.vehicle}
                    </span>
                  </div>
                </div>

                {/* Call Pro button (Native tel: protocol, 48px touch target) */}
                <a
                  href={`tel:${provider.phone}`}
                  className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/25 active:scale-95 transition shrink-0 touch-manipulation"
                  title="Call Provider"
                  aria-label="Call provider"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>

              {/* Live Map View when "On the way" */}
              {(status === 'accepted' || status === 'on_the_way') && (
                <div className="mt-2">
                  <MapView 
                    providerLat={providerLocation?.lat || provider.lat} 
                    providerLng={providerLocation?.lng || provider.lng} 
                    providerName={provider.name}
                    distanceKm={providerLocation?.distanceKm || 1.2}
                    etaMinutes={providerLocation?.etaMinutes || provider.etaMinutes} 
                  />
                </div>
              )}

              {/* Secondary Cancel trigger button on matched card */}
              {(status === 'accepted' || status === 'on_the_way') && (
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Need to change plans?</span>
                  <button
                    onClick={() => setShowCancelSheet(true)}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition active:scale-95"
                  >
                    Cancel or Change Pro
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. DOORSTEP 4-DIGIT OTP HANDSHAKE (When Arrived) */}
          {status === 'arrived' && (
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-5 text-white text-center shadow-lg space-y-2">
              <div className="inline-flex p-2 rounded-xl bg-white/10 mb-1">
                <KeyRound className="w-6 h-6 text-emerald-300" />
              </div>
              <h4 className="font-extrabold text-sm text-emerald-100 uppercase tracking-wide">
                Share this 4-digit code on arrival
              </h4>
              <p className="text-[11px] text-emerald-200 max-w-xs mx-auto leading-tight">
                Share this code with {provider?.name} at your door to start the job and prove they arrived.
              </p>

              {/* 4-digit code in huge typography */}
              <div className="my-3 tracking-widest font-mono font-black text-4xl text-amber-300 bg-black/35 py-3 px-6 rounded-2xl inline-block border border-white/20 shadow-inner">
                {otp}
              </div>

              <div className="text-[11px] text-emerald-200 flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Never share code before the provider reaches your doorstep.</span>
              </div>
            </div>
          )}

          {/* 5. FINAL QUOTE SUBMISSION & APPROVAL */}
          {status === 'quote_submitted' && finalQuote && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-700" />
                <h4 className="font-black text-xs text-amber-950 uppercase tracking-wide">
                  Waiting for your price approval
                </h4>
              </div>

              <p className="text-xs text-slate-700 leading-snug">
                {provider?.name} has inspected the problem on-site and quoted:
              </p>

              {/* Itemized breakdown */}
              <div className="bg-white rounded-xl p-3.5 border border-amber-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Inspection & Labor:</span>
                  <span className="font-bold text-slate-900">{formatINR(finalQuote.labor)}</span>
                </div>
                {finalQuote.materials > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Spare parts / materials:</span>
                    <span className="font-bold text-slate-900">{formatINR(finalQuote.materials)}</span>
                  </div>
                )}
                {finalQuote.breakdown && (
                  <p className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-1">
                    "{finalQuote.breakdown}"
                  </p>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total Final Price:</span>
                  <span className="text-emerald-700 text-base">{formatINR(finalQuote.total)}</span>
                </div>
              </div>

              {/* Comparison vs Initial Estimate */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 text-[11px] text-emerald-900 font-semibold border border-emerald-200">
                <span>AI Upfront Estimate:</span>
                <span>{formatINR(estimate?.min_price)} - {formatINR(estimate?.max_price)}</span>
              </div>

              {/* Approve & Reject Actions */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => respondToFinalQuote(false)}
                  className="min-h-[48px] py-3 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 active:scale-95 transition touch-manipulation"
                >
                  Reject & Cancel
                </button>
                <button
                  onClick={() => respondToFinalQuote(true)}
                  className="min-h-[48px] py-3 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition touch-manipulation"
                >
                  Approve Price & Start
                </button>
              </div>
            </div>
          )}

          {/* 6. WORK IN PROGRESS */}
          {status === 'in_progress' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 animate-bounce shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-black text-sm text-slate-900">
                Work is in progress
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                {provider?.name} is repairing your {activeJob.category}. Price is locked at {formatINR(finalQuote?.total || 350)}.
              </p>
              
              <button
                onClick={() => completeJob(selectedPayment)}
                className="mt-3 py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition active:scale-95"
              >
                Mark Done (Demo Trigger)
              </button>
            </div>
          )}

          {/* 7. COMPLETED, PAYMENT & REVIEW */}
          {status === 'completed' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-1" />
                <h4 className="font-black text-base text-slate-900">
                  Job Completed!
                </h4>
                <div className="text-2xl font-black text-emerald-800 mt-1">
                  {formatINR(paymentAmount)}
                </div>
              </div>

              {/* Payment selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Select payment method:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedPayment('UPI')}
                    className={`min-h-[48px] flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition active:scale-95 touch-manipulation ${
                      selectedPayment === 'UPI'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>UPI (GPay / PhonePe)</span>
                  </button>

                  <button
                    onClick={() => setSelectedPayment('Cash')}
                    className={`min-h-[48px] flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition active:scale-95 touch-manipulation ${
                      selectedPayment === 'Cash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Hand</span>
                  </button>
                </div>
              </div>

              {/* UPI Intent Button on Mobile / QR & ID on Desktop */}
              {selectedPayment === 'UPI' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">UPI ID: verifix.pay@icici</span>
                    <button
                      onClick={handleCopyUpi}
                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Direct Mobile UPI Intent Link */}
                  <a
                    href={upiIntentUrl}
                    className="w-full h-[52px] min-h-[52px] rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/25 active:scale-95 transition flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Pay ₹{paymentAmount} via UPI App (PhonePe / GPay / Paytm)</span>
                  </a>
                </div>
              )}

              {/* Rate & Review Button */}
              <button
                onClick={() => setIsReviewOpen(true)}
                className="w-full h-[52px] min-h-[52px] px-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/25 active:scale-95 transition flex items-center justify-center gap-2 touch-manipulation"
              >
                <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>Rate & Review {provider?.name}</span>
              </button>

              <div className="text-center pt-1">
                <button
                  onClick={() => setShowDisputeInput(!showDisputeInput)}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition"
                >
                  Have an issue? Raise a dispute (within 48 hours)
                </button>
              </div>

              {showDisputeInput && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2">
                  <label className="block font-bold text-rose-900">
                    Describe your issue
                  </label>
                  <textarea
                    rows={2}
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    placeholder="E.g., Problem reappeared, billing discrepancy..."
                    className="w-full text-base md:text-xs p-2.5 rounded-xl border border-rose-200 bg-white"
                  />
                  <button
                    onClick={() => {
                      raiseDispute({ reason: disputeReason });
                      setShowDisputeInput(false);
                    }}
                    className="w-full min-h-[44px] py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs transition active:scale-95"
                  >
                    Submit Dispute to Trust Officer
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* CANCELLATION BOTTOM SHEET */}
      {showCancelSheet && (
        <div 
          className="fixed inset-0 z-60 flex flex-col justify-end md:justify-center items-center bg-black/60 backdrop-blur-xs p-0 md:p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCancelSheet(false);
          }}
        >
          <div className="w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-6 md:zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-sm text-slate-900">Why are you cancelling?</h4>
              <button 
                onClick={() => setShowCancelSheet(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Radio / Chip Options */}
            <div className="space-y-2">
              {CANCEL_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedCancelReason(r)}
                  className={`w-full min-h-[48px] p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition touch-manipulation ${
                    selectedCancelReason === r
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-2xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{r}</span>
                  {selectedCancelReason === r && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </button>
              ))}

              {selectedCancelReason === 'Other' && (
                <input
                  type="text"
                  placeholder="Tell us more..."
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="w-full text-base md:text-xs p-3 rounded-xl border border-slate-200 mt-1"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 pb-safe">
              <button
                onClick={handleConfirmFindAnother}
                className="w-full h-[52px] min-h-[52px] px-4 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/25 active:scale-95 transition flex items-center justify-center gap-1.5 touch-manipulation"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Find another provider</span>
              </button>

              <button
                onClick={handleConfirmCancelRequest}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 active:scale-95 transition touch-manipulation"
              >
                Cancel request completely
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewOpen && (
        <ReviewModal
          provider={provider}
          onClose={() => setIsReviewOpen(false)}
        />
      )}
    </div>
  );
}
