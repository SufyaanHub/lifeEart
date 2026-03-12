import React, { memo, useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/* Lazy load heavy components */
const ParticleCanvas = lazy(() => import('./ParticleCanvas'));
const WaterMolecule = lazy(() => import('../optimized/WaterMolecule'));

/* Memoized SVG Components */
const AtomOrbit = memo(({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    <circle cx="60" cy="60" r="7" fill="rgba(6,182,212,.9)" />
    <circle cx="60" cy="60" r="4" fill="white" opacity=".85" />
    <ellipse cx="60" cy="60" rx="52" ry="20" stroke="rgba(6,182,212,.28)" strokeWidth=".9" />
    <ellipse cx="60" cy="60" rx="52" ry="20" stroke="rgba(6,182,212,.28)" strokeWidth=".9" transform="rotate(60 60 60)" />
    <ellipse cx="60" cy="60" rx="52" ry="20" stroke="rgba(6,182,212,.28)" strokeWidth=".9" transform="rotate(120 60 60)" />
    <circle cx="112" cy="60" r="3.5" fill="rgba(6,182,212,.95)">
      <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="34" cy="13" r="3" fill="rgba(14,165,233,.9)">
      <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="-360 60 60" dur="6.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="8" cy="60" r="2.5" fill="rgba(59,130,246,.85)">
      <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="5.2s" repeatCount="indefinite" />
    </circle>
  </svg>
));
AtomOrbit.displayName = 'AtomOrbit';

const HexGrid = memo(({ cols = 5, rows = 3, hex = 28 }) => {
  const { svgElement } = useMemo(() => {
    const pts = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * hex * 1.73 + (r % 2 ? hex * 0.87 : 0);
        const y = r * hex * 1.5;
        const verts = Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          return `${x + hex * Math.cos(a)},${y + hex * Math.sin(a)}`;
        }).join(' ');
        pts.push(<polygon key={`${r}-${c}`} points={verts} fill="none" stroke="rgba(6,182,212,.55)" strokeWidth=".7" />);
      }
    }
    const w = cols * hex * 1.73 + hex;
    const h = rows * hex * 1.5 + hex;
    return { 
      svgElement: <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">{pts}</svg>,
      width: w,
      height: h
    };
  }, [cols, rows, hex]);

  return svgElement;
});
HexGrid.displayName = 'HexGrid';

const EnergyStream = memo(() => (
  <svg width="200" height="80" viewBox="0 0 200 80" fill="none">
    <defs>
      <linearGradient id="eg1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(6,182,212,0)" />
        <stop offset="50%" stopColor="rgba(6,182,212,0.8)" />
        <stop offset="100%" stopColor="rgba(6,182,212,0)" />
      </linearGradient>
    </defs>
    <path 
      d="M0 40 Q50 10 100 40 Q150 70 200 40" 
      stroke="url(#eg1)" 
      strokeWidth="1.5" 
      strokeDasharray="600" 
      className="anim-energyFlow"
      style={{ animationDuration: '4s' }}
    />
    <path 
      d="M0 30 Q50 55 100 30 Q150 5 200 30" 
      stroke="rgba(14,165,233,.4)" 
      strokeWidth=".8" 
      strokeDasharray="600" 
      className="anim-energyFlow"
      style={{ animationDuration: '5s', animationDelay: '1s' }}
    />
    {[30, 80, 130, 170].map(cx => (
      <circle key={cx} cx={cx} cy={cx % 60 < 30 ? 35 : 45} r="2" fill="rgba(6,182,212,.7)">
        <animate attributeName="opacity" values=".2;1;.2" dur="2s" begin={`${cx * 0.01}s`} repeatCount="indefinite" />
      </circle>
    ))}
  </svg>
));
EnergyStream.displayName = 'EnergyStream';

const GlassCard = memo(({ children, delay = '0s', className = '' }) => (
  <div
    className={`px-5 py-4.5 bg-white/68 border border-cyan-500/20 rounded-[18px] backdrop-blur-[22px] shadow-[0_4px_28px_rgba(6,182,212,.07),0_1px_4px_rgba(0,0,0,.04)] anim-borderPulse ${className}`}
    style={{ animationDelay: delay, willChange: 'transform' }}
  >
    {children}
  </div>
));
GlassCard.displayName = 'GlassCard';

