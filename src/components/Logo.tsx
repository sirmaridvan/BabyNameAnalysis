import React from 'react';

/** Yeni marka logosu (revize: sade, tema uyumlu). */
const Logo: React.FC<{ size?: number; variant?: 'auto' | 'light' | 'dark' }> = ({ size = 44, variant = 'auto' }) => {
  const mode = variant === 'auto' ? undefined : variant; // ileride sınıf bazlı tema kullanılabilir
  return (
    <a href="/" className={`site-logo ${mode ? 'logo-' + mode : ''}`} aria-label="İsim Analizi Ana Sayfa" title="İsim Analizi">
      <svg
        className="site-logo-mark"
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="iaRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="55%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <radialGradient id="iaSoft" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Outer gradient ring */}
        <circle cx="32" cy="32" r="30" fill="url(#iaRing)" opacity="0.3" />
        {/* Inner plate */}
        <circle cx="32" cy="32" r="22" fill="#fff" stroke="#e6e3de" strokeWidth="1.4" />
        {/* Soft glow */}
        <circle cx="32" cy="26" r="16" fill="url(#iaSoft)" />
        {/* Heart (naming love) */}
        <path className="logo-heart" d="M26.9 31.8c-1.7 1.9-1.5 5 .6 6.8 2.6 2.2 4.2 3.3 5.7 4.3.3.2.6.2.9 0 1.6-1 3.1-2.1 5.7-4.3 2.1-1.8 2.3-4.9.6-6.8-1.4-1.6-4.1-1.9-5.8-.4l-.5.5-.5-.5c-1.7-1.5-4.4-1.2-5.8.4Z" fill="#fda4af" transform="translate(32 36) scale(1.38) translate(-32 -36)" />
        {/* Pulse (büyüme yolu) */}
        <path className="logo-pulse" d="M15 39h10.2l2.4-6.6 3.6 9.6L36 35l2.5 4.4H49" fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Spark accent */}
        <path d="M44 22l1.4 3.2 3.2 1.4-3.2 1.4L44 31.2 42.6 28l-3.2-1.4 3.2-1.4L44 22Z" fill="#fbbf24" opacity="0.9" />
      </svg>
      <span className="site-logo-text">İsim<span>Analizi</span></span>
    </a>
  );
};

export default Logo;
