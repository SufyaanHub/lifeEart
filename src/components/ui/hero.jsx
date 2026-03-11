import React, { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────
   Keyframe + animation helper classes injected once
   (Tailwind cannot define custom keyframes without config)
───────────────────────────────────────────── */
const STYLES = `
  @keyframes fadeIn      { from{opacity:0} to{opacity:1} }
  @keyframes fadeInUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes charReveal  { from{opacity:0;transform:translateY(18px) rotateX(40deg)} to{opacity:1;transform:translateY(0) rotateX(0)} }
  @keyframes typing      { from{width:0} to{width:100%} }
  @keyframes blink       { 0%,100%{border-color:transparent} 50%{border-color:rgba(6,182,212,.9)} }
  @keyframes typingLine2 { 0%,50%{width:0;opacity:0} 50.1%{opacity:1} 100%{width:100%;opacity:1} }
  .anim-typing      { display:inline-block; overflow:hidden; white-space:nowrap; border-right:3px solid transparent; width:0; animation: typing 2s steps(11,end) forwards; }
  .anim-typing-line2 { display:inline-block; overflow:hidden; white-space:nowrap; border-right:3px solid rgba(6,182,212,.9); width:0; animation: typingLine2 4s steps(33,end) forwards, blink .75s step-end infinite 2s; }
  @keyframes floatA      { 0%,100%{transform:translateY(0) rotate(0deg)} 40%{transform:translateY(-14px) rotate(1.5deg)} 70%{transform:translateY(-7px) rotate(-1deg)} }
  @keyframes floatB      { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(2deg)} }
  @keyframes pulseBlob   { 0%,100%{opacity:.35;filter:blur(48px)} 50%{opacity:.65;filter:blur(70px)} }
  @keyframes pulseBlob2  { 0%,100%{opacity:.25;filter:blur(64px)} 50%{opacity:.55;filter:blur(90px)} }
  @keyframes borderPulse { 0%,100%{border-color:rgba(6,182,212,.2);box-shadow:0 0 0 rgba(6,182,212,0)} 50%{border-color:rgba(6,182,212,.55);box-shadow:0 0 18px rgba(6,182,212,.12)} }
  @keyframes scanDot     { 0%{transform:scaleY(0);transform-origin:top;opacity:0} 50%{transform:scaleY(1);transform-origin:top;opacity:1} 100%{transform:scaleY(1);transform-origin:bottom;opacity:0} }
  @keyframes dotPulse    { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.6);opacity:1} }
  @keyframes energyFlow  { 0%{stroke-dashoffset:600;opacity:.2} 50%{opacity:.9} 100%{stroke-dashoffset:0;opacity:.2} }
  .anim-fadeIn      { animation: fadeIn       1s    ease                        forwards; }
  .anim-fadeInUp    { animation: fadeInUp     1s    ease                        forwards; }
  .anim-charReveal  { animation: charReveal   .65s  cubic-bezier(.22,1,.36,1)   forwards; }
  .anim-floatA      { animation: floatA             ease-in-out         infinite; }
  .anim-floatB      { animation: floatB             ease-in-out         infinite; }
  .anim-pulseBlob   { animation: pulseBlob    9s    ease-in-out         infinite; }
  .anim-pulseBlob2  { animation: pulseBlob2   11s   ease-in-out      3s infinite; }
  .anim-borderPulse { animation: borderPulse  5s    ease-in-out         infinite; }
  .anim-scanDot     { animation: scanDot      2.2s  ease-in-out         infinite; }
  .anim-dotPulse    { animation: dotPulse     2.2s  ease-in-out         infinite; }
  .anim-energyFlow  { animation: energyFlow         linear              infinite; }
  @media (max-width:1100px) { .hero-aside  { display:none!important } }
  @media (max-width:700px)  { .hero-mol-lg { display:none!important } }
`;

/* ─────────────────────────────────────────────
   SVG – Water Molecule
───────────────────────────────────────────── */
const WaterMolecule = ({ size = 90 }) => (
  <svg width={size} height={size} viewBox="0 0 90 90" fill="none">
    {/* electron cloud */}
    <ellipse cx="45" cy="45" rx="38" ry="28" stroke="rgba(6,182,212,.12)" strokeWidth=".8" strokeDasharray="3 4"/>
    {/* O–H bonds */}
    <line x1="45" y1="45" x2="22" y2="32" stroke="rgba(6,182,212,.55)" strokeWidth="1.6"/>
    <line x1="45" y1="45" x2="68" y2="32" stroke="rgba(6,182,212,.55)" strokeWidth="1.6"/>
    {/* Hydrogen atoms */}
    <circle cx="22" cy="32" r="9" stroke="rgba(14,165,233,.55)" strokeWidth="1"/>
    <circle cx="22" cy="32" r="3"  fill="rgba(14,165,233,.5)"/>
    <circle cx="68" cy="32" r="9" stroke="rgba(14,165,233,.55)" strokeWidth="1"/>
    <circle cx="68" cy="32" r="3"  fill="rgba(14,165,233,.5)"/>
    {/* Oxygen atom */}
    <circle cx="45" cy="45" r="13" stroke="rgba(6,182,212,.8)" strokeWidth="1.4"/>
    <circle cx="45" cy="45" r="5"  fill="rgba(6,182,212,.65)"/>
  </svg>
);

/* ─────────────────────────────────────────────
   SVG – Atom Orbital
───────────────────────────────────────────── */
const AtomOrbit = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <circle cx="60" cy="60" r="7"  fill="rgba(6,182,212,.9)"/>
    <circle cx="60" cy="60" r="4"  fill="white" opacity=".85"/>
    <ellipse cx="60" cy="60" rx="52" ry="20" stroke="rgba(6,182,212,.28)" strokeWidth=".9"/>
    <ellipse cx="60" cy="60" rx="52" ry="20" stroke="rgba(6,182,212,.28)" strokeWidth=".9" transform="rotate(60 60 60)"/>
    <ellipse cx="60" cy="60" rx="52" ry="20" stroke="rgba(6,182,212,.28)" strokeWidth=".9" transform="rotate(120 60 60)"/>
    {/* Animated electrons */}
    <circle cx="112" cy="60" r="3.5" fill="rgba(6,182,212,.95)">
      <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="4s" repeatCount="indefinite"/>
    </circle>
    <circle cx="34" cy="13" r="3" fill="rgba(14,165,233,.9)">
      <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="-360 60 60" dur="6.5s" repeatCount="indefinite"/>
    </circle>
    <circle cx="8" cy="60" r="2.5" fill="rgba(59,130,246,.85)">
      <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="5.2s" repeatCount="indefinite"/>
    </circle>
  </svg>
);

