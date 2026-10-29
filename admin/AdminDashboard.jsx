import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/helpers';
import TrustBadge from '../common/TrustBadge';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  PhoneCall, 
  FileText, 
  Users, 
  BarChart3, 
  Repeat, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  Clock,
  Search,
  Filter,
  Eye,
  Check,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const { 
    providers, 
    jobHistory, 
    disputes, 
    showToast, 
    t, 
    language 
  } = useApp();

  // Admin Tab: 'verifications' | 'disputes' | 'analytics' | 'pricing'
  const [activeTab, setActiveTab] = useState('verifications');

  // Seed / dynamic applicants under audit
  const [pendingApplicants, setPendingApplicants] = useState([
    {
      id: 'app-001',
      name: 'Suresh Patel',
      phone: '+91 98765 12001',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      category: 'Plumber',
      experienceYears: 6,
      locality: 'Indiranagar',
      appliedDate: 'Today, 10:15 AM',
      idDocument: {
        type: 'Aadhaar Card (UIDAI QR)',
        url: 'private/storage/provider_documents/aadhaar_suresh.pdf',
        isVerified: true
      },
      references: [
        { name: 'Kavita Sundaram', phone: '+91 98450 11223', work: 'Bathroom renovation & mixer fitting', called: true, status: 'confirmed' },
        { name: 'Alok Nath', phone: '+91 98200 44991', work: 'Drainage pipe leakage repair', called: true, status: 'confirmed' },
        { name: 'Dr. Ramesh Rao', phone: '+91 97410 88220', work: 'Motor pump replacement', called: false, status: 'pending' }
      ],
      adminStatus: 'pending' // 'pending' | 'approved' | 'rejected'
    },
    {
      id: 'app-002',
      name: 'Dinesh Gurung',
      phone: '+91 98190 33412',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      category: 'Electrician',
      experienceYears: 4,
      locality: 'Koramangala',
      appliedDate: 'Yesterday',
      idDocument: {
        type: 'Driving License',
        url: 'private/storage/provider_documents/dl_dinesh.pdf',
        isVerified: true
      },
      references: [
        { name: 'Sunil Chawla', phone: '+91 98330 77122', work: 'Wiring and switchboard replacement', called: true, status: 'confirmed' },
        { name: 'Ritu Sen', phone: '+91 98210 55001', work: 'Inverter tripping troubleshooting', called: false, status: 'pending' },
        { name: 'Anand K.', phone: '+91 99002 44119', work: 'Ceiling fan regulator wiring', called: false, status: 'pending' }
      ],
      adminStatus: 'pending'
    }
  ]);

  // Active platform disputes list
  const [adminDisputes, setAdminDisputes] = useState([
    {
      id: 'disp-301',
      jobId: 'job-7812',
      customerName: 'Pooja Hegde',
      customerPhone: '+91 98450 99881',
      providerName: 'Rajesh Kumar',
      category: 'Plumber',
      problemDescription: 'Tap started leaking again within 6 hours of repair.',
      paidAmount: 480,
      initialAiEstimate: '₹250 - ₹450',
      otpVerifiedTime: 'Yesterday, 04:30 PM',
      status: 'open', // 'open' | 'refunded' | 'revisit_scheduled' | 'dismissed'
      hoursRemaining: 34
    },
    {
      id: 'disp-302',
      jobId: 'job-7809',
      customerName: 'Kunal Mathur',
      customerPhone: '+91 98200 11445',
      providerName: 'Amit Sharma',
      category: 'Electrician',
      problemDescription: 'Customer claims spare MCB switch price was ₹50 higher than MRP.',
      paidAmount: 620,
      initialAiEstimate: '₹400 - ₹650',
      otpVerifiedTime: '2 days ago',
      status: 'open',
      hoursRemaining: 12
    }
  ]);

  // Selected applicant modal viewer
  const [viewingApplicant, setViewingApplicant] = useState(null);

  // Toggle reference called status
  const handleToggleReferenceAudit = (appId, refIdx) => {
    setPendingApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const updatedRefs = [...app.references];
        const current = updatedRefs[refIdx];
        updatedRefs[refIdx] = {
          ...current,
          called: !current.called,
          status: !current.called ? 'confirmed' : 'pending'
        };
        return { ...app, references: updatedRefs };
      })
    );
  };

  // Grant Verified Shield Badge
  const handleApproveApplicant = (app) => {
    const confirmedCount = app.references.filter((r) => r.status === 'confirmed').length;
    if (confirmedCount < 2) {
      showToast('Cannot verify provider: At least 2 customer reference calls must be confirmed!', 'error');
      return;
    }

    setPendingApplicants((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, adminStatus: 'approved' } : a))
    );

    showToast(`Verified Shield granted to ${app.name}! Aadhaar & ${confirmedCount} references validated.`, 'success');
  };

  // Resolve Dispute
  const handleResolveDispute = (dispId, resolutionType) => {
    setAdminDisputes((prev) =>
      prev.map((d) => (d.id === dispId ? { ...d, status: resolutionType } : d))
    );
    showToast(`Dispute #${dispId.slice(-3)} resolved: ${resolutionType.replace(/_/g, ' ')}`, 'success');
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* 1. ADMIN HEADER & KEY PLATFORM METRICS */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-extrabold text-base tracking-tight">Verifix Trust & Compliance</h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Admin Panel
                </span>
              </div>
              <p className="text-xs text-slate-400">Auditing provider trust, reference calls & disputes</p>
            </div>
          </div>
        </div>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-800 text-center">
          <div className="bg-slate-800/80 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-semibold">Verified Pros</span>
            <span className="text-sm font-black text-emerald-400">{providers.length}</span>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-semibold">Under Audit</span>
            <span className="text-sm font-black text-amber-400">
              {pendingApplicants.filter((a) => a.adminStatus === 'pending').length}
            </span>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-semibold">Disputes</span>
            <span className="text-sm font-black text-rose-400">
              {adminDisputes.filter((d) => d.status === 'open').length}
            </span>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl">
            <span className="text-[10px] text-slate-400 block font-semibold">Repeat Rate</span>
            <span className="text-sm font-black text-cyan-400">42.8%</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-800 p-1 rounded-2xl border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'verifications' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Audits ({pendingApplicants.filter((a) => a.adminStatus === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'disputes' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Disputes ({adminDisputes.filter((d) => d.status === 'open').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* 2. TAB: PROVIDER VERIFICATION AUDITS (Section 5) */}
      {activeTab === 'verifications' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">
              Pending Provider Verifications
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Rule: ID + 2 Reference Calls Required
            </span>
          </div>

          {pendingApplicants.map((app) => {
            const confirmedCount = app.references.filter((r) => r.status === 'confirmed').length;
            const isApproved = app.adminStatus === 'approved';

            return (
              <div
                key={app.id}
                className={`bg-white rounded-3xl p-4 border shadow-xs space-y-3 transition ${
                  isApproved ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={app.avatar}
                      alt={app.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-sm text-slate-900">{app.name}</h4>
                        {isApproved && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Verified Shield Active ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {app.category} • {app.experienceYears}y exp • {app.locality}
                      </p>
                      <p className="text-[10px] text-slate-400">{app.phone} • Applied {app.appliedDate}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {confirmedCount} / 2 Calls Verified
                  </span>
                </div>

                {/* Document Verification Pill */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">{app.idDocument.type}</span>
                      <span className="text-[10px] text-slate-400">Stored in private bucket `provider_documents`</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    UIDAI Authenticated ✓
                  </span>
                </div>

                {/* 3 Reference Calls Checklist (Section 5 Requirement) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    Customer Phone References Audit (Need ≥ 2):
                  </span>

                  {app.references.map((ref, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                        ref.status === 'confirmed'
                          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 font-medium'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-xs">{ref.name}</strong>
                          <span className="text-[10px] text-slate-500">({ref.phone})</span>
                        </div>
                        <p className="text-[10px] text-slate-500">{ref.work}</p>
                      </div>

                      <button
                        onClick={() => handleToggleReferenceAudit(app.id, idx)}
                        disabled={isApproved}
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                          ref.status === 'confirmed'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>{ref.status === 'confirmed' ? 'Confirmed ✓' : 'Mark Called'}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                {!isApproved && (
                  <div className="flex gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => showToast('Application flagged for resubmission.', 'info')}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                    >
                      Request Re-upload
                    </button>
                    <button
                      onClick={() => handleApproveApplicant(app)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition flex items-center justify-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Approve & Grant Badge</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. TAB: 48-HOUR DISPUTE RESOLUTION CENTER (Section 5) */}
      {activeTab === 'disputes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">
              Customer 48-Hour Disputes
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Window: 48h Post-OTP Completion
            </span>
          </div>

          {adminDisputes.map((disp) => {
            const isResolved = disp.status !== 'open';

            return (
              <div
                key={disp.id}
                className={`bg-white rounded-3xl p-4 border shadow-xs space-y-3 ${
                  isResolved ? 'border-slate-200 bg-slate-50/50' : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{disp.customerName}</span>
                      <span className="text-[10px] font-bold text-slate-400">vs</span>
                      <span className="font-extrabold text-sm text-emerald-800">{disp.providerName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">{disp.category} • Completed {disp.otpVerifiedTime}</span>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isResolved ? 'bg-slate-100 text-slate-700' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {isResolved ? disp.status.replace(/_/g, ' ') : `${disp.hoursRemaining}h SLA Left`}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800">
                  <span className="font-bold text-slate-900 block mb-1">Customer Claim:</span>
                  <p className="text-slate-600 leading-relaxed italic">"{disp.problemDescription}"</p>
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500">Paid Amount: <strong className="text-slate-900">{formatINR(disp.paidAmount)}</strong></span>
                  <span className="text-slate-500">AI Benchmark: <strong className="text-emerald-700">{disp.initialAiEstimate}</strong></span>
                </div>

                {!isResolved && (
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleResolveDispute(disp.id, 'refund_issued')}
                      className="py-2.5 px-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-[11px] shadow-xs active:scale-95"
                    >
                      Issue Full Refund
                    </button>
                    <button
                      onClick={() => handleResolveDispute(disp.id, 'revisit_dispatched')}
                      className="py-2.5 px-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] shadow-xs active:scale-95"
                    >
                      Free Re-visit
                    </button>
                    <button
                      onClick={() => handleResolveDispute(disp.id, 'dismissed')}
                      className="py-2.5 px-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-[11px] hover:bg-slate-50"
                    >
                      Dismiss Claim
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. TAB: PLATFORM ANALYTICS & REPEAT CUSTOMER METRICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <Repeat className="w-4 h-4 text-emerald-600" />
              <span>Hyperlocal Repeat-Customer Trust Leaderboard</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verifix ranks providers based on distinct families who book them 2+ times rather than easily faked ratings.
            </p>

            <div className="space-y-2 pt-1">
              {providers.slice(0, 4).map((p, idx) => (
                <div key={p.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-slate-400 text-sm w-4">#{idx + 1}</span>
                    <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <span className="font-extrabold text-slate-900 block">{p.name}</span>
                      <span className="text-[10px] text-slate-500 capitalize">{p.category} • {p.locality}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-emerald-800 text-xs block">
                      {p.repeatCustomers} Repeat Users
                    </span>
                    <span className="text-[10px] text-slate-400">★ {p.rating} ({p.totalReviews})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
