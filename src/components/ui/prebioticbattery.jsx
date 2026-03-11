import React, { useEffect, useRef, useState, useMemo } from 'react';

/* ─────────────────────────────────────────────
   Keyframes & Styles (Black & White Theme)
───────────────────────────────────────────── */
const PB_STYLES = `
  @keyframes pb-fadeUp        { from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)} }
  @keyframes pb-pulse         { 0%,100%{opacity:.6}50%{opacity:1} }
  .pb-visible                 { animation: pb-fadeUp .8s cubic-bezier(.22,1,.36,1) forwards; }
  .pb-glass                   { background: rgba(0,0,0,.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,.15); }
  .pb-glass:hover             { border-color: rgba(255,255,255,.3); }
  
  /* Slider styling */
  input[type="range"].pb-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    background: linear-gradient(to right, #333 0%, #666 100%);
    border-radius: 3px;
    outline: none;
  }
  input[type="range"].pb-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: #fff;
    border: 2px solid #000;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,.5);
  }
  input[type="range"].pb-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #fff;
    border: 2px solid #000;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,.5);
  }
`;

/* ─────────────────────────────────────────────
   Physics Constants & Calculations
───────────────────────────────────────────── */
const BOLTZMANN = 1.380649e-23; // J/K
const ELEMENTARY_CHARGE = 1.602176634e-19; // C
const AVOGADRO = 6.02214076e23;
const PERMITTIVITY = 8.854187817e-12; // F/m
const WATER_PERMITTIVITY = 80;

// Mineral pKa values (affects surface charge)
const MINERAL_PKA = {
  'Olivine': 8.5,
  'Magnetite': 6.5,
  'Fe-Sulfide': 4.5,
};

// Calculate Debye length (nm)
const calcDebyeLength = (ionicStrength, temperature) => {
  const T = temperature + 273.15;
  const I = ionicStrength * 1000;
  if (I <= 0) return 100;
  const kappa = Math.sqrt(
    (2 * AVOGADRO * ELEMENTARY_CHARGE * ELEMENTARY_CHARGE * I) /
    (PERMITTIVITY * WATER_PERMITTIVITY * BOLTZMANN * T)
  );
  return (1 / kappa) * 1e9;
};

// Calculate potential at distance x (mV)
const calcPotential = (surfacePotential, x, debyeLength) => {
  return surfacePotential * Math.exp(-x / debyeLength);
};

// Calculate proton concentration factor
const calcProtonConcentration = (pH, potential, temperature) => {
  const T = temperature + 273.15;
  const bulkConc = Math.pow(10, -pH);
  const factor = Math.exp((ELEMENTARY_CHARGE * potential * 0.001) / (BOLTZMANN * T));
  return bulkConc * factor;
};

// Calculate PMF (Proton Motive Force) in mV
const calcPMF = (deltaPsi, deltaPH, temperature) => {
  const T = temperature + 273.15;
  const nernstFactor = (2.303 * BOLTZMANN * T) / ELEMENTARY_CHARGE * 1000;
  return deltaPsi + nernstFactor * deltaPH;
};

/* ─────────────────────────────────────────────
   Grid Background Canvas
───────────────────────────────────────────── */
function useGridCanvas(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      if (width === 0 || height === 0) return;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      
      ctx.clearRect(0, 0, width, height);

      const gridSize = 40;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 0.5;

      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    draw();
    
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(draw);
    });
    resizeObserver.observe(canvas);
    
    return () => resizeObserver.disconnect();
  }, [canvasRef]);
}