/* ─────────────────────────────────────────────
   SVG – Hexagonal Molecular Grid
───────────────────────────────────────────── */
const HexGrid = ({ cols = 5, rows = 3, hex = 28 }) => {
  const pts = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * hex * 1.73 + (r % 2 ? hex * 0.87 : 0);
      const y = r * hex * 1.5;
      const verts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return `${x + hex * Math.cos(a)},${y + hex * Math.sin(a)}`;
      }).join(' ');
      pts.push(<polygon key={`${r}-${c}`} points={verts} fill="none" stroke="rgba(6,182,212,.55)" strokeWidth=".7"/>);
    }
  }
  const w = cols * hex * 1.73 + hex;
  const h = rows * hex * 1.5 + hex;
  return <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">{pts}</svg>;
};

/* ─────────────────────────────────────────────
   SVG – Flowing Energy Stream
───────────────────────────────────────────── */
const EnergyStream = () => (
  <svg width="200" height="80" viewBox="0 0 200 80" fill="none">
    <defs>
      <linearGradient id="eg1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stopColor="rgba(6,182,212,0)"/>
        <stop offset="50%"  stopColor="rgba(6,182,212,0.8)"/>
        <stop offset="100%" stopColor="rgba(6,182,212,0)"/>
      </linearGradient>
    </defs>
    <path d="M0 40 Q50 10 100 40 Q150 70 200 40" stroke="url(#eg1)" strokeWidth="1.5" strokeDasharray="600" style={{animation:'energyFlow 4s linear infinite'}}/>
    <path d="M0 30 Q50 55 100 30 Q150 5 200 30"  stroke="rgba(14,165,233,.4)" strokeWidth=".8" strokeDasharray="600" style={{animation:'energyFlow 5s linear infinite 1s'}}/>
    {[30, 80, 130, 170].map(cx => (
      <circle key={cx} cx={cx} cy={cx % 60 < 30 ? 35 : 45} r="2" fill="rgba(6,182,212,.7)">
        <animate attributeName="opacity" values=".2;1;.2" dur="2s" begin={`${cx * 0.01}s`} repeatCount="indefinite"/>
      </circle>
    ))}
  </svg>
);