const DataBar = memo(({ label, val, pct }) => (
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
));
DataBar.displayName = 'DataBar';

/* Optimized Title Animation Component */
const AnimatedTitle = memo(({ line, startIndex = 0, colored = false, on = false }) => {
  const chars = useMemo(() => line.split(''), [line]);
  
  return (
    <>
      {chars.map((ch, i) => (
        <span 
          key={startIndex + i} 
          className={`inline-block opacity-0 ${
            colored 
              ? 'bg-linear-to-br from-cyan-600 via-cyan-400 to-sky-400 bg-clip-text text-transparent'
              : 'text-slate-900'
          } ${on ? 'anim-charReveal' : ''}`}
          style={on ? { 
            animationDelay: `${(startIndex + i) * 0.028}s`,
            willChange: 'transform, opacity'
          } : undefined}
        >
          {ch === ' ' ? '\u00a0' : ch}
        </span>
      ))}
    </>
  );
});
AnimatedTitle.displayName = 'AnimatedTitle';

/* Main Hero Component */
const TITLE_LINE1 = '\u00a0\u2013\u00a0A Digital';
const TITLE_LINE2 = 'Twin Model';

const Hero = memo(() => {
  const [on, setOn] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  useEffect(() => {
    const id = setTimeout(() => setOn(true), 60);
    return () => clearTimeout(id);
  }, []);

  const backgroundStyle = useMemo(() => ({
    background: 'linear-gradient(145deg, #f7fbff 0%, #eef6ff 35%, #e6f4ff 65%, #f4f9ff 100%)'
  }), []);

  const glowStyles = useMemo(() => ({
    blob1: { background: 'radial-gradient(ellipse, rgba(6,182,212,.13) 0%, transparent 68%)' },
    blob2: { background: 'radial-gradient(ellipse, rgba(14,165,233,.10) 0%, transparent 65%)' },
    blob3: { background: 'radial-gradient(ellipse, rgba(6,182,212,.07) 0%, transparent 60%)' }
  }), []);

  return (
    <div className="sticky top-0 z-0">
      <section 
        className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center"
        style={backgroundStyle}
      >

        {/* Lazy Loaded Canvas */}
        <Suspense fallback={<div className="absolute inset-0 w-full h-90% z-1 bg-transparent" />}>
          <ParticleCanvas />
        </Suspense>

        {/* Optimized Ambient glow blobs */}
        {!shouldReduceMotion && (
          <>
            <div 
              className="absolute top-[-8%] left-[-4%] w-[42%] h-[62%] pointer-events-none z-2 anim-pulseBlob"
              style={glowStyles.blob1}
            />
            <div 
              className="absolute bottom-[-8%] right-[-4%] w-[48%] h-[68%] pointer-events-none z-2 anim-pulseBlob2"
              style={glowStyles.blob2}
            />
            <div 
              className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%] pointer-events-none z-2 anim-pulseBlob"
              style={{ ...glowStyles.blob3, animationDuration: '13s', animationDelay: '6s' }}
            />
          </>
        )}

        {/* Optimized Hex grids - only render on larger screens */}
        <div className="hero-mol-lg absolute -top-3.75 -left-4.5 opacity-38 z-3 pointer-events-none anim-floatA"
             style={{ animationDuration: '14s' }}>
          <HexGrid cols={5} rows={3} hex={30} />
        </div>
        <div className="hero-mol-lg absolute -bottom-3.75 -right-4.5 opacity-28 z-3 rotate-25 pointer-events-none anim-floatB"
             style={{ animationDuration: '17s' }}>
          <HexGrid cols={4} rows={3} hex={28} />
        </div>

        {/* Lazy Loaded Decorative molecules */}
        <Suspense fallback={null}>
          <div className="absolute left-[3%] top-[22%] z-3 pointer-events-none opacity-78 anim-floatA" 
               style={{ animationDuration: '10s' }}>
            <WaterMolecule size={96} />
          </div>
          <div className="absolute left-[6%] bottom-[20%] z-3 pointer-events-none opacity-50 anim-floatB" 
               style={{ animationDuration: '12.5s', animationDelay: '2s' }}>
            <WaterMolecule size={68} />
          </div>
        </Suspense>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-6xl mx-auto">
          
          {/* Optimized Subtitle */}
          <div className="mb-8">
            <h1 className={`text-[clamp(1.8rem,4.2vw,4rem)] font-black leading-[1.1] tracking-[-0.02em] text-transparent bg-clip-text bg-linear-to-br from-[#0a2e5c] via-[#1a4a8a] to-[#2563eb] mb-1 ${on ? 'anim-typing' : 'opacity-0'}`}>
                WATERWISE
            </h1>
            <h2 className={`text-[clamp(1.4rem,3vw,2.4rem)] font-bold leading-[1.2] tracking-tight text-[#0a2e5c] mt-2 ${on ? 'anim-typing-line2' : 'opacity-0'}`}>
              The Energy Paradox of Early Earth
            </h2>
          </div>

          {/* Optimized Title with memoized animation */}
          <h1 className="text-[clamp(2.6rem,5.8vw,5.4rem)] font-extrabold leading-[1.08] tracking-tight mb-[1.6rem]">
            <AnimatedTitle line={TITLE_LINE1} startIndex={0} colored={true} on={on} />
            <br />
            <AnimatedTitle line={TITLE_LINE2} startIndex={TITLE_LINE1.length} colored={false} on={on} />
          </h1>

          {/* Optimized Subtitle */}
          <p 
            className={`text-[clamp(.95rem,1.8vw,1.2rem)] text-slate-500 max-w-170 mx-auto mb-[3.2rem] leading-7 font-normal opacity-0 ${on ? 'anim-fadeInUp' : ''}`}
            style={on ? { animationDelay: '.75s' } : undefined}
          >
            A hydrological + geochemical simulation of early Earth environments —
            modeling the emergence of life through{' '}
            <span className="text-cyan-600 font-medium">water–mineral interactions</span>,
            {' '}energy flows, and{' '}
            <span className="text-cyan-600 font-medium">molecular self-assembly</span>.
          </p>

          {/* Mentor credit */}
          <div 
            className={`mt-0 opacity-0 ${on ? 'anim-fadeInUp' : ''}`}
            style={on ? { animationDelay: '1.25s' } : undefined}
          >
            <div className="inline-flex items-center gap-2 px-8 py-2 rounded-full bg-white/60 border border-slate-200/80 backdrop-blur-sm shadow-sm">
              <span className="text-[.88rem] font-medium tracking-widest uppercase text-slate-400">Mentor</span>
              <span className="w-px h-3 bg-slate-300/70" />
              <span className="text-[1rem] font-bold text-[#1e2d5a] tracking-tight">Courteney Monchinski</span>
            </div>
          </div>
        </div>

        {/* Optimized Side panels */}
        <aside 
          className={`hero-aside absolute left-[2%] top-1/2 -translate-y-1/2 z-10 w-47.5 pointer-events-none opacity-0 ${on ? 'anim-fadeIn' : ''}`}
          style={on ? { animationDelay: '1.5s' } : undefined}
        >
          <GlassCard>
            <div className="text-[.62rem] font-bold tracking-[.12em] uppercase text-cyan-500/80 mb-3.25">H₂O Dynamics</div>
            <DataBar label="Temperature" val="92 °C" pct={76} />
            <DataBar label="pH Level" val="6.8" pct={52} />
            <DataBar label="Salinity" val="3.5 %" pct={35} />
            <DataBar label="Pressure" val="1.2 atm" pct={60} />
          </GlassCard>
        </aside>

        <aside 
          className={`hero-aside absolute right-[2%] top-1/2 -translate-y-1/2 z-10 w-47.5 pointer-events-none opacity-0 ${on ? 'anim-fadeIn' : ''}`}
          style={on ? { animationDelay: '1.7s' } : undefined}
        >
          <GlassCard delay=".8s">
            <div className="text-[.62rem] font-bold tracking-[.12em] uppercase text-cyan-500/80 mb-3.25">Mineral Matrix</div>
            <DataBar label="Silicate" val="42 %" pct={42} />
            <DataBar label="Iron-Sulfide" val="28 %" pct={28} />
            <DataBar label="Carbonate" val="18 %" pct={18} />
            <DataBar label="Phosphate" val="12 %" pct={12} />
          </GlassCard>
        </aside>

      </section>
    </div>
  );
});

Hero.displayName = 'Hero';

export default Hero;