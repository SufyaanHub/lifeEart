import React, { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────
   Keyframes injected once
───────────────────────────────────────────── */
const STYLES = `
  @keyframes ts-glow      { 0%,100%{opacity:.5}                50%{opacity:1} }
  @keyframes ts-scan      { 0%{transform:translateY(-100%)}    100%{transform:translateY(400%)} }
  @keyframes ts-dash      { to{stroke-dashoffset:0} }
  @keyframes ts-blink     { 0%,100%{opacity:1} 50%{opacity:.2} }
  @keyframes ts-fadeIn    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ts-lineGrow  { from{width:0} to{width:100%} }
  .ts-row-visible         { animation: ts-fadeIn .6s cubic-bezier(.22,1,.36,1) forwards; }
`;

/* ─────────────────────────────────────────────
   Data for the grid
───────────────────────────────────────────── */
const TECH_DATA = [
  {
    num: '01',
    layer: 'Data Layer',
    component: 'Hadean Mineral Dataset',
    description: 'High-fidelity synthetic datasets encoding mineral surface properties — pKa, surface charge, hydration shells — derived from Hadean geochemical models.',
    specs: ['pKa Profiles', 'Surface Charge', 'Mineral DB'],
    status: 'Active',
  },
  {
    num: '02',
    layer: 'Simulation Engine',
    component: 'Cloud Thermodynamic Core',
    description: 'Cloud-based iterative processing pipeline for real-time thermodynamic modeling of water–mineral interactions across geological timescales.',
    specs: ['Iterative Solver', 'Cloud Nodes', 'ΔG Engine'],
    status: 'Active',
  },
  {
    num: '03',
    layer: 'Frontend UI',
    component: 'Interactive What-If Dashboard',
    description: 'Scenario-driven interface with real-time parameter sliders, chemical reaction panels, and live chart updates — built for researchers and educators.',
    specs: ['Scenario Explorer', 'Live Charts', 'Reaction Viewer'],
    status: 'Active',
  },
];

/* ─────────────────────────────────────────────
   TechStack Section - Grid Layout
───────────────────────────────────────────── */
export default function TechStack() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState([false, false, false]);

  /* inject keyframes once */
  useEffect(() => {
    const el = document.createElement('style');
    el.dataset.tsStyles = '1';
    el.textContent = STYLES;
    if (!document.querySelector('[data-ts-styles]')) document.head.appendChild(el);
    return () => el.remove();
  }, []);

  /* stagger row reveal on scroll into view */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          TECH_DATA.forEach((_, i) =>
            setTimeout(() => setVisible(v => { const n = [...v]; n[i] = true; return n; }), i * 150)
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
    <div className="sticky top-0 z-0">
      <section
        ref={sectionRef}
        className="relative w-full min-h-screen mb-20 overflow-hidden flex flex-col items-center justify-center py-20 pb-32 bg-[#050d1a]"
      >
        {/* ── Background grid ── */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6,182,212,.03) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(6,182,212,.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* ── Ambient orbs ── */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(ellipse,rgba(6,182,212,.06) 0%,transparent 65%)' }}/>
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[55%] pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(ellipse,rgba(59,130,246,.05) 0%,transparent 60%)' }}/>

        {/* ════════════════════════════════════════════
            MAIN CONTAINER
        ════════════════════════════════════════════ */}
        <div className="relative z-10 w-full mb-4 max-w-6xl mx-auto px-6">

          {/* ── Header ── */}
          <div className="text-center mb-16">
            <h2 className="text-[clamp(2rem,4.5vw,3.6rem)] font-extrabold leading-tight tracking-tight text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Our{' '}
              <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Tech Stack
              </span>
            </h2>
            <p className="text-[clamp(.85rem,1.5vw,1rem)] text-slate-400 max-w-xl mx-auto leading-7" style={{ fontFamily: "'Inter', sans-serif" }}>
              Three interlocking layers — data, computation, and visualization —
              built for scientific rigor at planetary scale.
            </p>
          </div>

          {/* ════════════════════════════════════════════
              GRID TABLE CONTAINER
          ════════════════════════════════════════════ */}
          <div className="relative rounded-2xl border mb-10 pb-8 border-cyan-500/20 bg-slate-900/50 backdrop-blur-xl overflow-hidden">
            
            {/* ── Table Header ── */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-cyan-500/15 bg-slate-900/60">
              <div className="col-span-1">
                <span className="text-[.65rem] font-bold tracking-[.15em] uppercase text-cyan-500/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>#</span>
              </div>
              <div className="col-span-2">
                <span className="text-[.65rem] font-bold tracking-[.15em] uppercase text-cyan-500/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Layer</span>
              </div>
              <div className="col-span-3">
                <span className="text-[.65rem] font-bold tracking-[.15em] uppercase text-cyan-500/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Component</span>
              </div>
              <div className="col-span-4">
                <span className="text-[.65rem] font-bold tracking-[.15em] uppercase text-cyan-500/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Description</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-[.65rem] font-bold tracking-[.15em] uppercase text-cyan-500/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Status</span>
              </div>
            </div>

            {/* ── Table Rows ── */}
            {TECH_DATA.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-12 gap-4 px-6 py-6 border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors duration-300 opacity-0 ${visible[i] ? 'ts-row-visible' : ''}`}
                style={visible[i] ? { animationDelay: `${i * 0.1}s` } : undefined}
              >
                {/* Number */}
                <div className="col-span-1 flex items-start">
                  <span className="text-2xl font-black text-cyan-500/30" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{row.num}</span>
                </div>

                {/* Layer */}
                <div className="col-span-2 flex items-start">
                  <div>
                    <span className="text-sm font-bold text-white block mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{row.layer}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{ animation: 'ts-blink 2s ease-in-out infinite' }}/>
                      <span className="text-[.6rem] text-cyan-400/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>ONLINE</span>
                    </div>
                  </div>
                </div>

                {/* Component */}
                <div className="col-span-3 flex flex-col justify-start">
                  <span className="text-sm font-semibold text-slate-200 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{row.component}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {row.specs.map(spec => (
                      <span key={spec} className="px-2 py-0.5 rounded text-[.6rem] font-medium bg-cyan-500/10 border border-cyan-500/20 text-cyan-400/80" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-4">
                  <p className="text-[.8rem] text-slate-400 leading-6" style={{ fontFamily: "'Inter', sans-serif" }}>{row.description}</p>
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-start justify-end">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.6)]" style={{ animation: 'ts-glow 2s ease-in-out infinite' }}/>
                    <span className="text-[.65rem] font-semibold text-emerald-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.status}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* ── Table Footer / Summary ── */}
            <div className="px-6 py-5 bg-slate-900/40 border-t border-cyan-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[.65rem] text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Total Layers:</span>
                    <span className="text-sm font-bold text-cyan-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>3</span>
                  </div>
                  <div className="w-px h-4 bg-cyan-500/20"/>
                  <div className="flex items-center gap-2">
                    <span className="text-[.65rem] text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>System Status:</span>
                    <span className="text-sm font-bold text-emerald-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Operational</span>
                  </div>
                  <div className="w-px h-4 bg-cyan-500/20"/>
                  <div className="flex items-center gap-2">
                    <span className="text-[.65rem] text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Uptime:</span>
                    <span className="text-sm font-bold text-cyan-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>99.9%</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {['Data', 'Compute', 'Render'].map((label, i) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-500/60" style={{ animation: `ts-glow ${1.5 + i * 0.3}s ease-in-out infinite ${i * 0.2}s` }}/>
                      <span className="text-[.6rem] text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>
    </div>
  );
}
