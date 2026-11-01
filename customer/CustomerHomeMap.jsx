import React, { useState, Suspense, lazy } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/categories';
import VerifiedProCarousel from './VerifiedProCarousel';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Zap, 
  Wrench, 
  Wind, 
  GraduationCap, 
  Hammer, 
  Paintbrush, 
  Clock, 
  Navigation,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Lazy-load the Leaflet map for fast load on mobile networks
const LiveCustomerMap = lazy(() => import('./LiveCustomerMap'));

const ICON_MAP = {
  Wrench,
  Zap,
  Wind,
  GraduationCap,
  Hammer,
  Paintbrush
};

// Map Loading Skeleton
function MapLoadingSkeleton() {
  return (
    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center p-6 space-y-3 animate-pulse">
      <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-inner">
        <Navigation className="w-7 h-7 text-emerald-700 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <h4 className="font-extrabold text-sm text-slate-800">Loading live verified map...</h4>
        <p className="text-xs text-slate-500">Connecting to OpenStreetMap & nearby specialists</p>
      </div>
    </div>
  );
}

export default function CustomerHomeMap({ onSelectCategory, onSelectProvider }) {
  const { 
    providers, 
    selectedLocality, 
    language, 
    t 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Filter categories by search
  const filteredCategories = CATEGORIES.filter((cat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cat.name_en.toLowerCase().includes(query) ||
      cat.name_hi.toLowerCase().includes(query)
    );
  });

  const handleWorkerSelected = (worker) => {
    setSelectedWorker(worker);
  };

  const handleBookWorker = (worker) => {
    setSelectedWorker(null);
    onSelectProvider?.(worker);
  };

  return (
    <div className="relative w-full h-[calc(100dvh-57px)] overflow-hidden bg-slate-100 flex flex-col md:flex-row">
      
      {/* ============================================================== */}
      {/* DESKTOP / TABLET SIDE PANEL (>= 768px: fixed 380px - 420px)    */}
      {/* ============================================================== */}
      <aside className="hidden md:flex flex-col w-[380px] lg:w-[420px] shrink-0 h-full bg-white border-r border-slate-200/90 z-20 shadow-xl overflow-hidden">
        
        {/* Top Search in Desktop Panel */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div>
            <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
              {language === 'hi' ? 'सेवा चुनें (1-टैप बुकिंग)' : 'Local Services'}
            </h2>
            <p className="text-xs text-slate-500">
              Verified specialists near {selectedLocality}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative shadow-xs rounded-2xl bg-white border border-slate-200">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'आज क्या ठीक कराना है? (नल, एसी)' : 'What needs fixing today?'}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Categories & Pros in Desktop Panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          
          {/* Category Grid (2 columns in panel) */}
          <div className="grid grid-cols-2 gap-3">
            {filteredCategories.map((cat) => {
              const Icon = ICON_MAP[cat.icon] || Wrench;
              const name = language === 'hi' ? cat.name_hi : cat.name_en;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat)}
                  className="group relative flex flex-col items-start p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 hover:shadow-md active:scale-[0.98] transition-all text-left min-h-[105px]"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.color} text-white shadow-xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      ₹{cat.basePrice}+
                    </span>
                  </div>

                  <span className="text-xs font-black text-slate-900 tracking-tight leading-snug">
                    {name}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                    {cat.avgTime}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Verified Pros Near You */}
          <div className="pt-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Verified Pros Nearby
            </h3>
            <VerifiedProCarousel onSelectProvider={onSelectProvider} />
          </div>

          {/* Trust Guarantee Callout */}
          <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-950">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <strong className="block text-emerald-900 mb-1">Verifix Trust Protocol:</strong>
              <span className="text-[11px] text-emerald-800">
                Aadhaar audited • 3+ Customer references confirmed • Doorstep OTP handshake • Transparent upfront quote.
              </span>
            </div>
          </div>

        </div>
      </aside>

      {/* ============================================================== */}
      {/* LIVE MAP CONTAINER (Fills screen on mobile, right on desktop) */}
      {/* ============================================================== */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        
        {/* Lazy Loaded Live Customer Map */}
        <Suspense fallback={<MapLoadingSkeleton />}>
          <LiveCustomerMap
            onSelectProvider={handleBookWorker}
            activeCategoryFilter={activeCategoryFilter}
            selectedWorker={selectedWorker}
            onClearSelectedWorker={() => setSelectedWorker(null)}
          />
        </Suspense>

        {/* ============================================================== */}
        {/* MOBILE FLOATING SEARCH & CATEGORY CHIPS (< 768px)             */}
        {/* ============================================================== */}
        <div className="md:hidden absolute top-3 left-3 right-3 z-25 space-y-2 pointer-events-auto">
          {/* Floating Search Pill */}
          <div className="relative shadow-lg rounded-2xl bg-white border border-slate-200/90">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'आज क्या ठीक कराना है? (नल, एसी)' : 'What needs fixing today?'}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white text-base font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition shadow-xs ${
                activeCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white/95 backdrop-blur-md text-slate-700 border border-slate-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(isSelected ? 'all' : cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition shadow-xs ${
                    isSelected
                      ? 'bg-emerald-700 text-white ring-2 ring-emerald-600'
                      : 'bg-white/95 backdrop-blur-md text-slate-700 border border-slate-200'
                  }`}
                >
                  {cat.name_en}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* MOBILE SLEEK BOTTOM SHEET (< 768px)                           */}
        {/* ============================================================== */}
        <div
          className={`md:hidden absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-slate-200 transition-all duration-300 flex flex-col ${
            sheetExpanded ? 'h-[75dvh]' : 'h-[145px]'
          }`}
        >
          {/* Pull Handle & Header */}
          <div 
            onClick={() => setSheetExpanded(!sheetExpanded)}
            className="pt-2 pb-1.5 px-4 cursor-pointer flex flex-col items-center shrink-0 select-none"
          >
            <div className="w-10 h-1 bg-slate-300 rounded-full mb-2 hover:bg-slate-400 transition-colors" />
            
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-slate-900 tracking-tight">
                  {language === 'hi' ? 'सेवा चुनें' : 'Instant Local Services'}
                </span>
                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  ⚡ ~15m Arrival
                </span>
              </div>

              <button 
                type="button"
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label={sheetExpanded ? 'Collapse' : 'Expand'}
              >
                {sheetExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Compact View: Horizontal scroll of categories (When collapsed) */}
          {!sheetExpanded && (
            <div className="flex items-center gap-2.5 px-4 pt-1 pb-2 overflow-x-auto no-scrollbar">
              {filteredCategories.slice(0, 5).map((cat) => {
                const Icon = ICON_MAP[cat.icon] || Wrench;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat)}
                    className="flex flex-col items-center p-2 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 min-w-[76px] hover:border-emerald-500 active:scale-95 transition"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.color} text-white shadow-2xs mb-1`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-800 truncate max-w-[70px]">
                      {cat.name_en.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold">
                      ₹{cat.basePrice}+
                    </span>
                  </button>
                );
              })}
              
              {/* "More" button */}
              <button
                onClick={() => setSheetExpanded(true)}
                className="flex flex-col items-center justify-center p-2 rounded-2xl bg-emerald-50 border border-emerald-200 shrink-0 min-w-[76px] h-[78px] text-emerald-800 font-bold text-xs active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4 mb-1 text-emerald-600" />
                <span className="text-[10px]">View All</span>
              </button>
            </div>
          )}

          {/* Expanded View: Full category grid + Carousel + Trust badge */}
          {sheetExpanded && (
            <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-2.5">
                {filteredCategories.map((cat) => {
                  const Icon = ICON_MAP[cat.icon] || Wrench;
                  const name = language === 'hi' ? cat.name_hi : cat.name_en;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => onSelectCategory(cat)}
                      className="group relative flex flex-col items-start p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 hover:border-emerald-500 hover:bg-emerald-50/30 hover:shadow-md active:scale-[0.97] transition-all text-left min-h-[96px]"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.color} text-white shadow-xs`}>
                          <Icon className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          From ₹{cat.basePrice}
                        </span>
                      </div>

                      <span className="text-xs font-black text-slate-900 tracking-tight leading-snug">
                        {name}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
                        {cat.avgTime}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Verified Pros Near You */}
              <div className="pt-2">
                <VerifiedProCarousel onSelectProvider={onSelectProvider} />
              </div>

              {/* Trust Guarantee Callout */}
              <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <strong className="block text-emerald-900 mb-0.5">Verifix Trust Layer:</strong>
                  <span className="text-[11px] text-emerald-800">
                    Aadhaar checked • Customer references audited • Doorstep OTP confirmation • Quote approval before work starts.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
