import React, { useRef, useEffect, useState } from 'react';
import originVideo from '../../assets/Origin_of_life_energy_s1.mp4';

const EV_STYLES = `
  .ev-visible {
    animation: ev-fadeIn 0.8s ease-out forwards;
  }
  @keyframes ev-fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .ev-glass {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
  }
  .ev-glow {
    box-shadow: 0 0 60px rgba(255, 255, 255, 0.05);
  }
`;

export default function EnergyVideo() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (document.querySelector('[data-ev-styles]')) return;
    const style = document.createElement('style');
    style.dataset.evStyles = '1';
    style.textContent = EV_STYLES;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          // Auto-play video when section becomes visible
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          }
        } else {
          // Pause when out of view
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden"
      style={{ background: '#000' }}
    >
      {/* Full-width Video */}
      <video
        ref={videoRef}
        className="w-full h-screen object-cover"
        loop
        muted
        playsInline
        onClick={togglePlay}
        style={{ cursor: 'pointer' }}
      >
        <source src={originVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Top gradient fade */}
      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #000, transparent)' }} />
      
      {/* Top Header Overlay */}
      <div className={`absolute top-0 left-0 right-0 pt-12 px-6 text-center pointer-events-none opacity-0 ${visible ? 'ev-visible' : ''}`}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-black/50 backdrop-blur-sm mb-4">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold tracking-[.2em] uppercase text-gray-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Energy Transfer Visualization
          </span>
        </div>

        <h2 className="text-[clamp(1.5rem,4vw,2.8rem)] font-extrabold leading-tight tracking-tight text-white drop-shadow-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          The Origin of Life
          <span className="text-gray-400"> — Energy Systems</span>
        </h2>
      </div>
      
      {/* Play/Pause overlay indicator */}
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
          <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: 'linear-gradient(to top, #000, transparent)' }} />
    </section>
  );
}
