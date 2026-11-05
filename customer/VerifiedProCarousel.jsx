import React from 'react';
import { useApp } from '../context/AppContext';
import TrustBadge from '../common/TrustBadge';
import { Star, Repeat, Navigation, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

export default function VerifiedProCarousel({ onSelectProvider }) {
  const { providers, t, language } = useApp();

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('verifiedNearYou')}</span>
          </h3>
          <p className="text-[11px] text-slate-500">
            {language === 'hi' 
              ? 'आईडी व 2+ कस्टमर कॉल्स से सत्यापित' 
              : 'Admin ID & reference-verified local specialists'}
          </p>
        </div>
      </div>

      {/* Horizontal smooth swipe carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory no-scrollbar">
        {providers.map((pro) => (
          <div
            key={pro.id}
            onClick={() => onSelectProvider?.(pro)}
            className="min-w-[270px] max-w-[280px] snap-start bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Top row: Avatar + Name + Trade */}
            <div>
              <div className="flex items-start gap-3 mb-2.5">
                <img
                  src={pro.avatar}
                  alt={pro.name}
                  className="w-13 h-13 rounded-xl object-cover ring-2 ring-emerald-600/30 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{pro.name}</h4>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 capitalize truncate">
                    {pro.category.replace('_', ' ')} • {pro.experienceYears}y exp
                  </p>
                  <div className="mt-1">
                    <TrustBadge provider={pro} size="sm" />
                  </div>
                </div>
              </div>

              {/* Bio summary */}
              <p className="text-[11px] text-slate-600 line-clamp-2 mb-2 leading-relaxed">
                {pro.bio}
              </p>
            </div>

            {/* Metrics pills: Repeat Customers & Rating */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                {/* Repeat customer metric badge */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-extrabold text-[11px] border border-emerald-100">
                  <Repeat className="w-3 h-3 text-emerald-600" />
                  <span>{pro.repeatCustomers} Repeat Users</span>
                </span>

                {/* Rating */}
                <span className="flex items-center gap-1 font-bold text-slate-800 text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{pro.rating}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({pro.totalReviews})</span>
                </span>
              </div>

              {/* Distance and ETA */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-emerald-600" />
                  <span>{pro.locality} ({pro.distanceKm} km)</span>
                </span>
                <span className="flex items-center gap-1 font-semibold text-emerald-700">
                  <Clock className="w-3 h-3" />
                  <span>{pro.etaMinutes}m ETA</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
