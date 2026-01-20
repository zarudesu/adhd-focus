'use client';

/**
 * BeatYour8 Logo - The Visual Metaphor
 *
 * A vertical figure-8 that breaks free into a dot.
 * Represents: Breaking the infinite loop of anxiety.
 */

import { cn } from '@/lib/utils';

interface BeatLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

export function BeatLogo({
  className,
  size = 'md',
}: BeatLogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(sizes[size], className)}
    >
      <defs>
        {/* Gradient - lighter on top */}
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8FFA0" />
          <stop offset="50%" stopColor="#D9F968" />
          <stop offset="100%" stopColor="#C4E84D" />
        </linearGradient>

        {/* Soft glow filter */}
        <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Top circle of 8 - smaller, ~40% of bottom */}
      <circle
        cx="60"
        cy="50"
        r="28"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="22"
        strokeLinecap="round"
        filter="url(#logoGlow)"
      />

      {/* Bottom circle of 8 - larger, overlapping at waist */}
      <circle
        cx="60"
        cy="120"
        r="50"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="22"
        strokeLinecap="round"
        filter="url(#logoGlow)"
      />

      {/* Tail - from 3 o'clock, horizontal right with slight curve */}
      <path
        d="M 108 120 Q 150 130, 175 95"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="22"
        strokeLinecap="round"
        filter="url(#logoGlow)"
      />

      {/* Escape dot - filled, at waist level right */}
      <circle
        cx="178"
        cy="85"
        r="26"
        fill="url(#logoGradient)"
        filter="url(#logoGlow)"
      />
    </svg>
  );
}
