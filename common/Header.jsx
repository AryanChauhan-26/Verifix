import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import VerifixLogo from './VerifixLogo';
import { 
  ShieldCheck, 
  MapPin, 
  Languages, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Sparkles,
  ArrowLeftRight,
  Home,
  ClipboardList,
  User,
  Compass
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const { 
    userRole, 
    setUserRole, 
    language, 
    setLanguage, 
    selectedLocality, 
    setSelectedLocality, 
    selectedCity, 
    setSelectedCity,
    toast,
    activeJob,
    fastForwardDemoState,
    t
  } = useApp();

  const [isLocalityOpen, setIsLocalityOpen] = useState(false);

  const LOCALITIES = [
    { city: 'Bengaluru', locality: 'Indiranagar' },
    { city: 'Bengaluru', locality: 'Koramangala' },
    { city: 'Bengaluru', locality: 'HSR Layout' },
    { city: 'Mumbai', locality: 'Bandra West' },
    { city: 'Delhi NCR', locality: 'South Delhi' }
  ];

  const NAV_ITEMS = [
    { id: 'home', label: t('navHome'), icon: Home },
    { 
      id: 'activity', 
      label: t('navBookings'), 
      icon: ClipboardList,
      hasBadge: Boolean(activeJob)
    },
    { id: 'profile', label: t('navProfile'), icon: User }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 transition-all">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          
          {/* Left: Brand Logo & Locality */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab && setActiveTab('home')}
              className="flex items-center gap-2 cursor-pointer select-none group"
            >
              <VerifixLogo size={36} showWordmark={true} />
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Trust
              </span>
            </div>

            {/* Divider on desktop */}
            <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1" />

            {/* Locality Selector Pill */}
            <div className="relative">
              <button 
                onClick={() => setIsLocalityOpen(!isLocalityOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-slate-100 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition"
                aria-expanded={isLocalityOpen}
                aria-label="Select delivery locality"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[110px] sm:max-w-[180px] font-bold text-slate-800">
                  {selectedLocality}, {selectedCity}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLocalityOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Locality Dropdown with click-outside backdrop */}
              {isLocalityOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" 
                    onClick={() => setIsLocalityOpen(false)} 
                  />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider px-2 pt-1">
                      Select Your Service Area
                    </div>
                    <div className="space-y-1">
                      {LOCALITIES.map((loc) => {
                        const isSelected = selectedLocality === loc.locality && selectedCity === loc.city;
                        return (
                          <button
                            key={`${loc.city}-${loc.locality}`}
                            onClick={() => {
                              setSelectedLocality(loc.locality);
                              setSelectedCity(loc.city);
                              setIsLocalityOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                              <span>{loc.locality}, {loc.city}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center (Desktop / Tablet Nav Links) */}
          {userRole === 'customer' && setActiveTab && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="w-4 h-4" />
                      {item.hasBadge && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      )}
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Controls: Role Switcher & Language Toggle */}
          <div className="flex items-center gap-2">
            
            {/* Pro / Customer Switcher */}
            {userRole === 'customer' ? (
              <button
                onClick={() => setUserRole('provider')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 transition"
                title="Switch to Provider Mode"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                <span>Partner Mode</span>
              </button>
            ) : (
              <button
                onClick={() => setUserRole('customer')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-xs transition bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                title="Switch to Customer Mode"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>{userRole === 'provider' ? 'Pro Mode' : 'Admin Mode'} (Exit)</span>
              </button>
            )}

            {/* Language Toggle (EN / हिन्दी) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 active:scale-95 transition shadow-2xs"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Demo Fast-Forward Helper (when a job is active) */}
      {activeJob && (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-1.5 text-xs flex items-center justify-between shadow-md">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="font-semibold truncate">
                Live Status: <span className="uppercase text-emerald-300 font-bold">{activeJob.status.replace(/_/g, ' ')}</span>
              </span>
            </div>
            <button
              onClick={fastForwardDemoState}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Next Demo Step</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Alert Message Banner */}
      {toast && (
        <div className="fixed top-14 left-4 right-4 z-50 max-w-md mx-auto pointer-events-none animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white pointer-events-auto ${
              toast.type === 'success'
                ? 'bg-emerald-800 border border-emerald-700 shadow-emerald-900/30'
                : toast.type === 'error'
                ? 'bg-rose-700 border border-rose-600 shadow-rose-900/30'
                : toast.type === 'warning'
                ? 'bg-amber-700 border border-amber-600 shadow-amber-900/30'
                : 'bg-slate-800 border border-slate-700 shadow-slate-900/30'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-300 shrink-0" />}
            <span className="flex-1">{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
