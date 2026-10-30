import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Wrench, User, ArrowRight, Sparkles } from 'lucide-react';

export default function RoleSelectionModal({ isOpen, onSelect }) {
  const { language } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Logo and Brand */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-700/25 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Welcome to Verifix
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {language === 'hi' 
              ? 'भारत का भरोसेमंद लोकल सर्विस नेटवर्क। आप कैसे उपयोग करना चाहते हैं?'
              : "India's trust-based local services network. How will you use the app today?"}
          </p>
        </div>

        {/* 2 Big Choice Cards */}
        <div className="space-y-3 text-left">
          {/* Choice 1: Customer (Primary & Default) */}
          <button
            onClick={() => onSelect('customer')}
            className="w-full p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50/70 hover:bg-emerald-50 active:scale-[0.98] transition flex items-start gap-3.5 shadow-sm group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-emerald-950">
                  {language === 'hi' ? 'मुझे सर्विस चाहिए (ग्राहक)' : 'I need a service (Customer)'}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                  Popular
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1 leading-snug">
                {language === 'hi'
                  ? 'नल, बिजली, एसी, ट्यूटर आदि के लिए नज़दीकी वेरिफाइड कारीगर 1-टैप में बुलाएं।'
                  : 'Book verified plumbers, electricians, tutors & technicians with upfront transparent pricing.'}
              </p>
            </div>
          </button>

          {/* Choice 2: Provider */}
          <button
            onClick={() => onSelect('provider')}
            className="w-full p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.98] transition flex items-start gap-3.5 text-slate-800 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Wrench className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-extrabold text-sm text-slate-900 block">
                {language === 'hi' ? 'मैं सेवा प्रदान करता हूँ (कारीगर / पार्टनर)' : 'I provide services (Partner)'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                {language === 'hi'
                  ? 'ऑनलाइन जाएं, नज़दीकी काम स्वीकार करें और रिपीट ग्राहकों से कमाई बढ़ाएं।'
                  : 'Go online, accept nearby jobs, get OTP verified, and build your local reputation.'}
              </p>
            </div>
          </button>
        </div>

        <p className="text-[10px] text-slate-400">
          You can switch anytime in Profile settings.
        </p>
      </div>
    </div>
  );
}
