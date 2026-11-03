import React, { useState } from 'react';
import { formatINR } from '../utils/helpers';
import { ShieldCheck, Sparkles, ChevronDown, ChevronUp, Cpu, Info, CheckCircle2 } from 'lucide-react';

export default function PriceEstimateCard({ estimate, category, locality }) {
  const [showTelemetry, setShowTelemetry] = useState(false);

  if (!estimate) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/40 rounded-2xl p-4 border border-emerald-200/90 shadow-sm mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
            {estimate.isLlmPowered ? 'Hyperlocal AI Pricing Engine' : 'Transparent AI Benchmark'}
          </span>
        </div>
        
        {/* Confidence pill */}
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
          {estimate.confidence}
        </span>
      </div>

      {/* Main Big Price Display */}
      <div className="my-2.5 flex items-baseline justify-between border-b border-emerald-100 pb-3">
        <div>
          <span className="text-xs font-semibold text-slate-500 block">Expected Labor Range</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {formatINR(estimate.min_price)} - {formatINR(estimate.max_price)}
            </span>
            <span className="text-xs font-bold text-slate-400">INR</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200 shadow-2xs">
            {locality} Rates
          </span>
        </div>
      </div>

      {/* Explanation reasoning */}
      <div className="flex items-start gap-2 mb-2.5 text-xs text-slate-700 leading-relaxed">
        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 font-medium">{estimate.short_reason}</p>
      </div>

      {/* Collapsible AI Telemetry / Model Reasoning Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowTelemetry(!showTelemetry)}
          className="flex items-center justify-between w-full text-[10px] font-bold text-emerald-800 hover:text-emerald-950 p-1.5 rounded-lg bg-emerald-100/50 transition mb-2"
        >
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Reasoning & Local Training Telemetry</span>
          </span>
          {showTelemetry ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTelemetry && (
          <div className="p-3 rounded-xl bg-slate-900 text-white text-[10px] font-mono space-y-1.5 mb-2.5 animate-in fade-in duration-150">
            <div className="flex justify-between text-emerald-300">
              <span>Model Architecture:</span>
              <span className="text-white">Gemini 1.5 Flash / Rule Regression</span>
            </div>
            <div className="flex justify-between text-emerald-300">
              <span>Diagnosis Labor Base:</span>
              <span className="text-white">{formatINR(estimate.itemized?.baseInspection)}</span>
            </div>
            <div className="flex justify-between text-emerald-300">
              <span>Locality Weight:</span>
              <span className="text-white">{estimate.itemized?.localityWeight}</span>
            </div>
            <div className="flex justify-between text-emerald-300">
              <span>Parts & Materials Note:</span>
              <span className="text-amber-300">{estimate.itemized?.partsNote}</span>
            </div>
            <div className="text-[9px] text-slate-400 border-t border-slate-800 pt-1">
              ✓ Grounded on historical verified jobs in {locality} with zero price-gouging constraints.
            </div>
          </div>
        )}
      </div>

      {/* Price Protection Guarantee Callout */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-emerald-200/80 text-[11px] text-emerald-900 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Verifix Price Guarantee:</strong> The provider cannot start work without your approval of the final quote on arrival.
        </span>
      </div>
    </div>
  );
}
