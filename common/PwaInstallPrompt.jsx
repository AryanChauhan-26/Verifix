import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Download, X, ShieldCheck, Sparkles } from 'lucide-react';

export default function PwaInstallPrompt() {
  const { jobHistory } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for beforeinstallprompt event from browser
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Show prompt once after the user's first completed booking
  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('verifix_pwa_prompt_seen');
    if (jobHistory && jobHistory.length >= 1 && !hasSeenPrompt) {
      setIsVisible(true);
    }
  }, [jobHistory]);

  const handleInstallClick = async () => {
    localStorage.setItem('verifix_pwa_prompt_seen', 'true');
    setIsVisible(false);

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('verifix_pwa_prompt_seen', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-slate-700 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shrink-0 shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-white">Add Verifix to Home Screen</h4>
              <p className="text-[11px] text-slate-300">Instant access to verified local pros next time!</p>
            </div>
          </div>
          <button 
            onClick={handleDismiss} 
            className="text-slate-400 hover:text-white p-1 rounded-full"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
          >
            Maybe Later
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>
      </div>
    </div>
  );
}
