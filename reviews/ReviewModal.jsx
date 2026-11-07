import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Star, Repeat, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export default function ReviewModal({ provider, onClose }) {
  const { submitReview, t, language } = useApp();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [wouldHireAgain, setWouldHireAgain] = useState(true);

  const handleSubmit = () => {
    submitReview({
      rating,
      comment,
      wouldHireAgain
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 text-center">
        
        {/* Top Header */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider Photo & Name */}
        <div className="flex flex-col items-center -mt-2 mb-3">
          <img
            src={provider?.avatar}
            alt={provider?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20 mb-2 shadow-md"
          />
          <h3 className="font-extrabold text-base text-slate-900">{provider?.name}</h3>
          <p className="text-xs text-slate-500 capitalize">{provider?.category} Specialist</p>
        </div>

        {/* 1-5 Star Selection */}
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 transition-transform active:scale-125"
            >
              <Star
                className={`w-8 h-8 ${
                  (hoverRating || rating) >= star
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-200'
                } transition-colors`}
              />
            </button>
          ))}
        </div>

        {/* Written Review */}
        <div className="mb-4 text-left">
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the work? Honest feedback helps other local residents..."
            className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-slate-50"
          />
        </div>

        {/* Core Differentiator: "Would hire again" Toggle */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 mb-5 text-left flex items-start gap-3">
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setWouldHireAgain(!wouldHireAgain)}
              className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                wouldHireAgain
                  ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                  : 'bg-white border-slate-300'
              }`}
            >
              {wouldHireAgain && <CheckCircle2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex-1 cursor-pointer" onClick={() => setWouldHireAgain(!wouldHireAgain)}>
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950">
              <Repeat className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('wouldHireAgainPrompt')}</span>
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5 leading-tight">
              {t('wouldHireAgainDesc')}
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-700/25 active:scale-95 transition"
        >
          {t('submitReviewBtn')}
        </button>
      </div>
    </div>
  );
}