/* ─────────────────────────────────────────────
   SVG – Mineral / Rock Surface Lines
───────────────────────────────────────────── */
const MineralSurface = () => (
  <svg width="160" height="100" viewBox="0 0 160 100" fill="none">
    <polygon points="10,90 50,20 80,60 120,15 150,90" fill="rgba(6,182,212,.04)" stroke="rgba(6,182,212,.4)" strokeWidth=".8"/>
    <polygon points="30,90 60,40 95,65 130,25 155,90" fill="rgba(14,165,233,.03)" stroke="rgba(14,165,233,.25)" strokeWidth=".6"/>
    <line x1="50" y1="20"  x2="80" y2="60"  stroke="rgba(6,182,212,.3)" strokeWidth=".6"/>
    <line x1="80" y1="60"  x2="120" y2="15" stroke="rgba(6,182,212,.3)" strokeWidth=".6"/>
    <circle cx="50"  cy="20"  r="2.5" fill="rgba(6,182,212,.6)"/>
    <circle cx="80"  cy="60"  r="2"   fill="rgba(6,182,212,.5)"/>
    <circle cx="120" cy="15"  r="2.5" fill="rgba(6,182,212,.6)"/>
  </svg>
);

/* ─────────────────────────────────────────────
   Glassmorphism Card – reusable
───────────────────────────────────────────── */
const GlassCard = ({ children, delay = '0s', className = '' }) => (
  <div
    className={`px-5 py-4.5 bg-white/68 border border-cyan-500/20 rounded-[18px] backdrop-blur-[22px] shadow-[0_4px_28px_rgba(6,182,212,.07),0_1px_4px_rgba(0,0,0,.04)] anim-borderPulse ${className}`}
    style={{ animationDelay: delay }}
  >
    {children}
  </div>
);

/* ─────────────────────────────────────────────
   Mini data bar row
───────────────────────────────────────────── */
const DataBar = ({ label, val, pct }) => (
  <div className="mb-2.5">
    <div className="flex justify-between mb-1">
      <span className="text-[.6rem] text-slate-500">{label}</span>
      <span className="text-[.6rem] font-bold text-cyan-600 font-mono">{val}</span>
    </div>
    <div className="h-0.75 bg-cyan-500/10 rounded-sm overflow-hidden">
      <div
        className="h-full bg-linear-to-r from-cyan-700 to-sky-400 rounded-sm shadow-[0_0_6px_rgba(6,182,212,.45)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   Canvas – Particle System
───────────────────────────────────────────── */
function useParticleCanvas(ref) {
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const N = 110;
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * .45,
      vy: (Math.random() - .5) * .45,
      r: Math.random() * 2.4 + .5,
      base: Math.random() * .5 + .1,
      ph: Math.random() * Math.PI * 2,
      spd: Math.random() * .012 + .005,
      glow: Math.random() > .62,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Connections
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 125) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6,182,212,${(1 - d / 125) * .11})`;
            ctx.lineWidth = .55;
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }

      // Particles
      ps.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.ph += p.spd;
        if (p.x < -6) p.x = canvas.width + 6;
        if (p.x > canvas.width + 6) p.x = -6;
        if (p.y < -6) p.y = canvas.height + 6;
        if (p.y > canvas.height + 6) p.y = -6;

        const op = p.base * (.6 + .4 * Math.sin(p.ph));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.shadowBlur = p.glow ? 14 : 6;
        ctx.shadowColor = p.glow ? 'rgba(6,182,212,.9)' : 'rgba(14,165,233,.55)';
        ctx.fillStyle = p.glow ? `rgba(6,182,212,${op})` : `rgba(14,165,233,${op})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [ref]);
}

/* ─────────────────────────────────────────────
   HERO – Main Component
───────────────────────────────────────────── */
const TITLE_LINE1 = '\u00a0\u2013\u00a0A Digital';
const TITLE_LINE2 = 'Twin Model';

