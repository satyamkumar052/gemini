import { useState, useEffect, useRef } from "react";

// ── Keyframe injection ──────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&family=Barlow+Condensed:wght@700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy:    #0a0f1e;
    --navy2:   #0d1426;
    --navy3:   #111827;
    --blue:    #3b82f6;
    --blue-lt: #60a5fa;
    --slate:   #64748b;
    --muted:   #94a3b8;
    --border:  #1e2d4a;
    --white:   #ffffff;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(36px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeRight {
    from { opacity: 0; transform: translateX(60px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.35; transform: scale(1); }
    50%       { opacity: 0.55; transform: scale(1.08); }
  }
  @keyframes scanLine {
    from { transform: translateY(-100%); }
    to   { transform: translateY(100vh); }
  }
  @keyframes floatCar {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes borderPulse {
    0%, 100% { border-color: rgba(59,130,246,0.15); }
    50%       { border-color: rgba(59,130,246,0.45); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes neonFlicker {
    0%,19%,21%,23%,25%,54%,56%,100% { text-shadow: 0 0 20px #3b82f680, 0 0 40px #3b82f640; }
    20%,24%,55% { text-shadow: none; }
  }

  .ic-root {
    background: var(--navy);
    font-family: 'Barlow', sans-serif;
    min-height: 100vh;
    overflow: hidden;
    color: var(--white);
    position: relative;
  }

  /* ── Background grid ── */
  .ic-grid-bg {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 0;
  }
  .ic-grid-fade {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, var(--navy) 100%);
    pointer-events: none;
    z-index: 1;
  }

  /* ── Scan line effect ── */
  .ic-scan {
    position: absolute;
    left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent);
    animation: scanLine 8s linear infinite;
    z-index: 2;
    pointer-events: none;
  }

  /* ══════════════════ NAV ══════════════════ */
  .ic-nav {
    position: sticky;
    top: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 56px;
    height: 68px;
    background: rgba(13,20,38,0.9);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    animation: fadeUp 0.6s ease both;
  }
  .ic-logo {
    font-style: italic;
    font-weight: 800;
    font-size: 22px;
    letter-spacing: -0.5px;
    color: var(--white);
    cursor: pointer;
  }
  .ic-nav-links {
    display: flex;
    gap: 44px;
  }
  .ic-nav-link {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 4px 0;
    position: relative;
    transition: color 0.2s;
  }
  .ic-nav-link:hover { color: var(--white); }
  .ic-nav-link.active {
    color: var(--blue);
  }
  .ic-nav-link.active::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0; right: 0;
    height: 2px;
    background: var(--blue);
    border-radius: 2px;
  }
  .ic-nav-right {
    display: flex;
    align-items: center;
    gap: 18px;
  }
  .ic-icon-btn {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    font-size: 20px;
    padding: 4px;
    transition: color 0.2s;
  }
  .ic-icon-btn:hover { color: var(--white); }
  .ic-cta {
    background: var(--blue);
    color: var(--white);
    border: none;
    border-radius: 6px;
    padding: 10px 26px;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .ic-cta:hover {
    background: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(59,130,246,0.35);
  }

  /* ══════════════════ HERO ══════════════════ */
  .ic-hero {
    position: relative;
    z-index: 10;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    min-height: calc(100vh - 68px);
    padding: 60px 56px;
    gap: 32px;
  }

  /* ── Left column ── */
  .ic-hero-left {
    max-width: 640px;
  }
  .ic-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(59,130,246,0.4);
    border-radius: 4px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2em;
    padding: 6px 14px;
    margin-bottom: 36px;
    background: rgba(59,130,246,0.05);
    animation: fadeUp 0.7s 0.1s ease both;
  }
  .ic-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--blue);
    box-shadow: 0 0 6px var(--blue);
  }

  .ic-hero-h1 {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: clamp(56px, 6.5vw, 88px);
    font-weight: 900;
    line-height: 0.95;
    letter-spacing: -0.02em;
    margin-bottom: 28px;
    animation: fadeUp 0.7s 0.2s ease both;
  }
  .ic-hero-white { color: var(--white); display: block; }
  .ic-hero-blue {
    color: var(--blue);
    display: block;
    animation: neonFlicker 6s 2s ease-in-out infinite;
  }

  .ic-hero-sub {
    color: var(--muted);
    font-size: 16px;
    line-height: 1.75;
    max-width: 460px;
    margin-bottom: 40px;
    animation: fadeUp 0.7s 0.3s ease both;
  }

  /* Stats row */
  .ic-stats {
    display: flex;
    gap: 0;
    margin-bottom: 44px;
    animation: fadeUp 0.7s 0.4s ease both;
  }
  .ic-stat {
    flex: 1;
    padding: 20px 24px;
    border-left: 1px solid var(--border);
  }
  .ic-stat:first-child { border-left: none; padding-left: 0; }
  .ic-stat-num {
    display: block;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 34px;
    font-weight: 900;
    color: var(--white);
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 6px;
  }
  .ic-stat-label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    color: var(--slate);
    letter-spacing: 0.15em;
  }

  /* Buttons */
  .ic-hero-btns {
    display: flex;
    gap: 16px;
    animation: fadeUp 0.7s 0.5s ease both;
  }
  .ic-btn-primary {
    background: var(--blue);
    color: var(--white);
    border: none;
    border-radius: 6px;
    padding: 14px 32px;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .ic-btn-primary:hover {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(59,130,246,0.4);
  }
  .ic-btn-ghost {
    background: transparent;
    color: var(--white);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 6px;
    padding: 14px 32px;
    font-family: 'Barlow', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s, transform 0.15s;
  }
  .ic-btn-ghost:hover {
    border-color: rgba(255,255,255,0.5);
    background: rgba(255,255,255,0.05);
    transform: translateY(-2px);
  }

  /* ── Right column / Car visual ── */
  .ic-hero-right {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    animation: fadeRight 0.9s 0.3s ease both;
  }

  .ic-car-frame {
    position: relative;
    width: 100%;
    max-width: 620px;
    aspect-ratio: 4/3;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid rgba(59,130,246,0.2);
    animation: borderPulse 4s ease-in-out infinite;
  }

  /* Dark garage background */
  .ic-car-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 40% at 50% 30%, #0a1628 0%, #050912 100%);
  }

  /* Neon ceiling lines */
  .ic-neon-lines {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  /* Floor reflection */
  .ic-floor {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 35%;
    background: linear-gradient(to top, rgba(10,22,48,0.9) 0%, transparent 100%);
  }

  /* Ambient glow behind car */
  .ic-car-glow {
    position: absolute;
    bottom: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 75%;
    height: 35%;
    background: radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%);
    animation: pulseGlow 3s ease-in-out infinite;
    filter: blur(20px);
  }

  /* Car SVG */
  .ic-car-svg-wrap {
    position: absolute;
    bottom: 12%;
    left: 50%;
    transform: translateX(-50%);
    width: 88%;
    animation: floatCar 4s ease-in-out infinite;
    filter: drop-shadow(0 20px 60px rgba(59,130,246,0.5));
  }

  /* Corner accents */
  .ic-corner {
    position: absolute;
    width: 20px; height: 20px;
    border-color: var(--blue);
    border-style: solid;
    opacity: 0.6;
  }
  .ic-corner-tl { top: 0; left: 0; border-width: 2px 0 0 2px; }
  .ic-corner-tr { top: 0; right: 0; border-width: 2px 2px 0 0; }
  .ic-corner-bl { bottom: 0; left: 0; border-width: 0 0 2px 2px; }
  .ic-corner-br { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

  /* HUD overlay chip */
  .ic-hud-chip {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(13,20,38,0.85);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(59,130,246,0.3);
    border-radius: 8px;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    animation: fadeUp 1.2s 0.8s ease both;
  }
  .ic-hud-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 8px #22c55e;
    flex-shrink: 0;
  }
  .ic-hud-label { color: var(--muted); font-size: 10px; letter-spacing: 0.1em; }
  .ic-hud-val { color: var(--white); font-weight: 700; font-size: 13px; }

  /* Spec chip top-right */
  .ic-spec-chip {
    position: absolute;
    top: 16px;
    right: 16px;
    background: rgba(13,20,38,0.8);
    backdrop-filter: blur(8px);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.1em;
    font-weight: 600;
    animation: fadeUp 1.2s 1s ease both;
  }
  .ic-spec-chip span { color: var(--white); font-weight: 700; }

  /* Responsive */
  @media (max-width: 1024px) {
    .ic-hero { grid-template-columns: 1fr; padding: 48px 32px; }
    .ic-hero-right { justify-content: center; }
    .ic-car-frame { max-width: 100%; }
    .ic-nav { padding: 0 32px; }
  }
  @media (max-width: 640px) {
    .ic-nav-links { display: none; }
    .ic-hero { padding: 32px 20px; }
    .ic-stats { flex-wrap: wrap; gap: 8px; }
  }
