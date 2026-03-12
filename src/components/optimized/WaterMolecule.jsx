import React, { memo } from 'react';

/* Optimized Water Molecule SVG Component */
const WaterMolecule = memo(({ size = 90, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 90 90" 
    fill="none"
    className={className}
    style={{ willChange: 'transform' }}
  >
    {/* electron cloud */}
    <ellipse 
      cx="45" 
      cy="45" 
      rx="38" 
      ry="28" 
      stroke="rgba(6,182,212,.12)" 
      strokeWidth=".8" 
      strokeDasharray="3 4"
    />
    {/* O–H bonds */}
    <line 
      x1="45" 
      y1="45" 
      x2="22" 
      y2="32" 
      stroke="rgba(6,182,212,.55)" 
      strokeWidth="1.6"
    />
    <line 
      x1="45" 
      y1="45" 
      x2="68" 
      y2="32" 
      stroke="rgba(6,182,212,.55)" 
      strokeWidth="1.6"
    />
    {/* Hydrogen atoms */}
    <circle 
      cx="22" 
      cy="32" 
      r="9" 
      stroke="rgba(14,165,233,.55)" 
      strokeWidth="1"
    />
    <circle 
      cx="68" 
      cy="32" 
      r="9" 
      stroke="rgba(14,165,233,.55)" 
      strokeWidth="1"
    />
    {/* Oxygen atom */}
    <circle 
      cx="45" 
      cy="45" 
      r="15" 
      stroke="rgba(59,130,246,.65)" 
      strokeWidth="1.4"
    />
  </svg>
));

WaterMolecule.displayName = 'WaterMolecule';

export default WaterMolecule;