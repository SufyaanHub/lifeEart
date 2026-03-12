import React, { memo, useRef, useEffect } from 'react';

/* Optimized Particle Canvas with performance improvements */
const ParticleCanvas = memo(() => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let raf;
    let isVisible = true;

    // Optimized resize handling
    const resize = () => { 
      canvas.width = canvas.offsetWidth; 
      canvas.height = canvas.offsetHeight; 
    };
    resize();
    
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Visibility API for performance
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Reduced particle count for better performance
    const N = window.innerWidth < 768 ? 50 : 80;
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * .35, // Reduced velocity
      vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.8 + .4,   // Smaller particles
      base: Math.random() * .4 + .1,
      ph: Math.random() * Math.PI * 2,
      spd: Math.random() * .008 + .003, // Slower animation
      glow: Math.random() > .7,      // Fewer glowing particles
    }));

    let lastTime = 0;
    const targetFPS = 30; // Reduced from 60fps
    const frameInterval = 1000 / targetFPS;

    const draw = (currentTime) => {
      // Only render if visible and at target FPS
      if (!isVisible || (currentTime - lastTime < frameInterval)) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Optimized connection drawing - reduced distance
      const maxDistance = window.innerWidth < 768 ? 80 : 100;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          
          if (d < maxDistance) {
            const opacity = (1 - d / maxDistance) * .08; // Reduced opacity
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6,182,212,${opacity})`;
            ctx.lineWidth = .4; // Thinner lines
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }

      // Optimized particle rendering
      ps.forEach(p => {
        p.x += p.vx; 
        p.y += p.vy; 
        p.ph += p.spd;
        
        // Boundary wrapping
        if (p.x < -6) p.x = canvas.width + 6;
        else if (p.x > canvas.width + 6) p.x = -6;
        if (p.y < -6) p.y = canvas.height + 6;
        else if (p.y > canvas.height + 6) p.y = -6;

        const op = p.base * (.6 + .4 * Math.sin(p.ph));
        
        // Reduced shadow blur for performance
        ctx.shadowBlur = p.glow ? 8 : 4;
        ctx.shadowColor = p.glow ? 'rgba(6,182,212,.7)' : 'rgba(14,165,233,.4)';
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.glow ? `rgba(6,182,212,${op})` : `rgba(14,165,233,${op})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      raf = requestAnimationFrame(draw);
    };
    
    draw(performance.now());

    return () => { 
      cancelAnimationFrame(raf); 
      ro.disconnect(); 
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-90% z-1" 
      style={{ willChange: 'auto' }}
    />
  );
});

ParticleCanvas.displayName = 'ParticleCanvas';

export default ParticleCanvas;