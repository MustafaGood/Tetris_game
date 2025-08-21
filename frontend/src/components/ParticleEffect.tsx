import React, { useEffect, useState, useRef } from 'react';

// Partikelsystem för visuella effekter (svenska kommentarer)
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface ParticleEffectProps {
  isActive: boolean; // Om effekten ska spelas
  position: { x: number; y: number }; // Startposition i px
  onComplete: () => void; // Callback när alla partiklar är döda
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ isActive, position, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const calledRef = useRef(false); // Förhindra flera onComplete-anrop

  useEffect(() => {
    if (!isActive) return;

    calledRef.current = false;

    const newParticles: Particle[] = [];
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
    
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: Date.now() + i, // unikt id
        x: position.x,
        y: position.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1,
        maxLife: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2
      });
    }

    setParticles(newParticles);

    const animate = () => {
      setParticles(prevParticles => {
        const updated = prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx * 0.16,
            y: particle.y + particle.vy * 0.16,
            vy: particle.vy + 0.3,
            life: particle.life - 0.02
          }))
          .filter(particle => particle.life > 0);

        if (updated.length === 0 && !calledRef.current) {
          calledRef.current = true;
          // Kör callback när animationen är klar
          onComplete();
          return [];
        }

        return updated;
      });
    };

    const interval = setInterval(animate, 16);

    return () => clearInterval(interval);
  }, [isActive, position, onComplete]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life,
            transform: `scale(${particle.life})`,
            transition: 'all 0.016s linear'
          }}
        />
      ))}
    </div>
  );
};

export default ParticleEffect;
