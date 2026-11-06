import React, { useState } from 'react';
import { formatINR } from '../utils/helpers';
import { 
  TrendingUp, 
  Calendar, 
  Repeat, 
  Star, 
  CheckCircle2, 
  QrCode, 
  Banknote, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight 
} from 'lucide-react';

export default function ProviderEarnings({ provider }) {
  const [timeframe, setTimeframe] = useState('week'); // 'day' | 'week' | 'month'

  const EARNINGS_DATA = {
    day: {
      total: 1450,
      jobsCount: 3,
      avgPayout: 483,
      jobs: [
        { id: 'job-d1', customer: 'Rohan Verma', category: 'Plumbing', service: 'Basin Mixer Repair', amount: 480, method: 'UPI', time: '11:30 AM', otpVerified: true },
        { id: 'job-d2', customer: 'Ananya Sharma', category: 'Plumbing', service: 'Flush Cistern Fix', amount: 520, method: 'Cash', time: '02:15 PM', otpVerified: true },
        { id: 'job-d3', customer: 'Girish Menon', category: 'Plumbing', service: 'Kitchen Tap Washer', amount: 450, method: 'UPI', time: '04:45 PM', otpVerified: true }
      ]
    },
    week: {
      total: 8920,
      jobsCount: 19,
      avgPayout: 469,
      jobs: [
        { id: 'job-w1', customer: 'Rohan Verma', category: 'Plumbing', service: 'Basin Mixer Repair', amount: 480, method: 'UPI', time: 'Today, 11:30 AM', otpVerified: true },
        { id: 'job-w2', customer: 'Ananya Sharma', category: 'Plumbing', service: 'Flush Cistern Fix', amount: 520, method: 'Cash', time: 'Today, 02:15 PM', otpVerified: true },
        { id: 'job-w3', customer: 'Deepak Patel', category: 'Plumbing', service: 'Main Line Valve Sealing', amount: 750, method: 'UPI', time: 'Yesterday', otpVerified: true },
        { id: 'job-w4', customer: 'Meera Nair', category: 'Plumbing', service: 'Geyser Inlet Pipe Fitting', amount: 620, method: 'UPI', time: '2 days ago', otpVerified: true },
        { id: 'job-w5', customer: 'Vikram Sundaram', category: 'Plumbing', service: 'Drain Blockage Clear', amount: 590, method: 'Cash', time: '3 days ago', otpVerified: true }
      ]
    },
    month: {
      total: 36450,
      jobsCount: 78,
      avgPayout: 467,
      jobs: [
        { id: 'job-m1', customer: 'Week 4 Total (19 Jobs)', category: 'Plumbing', service: 'All Services', amount: 8920, method: 'Direct Bank Transfer', time: 'Oct 18-24', otpVerified: true },
        { id: 'job-m2', customer: 'Week 3 Total (21 Jobs)', category: 'Plumbing', service: 'All Services', amount: 9840, method: 'Direct Bank Transfer', time: 'Oct 11-17', otpVerified: true },
        { id: 'job-m3', customer: 'Week 2 Total (18 Jobs)', category: 'Plumbing', service: 'All Services', amount: 8490, method: 'Direct Bank Transfer', time: 'Oct 04-10', otpVerified: true },
        { id: 'job-m4', customer: 'Week 1 Total (20 Jobs)', category: 'Plumbing', service: 'All Services', amount: 9200, method: 'Direct Bank Transfer', time: 'Sep 27-Oct 03', otpVerified: true }
      ]
    }
  };

  const currentData = EARNINGS_DATA[timeframe];

  return (
    <div className="space-y-4">
      {/* Timeframe Toggle Pills */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => setTimeframe('day')}
          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition ${
            timeframe === 'day'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setTimeframe('week')}
          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition ${
            timeframe === 'week'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => setTimeframe('month')}
          className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition ${
            timeframe === 'month'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          This Month
        </button>
      </div>

      {/* Main Big Earnings Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
            {timeframe === 'day' ? "Today's Take-Home" : timeframe === 'week' ? "Weekly Revenue" : "Monthly Revenue"}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-emerald-200">
            <ArrowUpRight className="w-3 h-3 text-emerald-300" />
            <span>+18% vs last {timeframe}</span>
          </span>
        </div>

        <div className="text-3xl font-black tracking-tight text-white my-1">
          {formatINR(currentData.total)}
        </div>

        <div className="flex items-center gap-4 text-xs text-emerald-200 border-t border-white/10 pt-3 mt-3">
          <div>
            <span className="text-[10px] text-emerald-300 block">Jobs Done</span>
            <span className="font-bold text-white text-sm">{currentData.jobsCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-300 block">Avg. Ticket</span>
            <span className="font-bold text-white text-sm">{formatINR(currentData.avgPayout)}</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-300 block">Settlement</span>
            <span className="font-bold text-amber-300 text-sm">Instant UPI</span>
          </div>
        </div>
      </div>

      {/* Reputation & Trust Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Repeat Customers Metric */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500">Repeat Customers</span>
            <Repeat className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700">
            {provider?.repeatCustomers || 46}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Distinct families booked 2+ times
          </p>
        </div>

        {/* Rating & Trust Score */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-slate-500">Trust Rating</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {provider?.rating || 4.9} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Across {provider?.totalReviews || 148} OTP-verified reviews
          </p>
        </div>
      </div>

      {/* Itemized Completed Jobs List */}
      <div className="space-y-2.5 pt-1">
        <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide px-1">
          Settled Job History ({timeframe})
        </h4>

        {currentData.jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-slate-900">{job.service}</span>
                {job.otpVerified && (
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                    OTP Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {job.customer} • {job.time}
              </p>
            </div>

            <div className="text-right">
              <div className="font-black text-xs text-emerald-700">
                {formatINR(job.amount)}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center justify-end gap-1">
                {job.method === 'UPI' ? <QrCode className="w-3 h-3 text-emerald-600" /> : <Banknote className="w-3 h-3 text-slate-400" />}
                <span>{job.method}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
