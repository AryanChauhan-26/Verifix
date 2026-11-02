import React from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/helpers';
import { 
  ClipboardList, 
  CheckCircle2, 
  Star, 
  Repeat, 
  Clock, 
  ShieldCheck, 
  ChevronRight,
  AlertCircle 
} from 'lucide-react';

export default function ActivityTab({ onOpenActiveJob }) {
  const { jobHistory, activeJob, disputes } = useApp();

  return (
    <div className="space-y-4 pb-20">
      <div className="px-1">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Your Activity & Bookings</h2>
        <p className="text-xs text-slate-500">Track current service calls and OTP-verified past records</p>
      </div>

      {/* Ongoing Active Job Callout */}
      {activeJob && (
        <div 
          onClick={onOpenActiveJob}
          className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Active Job in Progress
            </span>
            <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full">
              {activeJob.status.replace('_', ' ')}
            </span>
          </div>

          <h3 className="text-sm font-extrabold mb-1">{activeJob.problemTitle}</h3>
          <p className="text-xs text-emerald-100 mb-3">{activeJob.provider?.name} • OTP: {activeJob.otp}</p>

          <button className="w-full py-2 bg-white text-emerald-900 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1">
            <span>View Live Tracking & OTP</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Past Completed Bookings */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Past OTP-Verified Jobs
        </h3>

        {jobHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No completed jobs yet. Book your first verified pro today!
          </div>
        ) : (
          jobHistory.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={item.providerAvatar}
                    alt={item.providerName}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.providerName}</h4>
                    <span className="text-[11px] text-slate-500 capitalize">{item.categoryName} • {item.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-xs text-slate-900 block">
                    {formatINR(item.paidAmount)}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>OTP #{item.otp}</span>
                  </span>
                </div>
              </div>

              {item.review && (
                <div className="p-2 rounded-xl bg-slate-50 text-[11px] text-slate-600 italic">
                  "{item.review}"
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>Rated {item.rating} / 5</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Repeat className="w-3 h-3" />
                  <span>Repeat Customer Count: {item.repeatCustomerCount}</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Disputes History (if any) */}
      {disputes.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider px-1">
            Active Disputes ({disputes.length})
          </h3>
          {disputes.map((d) => (
            <div key={d.id} className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs">
              <div className="flex items-center justify-between font-bold text-rose-950 mb-1">
                <span>Dispute #{d.id.slice(-4)}</span>
                <span className="text-[10px] uppercase px-2 py-0.5 bg-rose-200 rounded-full">
                  Under Admin Review
                </span>
              </div>
              <p className="text-rose-800 text-[11px]">Reason: {d.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
