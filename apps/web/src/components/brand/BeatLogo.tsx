'use client';

/**
 * BeatYour8 Logo
 *
 * A figure-8 that breaks free into a dot.
 * Represents: Breaking the infinite loop of anxiety.
 */

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BeatLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: { container: 'w-8 h-8', px: 32 },
  md: { container: 'w-12 h-12', px: 48 },
  lg: { container: 'w-24 h-24', px: 96 },
  xl: { container: 'w-32 h-32', px: 128 },
};

export function BeatLogo({
  className,
  size = 'md',
}: BeatLogoProps) {
  const sizeConfig = sizes[size];

  return (
    <div className={cn(sizeConfig.container, 'relative', className)}>
      <Image
        src="/logo.jpg"
        alt="beatyour8"
        width={sizeConfig.px}
        height={sizeConfig.px}
        className="rounded-xl object-cover"
        priority
      />
    </div>
  );
}