`;

// ── SVG Car (sleek supercar profile) ────────────────────────────────────────
function CarSVG() {
  return (
    <svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" width="100%">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a3a6e" />
          <stop offset="40%" stopColor="#0f2348" />
          <stop offset="100%" stopColor="#060e20" />
        </linearGradient>
        <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e4080" />
          <stop offset="100%" stopColor="#0c1e44" />
        </linearGradient>
        <linearGradient id="windowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a3668" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#071428" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="floorRefl" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Floor shadow */}
      <ellipse cx="300" cy="250" rx="220" ry="16" fill="rgba(0,0,0,0.5)" />

      {/* Body lower */}
      <path
        d="M 60 210 L 62 195 Q 70 185 90 182 L 130 178 L 155 148 Q 180 120 230 110 L 290 106 Q 350 104 390 112 L 440 130 Q 470 142 485 160 L 510 185 L 540 188 Q 550 190 552 198 L 554 210 Z"
        fill="url(#bodyGrad)"
        stroke="rgba(59,130,246,0.3)"
        strokeWidth="1.5"
      />

      {/* Body skirt / lower trim */}
      <path
        d="M 75 210 L 554 210 L 548 218 Q 500 224 300 224 Q 100 224 58 218 Z"
        fill="#08122a"
        stroke="rgba(59,130,246,0.2)"
        strokeWidth="1"
      />

      {/* Roof */}
      <path
        d="M 220 110 Q 240 72 280 60 Q 318 50 360 60 L 400 80 L 430 110 Z"
        fill="url(#roofGrad)"
        stroke="rgba(59,130,246,0.25)"
        strokeWidth="1"
      />

      {/* Windshield */}
      <path
        d="M 225 108 Q 248 72 282 62 Q 316 54 354 64 L 390 84 L 420 108 Z"
        fill="url(#windowGrad)"
        stroke="rgba(100,160,255,0.3)"
        strokeWidth="1"
        filter="url(#glow)"
      />

      {/* Side windows */}
      <path
        d="M 230 110 L 218 138 L 290 136 L 300 108 Z"
        fill="url(#windowGrad)"
        stroke="rgba(100,160,255,0.2)"
        strokeWidth="1"
      />
      <path
        d="M 308 107 L 304 136 L 360 135 L 375 110 Z"
        fill="url(#windowGrad)"
        stroke="rgba(100,160,255,0.2)"
        strokeWidth="1"
      />

      {/* Rear spoiler */}
      <path d="M 490 162 L 555 156 L 556 163 L 491 170 Z" fill="#0d1e3c" stroke="rgba(59,130,246,0.4)" strokeWidth="1" />
      <rect x="546" y="148" width="8" height="22" rx="2" fill="#0a1628" stroke="rgba(59,130,246,0.5)" strokeWidth="1" />

      {/* Front bumper scoop */}
      <path d="M 60 195 L 70 188 L 90 186 L 88 195 Z" fill="#060e20" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />

      {/* Body accent line */}
      <path d="M 160 150 Q 280 138 430 148" stroke="rgba(59,130,246,0.5)" strokeWidth="1.5" fill="none" />

      {/* FRONT WHEEL */}
      <circle cx="148" cy="218" r="38" fill="#070c1a" stroke="rgba(59,130,246,0.4)" strokeWidth="2.5" />
      <circle cx="148" cy="218" r="28" fill="#0a1020" stroke="rgba(100,160,255,0.3)" strokeWidth="1.5" />
      <circle cx="148" cy="218" r="18" fill="#0d1428" />
      {/* Spokes */}
      {[0,60,120,180,240,300].map((a,i)=>(
        <line key={i} x1={148+Math.cos(a*Math.PI/180)*8} y1={218+Math.sin(a*Math.PI/180)*8}
          x2={148+Math.cos(a*Math.PI/180)*26} y2={218+Math.sin(a*Math.PI/180)*26}
          stroke="rgba(100,160,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
      ))}
      <circle cx="148" cy="218" r="6" fill="#3b82f6" filter="url(#glow)" />
      {/* Brake caliper (orange accent like original) */}
      <path d="M 120 228 L 125 240 L 135 238 L 130 226 Z" fill="#f97316" opacity="0.8" />

      {/* REAR WHEEL */}
      <circle cx="450" cy="218" r="38" fill="#070c1a" stroke="rgba(59,130,246,0.4)" strokeWidth="2.5" />
      <circle cx="450" cy="218" r="28" fill="#0a1020" stroke="rgba(100,160,255,0.3)" strokeWidth="1.5" />
      <circle cx="450" cy="218" r="18" fill="#0d1428" />
      {[0,60,120,180,240,300].map((a,i)=>(
        <line key={i} x1={450+Math.cos(a*Math.PI/180)*8} y1={218+Math.sin(a*Math.PI/180)*8}
          x2={450+Math.cos(a*Math.PI/180)*26} y2={218+Math.sin(a*Math.PI/180)*26}
          stroke="rgba(100,160,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
      ))}
      <circle cx="450" cy="218" r="6" fill="#3b82f6" filter="url(#glow)" />
      <path d="M 422 228 L 427 240 L 437 238 L 432 226 Z" fill="#f97316" opacity="0.8" />

      {/* Front headlight strip */}
      <path d="M 62 188 L 80 183 L 82 192 L 64 196 Z" fill="#93c5fd" filter="url(#glow)" opacity="0.95" />
      <path d="M 64 185 L 80 180 L 81 184 L 65 188 Z" fill="white" opacity="0.4" />

      {/* Rear light */}
      <path d="M 537 183 L 552 180 L 553 192 L 538 194 Z" fill="#ef4444" filter="url(#glow)" opacity="0.85" />

      {/* Under-car LED glow */}
      <ellipse cx="300" cy="230" rx="180" ry="6" fill="rgba(59,130,246,0.15)" filter="url(#softGlow)" />

      {/* Floor reflection */}
      <path
        d="M 80 245 Q 300 238 520 245 L 520 265 Q 300 270 80 265 Z"
        fill="url(#floorRefl)"
        opacity="0.4"
      />
    </svg>
  );
}

// ── Neon ceiling lines SVG ───────────────────────────────────────────────────
function NeonLines() {
  return (
    <svg viewBox="0 0 620 370" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="nl">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Main ceiling strip left */}
      <line x1="80" y1="0" x2="180" y2="370" stroke="rgba(150,220,255,0.5)" strokeWidth="3" filter="url(#nl)" />
      <line x1="82" y1="0" x2="182" y2="370" stroke="white" strokeWidth="0.5" opacity="0.6" />
      {/* Main ceiling strip right */}
      <line x1="540" y1="0" x2="440" y2="370" stroke="rgba(150,220,255,0.5)" strokeWidth="3" filter="url(#nl)" />
      <line x1="538" y1="0" x2="438" y2="370" stroke="white" strokeWidth="0.5" opacity="0.6" />
      {/* Center overhead strip */}
      <line x1="310" y1="0" x2="310" y2="120" stroke="rgba(150,220,255,0.35)" strokeWidth="5" filter="url(#nl)" />
      <line x1="310" y1="0" x2="310" y2="120" stroke="white" strokeWidth="1" opacity="0.5" />
      {/* Subtle secondary */}
      <line x1="200" y1="0" x2="250" y2="180" stroke="rgba(100,180,255,0.2)" strokeWidth="2" filter="url(#nl)" />
      <line x1="420" y1="0" x2="370" y2="180" stroke="rgba(100,180,255,0.2)" strokeWidth="2" filter="url(#nl)" />
      {/* Floor lines */}
      <line x1="0" y1="310" x2="620" y2="310" stroke="rgba(59,130,246,0.15)" strokeWidth="1.5" />
      <line x1="0" y1="330" x2="620" y2="330" stroke="rgba(59,130,246,0.08)" strokeWidth="1" />
    </svg>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function Carlandingpage() {
  const [active, setActive] = useState("DRIVE");
  const [visible, setVisible] = useState(false);
  const styleRef = useRef(null);

  useEffect(() => {
    if (!document.getElementById("ic-styles")) {
      const el = document.createElement("style");
      el.id = "ic-styles";
      el.textContent = CSS;
      document.head.appendChild(el);
    }
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="ic-root">
      <div className="ic-grid-bg" />
      <div className="ic-grid-fade" />
      <div className="ic-scan" />

      {/* ── NAV ── */}
      <nav className="ic-nav">
        <span className="ic-logo">IntelliCar</span>
        <div className="ic-nav-links">
          {["DRIVE", "FLEET", "INTELLIGENCE", "SUPPORT"].map(l => (
            <button
              key={l}
              className={`ic-nav-link${active === l ? " active" : ""}`}
              onClick={() => setActive(l)}
            >{l}</button>
          ))}
        </div>
        <div className="ic-nav-right">
          <button className="ic-icon-btn" title="Account">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>
          <button className="ic-cta">GET STARTED</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="ic-hero">

        {/* Left */}
        <div className="ic-hero-left">
          <div className="ic-badge">
            <span className="ic-badge-dot" />
            FUTURE OF OWNERSHIP
          </div>

          <h1 className="ic-hero-h1">
            <span className="ic-hero-white">Own Smarter.</span>
            <span className="ic-hero-blue">Drive<br />Confident.</span>
          </h1>

          <p className="ic-hero-sub">
            The premium digital ecosystem for high-performance vehicle management.
            AI-driven insights, document vaults, and proactive reminders in one seamless cockpit.
          </p>

          {/* Stats */}
          <div className="ic-stats">
            {[
              { num: "10K+", label: "CARS MANAGED" },
              { num: "50K+", label: "DOCUMENTS STORED" },
              { num: "99.9%", label: "UPTIME SLA" },
            ].map(s => (
              <div className="ic-stat" key={s.label}>
                <span className="ic-stat-num">{s.num}</span>
                <span className="ic-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="ic-hero-btns">
            <button className="ic-btn-primary">EXPLORE FLEET</button>
            <button className="ic-btn-ghost">WATCH DEMO</button>
          </div>
        </div>

        {/* Right – Car Visual */}
        <div className="ic-hero-right">
          <div className="ic-car-frame">
            <div className="ic-car-bg" />
            <NeonLines />
            <div className="ic-floor" />
            <div className="ic-car-glow" />

            <div className="ic-car-svg-wrap">
              <CarSVG />
            </div>

            {/* Corner accents */}
            <div className="ic-corner ic-corner-tl" />
            <div className="ic-corner ic-corner-tr" />
            <div className="ic-corner ic-corner-bl" />
            <div className="ic-corner ic-corner-br" />

            {/* HUD chip bottom-left */}
            <div className="ic-hud-chip">
              <span className="ic-hud-dot" />
              <div>
                <div className="ic-hud-label">SYSTEM STATUS</div>
                <div className="ic-hud-val">All Systems Active</div>
              </div>
            </div>

            {/* Spec chip top-right */}
            <div className="ic-spec-chip">
              MODEL S PLAID · <span>2024</span>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}