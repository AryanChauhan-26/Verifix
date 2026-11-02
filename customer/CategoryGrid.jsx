import React from 'react';
import { CATEGORIES } from '../data/categories';
import { useApp } from '../context/AppContext';
import { 
  Wrench, 
  Zap, 
  Wind, 
  GraduationCap, 
  Hammer, 
  Paintbrush, 
  Clock, 
  ArrowRight 
} from 'lucide-react';

const ICON_MAP = {
  Wrench,
  Zap,
  Wind,
  GraduationCap,
  Hammer,
  Paintbrush
};

export default function CategoryGrid({ onSelectCategory }) {
  const { language, t } = useApp();

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
          <span>{t('categoriesTitle')}</span>
        </h2>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
          ⚡ 15-min Arrival
        </span>
      </div>

      {/* Grid: 2 columns on mobile for big finger-friendly touch targets */}
      <div className="grid grid-cols-2 gap-2.5">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Wrench;
          const name = language === 'hi' ? cat.name_hi : cat.name_en;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className="group relative flex flex-col items-start p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-md active:scale-[0.97] transition-all text-left overflow-hidden min-h-[105px]"
            >
              {/* Subtle accent corner glow */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 group-hover:bg-emerald-50/60 rounded-bl-full transition-colors -z-0" />

              <div className="flex items-center justify-between w-full mb-2 z-10">
                {/* Big Category Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.color} text-white shadow-sm shadow-slate-300`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition flex items-center">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

              {/* Title & Visit fee */}
              <div className="z-10 mt-auto">
                <span className="block text-sm font-bold text-slate-900 tracking-tight leading-snug">
                  {name}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-0.5">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>From ₹{cat.basePrice}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
