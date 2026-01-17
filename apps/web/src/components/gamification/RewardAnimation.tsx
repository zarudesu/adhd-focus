'use client';

/**
 * Reward Animation Component
 * Sci-Fi / High-Tech visual effects for task completion
 */

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { RewardRarity } from '@/hooks/useGamification';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  angle?: number;
  distance?: number;
}

interface RewardAnimationProps {
  effect: string;
  rarity: RewardRarity;
  onComplete?: () => void;
}

// Sci-Fi color palettes by rarity
const RARITY_COLORS = {
  common: ['#00ff88', '#00ffcc', '#88ffcc'],
  uncommon: ['#00ccff', '#0088ff', '#00ffff', '#44aaff'],
  rare: ['#ff00ff', '#cc00ff', '#ff44ff', '#aa00ff'],
  legendary: ['#ffaa00', '#ff6600', '#ffcc00', '#ff8800'],
  mythic: ['#ff0044', '#ff0088', '#ffffff', '#ffcc00', '#00ffff'],
};

// Generate random particles
function generateParticles(count: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 2,
    angle: Math.random() * 360,
    distance: 50 + Math.random() * 150,
  }));
}

// Individual effect components
function SparkleEffect({ colors }: { colors: string[] }) {
  const particles = generateParticles(30, colors);

  return (
    <div className="reward-sparkle">
      {particles.map((p) => (
        <div
          key={p.id}
          className="sparkle-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function GlitchEffect({ colors }: { colors: string[] }) {
  return (
    <div className="reward-glitch">
      <div className="glitch-overlay glitch-1" style={{ backgroundColor: colors[0] }} />
      <div className="glitch-overlay glitch-2" style={{ backgroundColor: colors[1] }} />
      <div className="glitch-scanlines" />
      <div className="glitch-text">TASK COMPLETE</div>
    </div>
  );
}

function PortalEffect({ colors }: { colors: string[] }) {
  return (
    <div className="reward-portal">
      <div className="portal-ring ring-1" style={{ borderColor: colors[0] }} />
      <div className="portal-ring ring-2" style={{ borderColor: colors[1] }} />
      <div className="portal-ring ring-3" style={{ borderColor: colors[2] || colors[0] }} />
      <div className="portal-center" style={{ backgroundColor: colors[0] }} />
      <div className="portal-particles">
        {generateParticles(20, colors).map((p) => (
          <div
            key={p.id}
            className="portal-particle"
            style={{
              '--angle': `${p.angle}deg`,
              '--distance': `${p.distance}px`,
              '--delay': `${p.delay}s`,
              '--color': p.color,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}

function WarpEffect({ colors }: { colors: string[] }) {
  const lines = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    angle: (i / 50) * 360,
    delay: Math.random() * 0.3,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="reward-warp">
      {lines.map((line) => (
        <div
          key={line.id}
          className="warp-line"
          style={{
            '--angle': `${line.angle}deg`,
            '--delay': `${line.delay}s`,
            '--color': line.color,
          } as React.CSSProperties}
        />
      ))}
      <div className="warp-flash" />
    </div>
  );
}

function DataStreamEffect({ colors }: { colors: string[] }) {
  const streams = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    speed: 1 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="reward-datastream">
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="data-column"
          style={{
            left: `${stream.x}%`,
            animationDelay: `${stream.delay}s`,
            animationDuration: `${stream.speed}s`,
            color: stream.color,
            textShadow: `0 0 10px ${stream.color}`,
          }}
        >
          {Array.from({ length: 20 }, () =>
            String.fromCharCode(0x30A0 + Math.random() * 96)
          ).join('')}
        </div>
      ))}
    </div>
  );
}

function HexGridEffect({ colors }: { colors: string[] }) {
  const hexes = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 1,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="reward-hexgrid">
      {hexes.map((hex) => (
        <div
          key={hex.id}
          className="hex-cell"
          style={{
            left: `${hex.x}%`,
            top: `${hex.y}%`,
            animationDelay: `${hex.delay}s`,
            borderColor: hex.color,
            boxShadow: `0 0 20px ${hex.color}, inset 0 0 20px ${hex.color}40`,
          }}
        />
      ))}
    </div>
  );
}

function CircuitEffect({ colors }: { colors: string[] }) {
  return (
    <div className="reward-circuit">
      <svg viewBox="0 0 400 400" className="circuit-svg">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Circuit paths */}
        <path
          className="circuit-path path-1"
          d="M200,200 L200,50 L350,50 L350,150"
          stroke={colors[0]}
          filter="url(#glow)"
        />
        <path
          className="circuit-path path-2"
          d="M200,200 L50,200 L50,350 L150,350"
          stroke={colors[1]}
          filter="url(#glow)"
        />
        <path
          className="circuit-path path-3"
          d="M200,200 L350,350"
          stroke={colors[2] || colors[0]}
          filter="url(#glow)"
        />
        {/* Nodes */}
        <circle className="circuit-node node-1" cx="200" cy="200" r="8" fill={colors[0]} />
        <circle className="circuit-node node-2" cx="350" cy="150" r="6" fill={colors[1]} />
        <circle className="circuit-node node-3" cx="150" cy="350" r="6" fill={colors[2] || colors[0]} />
      </svg>
    </div>
  );
}

function EnergyWaveEffect({ colors }: { colors: string[] }) {
  return (
    <div className="reward-energy">
      <div className="energy-wave wave-1" style={{ borderColor: colors[0] }} />
      <div className="energy-wave wave-2" style={{ borderColor: colors[1] }} />
      <div className="energy-wave wave-3" style={{ borderColor: colors[2] || colors[0] }} />
      <div className="energy-core" style={{ backgroundColor: colors[0] }} />
    </div>
  );
}

function HologramEffect({ colors }: { colors: string[] }) {
  return (
    <div className="reward-hologram">
      <div className="hologram-container">
        <div className="hologram-check" style={{ color: colors[0] }}>✓</div>
        <div className="hologram-scanline" />
        <div className="hologram-flicker" />
      </div>
      <div className="hologram-base" style={{ borderColor: colors[0] }} />
    </div>
  );
}

function PlasmaEffect({ colors }: { colors: string[] }) {
  return (
    <div className="reward-plasma">
      <div className="plasma-blob blob-1" style={{ background: `radial-gradient(circle, ${colors[0]}80, transparent)` }} />
      <div className="plasma-blob blob-2" style={{ background: `radial-gradient(circle, ${colors[1]}80, transparent)` }} />
      <div className="plasma-blob blob-3" style={{ background: `radial-gradient(circle, ${colors[2] || colors[0]}80, transparent)` }} />
    </div>
  );
}

function QuantumEffect({ colors }: { colors: string[] }) {
  const orbitals = [1, 2, 3];
  return (
    <div className="reward-quantum">
      {orbitals.map((i) => (
        <div
          key={i}
          className={`quantum-orbital orbital-${i}`}
          style={{ borderColor: colors[i - 1] || colors[0] }}
        >
          <div className="quantum-electron" style={{ backgroundColor: colors[i - 1] || colors[0] }} />
        </div>
      ))}
      <div className="quantum-nucleus" style={{ backgroundColor: colors[0] }} />
    </div>
  );
}

function TakeoverEffect({ colors }: { colors: string[] }) {
  return (
    <div className="reward-takeover">
      <DataStreamEffect colors={colors} />
      <div className="takeover-flash" />
      <div className="takeover-text">
        <span style={{ color: colors[0] }}>SYSTEM</span>
        <span style={{ color: colors[1] }}>UPGRADED</span>
      </div>
    </div>
  );
}

// Effect map
const EFFECTS: Record<string, React.FC<{ colors: string[] }>> = {
  sparkle: SparkleEffect,
  wave: EnergyWaveEffect,
  star: SparkleEffect,
  glow: EnergyWaveEffect,
  glitch: GlitchEffect,
  rainbow: PlasmaEffect,
  music: HexGridEffect,
  fire: PlasmaEffect,
  crystal: HexGridEffect,
  portal: PortalEffect,
  creature: QuantumEffect,
  fireworks: SparkleEffect,
  warp: WarpEffect,
  stars: WarpEffect,
  unicorn: HologramEffect,
  volcano: PlasmaEffect,
  invert: GlitchEffect,
  rocket: WarpEffect,
  aurora: EnergyWaveEffect,
  takeover: TakeoverEffect,
  golden: CircuitEffect,
  eye: QuantumEffect,
};

export function RewardAnimation({ effect, rarity, onComplete }: RewardAnimationProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  const colors = RARITY_COLORS[rarity] || RARITY_COLORS.common;
  const EffectComponent = EFFECTS[effect] || SparkleEffect;

  // Duration based on rarity
  const duration = {
    common: 1500,
    uncommon: 2000,
    rare: 2500,
    legendary: 3000,
    mythic: 4000,
  }[rarity] || 2000;

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const handleClick = useCallback(() => {
    setVisible(false);
    setTimeout(() => onComplete?.(), 300);
  }, [onComplete]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`reward-animation-overlay ${visible ? 'visible' : 'hidden'} rarity-${rarity}`}
      onClick={handleClick}
    >
      <EffectComponent colors={colors} />
      <div className="reward-rarity-badge" style={{ color: colors[0] }}>
        {rarity.toUpperCase()}
      </div>
    </div>,
    document.body
  );
}
