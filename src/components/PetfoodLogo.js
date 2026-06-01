import React from 'react';

/**
 * Logo PetfoodTN — icône + wordmark (SVG, pas de fichier externe requis).
 */
const PetfoodLogo = ({ size = 'md', showTagline = false, variant = 'default' }) => {
  const sizes = {
    sm: { icon: 36, title: 16, tag: 10, gap: 8 },
    md: { icon: 52, title: 22, tag: 11, gap: 12 },
    lg: { icon: 72, title: 28, tag: 12, gap: 14 },
    xl: { icon: 88, title: 34, tag: 13, gap: 16 },
  };
  const s = sizes[size] || sizes.md;
  const light = variant === 'light';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{ flexShrink: 0, filter: 'drop-shadow(0 4px 12px rgba(230,126,34,0.35))' }}
      >
        <defs>
          <linearGradient id="pfLogoGrad" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f97316" />
            <stop offset="1" stopColor="#c2410c" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#pfLogoGrad)" />
        <ellipse cx="22" cy="24" rx="5" ry="6" fill="white" opacity="0.95" />
        <ellipse cx="42" cy="24" rx="5" ry="6" fill="white" opacity="0.95" />
        <ellipse cx="32" cy="34" rx="6" ry="5" fill="white" opacity="0.95" />
        <ellipse cx="16" cy="36" rx="4" ry="5" fill="white" opacity="0.85" />
        <ellipse cx="48" cy="36" rx="4" ry="5" fill="white" opacity="0.85" />
        <path
          d="M26 44c2 4 10 4 12 0"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
      </svg>
      <div>
        <div
          style={{
            fontSize: s.title,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: light ? '#fff' : '#1e293b',
          }}
        >
          Petfood<span style={{ color: light ? '#fde68a' : '#ea580c' }}>TN</span>
        </div>
        {showTagline && (
          <div
            style={{
              fontSize: s.tag,
              fontWeight: 600,
              color: light ? 'rgba(255,255,255,0.85)' : '#64748b',
              marginTop: 2,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Nutrition & bien-être animal
          </div>
        )}
      </div>
    </div>
  );
};

export default PetfoodLogo;
