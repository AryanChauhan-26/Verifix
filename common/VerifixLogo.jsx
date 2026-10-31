import React from 'react';

/**
 * Verifix Brand Logo Component
 * Modern, minimal flat vector logo combining a location pin, verified checkmark, 
 * and subtle wrench curve with deep emerald green (#0B8F5A) and warm orange (#FF8A00).
 */
export default function VerifixLogo({ 
  size = 40, 
  showWordmark = true, 
  className = '' 
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Scalable Flat Vector Icon */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="Verifix Logo"
      >
        {/* Background / Pin Base */}
        <path 
          d="M50 8C30.1177 8 14 24.1177 14 44C14 65.5 44 90 48.5 93.5C49.4 94.2 50.6 94.2 51.5 93.5C56 90 86 65.5 86 44C86 24.1177 69.8823 8 50 8Z" 
          fill="#0B8F5A" 
        />
        
        {/* White Inner Checkmark + Wrench Curve */}
        {/* Verified Checkmark */}
        <path 
          d="M32 46L46 60L72 32" 
          stroke="white" 
          strokeWidth="9" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Subtle Wrench Jaw Accent (Top Left) */}
        <path 
          d="M35 25C30 29 28 35 29 41" 
          stroke="white" 
          strokeWidth="4.5" 
          strokeLinecap="round" 
        />
        <path 
          d="M34 23L40 29" 
          stroke="white" 
          strokeWidth="4.5" 
          strokeLinecap="round" 
        />

        {/* Warm Orange Accent Dot (#FF8A00) */}
        <circle 
          cx="28" 
          cy="66" 
          r="4.5" 
          fill="#FF8A00" 
          stroke="white" 
          strokeWidth="1.5" 
        />
      </svg>

      {/* Modern Rounded Sans-Serif Wordmark */}
      {showWordmark && (
        <span className="font-extrabold tracking-tight text-slate-900 font-sans text-xl leading-none">
          Veri<span className="text-[#0B8F5A]">fix</span>
        </span>
      )}
    </div>
  );
}
