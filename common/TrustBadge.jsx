import React, { useState } from 'react';
import { ShieldCheck, PhoneCall, Check, AlertCircle, X } from 'lucide-react';

export default function TrustBadge({ provider, size = 'md', showTooltip = true }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!provider) return null;

  return (
    <div className="relative inline-block">
      {/* Badge Button */}
      <button
        onClick={(e) => {
          if (!showTooltip) return;
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-1 font-bold rounded-full transition active:scale-95 ${
          size === 'sm'
            ? 'px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200'
            : size === 'lg'
            ? 'px-3 py-1 text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm'
            : 'px-2 py-0.5 text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200'
        }`}
        title="Tap to view official Verifix Trust Audit"
      >
        <ShieldCheck className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-emerald-700`} />
        <span>Verified Pro</span>
      </button>

      {/* Trust Audit Modal Popover */}
      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Verifix Trust Audit</h4>
                  <p className="text-[10px] text-slate-500">{provider.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Govt ID Verified</span>
                  <p className="text-[10px] text-slate-500">{provider.verification?.idDocType || 'Aadhaar Card (UIDAI Verified)'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">3+ Customer References Checked</span>
                  <p className="text-[10px] text-slate-500">Verified via independent recorded voice calls before onboarding.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Zero Pending Disputes</span>
                  <p className="text-[10px] text-slate-500">Dispute rate 0.0% across {provider.totalJobsCompleted} completed jobs.</p>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[10px] text-emerald-800 leading-tight">
                💡 <strong>Verifix Guarantee:</strong> All reviews are OTP-verified at physical completion. No fake or paid reviews.
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
