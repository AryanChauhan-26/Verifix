import React from 'react';
import { Home, ClipboardList, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { t, activeJob, userRole } = useApp();

  // Hide on admin or on tablet & desktop (where top nav is present)
  if (userRole === 'admin') return null;

  const TABS = [
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all relative active:scale-95 touch-manipulation ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-emerald-700 stroke-[2.4]' : ''}`} />
                {tab.hasBadge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-6 h-1 bg-emerald-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
