'use client';

import React from 'react';

/**
 * DeepGuardIcon — High-Visibility Cyber Sentinel & Neural Network Emblem
 *
 * Represents DeepGuard AI:
 * 1. Heavy Aegis Cyber Shield perimeter (Network Intrusion Defense)
 * 2. Luminous Vertical Cyber Laser Scanner (Deep Packet Traffic Inspection)
 * 3. Central Quantum AI Nexus Diamond with 4 Cardinal Nodes (4-Layer PyTorch MLP)
 * 4. High-contrast solid geometry ensuring crisp visibility at 18px, 24px, 32px, 48px, and 72px.
 *
 * Status Variations:
 * - 'idle': Precision Cobalt Blue (#3b82f6) with steady 3.2s scanning laser
 * - 'scanning': High-speed cyan/blue sweep (1.2s) during live batch inference
 * - 'threat': Alert Crimson (#ef4444) with warning laser and red alert wave
 * - 'secure': Semantic Emerald (#22c55e) with calm green shield pulse
 */
export default function DeepGuardIcon({
  size = 24,
  status = 'idle',
  className = '',
  style = {},
  showScanner = true,
  showRadar = true,
  showPulse = true,
}) {
  const isScannerActive = showScanner && showRadar !== false;
  // Normalize size
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 18
      : size === 'md'
      ? 24
      : size === 'lg'
      ? 32
      : size === 'xl'
      ? 48
      : size === 'hero'
      ? 72
      : 24;

  // High-contrast, vivid color palettes for maximum visibility in dark and light modes
  const colorMap = {
    idle: {
      primary: '#2563eb', // Rich Cobalt
      secondary: '#60a5fa', // Electric Cyan/Sky
      dark: '#1d4ed8', // Deep Royal Blue
      bgTint: 'rgba(37, 99, 235, 0.12)',
      pulse: 'rgba(59, 130, 246, 0.35)',
      laserGlow: '#93c5fd',
    },
    scanning: {
      primary: '#0284c7', // Cyber Azure
      secondary: '#38bdf8', // Neon Sky
      dark: '#0369a1',
      bgTint: 'rgba(14, 165, 233, 0.16)',
      pulse: 'rgba(56, 189, 248, 0.45)',
      laserGlow: '#bae6fd',
    },
    threat: {
      primary: '#dc2626', // Alert Crimson
      secondary: '#f87171', // Light Coral
      dark: '#b91c1c',
      bgTint: 'rgba(239, 68, 68, 0.14)',
      pulse: 'rgba(239, 68, 68, 0.4)',
      laserGlow: '#fca5a5',
    },
    secure: {
      primary: '#16a34a', // Emerald
      secondary: '#4ade80', // Mint Green
      dark: '#15803d',
      bgTint: 'rgba(34, 197, 94, 0.14)',
      pulse: 'rgba(34, 197, 94, 0.4)',
      laserGlow: '#86efac',
    },
  };

  const themeColors = colorMap[status] || colorMap.idle;
  const isScanning = status === 'scanning';

  // Deterministic unique ID to prevent SVG gradient/clipPath collision across multiple instances
  const id = `dg-sentinel-${status}-${Math.floor(pixelSize)}`;

  return (
    <span
      className={`dg-sentinel-icon ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        position: 'relative',
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible', width: '100%', height: '100%' }}
      >
        <defs>
          {/* Bold, high-contrast shield contour gradient */}
          <linearGradient id={`${id}-shield-grad`} x1="15" y1="5" x2="85" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={themeColors.secondary} />
            <stop offset="50%" stopColor={themeColors.primary} />
            <stop offset="100%" stopColor={themeColors.dark} />
          </linearGradient>

          {/* Core diamond gradient */}
          <linearGradient id={`${id}-core-grad`} x1="40" y1="38" x2="60" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={themeColors.secondary} />
            <stop offset="100%" stopColor={themeColors.primary} />
          </linearGradient>

          {/* Luminous Horizontal Laser Beam Gradient */}
          <linearGradient id={`${id}-laser-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={themeColors.primary} stopOpacity="0" />
            <stop offset="20%" stopColor={themeColors.secondary} stopOpacity="0.85" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="80%" stopColor={themeColors.secondary} stopOpacity="0.85" />
            <stop offset="100%" stopColor={themeColors.primary} stopOpacity="0" />
          </linearGradient>

          {/* Laser vertical aura / glowing veil */}
          <linearGradient id={`${id}-laser-veil`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={themeColors.secondary} stopOpacity="0" />
            <stop offset="50%" stopColor={themeColors.primary} stopOpacity="0.3" />
            <stop offset="100%" stopColor={themeColors.secondary} stopOpacity="0" />
          </linearGradient>

          {/* Clip path: Confines the scanning laser strictly inside the shield boundary */}
          <clipPath id={`${id}-shield-clip`}>
            <path d="M 50 6 L 86 19 L 86 54 C 86 74 50 93 50 93 C 50 93 14 74 14 54 L 14 19 Z" />
          </clipPath>

          {/* Drop glow filter */}
          <filter id={`${id}-laser-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Ambient Defensive Shockwave Pulse */}
        {showPulse && (
          <path
            d="M 50 6 L 86 19 L 86 54 C 86 74 50 93 50 93 C 50 93 14 74 14 54 L 14 19 Z"
            fill="none"
            stroke={themeColors.pulse}
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="dg-shield-pulse-wave"
          />
        )}

        {/* 2. Solid High-Contrast Shield Body */}
        <path
          d="M 50 6 L 86 19 L 86 54 C 86 74 50 93 50 93 C 50 93 14 74 14 54 L 14 19 Z"
          fill={themeColors.bgTint}
          stroke={`url(#${id}-shield-grad)`}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dg-shield-border"
        />

        {/* 3. High-Visibility Cyber Laser Scanner (Contained within Shield) */}
        {isScannerActive && (
          <g clipPath={`url(#${id}-shield-clip)`}>
            <g className={isScanning ? 'dg-laser-fast' : 'dg-laser-steady'}>
              {/* Luminous aura veil */}
              <rect x="14" y="38" width="72" height="20" fill={`url(#${id}-laser-veil)`} />
              {/* Sharp, high-contrast laser line */}
              <line
                x1="16"
                y1="48"
                x2="84"
                y2="48"
                stroke={`url(#${id}-laser-grad)`}
                strokeWidth="3"
                strokeLinecap="round"
                filter={`url(#${id}-laser-glow)`}
              />
              {/* Ultra-bright photonic center pip */}
              <circle cx="50" cy="48" r="3.2" fill="#ffffff" filter={`url(#${id}-laser-glow)`} />
            </g>
          </g>
        )}

        {/* 4. Inner Nested Cyber Defense Matrix (Circuit Track) */}
        <path
          d="M 50 16 L 78 27 L 78 52 C 78 68 50 82 50 82 C 50 82 22 68 22 52 L 22 27 Z"
          fill="none"
          stroke={themeColors.primary}
          strokeWidth="2"
          strokeOpacity="0.5"
          strokeDasharray="5 3"
          className="dg-circuit-track"
        />

        {/* 5. Neural Network Conduits connecting Cardinal Nodes */}
        <line x1="50" y1="26" x2="50" y2="38" stroke={themeColors.secondary} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="50" y1="58" x2="50" y2="70" stroke={themeColors.secondary} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="32" y1="48" x2="40" y2="48" stroke={themeColors.secondary} strokeWidth="2.2" strokeLinecap="round" />
        <line x1="60" y1="48" x2="68" y2="48" stroke={themeColors.secondary} strokeWidth="2.2" strokeLinecap="round" />

        {/* 6. Cardinal Neural Nodes (Representing 4 MLP Layers) */}
        <circle cx="50" cy="26" r="3.4" fill={themeColors.secondary} className="dg-node-pulse-1" />
        <circle cx="50" cy="70" r="3.4" fill={themeColors.secondary} className="dg-node-pulse-2" />
        <circle cx="32" cy="48" r="3.4" fill={themeColors.secondary} className="dg-node-pulse-3" />
        <circle cx="68" cy="48" r="3.4" fill={themeColors.secondary} className="dg-node-pulse-4" />

        {/* 7. Central Quantum AI Nexus Diamond Core */}
        <g className="dg-nexus-core" style={{ transformOrigin: '50px 48px' }}>
          <path
            d="M 50 37 L 61 48 L 50 59 L 39 48 Z"
            fill={`url(#${id}-core-grad)`}
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Inner spark */}
          <circle cx="50" cy="48" r="2.2" fill="#ffffff" />
        </g>
      </svg>
    </span>
  );
}
