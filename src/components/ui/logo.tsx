'use client';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="logoGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>

      {/* Background circle with gradient */}
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="url(#logoGradient)"
        opacity="0.1"
      />

      {/* Outer ring */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
      />

      {/* Inner zero/donut - representing "zero" */}
      <circle
        cx="16"
        cy="16"
        r="7"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        fill="none"
      />

      {/* Center dot - representing "dust" being swept */}
      <circle
        cx="16"
        cy="16"
        r="2"
        fill="url(#logoGradient)"
      />

      {/* Sweep indicator - small arc showing motion */}
      <path
        d="M23 9C25.5 11.5 27 15 27 16"
        stroke="url(#logoGradientLight)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}
