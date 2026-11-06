import React, { useState } from 'react';
import { CATEGORIES } from '../data/categories';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Phone, 
  User, 
  Upload, 
  FileCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  ArrowLeft,
  Camera,
  Users,
  Sparkles
} from 'lucide-react';

export default function ProviderOnboardingModal({ isOpen, onClose, onComplete }) {
  const { language, t, showToast } = useApp();

  // Multi-step onboarding: 1. Phone Auth -> 2. Profile & Categories -> 3. Govt ID -> 4. Past References
  const [step, setStep] = useState(1);

  // Form State
  const [phone, setPhone] = useState('98765 12001');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Profile Info
  const [fullName, setFullName] = useState('Suresh Patel');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80');
  const [selectedCategories, setSelectedCategories] = useState(['plumber']);
  const [experienceYears, setExperienceYears] = useState('6');
  const [serviceArea, setServiceArea] = useState('Indiranagar');

  // Govt ID Upload
  const [idDocType, setIdDocType] = useState('Aadhaar Card (UIDAI)');
  const [idFileName, setIdFileName] = useState('aadhaar_front_back.pdf');
  const [idUploaded, setIdUploaded] = useState(true);

  // 3+ Past Customer References
  const [references, setReferences] = useState([
    { name: 'Kavita Sundaram', phone: '+91 98450 11223', relation: 'Bathroom renovation' },
    { name: 'Alok Nath', phone: '+91 98200 44991', relation: 'Pipeline leakage repair' },
    { name: 'Dr. Ramesh Rao', phone: '+91 97410 88220', relation: 'Motor pump install' }
  ]);

  if (!isOpen) return null;

  // Step 1: Send / Verify OTP
  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      showToast('Please enter a valid 10-digit Indian phone number', 'error');
      return;
    }
    setIsOtpSent(true);
    setOtp('5821'); // Mock auto-filled OTP for fast testing
    showToast('OTP sent to ' + phone + ': Code is 5821', 'info');
  };

  const handleVerifyOtp = () => {
    if (otp !== '5821' && otp.length < 4) {
      showToast('Invalid OTP. Use demo code 5821', 'error');
      return;
    }
    setStep(2);
  };

  // Category multi-select
  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return; // keep at least 1
      setSelectedCategories(selectedCategories.filter((id) => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // Reference phone changes
  const updateReference = (index, field, value) => {
    const updated = [...references];
    updated[index][field] = value;
    setReferences(updated);
  };

  // Final submission -> status = 'pending_verification'
  const handleSubmitApplication = () => {
    const newProviderProfile = {
      id: 'prov-' + Date.now().toString().slice(-4),
      name: fullName,
      phone: '+91 ' + phone,
      avatar: avatarUrl,
      category: selectedCategories[0],
      categories: selectedCategories,
      experienceYears: Number(experienceYears),
      locality: serviceArea,
      city: 'Bengaluru',
      verificationStatus: 'pending_verification', // Per requirement: starts as pending verification
      verification: {
        idVerified: false,
        idDocType: idDocType,
        idFileUrl: 'private/storage/provider_documents/' + idFileName,
        references: references,
        customerReferencesCount: 0,
        appliedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      },
      rating: 5.0,
      totalReviews: 0,
      repeatCustomers: 0,
      totalJobsCompleted: 0,
      isOnline: false,
      distanceKm: 1.0,
      etaMinutes: 8,
      lat: 12.9784,
      lng: 77.6408,
      bio: `${selectedCategories.join(', ')} pro with ${experienceYears} years experience in ${serviceArea}.`
    };

    onComplete(newProviderProfile);
    showToast('Application submitted! Status: Pending Admin Verification', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Partner Onboarding</h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Step {step} of 4 • Trust Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-500 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* STEP 1: Phone Auth */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Enter Your Mobile Number</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
                  We verify all service providers with high-security phone OTP.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  10-Digit Mobile Number
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 rounded-xl border border-slate-200 bg-slate-100 font-bold text-slate-600 text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {!isOtpSent && (
                    <button
                      onClick={handleSendOtp}
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800"
                    >
                      Send OTP
                    </button>
                  )}
                </div>
              </div>

              {isOtpSent && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-950 text-[11px]">Enter 4-digit OTP:</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">(Demo Code: 5821)</span>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center text-xl font-mono font-black tracking-widest py-2 rounded-xl border border-emerald-300 bg-white"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20"
                  >
                    Verify & Continue to Profile
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Profile & Categories */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name (as per Govt ID)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Profile Photo
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Change Avatar Photo</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Select Your Trade / Service Categories
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`p-2 rounded-xl border text-left font-bold transition flex items-center justify-between text-xs ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <span>{cat.name_en}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Service Area / Locality
                  </label>
                  <select
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="Indiranagar">Indiranagar</option>
                    <option value="Koramangala">Koramangala</option>
                    <option value="HSR Layout">HSR Layout</option>
                    <option value="Bandra West">Bandra West</option>
                    <option value="South Delhi">South Delhi</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Next: Govt ID
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Government ID Upload to Private Storage */}
          {step === 3 && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Private Storage Verification</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Your identity document is stored in a private Supabase Storage bucket (`provider_documents`) protected by Row Level Security. Only compliance officers can view it.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  value={idDocType}
                  onChange={(e) => setIdDocType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="Aadhaar Card (UIDAI)">Aadhaar Card (UIDAI QR-verified)</option>
                  <option value="Driving License">Driving License (State Transport)</option>
                  <option value="Voter ID Card">Voter ID (Election Commission)</option>
                  <option value="PAN Card">PAN Card (Income Tax Dept)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Upload Front & Back Copy
                </label>
                <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center bg-slate-50 hover:bg-emerald-50/40 transition cursor-pointer">
                  <Upload className="w-7 h-7 text-emerald-600 mx-auto mb-1.5" />
                  <span className="font-bold text-xs text-slate-800 block">
                    {idFileName}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    PDF, JPG, or PNG (Max 5MB) • Encrypted on upload
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Next: References
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: 3+ Past Customer References */}
          {step === 4 && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>3+ Past Customer Reference Audits</span>
                </div>
                <p className="text-amber-800 leading-tight">
                  Verifix requires phone verification with at least 2 distinct past customers before awarding the Verified Shield badge.
                </p>
              </div>

              {references.map((ref, idx) => (
                <div key={idx} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[11px] text-slate-700 uppercase">
                      Reference #{idx + 1}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Audit Call Required
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Customer Name"
                      value={ref.name}
                      onChange={(e) => updateReference(idx, 'name', e.target.value)}
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                    />
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={ref.phone}
                      onChange={(e) => updateReference(idx, 'phone', e.target.value)}
                      className="p-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Work performed (e.g. Tap fitting, wiring)"
                    value={ref.relation}
                    onChange={(e) => updateReference(idx, 'relation', e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmitApplication}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-700/25 active:scale-95 transition"
                >
                  Submit Application
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
