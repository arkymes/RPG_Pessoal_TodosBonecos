import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TransitionType = 'fire' | 'steampress' | 'none';

interface ThemeTransitionProps {
  isTransitioning: boolean;
  transitionType: TransitionType;
  onComplete: () => void;
}

// ============================================
// TRANSIÇÃO DE FOGO - ÉPICA E CINEMATOGRÁFICA
// ============================================

const FireTransition: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
      hue: number;
    }

    const particles: Particle[] = [];
    let burnLine = canvas.height + 100;
    let frame = 0;
    const totalFrames = 120;
    let themeChanged = false;

    const createParticle = (x: number, y: number) => {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 15 - 5,
        size: Math.random() * 30 + 10,
        life: 1,
        maxLife: Math.random() * 40 + 20,
        hue: Math.random() * 40 + 10,
      });
    };

    const createEmber = (x: number, y: number) => {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 25 - 10,
        size: Math.random() * 4 + 2,
        life: 1,
        maxLife: Math.random() * 60 + 40,
        hue: Math.random() * 30 + 30,
      });
    };

    const animate = () => {
      frame++;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const progress = Math.min(frame / (totalFrames * 0.6), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      burnLine = canvas.height + 100 - (canvas.height + 200) * easeProgress;

      if (progress > 0.5 && !themeChanged) {
        themeChanged = true;
        onComplete();
      }

      // Área queimada
      const burnGradient = ctx.createLinearGradient(0, canvas.height, 0, burnLine - 100);
      burnGradient.addColorStop(0, 'rgba(20, 5, 0, 1)');
      burnGradient.addColorStop(0.3, 'rgba(40, 10, 0, 0.95)');
      burnGradient.addColorStop(0.7, 'rgba(80, 20, 0, 0.8)');
      burnGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = burnGradient;
      ctx.fillRect(0, burnLine - 100, canvas.width, canvas.height - burnLine + 200);

      // Linha de fogo principal
      const fireGradient = ctx.createLinearGradient(0, burnLine + 80, 0, burnLine - 150);
      fireGradient.addColorStop(0, 'rgba(255, 50, 0, 0)');
      fireGradient.addColorStop(0.2, 'rgba(255, 100, 0, 0.8)');
      fireGradient.addColorStop(0.4, 'rgba(255, 150, 0, 1)');
      fireGradient.addColorStop(0.6, 'rgba(255, 200, 50, 1)');
      fireGradient.addColorStop(0.8, 'rgba(255, 255, 150, 0.9)');
      fireGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = fireGradient;
      ctx.fillRect(0, burnLine - 150, canvas.width, 230);

      // Gerar partículas
      if (frame < totalFrames * 0.8) {
        for (let i = 0; i < 15; i++) {
          createParticle(Math.random() * canvas.width, burnLine);
        }
        for (let i = 0; i < 8; i++) {
          createEmber(Math.random() * canvas.width, burnLine);
        }
      }

      // Atualizar partículas
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.vx *= 0.99;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const alpha = p.life * 0.8;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${alpha})`);
        gradient.addColorStop(0.4, `hsla(${p.hue - 10}, 100%, 50%, ${alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(${p.hue - 20}, 100%, 30%, 0)`);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Distorção de calor
      if (frame % 3 === 0) {
        ctx.strokeStyle = 'rgba(255, 200, 100, 0.1)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const y = burnLine - 50 - i * 30;
          ctx.moveTo(0, y);
          for (let x = 0; x < canvas.width; x += 20) {
            ctx.lineTo(x, y + Math.sin(x * 0.02 + frame * 0.1) * 10);
          }
          ctx.stroke();
        }
      }

      // Flash inicial
      if (frame < 10) {
        ctx.fillStyle = `rgba(255, 200, 100, ${(10 - frame) / 20})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (frame < totalFrames + 30) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 1.1] }}
        transition={{ duration: 2, times: [0, 0.2, 0.7, 1] }}
      >
        <div className="text-center">
          <h1 
            className="text-6xl md:text-8xl font-bold tracking-wider"
            style={{
              background: 'linear-gradient(180deg, #fff 0%, #ffd700 30%, #ff6b00 60%, #ff0000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(255, 100, 0, 0.8), 0 0 120px rgba(255, 50, 0, 0.6)',
              filter: 'drop-shadow(0 0 20px rgba(255, 100, 0, 1))'
            }}
          >
            KAELEN
          </h1>
          <p 
            className="text-xl md:text-2xl mt-4 text-orange-300 tracking-[0.3em] uppercase"
            style={{ textShadow: '0 0 20px rgba(255, 100, 0, 0.8)' }}
          >
            Chama Selvagem
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// TRANSIÇÃO STEAMPUNK - PRENSA INDUSTRIAL
// ============================================

