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
      {/* Gradient definition */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Outer circle */}
      <circle
        cx="16"
        cy="16"
        r="14"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
      />

      {/* Inner zero/dust symbol */}
      <path
        d="M16 8C11.582 8 8 11.582 8 16C8 20.418 11.582 24 16 24C20.418 24 24 20.418 24 16C24 11.582 20.418 8 16 8ZM16 20C13.791 20 12 18.209 12 16C12 13.791 13.791 12 16 12C18.209 12 20 13.791 20 16C20 18.209 18.209 20 16 20Z"
        fill="url(#logoGradient)"
      />

      {/* Sweep arrow */}
      <path
        d="M22 10L26 14L22 18"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