/* ─────────────────────────────────────────────
   3D Surface Plot Canvas
───────────────────────────────────────────── */
function use3DCanvas(canvasRef, params) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const draw = () => {
      const ctx = canvas.getContext('2d');
      
      // Get actual rendered dimensions
      const rect = canvas.getBoundingClientRect();
      const displayWidth = rect.width;
      const displayHeight = rect.height;
      
      // Skip if canvas has no size yet
      if (displayWidth === 0 || displayHeight === 0) return;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      
      const width = displayWidth;
      const height = displayHeight;
    
    ctx.clearRect(0, 0, width, height);
    
    const { surfacePotential, pH, temperature, ionicStrength, mineral } = params;
    const debyeLength = calcDebyeLength(ionicStrength, temperature);
    
    // 3D projection
    const gridSizeX = 25;
    const gridSizeY = 25;
    const scaleX = width / (gridSizeX + 12);
    const scaleY = height / (gridSizeY + 18);
    const offsetX = width * 0.12;
    const offsetY = height * 0.78;
    
    const project = (x, y, z) => {
      const isoX = (x - y) * 0.866 * scaleX + offsetX + width * 0.38;
      const isoY = (x + y) * 0.5 * scaleY - z * 2.5 + offsetY - height * 0.25;
      return [isoX, isoY];
    };
    
    // Generate surface data
    const surfaceData = [];
    const maxDebye = debyeLength * 3;
    
    for (let xi = 0; xi <= gridSizeX; xi++) {
      surfaceData[xi] = [];
      for (let yi = 0; yi <= gridSizeY; yi++) {
        const distance = (xi / gridSizeX) * maxDebye;
        const localPH = pH - 2 + (yi / gridSizeY) * 4;
        const potential = calcPotential(surfacePotential, distance, debyeLength);
        const protonConc = calcProtonConcentration(localPH, potential, temperature);
        const bulkConc = Math.pow(10, -pH);
        const enhancement = Math.log10(protonConc / bulkConc);
        const zValue = enhancement * 25 + 35;
        surfaceData[xi][yi] = Math.max(5, Math.min(85, zValue));
      }
    }
    
    // Draw surface mesh
    ctx.lineWidth = 0.8;
    
    // Y-direction lines
    for (let yi = gridSizeY; yi >= 0; yi -= 1) {
      ctx.beginPath();
      for (let xi = 0; xi <= gridSizeX; xi++) {
        const [px, py] = project(xi, yi, surfaceData[xi][yi]);
        if (xi === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      const intensity = 0.15 + (yi / gridSizeY) * 0.45;
      ctx.strokeStyle = `rgba(255, 255, 255, ${intensity})`;
      ctx.stroke();
    }
    
    // X-direction lines
    for (let xi = 0; xi <= gridSizeX; xi += 1) {
      ctx.beginPath();
      for (let yi = 0; yi <= gridSizeY; yi++) {
        const [px, py] = project(xi, yi, surfaceData[xi][yi]);
        if (yi === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      const intensity = 0.1 + (xi / gridSizeX) * 0.35;
      ctx.strokeStyle = `rgba(255, 255, 255, ${intensity})`;
      ctx.stroke();
    }
    
    // Highlight points at intersections
    for (let xi = 0; xi <= gridSizeX; xi += 3) {
      for (let yi = 0; yi <= gridSizeY; yi += 3) {
        const [px, py] = project(xi, yi, surfaceData[xi][yi]);
        const z = surfaceData[xi][yi];
        const brightness = Math.min(255, (z / 85) * 255);
        
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        ctx.fill();
      }
    }
    
    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1.5;
    
    // X axis (Distance)
    const [ax1, ay1] = project(0, 0, 0);
    const [ax2, ay2] = project(gridSizeX, 0, 0);
    ctx.beginPath();
    ctx.moveTo(ax1, ay1);
    ctx.lineTo(ax2, ay2);
    ctx.stroke();
    
    // Y axis (pH)
    const [, ay3] = project(0, 0, 0);
    const [bx2, by2] = project(0, gridSizeY, 0);
    ctx.beginPath();
    ctx.moveTo(ax1, ay3);
    ctx.lineTo(bx2, by2);
    ctx.stroke();
    
    // Z axis
    const [, cy1] = project(0, 0, 0);
    const [cx2, cy2] = project(0, 0, 80);
    ctx.beginPath();
    ctx.moveTo(ax1, cy1);
    ctx.lineTo(cx2, cy2);
    ctx.stroke();
    
    // Labels
    ctx.fillStyle = '#888';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('Distance (nm)', ax2 - 30, ay2 + 25);
    ctx.fillText('pH Variation', bx2 - 15, by2 + 25);
    
    ctx.save();
    ctx.translate(cx2 - 25, cy2 + 10);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('[H⁺] Factor', 0, 0);
    ctx.restore();
    
    // Title & info
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(`3D Proton Gradient Surface: ${mineral}`, 15, 25);
    
    ctx.font = '11px monospace';
    ctx.fillStyle = '#666';
    ctx.fillText(`λD = ${debyeLength.toFixed(1)} nm | T = ${temperature}°C | ψ₀ = ${surfacePotential} mV | pH = ${pH.toFixed(1)} | I = ${ionicStrength} M`, 15, 45);
    };
    
    // Draw immediately
    draw();
    
    // Also redraw on resize to handle initial layout
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(draw);
    });
    resizeObserver.observe(canvas);
    
    return () => resizeObserver.disconnect();
    
  }, [canvasRef, params]);
}

