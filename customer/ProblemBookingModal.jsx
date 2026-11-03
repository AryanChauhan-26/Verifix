import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { calculatePriceEstimate } from '../services/priceEstimator';
import { formatINR } from '../utils/helpers';
import TrustBadge from '../common/TrustBadge';
import { 
  X, 
  Camera, 
  Mic, 
  MicOff, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Clock
} from 'lucide-react';

export default function ProblemBookingModal({ category, onClose, onBookingSubmitted }) {
  const { selectedLocality, providers, language, t } = useApp();

  // Quick problem chips
  const quickProblems = category.popularProblems || [
    { id: 'common_fix', label_en: 'General Repair / Fix', label_hi: 'सामान्य रिपेयर' },
    { id: 'inspection', label_en: 'Inspection & Diagnosis', label_hi: 'जांच व कोटेशन' },
    { id: 'urgent_leak', label_en: 'Urgent Issue / Emergency', label_hi: 'आपातकालीन रिपेयर' },
    { id: 'other', label_en: 'Other Problem', label_hi: 'अन्य समस्या' }
  ];

  const [selectedChip, setSelectedChip] = useState(quickProblems[0]);
  const [customText, setCustomText] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNoteSeconds, setVoiceNoteSeconds] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [isCalculating, setIsCalculating] = useState(true);

  // Auto-detected location state
  const [locationConfirmed, setLocationConfirmed] = useState(true);

  // Nearest verified provider
  const nearestPro = providers.find((p) => p.category === category.id) || providers[0];

  const problemTitle = language === 'hi' ? selectedChip.label_hi : selectedChip.label_en;
  const fullDescription = customText ? `${problemTitle} — ${customText}` : problemTitle;

  // Calculate AI transparent price estimate
  useEffect(() => {
    let active = true;
    setIsCalculating(true);
    calculatePriceEstimate({
      category: category.id,
      problemDescription: fullDescription,
      locality: selectedLocality,
      isEmergency: true
    }).then((res) => {
      if (active) {
        setEstimate(res);
        setIsCalculating(false);
      }
    });
    return () => { active = false; };
  }, [category.id, fullDescription, selectedLocality]);

  // Handle Photo Simulation
  const handleAddPhoto = () => {
    setPhotoPreview('https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=300&auto=format&fit=crop&q=80');
  };

  // Handle Voice Note Simulation
  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      setVoiceNoteSeconds(12);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setVoiceNoteSeconds(16);
      }, 3000);
    }
  };

  // Submit Booking (Tap 3)
  const handleSubmit = () => {
    onBookingSubmitted({
      category: category.id,
      problemTitle,
      problemDescription: fullDescription,
      photoUrl: photoPreview,
      voiceNoteDuration: voiceNoteSeconds,
      bookingType: 'emergency',
      estimate
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center items-center bg-black/60 backdrop-blur-xs p-0 md:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full md:max-w-xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[92dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 md:zoom-in-95 duration-200">
        
        {/* Header: Service Category & Close */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${category.color} text-white shadow-xs`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                {language === 'hi' ? category.name_hi : category.name_en}
              </h3>
              <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>~{nearestPro.etaMinutes} mins arrival • Doorstep service</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* TAP 2: QUICK-SELECT CHIPS (Typing optional) */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-2 uppercase tracking-wide">
              {language === 'hi' ? 'समस्या चुनें:' : 'What is the issue?'}
            </label>
            <div className="flex flex-wrap gap-2">
              {quickProblems.map((chip) => {
                const isSelected = selectedChip.id === chip.id;
                const label = language === 'hi' ? chip.label_hi : chip.label_en;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setSelectedChip(chip)}
                    className={`min-h-[48px] py-2.5 px-4 rounded-xl text-xs font-bold transition active:scale-95 border touch-manipulation ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional: Brief Note or Photo/Voice */}
          <div className="space-y-2.5">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              placeholder="Add details (optional, e.g. tap is dripping into bucket)"
              className="w-full text-base md:text-sm p-3.5 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />

            {/* Optional Media Attachment Chips */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddPhoto}
                className={`min-h-[48px] py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 touch-manipulation ${
                  photoPreview ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>{photoPreview ? 'Photo Attached ✓' : 'Add Photo'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleVoice}
                className={`min-h-[48px] py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 touch-manipulation ${
                  isRecording 
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse' 
                    : voiceNoteSeconds 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4 text-emerald-600" />}
                <span>
                  {isRecording ? 'Listening...' : voiceNoteSeconds ? `Audio (${voiceNoteSeconds}s) ✓` : 'Voice Note'}
                </span>
              </button>
            </div>
          </div>

          {/* AUTO-DETECTED LOCATION WITH ONE-TAP CONFIRM */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Service Doorstep</span>
                <span className="text-xs font-black text-slate-900">{selectedLocality}, Bengaluru</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setLocationConfirmed(!locationConfirmed)}
              className="text-[11px] font-extrabold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50"
            >
              Confirmed ✓
            </button>
          </div>

          {/* ESTIMATED PRICE CARD (INR) */}
          {estimate && (
            <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 rounded-2xl p-4 border border-emerald-200 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">Estimated Fair Price:</span>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Upfront Guarantee
                </span>
              </div>

              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {formatINR(estimate.min_price)} - {formatINR(estimate.max_price)}
              </div>

              <p className="text-[11px] text-slate-600 leading-snug">
                Covers standard inspection & labor. Provider cannot charge higher without your in-app approval on arrival.
              </p>
            </div>
          )}

          {/* NEAREST VERIFIED PROVIDER SUMMARY */}
          {nearestPro && (
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={nearestPro.avatar}
                  alt={nearestPro.name}
                  className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-500/20"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-slate-900">{nearestPro.name}</span>
                    <TrustBadge provider={nearestPro} size="sm" showTooltip={false} />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    ★ {nearestPro.rating} • {nearestPro.repeatCustomers} repeat users
                  </span>
                </div>
              </div>

              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                ~{nearestPro.etaMinutes}m away
              </span>
            </div>
          )}

        </div>

        {/* TAP 3: LARGE BOTTOM BUTTON (52px tall, full-width fixed at bottom) */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0 pb-safe">
          <button
            onClick={handleSubmit}
            disabled={isCalculating}
            className="w-full h-[52px] min-h-[52px] rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-700/25 active:scale-[0.98] transition flex items-center justify-center gap-2 touch-manipulation"
          >
            <span>
              Request {category.name_en} ({estimate ? `${formatINR(estimate.min_price)} - ${formatINR(estimate.max_price)}` : 'Calculating...'})
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
