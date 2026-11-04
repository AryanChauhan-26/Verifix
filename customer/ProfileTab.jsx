import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  Languages, 
  ArrowLeftRight, 
  FileText, 
  HelpCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function ProfileTab() {
  const { customerUser, selectedLocality, language, setLanguage, userRole, setUserRole } = useApp();

  return (
    <div className="space-y-4 pb-20">
      <div className="px-1">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Profile & Trust Center</h2>
        <p className="text-xs text-slate-500">Your account safety and verification credentials</p>
      </div>

      {/* User Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-md">
          {customerUser.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-extrabold text-base text-slate-900">{customerUser.name}</h3>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
              OTP Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-slate-400" />
            <span>{customerUser.phone}</span>
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-600" />
            <span>{selectedLocality}</span>
          </p>
        </div>
      </div>

      {/* Verifix Trust System Explanation */}
      <div className="bg-emerald-50/70 rounded-3xl p-4 border border-emerald-200/90 space-y-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-950 font-extrabold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Why Verifix Is Safer Than Unverified Directories</span>
        </div>
        <ul className="space-y-1.5 text-[11px] text-emerald-900">
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Physical Handshake OTP:</strong> Work only begins after provider matches your 4-digit doorstep code.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Quote Lock Protection:</strong> Zero unexpected bills. Final price must be approved by you in-app.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Repeat Customer Metric:</strong> Providers build status only when real families hire them 2+ times.</span>
          </li>
        </ul>
      </div>

      {/* Settings list */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200/90 divide-y divide-slate-100 text-xs">
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition rounded-xl text-left"
        >
          <div className="flex items-center gap-2.5">
            <Languages className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">Language / भाषा</span>
          </div>
          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
            {language === 'en' ? 'English' : 'हिन्दी'}
          </span>
        </button>

        {/* Account Mode Switcher */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold text-slate-800 block text-xs">Account Role</span>
                <span className="text-[10px] text-slate-500">Currently in: <strong>{userRole === 'customer' ? 'Customer' : userRole === 'provider' ? 'Provider' : 'Admin'} Mode</strong></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={() => setUserRole('customer')}
              className={`py-2 px-2 rounded-xl text-center text-[11px] font-bold transition border ${
                userRole === 'customer'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setUserRole('provider')}
              className={`py-2 px-2 rounded-xl text-center text-[11px] font-bold transition border ${
                userRole === 'provider'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Partner
            </button>
            <button
              onClick={() => setUserRole('admin')}
              className={`py-2 px-2 rounded-xl text-center text-[11px] font-bold transition border ${
                userRole === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Admin
            </button>
          </div>
        </div>


        <div className="p-3 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Verifix Version 1.0 (Phase 1 MVP)</span>
          </span>
          <span className="font-semibold text-emerald-600">Encrypted</span>
        </div>
      </div>
    </div>
  );
}