/* ─────────────────────────────────────────────
   Slider Control Component
───────────────────────────────────────────── */
const SliderControl = ({ label, value, min, max, step, unit, onChange, description }) => (
  <div className="mb-5">
    <div className="flex justify-between items-center mb-2">
      <label className="text-xs font-bold tracking-wider uppercase text-gray-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {label}
      </label>
      <span className="text-sm font-bold text-white px-2 py-0.5 bg-white/10 rounded" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {typeof value === 'number' ? (Number.isInteger(step) ? value : value.toFixed(step < 1 ? Math.abs(Math.floor(Math.log10(step))) : 0)) : value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="pb-slider w-full"
    />
    <p className="text-[10px] text-gray-500 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
      {description}
    </p>
  </div>
);

/* ─────────────────────────────────────────────
   Mineral Selector
───────────────────────────────────────────── */
const MineralSelector = ({ value, onChange }) => (
  <div className="mb-5">
    <label className="text-xs font-bold tracking-wider uppercase text-gray-400 block mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      Mineral Type (≡M-OH)
    </label>
    <div className="grid grid-cols-3 gap-2">
      {['Olivine', 'Magnetite', 'Fe-Sulfide'].map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            value === m ? 'bg-white text-black' : 'bg-white/10 text-gray-400 hover:bg-white/20'
          }`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {m}
        </button>
      ))}
    </div>
    <p className="text-[10px] text-gray-500 mt-2" style={{ fontFamily: "'Inter', sans-serif" }}>
      pKa = {MINERAL_PKA[value]} — Changes surface hydroxyl group behavior
    </p>
  </div>
);

/* ─────────────────────────────────────────────
   Chart: Electric Potential vs Distance
───────────────────────────────────────────── */
const PotentialChart = ({ params }) => {
  const { surfacePotential, temperature, ionicStrength } = params;
  const debyeLength = calcDebyeLength(ionicStrength, temperature);
  
  const points = useMemo(() => {
    const pts = [];
    const maxDist = debyeLength * 4;
    for (let i = 0; i <= 50; i++) {
      const x = (i / 50) * maxDist;
      const y = calcPotential(surfacePotential, x, debyeLength);
      pts.push({ x, y });
    }
    return pts;
  }, [surfacePotential, debyeLength]);
  
  const maxX = debyeLength * 4;
  const maxY = surfacePotential;
  
  return (
    <div className="pb-glass rounded-xl p-4 h-full">
      <h3 className="text-sm font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Electric Potential ψ(x)
      </h3>
      <p className="text-[10px] text-gray-500 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Exponential decay: ψ = ψ₀·e^(-x/λD)
      </p>
      
      <svg viewBox="0 0 300 180" className="w-full h-44">
        {/* Grid */}
        {[...Array(5)].map((_, i) => (
          <g key={i}>
            <line x1="45" y1={30 + i * 30} x2="290" y2={30 + i * 30} stroke="#333" strokeWidth="0.5" />
            <text x="40" y={34 + i * 30} fill="#666" fontSize="8" textAnchor="end" fontFamily="monospace">
              {Math.round(maxY * (1 - i / 4))}
            </text>
          </g>
        ))}
        {[...Array(5)].map((_, i) => (
          <g key={`x${i}`}>
            <line x1={45 + i * 61.25} y1="30" x2={45 + i * 61.25} y2="150" stroke="#333" strokeWidth="0.5" />
            <text x={45 + i * 61.25} y="165" fill="#666" fontSize="8" textAnchor="middle" fontFamily="monospace">
              {(maxX * i / 4).toFixed(1)}
            </text>
          </g>
        ))}
        
        {/* Debye length marker */}
        <line 
          x1={45 + (debyeLength / maxX) * 245} 
          y1="30" 
          x2={45 + (debyeLength / maxX) * 245} 
          y2="150" 
          stroke="#888" 
          strokeWidth="1.5" 
          strokeDasharray="4 2" 
        />
        <text x={45 + (debyeLength / maxX) * 245} y="25" fill="#aaa" fontSize="9" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
          λD
        </text>
        
        {/* Chart line */}
        <path
          d={points.map((p, i) => {
            const px = 45 + (p.x / maxX) * 245;
            const py = 150 - (p.y / maxY) * 120;
            return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
          }).join(' ')}
          fill="none"
          stroke="#fff"
          strokeWidth="2"
        />
        
        {/* Data points */}
        {points.filter((_, i) => i % 5 === 0).map((p, i) => {
          const px = 45 + (p.x / maxX) * 245;
          const py = 150 - (p.y / maxY) * 120;
          return <circle key={i} cx={px} cy={py} r="3" fill="#fff" />;
        })}
        
        <text x="170" y="178" fill="#888" fontSize="9" textAnchor="middle" fontFamily="monospace">Distance (nm)</text>
        <text x="15" y="90" fill="#888" fontSize="9" textAnchor="middle" fontFamily="monospace" transform="rotate(-90, 15, 90)">ψ (mV)</text>
      </svg>
      
      <div className="text-[10px] text-gray-500 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Debye Length (λD) = {debyeLength.toFixed(2)} nm
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Chart: Proton Concentration Profile
───────────────────────────────────────────── */
const ProtonChart = ({ params }) => {
  const { surfacePotential, pH, temperature, ionicStrength } = params;
  const debyeLength = calcDebyeLength(ionicStrength, temperature);
  
  const points = useMemo(() => {
    const pts = [];
    const maxDist = debyeLength * 4;
    const bulkConc = Math.pow(10, -pH);
    
    for (let i = 0; i <= 50; i++) {
      const x = (i / 50) * maxDist;
      const potential = calcPotential(surfacePotential, x, debyeLength);
      const conc = calcProtonConcentration(pH, potential, temperature);
      pts.push({ x, y: conc / bulkConc });
    }
    return pts;
  }, [surfacePotential, pH, temperature, debyeLength]);
  
  const maxX = debyeLength * 4;
  const maxY = Math.max(...points.map(p => p.y));
  
  return (
    <div className="pb-glass rounded-xl p-4 h-full">
      <h3 className="text-sm font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        [H⁺] Enhancement Factor
      </h3>
      <p className="text-[10px] text-gray-500 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Proton accumulation near surface (× bulk)
      </p>
      
      <svg viewBox="0 0 300 180" className="w-full h-44">
        {/* Grid */}
        {[...Array(5)].map((_, i) => (
          <g key={i}>
            <line x1="45" y1={30 + i * 30} x2="290" y2={30 + i * 30} stroke="#333" strokeWidth="0.5" />
            <text x="40" y={34 + i * 30} fill="#666" fontSize="8" textAnchor="end" fontFamily="monospace">
              {(maxY * (1 - i / 4)).toFixed(1)}×
            </text>
          </g>
        ))}
        
        {/* Filled area */}
        <path
          d={`M 45 150 ${points.map((p) => {
            const px = 45 + (p.x / maxX) * 245;
            const py = 150 - ((p.y - 1) / (maxY - 1)) * 120;
            return `L ${px} ${Math.max(30, Math.min(150, py))}`;
          }).join(' ')} L 290 150 Z`}
          fill="rgba(255,255,255,0.08)"
        />
        
        {/* Line */}
        <path
          d={points.map((p, i) => {
            const px = 45 + (p.x / maxX) * 245;
            const py = 150 - ((p.y - 1) / (maxY - 1)) * 120;
            return `${i === 0 ? 'M' : 'L'} ${px} ${Math.max(30, Math.min(150, py))}`;
          }).join(' ')}
          fill="none"
          stroke="#fff"
          strokeWidth="2"
        />
        
        {/* Baseline */}
        <line x1="45" y1="150" x2="290" y2="150" stroke="#666" strokeWidth="1" strokeDasharray="2 2" />
        <text x="292" y="153" fill="#666" fontSize="8" fontFamily="monospace">1×</text>
        
        <text x="170" y="178" fill="#888" fontSize="9" textAnchor="middle" fontFamily="monospace">Distance (nm)</text>
      </svg>
      
      <div className="text-[10px] text-gray-500 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Surface [H⁺] = {maxY.toFixed(1)}× bulk ({Math.pow(10, -pH).toExponential(1)} M)
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Chart: PMF Components
───────────────────────────────────────────── */
const PMFChart = ({ params }) => {
  const { surfacePotential, pH, temperature, mineral } = params;
  const pKa = MINERAL_PKA[mineral];
  
  const deltaPsi = surfacePotential * 0.5;
  const deltaPH = Math.abs(pH - pKa) * 0.3;
  const totalPMF = calcPMF(deltaPsi, deltaPH, temperature);
  
  const components = [
    { label: 'Δψ', value: deltaPsi, desc: 'Membrane Potential' },
    { label: 'ΔpH×59', value: deltaPH * 59, desc: 'pH Gradient Component' },
    { label: 'PMF', value: totalPMF, desc: 'Total Proton Motive Force' },
  ];
  
  const maxVal = Math.max(...components.map(c => Math.abs(c.value)), 150);
  
  return (
    <div className="pb-glass rounded-xl p-4 h-full">
      <h3 className="text-sm font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Proton Motive Force (PMF)
      </h3>
      <p className="text-[10px] text-gray-500 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Δp = Δψ - (2.3RT/F)ΔpH
      </p>
      
      <div className="space-y-3 mt-2">
        {components.map((comp, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {comp.label}
              </span>
              <span className="text-xs text-white font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {comp.value.toFixed(1)} mV
              </span>
            </div>
            <div className="h-5 bg-white/5 rounded overflow-hidden relative">
              <div 
                className="h-full bg-white rounded transition-all duration-300"
                style={{ width: `${Math.abs(comp.value) / maxVal * 100}%` }}
              />
              {/* 120mV threshold marker */}
              {i === 2 && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-500"
                  style={{ left: `${120 / maxVal * 100}%` }}
                />
              )}
            </div>
            <p className="text-[9px] text-gray-600 mt-0.5">{comp.desc}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex justify-between items-center text-[10px] text-gray-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <span>ATP Synthesis Threshold</span>
          <span>~120 mV</span>
        </div>
        <div className="text-xs mt-2 font-bold text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {totalPMF >= 120 ? (
            <span className="text-white">✓ Sufficient for ATP synthesis</span>
          ) : (
            <span className="text-gray-500">✗ Below ATP threshold ({(120 - totalPMF).toFixed(0)} mV short)</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Chart: Nernst Slope vs Temperature
───────────────────────────────────────────── */
const NernstChart = ({ params }) => {
  const { temperature } = params;
  
  const points = useMemo(() => {
    const pts = [];
    for (let t = 0; t <= 200; t += 5) {
      const T = t + 273.15;
      const nernstSlope = (2.303 * BOLTZMANN * T) / ELEMENTARY_CHARGE * 1000;
      pts.push({ x: t, y: nernstSlope });
    }
    return pts;
  }, []);
  
  const currentSlope = (2.303 * BOLTZMANN * (temperature + 273.15)) / ELEMENTARY_CHARGE * 1000;
  
  return (
    <div className="pb-glass rounded-xl p-4 h-full">
      <h3 className="text-sm font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Nernstian Slope (kT/e)
      </h3>
      <p className="text-[10px] text-gray-500 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Temperature effect: 2.303 RT/F
      </p>
      
      <svg viewBox="0 0 300 180" className="w-full h-44">
        {/* Grid */}
        {[...Array(5)].map((_, i) => (
          <line key={i} x1="45" y1={30 + i * 30} x2="290" y2={30 + i * 30} stroke="#333" strokeWidth="0.5" />
        ))}
        
        {/* Y-axis labels */}
        <text x="40" y="34" fill="#666" fontSize="8" textAnchor="end" fontFamily="monospace">100</text>
        <text x="40" y="94" fill="#666" fontSize="8" textAnchor="end" fontFamily="monospace">75</text>
        <text x="40" y="154" fill="#666" fontSize="8" textAnchor="end" fontFamily="monospace">50</text>
        
        {/* Line */}
        <path
          d={points.map((p, i) => {
            const px = 45 + (p.x / 200) * 245;
            const py = 150 - ((p.y - 50) / 50) * 120;
            return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
          }).join(' ')}
          fill="none"
          stroke="#fff"
          strokeWidth="2"
        />
        
        {/* Current marker */}
        <circle 
          cx={45 + (temperature / 200) * 245} 
          cy={150 - ((currentSlope - 50) / 50) * 120} 
          r="6" 
          fill="#fff" 
        />
        <line
          x1={45 + (temperature / 200) * 245}
          y1="30"
          x2={45 + (temperature / 200) * 245}
          y2="150"
          stroke="#888"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        
        <text x="170" y="178" fill="#888" fontSize="9" textAnchor="middle" fontFamily="monospace">Temperature (°C)</text>
        <text x="12" y="90" fill="#888" fontSize="9" textAnchor="middle" fontFamily="monospace" transform="rotate(-90, 12, 90)">mV/pH</text>
      </svg>
      
      <div className="text-[10px] text-gray-500 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        At {temperature}°C: {currentSlope.toFixed(1)} mV per pH unit
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Factor Information Table
───────────────────────────────────────────── */
const FactorTable = ({ params }) => {
  const debyeLength = calcDebyeLength(params.ionicStrength, params.temperature);
  const nernstSlope = (2.303 * BOLTZMANN * (params.temperature + 273.15)) / ELEMENTARY_CHARGE * 1000;
  
  const factors = [
    { symbol: 'ψ₀', name: 'Surface Potential', value: `${params.surfacePotential} mV`, role: 'Determines the strength of the initial proton pull.' },
    { symbol: 'pH', name: 'pH of Bulk Water', value: params.pH.toFixed(1), role: `Sets the baseline proton concentration (10⁻${params.pH.toFixed(1)} M).` },
    { symbol: 'T', name: 'Temperature', value: `${params.temperature}°C`, role: `Affects ion mobility and the Nernstian slope (${nernstSlope.toFixed(1)} mV).` },
    { symbol: 'I', name: 'Ionic Strength', value: `${params.ionicStrength} M`, role: `Determines the "Debye Length"—${debyeLength.toFixed(1)} nm gradient extent.` },
    { symbol: '≡M-OH', name: 'Mineral Type', value: params.mineral, role: `Changes the pKa of surface hydroxyl groups (pKa = ${MINERAL_PKA[params.mineral]}).` },
  ];
  
  return (
    <div className="pb-glass rounded-xl p-4">
      <h3 className="text-sm font-bold text-white mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Simulation Factor Reference
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 text-gray-500 font-normal">Symbol</th>
              <th className="text-left py-2 text-gray-500 font-normal">Factor</th>
              <th className="text-left py-2 text-gray-500 font-normal">Current</th>
              <th className="text-left py-2 text-gray-500 font-normal">Role in Simulation</th>
            </tr>
          </thead>
          <tbody>
            {factors.map((f, i) => (
              <tr key={i} className="border-b border-white/5">
                <td className="py-2.5 text-white font-bold">{f.symbol}</td>
                <td className="py-2.5 text-gray-400">{f.name}</td>
                <td className="py-2.5 text-white">{f.value}</td>
                <td className="py-2.5 text-gray-500 text-[10px]">{f.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function PrebioticBattery() {
  const sectionRef = useRef(null);
  const gridCanvasRef = useRef(null);
  const canvas3DRef = useRef(null);
  const [visible, setVisible] = useState(false);
  
  // Parameters
  const [surfacePotential, setSurfacePotential] = useState(150);
  const [pH, setPH] = useState(9.0);
  const [temperature, setTemperature] = useState(80);
  const [ionicStrength, setIonicStrength] = useState(0.1);
  const [mineral, setMineral] = useState('Olivine');

  const params = useMemo(() => ({
    surfacePotential,
    pH,
    temperature,
    ionicStrength,
    mineral,
  }), [surfacePotential, pH, temperature, ionicStrength, mineral]);

  useGridCanvas(gridCanvasRef);
  use3DCanvas(canvas3DRef, params);

  useEffect(() => {
    if (document.querySelector('[data-pb-styles]')) return;
    const style = document.createElement('style');
    style.dataset.pbStyles = '1';
    style.textContent = PB_STYLES;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden py-16"
      style={{ background: '#000' }}
    >
      <canvas ref={gridCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className={`text-center mb-12 opacity-0 ${visible ? 'pb-visible' : ''}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-black/50 backdrop-blur-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-white" style={{ animation: 'pb-pulse 2s ease-in-out infinite' }} />
            <span className="text-[10px] font-bold tracking-[.2em] uppercase text-gray-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Interactive Simulation
            </span>
          </div>

          <h2 className="text-[clamp(1.8rem,4.5vw,3.2rem)] font-extrabold leading-tight tracking-tight mb-4 text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Mapping the Prebiotic Battery
            <br />
            <span className="text-gray-500">in Real-Time</span>
          </h2>

          <p className="text-[clamp(.85rem,1.4vw,1rem)] text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            Adjust the sliders to explore electrochemical gradients at ancient mineral-water interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls */}
          <div className={`opacity-0 ${visible ? 'pb-visible' : ''}`} style={visible ? { animationDelay: '0.2s' } : undefined}>
            <div className="pb-glass rounded-2xl p-6 sticky top-6">
              <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span className="w-2 h-2 rounded-full bg-white" />
                Simulation Parameters
              </h3>
              
              <SliderControl
                label="Surface Potential (ψ₀)"
                value={surfacePotential}
                min={50}
                max={300}
                step={10}
                unit=" mV"
                onChange={setSurfacePotential}
                description="Electric charge of the mineral surface"
              />
              
              <SliderControl
                label="Ocean pH"
                value={pH}
                min={6.0}
                max={11.0}
                step={0.1}
                unit=""
                onChange={setPH}
                description={`[H⁺] = ${Math.pow(10, -pH).toExponential(1)} M`}
              />
              
              <SliderControl
                label="Temperature (T)"
                value={temperature}
                min={20}
                max={200}
                step={5}
                unit="°C"
                onChange={setTemperature}
                description="Affects ion mobility & Nernst slope"
              />
              
              <SliderControl
                label="Ionic Strength (I)"
                value={ionicStrength}
                min={0.01}
                max={1.0}
                step={0.01}
                unit=" M"
                onChange={setIonicStrength}
                description={`Debye Length: ${calcDebyeLength(ionicStrength, temperature).toFixed(1)} nm`}
              />
              
              <MineralSelector value={mineral} onChange={setMineral} />
            </div>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 3D Plot */}
            <div className={`opacity-0 ${visible ? 'pb-visible' : ''}`} style={visible ? { animationDelay: '0.3s' } : undefined}>
              <div className="pb-glass rounded-2xl p-4">
                <canvas
                  ref={canvas3DRef}
                  className="w-full h-80 rounded-xl"
                  style={{ background: '#080808' }}
                />
              </div>
            </div>
            
            {/* 2D Charts */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 ${visible ? 'pb-visible' : ''}`} style={visible ? { animationDelay: '0.4s' } : undefined}>
              <PotentialChart params={params} />
              <ProtonChart params={params} />
              <PMFChart params={params} />
              <NernstChart params={params} />
            </div>
            
            {/* Factor Table */}
            <div className={`opacity-0 ${visible ? 'pb-visible' : ''}`} style={visible ? { animationDelay: '0.5s' } : undefined}>
              <FactorTable params={params} />
            </div>
          </div>
        </div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to top, #000, transparent)' }} />
    </section>
  );
}