const SteampunkTransition: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frame = 0;
    const totalFrames = 150;
    let themeChanged = false;

    interface Gear {
      x: number;
      y: number;
      radius: number;
      teeth: number;
      rotation: number;
      speed: number;
    }

    const gears: Gear[] = [];
    
    const gearPositions = [
      { x: 0.1, y: 0.15, r: 80, t: 12 },
      { x: 0.9, y: 0.15, r: 100, t: 16 },
      { x: 0.05, y: 0.85, r: 120, t: 18 },
      { x: 0.95, y: 0.85, r: 90, t: 14 },
      { x: 0.5, y: 0.1, r: 150, t: 20 },
      { x: 0.2, y: 0.5, r: 60, t: 10 },
      { x: 0.8, y: 0.5, r: 70, t: 12 },
    ];

    gearPositions.forEach((pos, i) => {
      gears.push({
        x: pos.x * canvas.width,
        y: pos.y * canvas.height,
        radius: pos.r,
        teeth: pos.t,
        rotation: Math.random() * Math.PI * 2,
        speed: (i % 2 === 0 ? 1 : -1) * (0.02 + Math.random() * 0.02),
      });
    });

    const drawGear = (gear: Gear, alpha: number) => {
      ctx.save();
      ctx.translate(gear.x, gear.y);
      ctx.rotate(gear.rotation);

      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, gear.radius);
      gradient.addColorStop(0, `rgba(205, 150, 80, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(160, 110, 50, ${alpha})`);
      gradient.addColorStop(1, `rgba(100, 70, 30, ${alpha})`);

      ctx.beginPath();
      ctx.arc(0, 0, gear.radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = `rgba(80, 50, 20, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.stroke();

      for (let i = 0; i < gear.teeth; i++) {
        const angle = (i / gear.teeth) * Math.PI * 2;
        const innerR = gear.radius * 0.65;
        const outerR = gear.radius;
        const toothWidth = Math.PI / gear.teeth * 0.7;

        ctx.beginPath();
        ctx.moveTo(Math.cos(angle - toothWidth) * innerR, Math.sin(angle - toothWidth) * innerR);
        ctx.lineTo(Math.cos(angle - toothWidth * 0.5) * outerR, Math.sin(angle - toothWidth * 0.5) * outerR);
        ctx.lineTo(Math.cos(angle + toothWidth * 0.5) * outerR, Math.sin(angle + toothWidth * 0.5) * outerR);
        ctx.lineTo(Math.cos(angle + toothWidth) * innerR, Math.sin(angle + toothWidth) * innerR);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(0, 0, gear.radius * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(60, 40, 20, ${alpha})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(180, 130, 60, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.stroke();

      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const r = gear.radius * 0.45;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 70, 40, ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(200, 150, 80, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    };

    interface Steam {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
    }

    const steamParticles: Steam[] = [];

    const createSteam = (x: number, y: number) => {
      steamParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3 - 1,
        size: Math.random() * 40 + 20,
        life: 1,
      });
    };

    const animate = () => {
      frame++;

      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#1a1208');
      bgGradient.addColorStop(0.5, '#2d1f10');
      bgGradient.addColorStop(1, '#1a1208');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const pressProgress = Math.min(frame / (totalFrames * 0.4), 1);
      const easePress = 1 - Math.pow(1 - pressProgress, 4);
      
      const plateOffset = canvas.height * 0.5 * (1 - easePress);
      const topPlateY = -canvas.height * 0.5 + plateOffset + canvas.height * 0.5;
      const bottomPlateY = canvas.height - plateOffset - canvas.height * 0.1;

      if (pressProgress > 0.9 && !themeChanged) {
        themeChanged = true;
        onComplete();
      }

      gears.forEach(gear => {
        gear.rotation += gear.speed;
        drawGear(gear, 0.6);
      });

      // Placa superior
      const topGradient = ctx.createLinearGradient(0, topPlateY - 200, 0, topPlateY);
      topGradient.addColorStop(0, '#3d2a14');
      topGradient.addColorStop(0.3, '#5c4020');
      topGradient.addColorStop(0.7, '#8b6030');
      topGradient.addColorStop(1, '#6b4820');
      
      ctx.fillStyle = topGradient;
      ctx.fillRect(0, topPlateY - 200, canvas.width, 200);

      ctx.fillStyle = '#4a3318';
      for (let x = 30; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.arc(x, topPlateY - 15, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = '#8b6914';
      ctx.fillRect(0, topPlateY - 20, canvas.width, 20);
      ctx.fillStyle = '#5c4a1f';
      ctx.fillRect(0, topPlateY - 5, canvas.width, 5);

      // Placa inferior
      const bottomGradient = ctx.createLinearGradient(0, bottomPlateY, 0, bottomPlateY + 200);
      bottomGradient.addColorStop(0, '#6b4820');
      bottomGradient.addColorStop(0.3, '#8b6030');
      bottomGradient.addColorStop(0.7, '#5c4020');
      bottomGradient.addColorStop(1, '#3d2a14');
      
      ctx.fillStyle = bottomGradient;
      ctx.fillRect(0, bottomPlateY, canvas.width, 200);

      ctx.fillStyle = '#5c4a1f';
      ctx.fillRect(0, bottomPlateY, canvas.width, 5);
      ctx.fillStyle = '#8b6914';
      ctx.fillRect(0, bottomPlateY + 5, canvas.width, 15);

      ctx.fillStyle = '#4a3318';
      for (let x = 30; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.arc(x, bottomPlateY + 25, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8b6914';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Vapor
      if (pressProgress > 0.7 && frame % 3 === 0) {
        for (let i = 0; i < 5; i++) {
          createSteam(Math.random() * canvas.width, (topPlateY + bottomPlateY) / 2);
        }
      }

      steamParticles.forEach((steam, i) => {
        steam.x += steam.vx;
        steam.y += steam.vy;
        steam.life -= 0.02;
        steam.size *= 1.02;

        if (steam.life <= 0) {
          steamParticles.splice(i, 1);
          return;
        }

        const steamGradient = ctx.createRadialGradient(steam.x, steam.y, 0, steam.x, steam.y, steam.size);
        steamGradient.addColorStop(0, `rgba(200, 200, 200, ${steam.life * 0.4})`);
        steamGradient.addColorStop(1, `rgba(150, 150, 150, 0)`);
        
        ctx.beginPath();
        ctx.arc(steam.x, steam.y, steam.size, 0, Math.PI * 2);
        ctx.fillStyle = steamGradient;
        ctx.fill();
      });

      // Impacto
      if (pressProgress > 0.95 && frame < totalFrames * 0.5) {
        const impactAlpha = Math.max(0, 1 - (frame - totalFrames * 0.4) / 10);
        ctx.fillStyle = `rgba(255, 200, 100, ${impactAlpha * 0.5})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Fade out
      if (frame > totalFrames * 0.6) {
        const openProgress = (frame - totalFrames * 0.6) / (totalFrames * 0.4);
        const fadeAlpha = Math.min(openProgress * 2, 1);
        
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: [0, 0, 1, 1, 0], scale: [1.2, 1.2, 1, 1, 0.9] }}
        transition={{ duration: 2.5, times: [0, 0.35, 0.45, 0.8, 1] }}
      >
        <div className="text-center">
          <h1 
            className="text-6xl md:text-8xl font-bold tracking-wider"
            style={{
              background: 'linear-gradient(180deg, #f4d9a0 0%, #d4a574 30%, #8b6914 60%, #5c4a1f 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(212, 165, 116, 0.6)',
              filter: 'drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))'
            }}
          >
            LOGAN
          </h1>
          <p 
            className="text-xl md:text-2xl mt-4 tracking-[0.3em] uppercase"
            style={{ 
              color: '#d4a574',
              textShadow: '0 0 20px rgba(212, 165, 116, 0.5)' 
            }}
          >
            Artífice do Bronze
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const ThemeTransition: React.FC<ThemeTransitionProps> = ({ 
  isTransitioning, 
  transitionType,
  onComplete 
}) => {
  return (
    <AnimatePresence>
      {isTransitioning && transitionType === 'fire' && (
        <FireTransition onComplete={onComplete} />
      )}
      {isTransitioning && transitionType === 'steampress' && (
        <SteampunkTransition onComplete={onComplete} />
      )}
    </AnimatePresence>
  );
};

export default ThemeTransition;