export default function Hero() {
  const canvasRef = useRef(null);
  const [on, setOn] = useState(false);
  useParticleCanvas(canvasRef);

  useEffect(() => {
    const el = document.createElement('style');
    el.dataset.heroStyles = '1';
    el.textContent = STYLES;
    if (!document.querySelector('[data-hero-styles]')) document.head.appendChild(el);
    const id = setTimeout(() => setOn(true), 60);
    return () => { clearTimeout(id); el.remove(); };
  }, []);

  const charClass = (i, colored) =>
    `inline-block opacity-0 ${colored
      ? 'bg-gradient-to-br from-cyan-600 via-cyan-400 to-sky-400 bg-clip-text text-transparent'
      : 'text-slate-900'
    } ${on ? 'anim-charReveal' : ''}`;

  return (
     <div className="sticky top-0 z-0">
    <section className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center bg-[linear-gradient(145deg,#f7fbff_0%,#eef6ff_35%,#e6f4ff_65%,#f4f9ff_100%)]">

      {/* ── Canvas ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-90% z-1" />

      {/* ── Ambient glow blobs ── */}
      <div className="absolute top-[-8%] left-[-4%] w-[42%] h-[62%] pointer-events-none z-2 anim-pulseBlob"
        style={{ background: 'radial-gradient(ellipse,rgba(6,182,212,.13) 0%,transparent 68%)' }}/>
      <div className="absolute bottom-[-8%] right-[-4%] w-[48%] h-[68%] pointer-events-none z-2 anim-pulseBlob2"
        style={{ background: 'radial-gradient(ellipse,rgba(14,165,233,.10) 0%,transparent 65%)' }}/>
      <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] pointer-events-none z-2"
        style={{ background: 'radial-gradient(ellipse,rgba(6,182,212,.07) 0%,transparent 60%)', animation: 'pulseBlob 13s ease-in-out infinite 6s' }}/>

      {/* ── Hex grids ── */}
      <div className="hero-mol-lg absolute -top-3.75 -left-4.5 opacity-38 z-3 pointer-events-none anim-floatA"
        style={{ animationDuration: '14s' }}>
        <HexGrid cols={5} rows={3} hex={30}/>
      </div>
      <div className="hero-mol-lg absolute -bottom-3.75 -right-4.5 opacity-28 z-3 rotate-25 pointer-events-none anim-floatB"
        style={{ animationDuration: '17s' }}>
        <HexGrid cols={4} rows={3} hex={28}/>
      </div>

      {/* ── Decorative molecules ── */}
      <div className="absolute left-[3%] top-[22%] z-3 pointer-events-none opacity-78 anim-floatA" style={{ animationDuration: '10s' }}>
        <WaterMolecule size={96}/>
      </div>
      <div className="absolute left-[6%] bottom-[20%] z-3 pointer-events-none opacity-50 anim-floatB" style={{ animationDuration: '12.5s', animationDelay: '2s' }}>
        <WaterMolecule size={68}/>
      </div>
      <div className="absolute right-[4%] top-[24%] z-3 pointer-events-none opacity-62 anim-floatB" style={{ animationDuration: '11s', animationDelay: '1s' }}>
        <WaterMolecule size={88}/>
      </div>
      <div className="absolute right-[7%] bottom-[28%] z-3 pointer-events-none anim-floatA" style={{ animationDuration: '13s', animationDelay: '4s' }}>
        <AtomOrbit size={130}/>
      </div>
      <div className="absolute left-[5%] bottom-[6%] z-3 pointer-events-none anim-floatB" style={{ animationDuration: '15s', animationDelay: '3s' }}>
        <AtomOrbit size={100}/>
      </div>

      {/* ── Energy streams ── */}
      <div className="absolute top-[12%] left-[18%] z-3 opacity-65 pointer-events-none anim-floatA" style={{ animationDuration: '18s', animationDelay: '1s' }}>
        <EnergyStream/>
      </div>
      <div className="absolute bottom-[16%] right-[16%] z-3 opacity-50 -scale-x-100 pointer-events-none anim-floatB" style={{ animationDuration: '16s', animationDelay: '2s' }}>
        <EnergyStream/>
      </div>

      {/* ── Mineral surfaces ── */}
      <div className="absolute top-[6%] right-[22%] z-3 opacity-70 pointer-events-none anim-floatA" style={{ animationDuration: '11s', animationDelay: '3s' }}>
        <MineralSurface/>
      </div>
      <div className="absolute bottom-[10%] left-[18%] z-3 opacity-55 -scale-y-100 pointer-events-none anim-floatB" style={{ animationDuration: '13s' }}>
        <MineralSurface/>
      </div>

      {/* ── Subtle scan line ── */}
      <div className="absolute inset-0 z-4 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,rgba(6,182,212,.35),transparent)] opacity-50 anim-floatB"
          style={{ animationDuration: '9s' }}/>
      </div>

      {/* ════════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════════ */}
      <div className="relative z-10 text-center max-w-230 px-8 mb-15">

        {/* Eyebrow pill */}
        <div className={`inline-flex items-center gap-1 px-5.5 py-1 mb-[2.6rem] bg-cyan-500/7 border border-cyan-500/28 rounded-full backdrop-blur-[14px] opacity-0 ${on ? 'anim-fadeIn' : ''}`}>
          <span className="w-1.75 h-1.75 rounded-full bg-cyan-500/95 shadow-[0_0_10px_rgba(6,182,212,.8)] inline-block anim-dotPulse"/>
          <span className="text-[.72rem] font-bold tracking-[.15em] uppercase text-cyan-500/90">
            Scientific Simulation Platform
          </span>
        </div>

        {/* Main Heading with Typing Animation */}
        <div className="mb-[1.2rem] flex flex-col items-center">
          <h1 className={`text-[clamp(1.8rem,4vw,3.2rem)] font-extrabold leading-[1.15] tracking-tight text-[#0a2e5c] ${on ? 'anim-typing' : 'opacity-0'}`}>
            WATERWISE
          </h1>
          <h2 className={`text-[clamp(1.4rem,3vw,2.4rem)] font-bold leading-[1.2] tracking-tight text-[#0a2e5c] mt-2 ${on ? 'anim-typing-line2' : 'opacity-0'}`}>
            The Energy Paradox of Early Earth
          </h2>
        </div>

        {/* Title */}
        <h1 className="text-[clamp(2.6rem,5.8vw,5.4rem)] font-extrabold leading-[1.08] tracking-tight mb-[1.6rem] perspective-midrange">
          {TITLE_LINE1.split('').map((ch, i) => (
            <span key={i} className={charClass(i, i < 5)}
              style={on ? { animationDelay: `${i * 0.028}s` } : undefined}>
              {ch === ' ' ? '\u00a0' : ch}
            </span>
          ))}
          <br/>
          {TITLE_LINE2.split('').map((ch, i) => (
            <span key={i + TITLE_LINE1.length} className={charClass(i + TITLE_LINE1.length, false)}
              style={on ? { animationDelay: `${(i + TITLE_LINE1.length) * 0.028}s` } : undefined}>
              {ch === ' ' ? '\u00a0' : ch}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p className={`text-[clamp(.95rem,1.8vw,1.2rem)] text-slate-500 max-w-170 mx-auto mb-[3.2rem] leading-7 font-normal opacity-0 ${on ? 'anim-fadeInUp' : ''}`}
          style={on ? { animationDelay: '.75s' } : undefined}>
          A hydrological + geochemical simulation of early Earth environments —
          modeling the emergence of life through{' '}
          <span className="text-cyan-600 font-medium">water–mineral interactions</span>,
          {' '}energy flows, and{' '}
          <span className="text-cyan-600 font-medium">molecular self-assembly</span>.
        </p>

        {/* CTAs */}

        {/* Mentor credit */}
        <div className={`mt-0 opacity-0 ${on ? 'anim-fadeInUp' : ''}`}
          style={on ? { animationDelay: '1.25s' } : undefined}>
          <div className="inline-flex items-center gap-2 px-8 py-2 rounded-full bg-white/60 border border-slate-200/80 backdrop-blur-sm shadow-sm">
            <span className="text-[.88rem] font-medium tracking-widest uppercase text-slate-400">Mentor</span>
            <span className="w-px h-3 bg-slate-300/70"/>
            <span className="text-[1rem] font-bold text-[#1e2d5a] tracking-tight">Courteney Monchinski</span>
          </div>
        </div>

      </div>

      {/* ════════════════════════════════════
          ASIDE DATA PANELS
      ════════════════════════════════════ */}

      {/* Left panel – H₂O Dynamics */}
      <aside className={`hero-aside absolute left-[2%] top-1/2 -translate-y-1/2 z-10 w-47.5 pointer-events-none opacity-0 ${on ? 'anim-fadeIn' : ''}`}
        style={on ? { animationDelay: '1.5s' } : undefined}>
        <GlassCard>
          <div className="text-[.62rem] font-bold tracking-[.12em] uppercase text-cyan-500/80 mb-3.25">H₂O Dynamics</div>
          <DataBar label="Temperature" val="92 °C"   pct={76}/>
          <DataBar label="pH Level"    val="6.8"     pct={52}/>
          <DataBar label="Salinity"    val="3.5 %"   pct={35}/>
          <DataBar label="Pressure"    val="1.2 atm" pct={60}/>
        </GlassCard>
      </aside>

      {/* Right panel – Mineral Matrix */}
      <aside className={`hero-aside absolute right-[2%] top-1/2 -translate-y-1/2 z-10 w-47.5 pointer-events-none opacity-0 ${on ? 'anim-fadeIn' : ''}`}
        style={on ? { animationDelay: '1.7s' } : undefined}>
        <GlassCard delay=".8s">
          <div className="text-[.62rem] font-bold tracking-[.12em] uppercase text-cyan-500/80 mb-3.25">Mineral Matrix</div>
          <DataBar label="Silicate"     val="42 %" pct={42}/>
          <DataBar label="Iron-Sulfide" val="28 %" pct={28}/>
          <DataBar label="Carbonate"    val="18 %" pct={18}/>
          <DataBar label="Phosphate"    val="12 %" pct={12}/>
        </GlassCard>
      </aside>

     

    </section>
    </div>
  );
}
