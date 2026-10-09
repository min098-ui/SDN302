"use client";

import { useEffect, useState } from "react";

export default function AnimatedPlanet() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate particles on client to avoid hydration mismatch
    const generated = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 5 + 3,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.4,
      color: Math.random() > 0.6 ? 'bg-secondary-300' : Math.random() > 0.5 ? 'bg-secondary-300' : 'bg-white',
    }));
    setParticles(generated);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative w-full h-[320px] flex items-center justify-center [perspective:1200px] my-6">
      <style>{`
        @keyframes planet-spin {
          from { transform: rotateX(75deg) rotateY(20deg) rotateZ(0deg); }
          to { transform: rotateX(75deg) rotateY(20deg) rotateZ(360deg); }
        }
        @keyframes planet-spin-reverse {
          from { transform: rotateX(65deg) rotateY(-25deg) rotateZ(0deg); }
          to { transform: rotateX(65deg) rotateY(-25deg) rotateZ(-360deg); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -25px) scale(1.2); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: inset -10px -10px 20px rgba(0,0,0,0.1), 0 0 40px rgba(255,255,255,0.6); }
          50% { box-shadow: inset -10px -10px 20px rgba(0,0,0,0.1), 0 0 60px rgba(255,255,255,0.9); }
        }
        @keyframes float-bunny {
          0%, 100% { transform: translateY(5px) scale(1.05); }
          50% { transform: translateY(-5px) scale(1.1); }
        }
      `}</style>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full shadow-[0_0_12px_currentColor] text-transparent ${p.color}`}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              top: `${p.top}%`,
              left: `${p.left}%`,
              opacity: p.opacity,
              animation: `float-particle ${p.duration}s ease-in-out infinite ${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* The Central Glowing Planet with Bunny (Snow Globe Effect) */}
      <div 
        className="absolute w-[130px] h-[130px] rounded-full bg-white z-10 flex items-center justify-center overflow-hidden border-2 border-white/50" 
        style={{ animation: 'glow-pulse 4s ease-in-out infinite' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/mascot-bunny-nobg.png" 
          alt="3D Bunny Mascot" 
          className="mascot-bunny-img w-[85%] h-[85%] object-contain object-center drop-shadow-md"
          style={{ animation: 'float-bunny 5s ease-in-out infinite' }}
        />
      </div>

      {/* The Cyan Ring */}
      <div 
        className="absolute w-[220px] h-[220px] rounded-full border-[3px] border-secondary-400/90 shadow-[0_0_20px_rgba(34,211,238,0.8),inset_0_0_20px_rgba(34,211,238,0.8)] z-20"
        style={{ animation: 'planet-spin 10s linear infinite' }}
      />
      
      {/* The Purple Ring */}
      <div 
        className="absolute w-[270px] h-[270px] rounded-full border-[2px] border-secondary-400/70 shadow-[0_0_20px_rgba(232,121,249,0.6),inset_0_0_20px_rgba(232,121,249,0.6)] z-20"
        style={{ animation: 'planet-spin-reverse 15s linear infinite' }}
      />
    </div>
  );
}
