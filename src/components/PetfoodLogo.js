import React from 'react';

const DEFAULT_TAGLINE = 'Bien-être de l\'animal';

/**
 * Logo PetfoodTN — empreinte + wordmark (SVG intégré).
 */
const PetfoodLogo = ({
  size = 'md',
  showTagline = false,
  tagline = DEFAULT_TAGLINE,
  subtitle = null,
  variant = 'default',
  iconOnly = false,
}) => {
  const sizes = {
    xs: { icon: 32, title: 14, tag: 9, sub: 9, gap: 8 },
    sm: { icon: 36, title: 16, tag: 10, sub: 10, gap: 8 },
    md: { icon: 52, title: 22, tag: 11, sub: 10, gap: 12 },
    lg: { icon: 72, title: 28, tag: 12, sub: 11, gap: 14 },
    xl: { icon: 88, title: 34, tag: 13, sub: 12, gap: 16 },
  };
  const s = sizes[size] || sizes.md;
  const light = variant === 'light';
  const gradId = `pfLogoGrad-${size}-${variant}`;

  const icon = (
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
        <linearGradient id={gradId} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#c2410c" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#${gradId})`} />
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
      <path
        d="M32 48c-1.5 2.5-4.5 2.5-6 0 1.5-2 4.5-2 6 0z"
        fill="#fecaca"
        opacity="0.95"
      />
    </svg>
  );

  if (iconOnly) return icon;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
      {icon}
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
        {showTagline && tagline && (
          <div
            style={{
              fontSize: s.tag,
              fontWeight: 700,
              color: light ? 'rgba(255,255,255,0.9)' : '#0d9488',
              marginTop: 2,
              letterSpacing: '0.02em',
            }}
          >
            {tagline}
          </div>
        )}
        {subtitle && (
          <div
            style={{
              fontSize: s.sub,
              fontWeight: 500,
              color: light ? 'rgba(255,255,255,0.75)' : '#94a3b8',
              marginTop: showTagline && tagline ? 1 : 2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export { DEFAULT_TAGLINE };
export default PetfoodLogo;
