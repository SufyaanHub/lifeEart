import React, { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────
   Keyframes
───────────────────────────────────────────── */
const STYLES = `
  @keyframes fs-float       { 0%,100%{transform:translateY(0) translateX(0)}50%{transform:translateY(-12px) translateX(4px)} }
  @keyframes fs-bubble      { 0%{opacity:.7;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-120px) scale(.4)} }
  @keyframes fs-glow        { 0%,100%{opacity:.5}50%{opacity:1} }
  @keyframes fs-proton      { 0%{transform:translateX(-100%);opacity:0}20%{opacity:1}80%{opacity:1}100%{transform:translateX(100%);opacity:0} }
  @keyframes fs-pulse       { 0%,100%{box-shadow:0 0 20px rgba(6,182,212,.3)}50%{box-shadow:0 0 40px rgba(6,182,212,.6)} }
  @keyframes fs-lightning   { 0%{opacity:1}10%{opacity:0}12%{opacity:.8}14%{opacity:0}100%{opacity:0} }
  @keyframes fs-fadeUp      { from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)} }
  @keyframes fs-shimmer     { 0%{background-position:-200% 0}100%{background-position:200% 0} }
  @keyframes fs-cellForm    { 0%{r:0;opacity:0}50%{r:8;opacity:.6}100%{r:6;opacity:.4} }
  @keyframes fs-mineralGlow { 0%,100%{filter:drop-shadow(0 0 8px rgba(6,182,212,.4))}50%{filter:drop-shadow(0 0 20px rgba(6,182,212,.8))} }
  @keyframes fs-gradient    { 0%{stop-opacity:.1}50%{stop-opacity:.6}100%{stop-opacity:.1} }
  @keyframes fs-sunFade     { 0%{opacity:.6}30%{opacity:.8}100%{opacity:0;transform:translateY(-50px)} }
  .fs-visible               { animation: fs-fadeUp .9s cubic-bezier(.22,1,.36,1) forwards; }
`;

/* ─────────────────────────────────────────────
   Water Flow Video URL (royalty-free)
───────────────────────────────────────────── */
const WATER_VIDEO_URL = 'https://videos.pexels.com/video-files/1918465/1918465-uhd_2560_1440_24fps.mp4';

/* ─────────────────────────────────────────────
   Water Particle Canvas
───────────────────────────────────────────── */
function useWaterCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;

    const particles = [];
    const bubbles = [];
    const PARTICLE_COUNT = 180;
    const BUBBLE_COUNT = 25;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // init particles (flowing water)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * (W / window.devicePixelRatio),
        y: Math.random() * (H / window.devicePixelRatio),
        vx: 0.15 + Math.random() * 0.35,
        vy: (Math.random() - 0.5) * 0.2,
        r: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.35,
      });
    }

    // init bubbles
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      bubbles.push({
        x: Math.random() * (W / window.devicePixelRatio),
        y: (H / window.devicePixelRatio) + Math.random() * 100,
        r: 2 + Math.random() * 5,
        speed: 0.3 + Math.random() * 0.5,
        wobble: Math.random() * Math.PI * 2,
        alpha: 0.2 + Math.random() * 0.3,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W / window.devicePixelRatio, H / window.devicePixelRatio);

      // water particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy + Math.sin(Date.now() * 0.001 + p.x * 0.01) * 0.15;
        if (p.x > W / window.devicePixelRatio + 10) p.x = -10;
        if (p.y < -10) p.y = H / window.devicePixelRatio + 10;
        if (p.y > H / window.devicePixelRatio + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
        ctx.fill();
      });

      // bubbles
      bubbles.forEach((b) => {
        b.y -= b.speed;
        b.x += Math.sin(b.wobble + Date.now() * 0.002) * 0.3;
        b.wobble += 0.02;
        if (b.y < -20) {
          b.y = H / window.devicePixelRatio + 20;
          b.x = Math.random() * (W / window.devicePixelRatio);
        }

        // bubble glow
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2);
        grad.addColorStop(0, `rgba(6, 182, 212, ${b.alpha})`);
        grad.addColorStop(0.5, `rgba(6, 182, 212, ${b.alpha * 0.5})`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // bubble outline
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${b.alpha + 0.2})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // draw connection lines between close particles (water refraction effect)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.08 * (1 - dist / 60)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}

/* ─────────────────────────────────────────────
   SVG: Molecular Diagrams & Primitive Cells
───────────────────────────────────────────── */
const MolecularDiagrams = () => (
  <svg viewBox="0 0 300 200" fill="none" className="absolute inset-0 w-full h-full">
    <defs>
      <linearGradient id="molBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0f172a" />
        <stop offset="50%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0c4a6e" />
      </linearGradient>
      <filter id="molGlow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <radialGradient id="cellGrad">
        <stop offset="0%" stopColor="rgba(6,182,212,.3)" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect width="300" height="200" fill="url(#molBg)" />
    
    {/* Glowing cell formations */}
    {[[60, 80], [120, 50], [200, 90], [250, 60], [80, 140], [180, 160], [240, 130]].map(([cx, cy], i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r="18" fill="url(#cellGrad)" style={{ animation: `fs-glow ${2 + i * 0.3}s ease-in-out infinite ${i * 0.5}s` }} />
        <circle
          cx={cx}
          cy={cy}
          r="0"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          filter="url(#molGlow)"
          style={{ animation: `fs-cellForm ${3 + i * 0.5}s ease-in-out infinite ${i * 0.7}s` }}
        />
      </g>
    ))}
    
    {/* Molecular bonds with glow */}
    {[[40, 100, 70, 85], [150, 70, 180, 55], [220, 110, 250, 95], [100, 150, 130, 165]].map(([x1, y1, x2, y2], i) => (
      <g key={i}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0ea5e9" strokeWidth="2" strokeDasharray="6 3" filter="url(#molGlow)" />
        <circle cx={x1} cy={y1} r="6" fill="#06b6d4" filter="url(#molGlow)" />
        <circle cx={x2} cy={y2} r="5" fill="#3b82f6" filter="url(#molGlow)" />
        <circle cx={x1} cy={y1} r="3" fill="#67e8f9" />
        <circle cx={x2} cy={y2} r="2.5" fill="#93c5fd" />
      </g>
    ))}
    
    {/* DNA-like helix hint */}
    <path d="M130 30 Q150 50 130 70 Q110 90 130 110 Q150 130 130 150" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeOpacity="0.6" filter="url(#molGlow)" />
    <path d="M145 30 Q125 50 145 70 Q165 90 145 110 Q125 130 145 150" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.6" filter="url(#molGlow)" />
    
    {/* Question mark molecules */}
    <text x="270" y="35" fill="#22d3ee" fontSize="16" fontWeight="bold" opacity="0.7" style={{ animation: 'fs-glow 2s ease-in-out infinite' }}>?</text>
    <text x="25" y="180" fill="#22d3ee" fontSize="14" fontWeight="bold" opacity="0.6" style={{ animation: 'fs-glow 2.5s ease-in-out infinite 0.5s' }}>?</text>
  </svg>
);

/* ─────────────────────────────────────────────
   SVG: Lightning & Sun (Fading Instability)
───────────────────────────────────────────── */
// Pre-computed spark positions for pure rendering
const SPARK_POSITIONS = [
  { cx: 45, cy: 85, r: 2.2, dur: 1.8, delay: 0.5 },
  { cx: 120, cy: 110, r: 1.5, dur: 2.1, delay: 1.2 },
  { cx: 180, cy: 75, r: 2.8, dur: 1.6, delay: 0.3 },
  { cx: 230, cy: 130, r: 1.8, dur: 2.4, delay: 2.1 },
  { cx: 75, cy: 140, r: 2.5, dur: 1.9, delay: 1.8 },
  { cx: 160, cy: 95, r: 1.3, dur: 2.2, delay: 0.9 },
  { cx: 95, cy: 120, r: 2.1, dur: 1.7, delay: 2.5 },
  { cx: 200, cy: 85, r: 1.6, dur: 2.0, delay: 0.7 },
  { cx: 55, cy: 105, r: 2.4, dur: 2.3, delay: 1.5 },
  { cx: 145, cy: 145, r: 1.9, dur: 1.5, delay: 2.8 },
  { cx: 250, cy: 100, r: 2.0, dur: 2.1, delay: 0.2 },
  { cx: 110, cy: 70, r: 1.4, dur: 1.8, delay: 1.0 },
];

const InstabilityViz = () => (
  <svg viewBox="0 0 300 200" fill="none" className="absolute inset-0 w-full h-full">
    <defs>
      <linearGradient id="instBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1a1a2e" />
        <stop offset="50%" stopColor="#16213e" />
        <stop offset="100%" stopColor="#0f0f23" />
      </linearGradient>
      <radialGradient id="sunGradDark" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="40%" stopColor="#f97316" />
        <stop offset="70%" stopColor="#dc2626" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
      <filter id="lightningGlow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <rect width="300" height="200" fill="url(#instBg)" />

    {/* Intense Sun */}
    <circle cx="250" cy="40" r="30" fill="url(#sunGradDark)" filter="url(#lightningGlow)" style={{ animation: 'fs-sunFade 4s ease-out infinite' }} />
    <circle cx="250" cy="40" r="20" fill="#fbbf24" opacity="0.8" style={{ animation: 'fs-sunFade 4s ease-out infinite' }} />

    {/* Dramatic lightning bolts */}
    {[[50, 15], [140, 5], [90, 25]].map(([x, y], i) => (
      <g key={i} style={{ animation: `fs-lightning ${2 + i * 0.5}s ease-out infinite ${i * 1.2}s` }}>
        <path
          d={`M${x} ${y} L${x + 8} ${y + 30} L${x + 18} ${y + 22} L${x + 12} ${y + 60} L${x + 5} ${y + 42} L${x - 6} ${y + 50} Z`}
          fill="#fbbf24"
          stroke="#fef08a"
          strokeWidth="1.5"
          filter="url(#lightningGlow)"
        />
      </g>
    ))}

    {/* Chaotic energy sparks */}
    {SPARK_POSITIONS.map((spark, i) => (
      <g key={i}>
        <circle
          cx={spark.cx}
          cy={spark.cy}
          r={spark.r * 2}
          fill="rgba(251,191,36,.3)"
          style={{ animation: `fs-lightning ${spark.dur}s ease-out infinite ${spark.delay}s` }}
        />
        <circle
          cx={spark.cx}
          cy={spark.cy}
          r={spark.r}
          fill="#fbbf24"
          filter="url(#lightningGlow)"
          style={{ animation: `fs-lightning ${spark.dur}s ease-out infinite ${spark.delay}s` }}
        />
      </g>
    ))}

    {/* "X" marks - too destructive */}
    <text x="200" y="140" fill="#ef4444" fontSize="24" fontWeight="bold" opacity="0.8" filter="url(#lightningGlow)" style={{ animation: 'fs-lightning 2s ease-out infinite' }}>✗</text>
    <text x="40" y="170" fill="#ef4444" fontSize="18" fontWeight="bold" opacity="0.7" filter="url(#lightningGlow)" style={{ animation: 'fs-lightning 2.5s ease-out infinite 0.8s' }}>✗</text>
    
    {/* Warning text */}
    <text x="150" y="190" fill="#fbbf24" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.8">TOO CHAOTIC</text>
  </svg>
);

/* ─────────────────────────────────────────────
   SVG: Proton Gradient & Mineral Surface
───────────────────────────────────────────── */
const ProtonGradientViz = () => (
  <svg viewBox="0 0 400 220" fill="none" className="w-full h-full">
    <defs>
      <linearGradient id="protonBgDark" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0c4a6e" />
        <stop offset="50%" stopColor="#0e7490" />
        <stop offset="100%" stopColor="#164e63" />
      </linearGradient>
      <linearGradient id="mineralSurfaceDark" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#374151" />
        <stop offset="50%" stopColor="#1f2937" />
        <stop offset="100%" stopColor="#374151" />
      </linearGradient>
      <linearGradient id="protonGlowDark" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="30%" stopColor="#22d3ee">
          <animate attributeName="stop-opacity" values=".4;.9;.4" dur="2s" repeatCount="indefinite" />
        </stop>
        <stop offset="70%" stopColor="#3b82f6">
          <animate attributeName="stop-opacity" values=".3;.8;.3" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </stop>
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
      <filter id="protonGlow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="strongGlow">
        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    
    {/* Dark water background */}
    <rect width="400" height="220" fill="url(#protonBgDark)" />
    
    {/* Water ripples */}
    {[40, 80, 120].map((y, i) => (
      <path
        key={i}
        d={`M0 ${y} Q100 ${y - 8} 200 ${y} Q300 ${y + 8} 400 ${y}`}
        fill="none"
        stroke="rgba(34,211,238,.15)"
        strokeWidth="1"
      />
    ))}

    {/* Mineral crystalline structure */}
    <g style={{ animation: 'fs-mineralGlow 4s ease-in-out infinite' }}>
      <rect x="20" y="155" width="360" height="45" rx="4" fill="url(#mineralSurfaceDark)" stroke="#22d3ee" strokeWidth="2" filter="url(#protonGlow)" />

      {/* Crystal facets with glow */}
      {[[40, 153], [100, 150], [160, 152], [220, 149], [280, 153], [340, 151]].map(([x, y], i) => (
        <polygon
          key={i}
          points={`${x},${y} ${x + 18},${y - 15} ${x + 36},${y}`}
          fill="#0e7490"
          stroke="#22d3ee"
          strokeWidth="1.5"
          filter="url(#protonGlow)"
        />
      ))}

      {/* Surface charge indicators */}
      {[[55, 175], [115, 178], [175, 173], [235, 177], [295, 174], [355, 176]].map(([x, y], i) => (
        <text
          key={i}
          x={x}
          y={y}
          fill="#22d3ee"
          fontSize="14"
          fontFamily="monospace"
          fontWeight="bold"
          filter="url(#protonGlow)"
          style={{ animation: `fs-glow ${2 + i * 0.3}s ease-in-out infinite ${i * 0.2}s` }}
        >
          −
        </text>
      ))}
    </g>

    {/* Proton gradient zone - glowing band */}
    <rect x="20" y="115" width="360" height="35" fill="url(#protonGlowDark)" opacity="0.9" />

    {/* Flowing proton particles (H⁺) */}
    {[...Array(8)].map((_, i) => (
      <g key={i} style={{ animation: `fs-proton ${3.5 + i * 0.4}s linear infinite ${i * 0.5}s` }}>
        <circle
          cx={50 + i * 40}
          cy={130 + Math.sin(i) * 6}
          r="10"
          fill="#22d3ee"
          filter="url(#strongGlow)"
        />
        <text
          x={42 + i * 40}
          y={135 + Math.sin(i) * 6}
          fill="#0f172a"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="bold"
        >
          H⁺
        </text>
      </g>
    ))}

    {/* Energy gradient arrows */}
    {[...Array(5)].map((_, i) => (
      <g key={i}>
        <line
          x1={70 + i * 70}
          y1="150"
          x2={70 + i * 70}
          y2="100"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeDasharray="4 3"
          filter="url(#protonGlow)"
          style={{ animation: `fs-glow ${2 + i * 0.2}s ease-in-out infinite ${i * 0.3}s` }}
        />
        <polygon
          points={`${65 + i * 70},105 ${70 + i * 70},95 ${75 + i * 70},105`}
          fill="#22d3ee"
          filter="url(#protonGlow)"
        />
      </g>
    ))}

    {/* Labels */}
    <text x="30" y="90" fill="#67e8f9" fontSize="10" fontFamily="monospace" fontWeight="bold">
      WATER INTERFACE
    </text>
    <text x="30" y="195" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">
      MINERAL SURFACE
    </text>

    {/* Energy arrow */}
    <path d="M365 130 L385 125 L365 120" fill="#22d3ee" filter="url(#strongGlow)" />
    <text x="310" y="80" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold" filter="url(#protonGlow)">
      ΔpH → ATP
    </text>
    
    {/* Success indicator */}
    <text x="350" y="50" fill="#4ade80" fontSize="20" fontWeight="bold" filter="url(#protonGlow)" style={{ animation: 'fs-glow 2s ease-in-out infinite' }}>✓</text>
  </svg>
);

/* ─────────────────────────────────────────────
   Story Block Component (Clean Point Style)
───────────────────────────────────────────── */
const StoryBlock = ({ num, label, title, description, children, visible, delay }) => (
  <div
    className={`relative w-full max-w-5xl mx-auto px-8 py-10 opacity-0 ${visible ? 'fs-visible' : ''}`}
    style={visible ? { animationDelay: `${delay}s` } : undefined}
  >
    <div className="flex gap-8 items-start">
      {/* Point indicator */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div
          className="w-12 h-12 rounded-full bg-cyan-700 flex items-center justify-center shadow-lg"
          style={{ boxShadow: '0 0 25px rgba(6,182,212,.5)' }}
        >
          <span
            className="text-sm font-bold text-white"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {num}
          </span>
        </div>
        <div className="w-0.5 h-full min-h-50 bg-linear-to-b from-cyan-500/60 to-transparent mt-3" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        {/* Label */}
        <span
          className="inline-block text-[.7rem] font-bold tracking-[.25em] uppercase text-white mb-3 px-3 py-1 bg-cyan-500/10 rounded-full"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {label}
        </span>

        {/* Title */}
        <h3
          className="text-[clamp(1.3rem,2.8vw,1.8rem)] font-bold text-slate-800 leading-snug mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className="text-[clamp(.9rem,1.4vw,1.05rem)] text-slate-600 leading-8 mb-6 max-w-3xl"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {description}
        </p>

        {/* Visual area */}
        <div className="relative w-full h-52 overflow-hidden" style={{
          maskImage: 'radial-gradient(ellipse 90% 80% at center, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at center, black 60%, transparent 100%)',
        }}>
          {children}
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Main Component: First Spark Section
───────────────────────────────────────────── */
export default function FirstSpark() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState([false, false, false]);

  useWaterCanvas(canvasRef);

  /* Inject keyframes */
  useEffect(() => {
    if (document.querySelector('[data-fs-styles]')) return;
    const style = document.createElement('style');
    style.dataset.fsStyles = '1';
    style.textContent = STYLES;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  /* Staggered reveal on scroll */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          [0, 1, 2].forEach((i) =>
            setTimeout(() => setVisible((v) => { const n = [...v]; n[i] = true; return n; }), i * 400)
          );
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative z-10">
      <section
        ref={sectionRef}
        className="relative w-full min-h-screen overflow-hidden py-24 bg-white shadow-[0_-20px_40px_rgba(0,0,0,0.1)]"
      >
        {/* ═══ Solid white base to block previous sections ═══ */}
        <div className="absolute inset-0 bg-white" />

        {/* ═══ Water Flow Video Background ═══ */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute w-full h-full object-cover"
            style={{ opacity: 0.6, filter: 'saturate(1.3) brightness(1.05)' }}
          >
            <source src={WATER_VIDEO_URL} type="video/mp4" />
          </video>
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-b from-white/40 via-transparent to-white/40" />
        </div>

        {/* ═══ Water Particle Canvas (white theme overlay) ═══ */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.15, mixBlendMode: 'multiply' }}
        />

        {/* ═══ Ambient Gradient Orbs (Subtle) ═══ */}
        <div
          className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(6,182,212,.08) 0%, transparent 60%)',
            animation: 'fs-float 12s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[5%] right-[-10%] w-[45%] h-[55%] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(59,130,246,.06) 0%, transparent 55%)',
            animation: 'fs-float 15s ease-in-out infinite 3s',
          }}
        />

        {/* ═══ Section Header ═══ */}
        <div className="relative z-10 text-center mb-20 px-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-cyan-500/30 bg-white/70 backdrop-blur-sm shadow-lg shadow-cyan-500/10 mb-6">
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-500"
              style={{ animation: 'fs-glow 2s ease-in-out infinite' }}
            />
            <span
              className="text-[.7rem] font-bold tracking-[.2em] uppercase text-cyan-600"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Origin Story
            </span>
          </div>

          <h2
            className="text-[clamp(2rem,5vw,3.8rem)] font-extrabold leading-tight tracking-tight text-slate-800 mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            The First Spark:{' '}
            <span className="bg-linear-to-r from-cyan-500 via-blue-700 to-cyan-400 bg-clip-text text-transparent">
              Mineral-Driven
            </span>
            <br />
            <span className="text-slate-600">Electrochemical Potential</span>
          </h2>

          <p
            className="text-[clamp(.9rem,1.6vw,1.1rem)] text-slate-600 max-w-2xl mx-auto leading-8"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            A journey through the emergence of life's first energy source —
            from chaos to order, from minerals to metabolism.
          </p>
        </div>

        {/* ═══ Story Points ═══ */}
        <div className="relative z-10 flex flex-col">
          {/* Block 1: The Question */}
          <StoryBlock
            num="01"
            label="The Question"
            title="How did the first life-forms power their metabolism before DNA or complex proteins existed?"
            description="In Earth's primordial oceans, 4 billion years ago, the building blocks of life were assembling — but they needed energy. Without modern enzymes or genetic machinery, how could simple chemistry become living chemistry?"
            visible={visible[0]}
            delay={0}
          >
            <MolecularDiagrams />
          </StoryBlock>

          {/* Block 2: The Reality */}
          <StoryBlock
            num="02"
            label="The Reality"
            title="Sunlight and lightning were too chaotic. Life needed a stable, continuous battery."
            description="While UV radiation and electrical storms could spark reactions, they were unpredictable and destructive. Life required something more reliable — a steady electrochemical gradient that could persist across geological time."
            visible={visible[1]}
            delay={0.15}
          >
            <InstabilityViz />
          </StoryBlock>

          {/* Block 3: The Discovery */}
          <StoryBlock
            num="03"
            label="The Discovery"
            title="Naturally occurring proton gradients at mineral-water interfaces provided the first reliable energy source — the Prebiotic Battery."
            description="At the boundary between ancient mineral surfaces and primordial water, pH differences created natural proton gradients. These stable electrochemical potentials drove the synthesis of life's first energy currency — a mechanism still used by every living cell today."
            visible={visible[2]}
            delay={0.3}
          >
            <ProtonGradientViz />
          </StoryBlock>
        </div>

        {/* ═══ Bottom Fade ═══ */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to top, white, transparent)' }}
        />
      </section>
    </div>
  );
}
