import React from 'react';

interface GearProps {
  size?: number;
  teeth?: number;
  spinning?: boolean;
  reverse?: boolean;
  speed?: 'slow' | 'medium' | 'fast';
  active?: boolean;
  className?: string;
  innerRatio?: number;
  style?: 'standard' | 'decorative' | 'small';
}

// Componente SVG de engrenagem steampunk com dentes retos e bem definidos
export const Gear: React.FC<GearProps> = ({
  size = 60,
  teeth = 12,
  spinning = false,
  reverse = false,
  speed = 'slow',
  active = true,
  className = '',
  innerRatio = 0.5,
  style = 'standard'
}) => {
  const center = size / 2;
  const outerRadius = size / 2 - 2;
  const baseRadius = outerRadius * 0.78; // Raio da base (onde os dentes comecam)
  const innerRadius = outerRadius * innerRatio;
  
  // Gerar path da engrenagem com dentes RETOS (trapezoidais bem definidos)
  const generateGearPath = () => {
    const points: string[] = [];
    const anglePerTooth = (2 * Math.PI) / teeth;
    
    // Proporcoes do dente
    const toothTopWidth = anglePerTooth * 0.25; // Largura do topo do dente
    const toothBaseWidth = anglePerTooth * 0.4; // Largura da base do dente
    const gapWidth = anglePerTooth - toothBaseWidth; // Espaco entre dentes
    
    for (let i = 0; i < teeth; i++) {
      const toothStartAngle = i * anglePerTooth;
      
      // Ponto 1: Inicio do vale (na base)
      const p1Angle = toothStartAngle;
      const p1x = center + Math.cos(p1Angle) * baseRadius;
      const p1y = center + Math.sin(p1Angle) * baseRadius;
      
      // Ponto 2: Inicio da subida do dente (na base)
      const p2Angle = toothStartAngle + gapWidth / 2;
      const p2x = center + Math.cos(p2Angle) * baseRadius;
      const p2y = center + Math.sin(p2Angle) * baseRadius;
      
      // Ponto 3: Canto inferior esquerdo do topo do dente
      const p3Angle = toothStartAngle + (gapWidth / 2) + (toothBaseWidth - toothTopWidth) / 2;
      const p3x = center + Math.cos(p3Angle) * outerRadius;
      const p3y = center + Math.sin(p3Angle) * outerRadius;
      
      // Ponto 4: Canto inferior direito do topo do dente
      const p4Angle = p3Angle + toothTopWidth;
      const p4x = center + Math.cos(p4Angle) * outerRadius;
      const p4y = center + Math.sin(p4Angle) * outerRadius;
      
      // Ponto 5: Fim da descida do dente (na base)
      const p5Angle = toothStartAngle + gapWidth / 2 + toothBaseWidth;
      const p5x = center + Math.cos(p5Angle) * baseRadius;
      const p5y = center + Math.sin(p5Angle) * baseRadius;
      
      // Ponto 6: Fim do vale antes do proximo dente
      const p6Angle = toothStartAngle + anglePerTooth;
      const p6x = center + Math.cos(p6Angle) * baseRadius;
      const p6y = center + Math.sin(p6Angle) * baseRadius;
      
      if (i === 0) {
        points.push(`M ${p1x.toFixed(2)} ${p1y.toFixed(2)}`);
      }
      
      // Linha reta no vale
      points.push(`L ${p2x.toFixed(2)} ${p2y.toFixed(2)}`);
      // Linha reta subindo o dente
      points.push(`L ${p3x.toFixed(2)} ${p3y.toFixed(2)}`);
      // Linha reta no topo do dente
      points.push(`L ${p4x.toFixed(2)} ${p4y.toFixed(2)}`);
      // Linha reta descendo o dente
      points.push(`L ${p5x.toFixed(2)} ${p5y.toFixed(2)}`);
      // Linha reta no vale ate o proximo dente
      if (i < teeth - 1) {
        points.push(`L ${p6x.toFixed(2)} ${p6y.toFixed(2)}`);
      }
    }
    
    points.push('Z');
    return points.join(' ');
  };
  
  // Determinar duracao da animacao baseada na velocidade
  const getDuration = () => {
    switch (speed) {
      case 'fast': return '8s';
      case 'medium': return '20s';
      case 'slow': 
      default: return '45s';
    }
  };
  
  const gearPath = generateGearPath();
  const isSpinning = spinning && active;
  const uniqueId = `gear-${size}-${teeth}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`${className} transition-all duration-500`}
      style={{
        filter: active 
          ? 'drop-shadow(0 0 3px rgba(255, 200, 100, 0.5))'
          : 'brightness(0.4) saturate(0.3)',
      }}
    >
      <defs>
        {/* Gradiente principal do bronze */}
        <radialGradient id={`gearGrad-${uniqueId}`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f0d090" />
          <stop offset="40%" stopColor="#cd9b50" />
          <stop offset="75%" stopColor="#a67c40" />
          <stop offset="100%" stopColor="#705030" />
        </radialGradient>
        
        {/* Gradiente para borda/stroke */}
        <linearGradient id={`gearStroke-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b6914" />
          <stop offset="100%" stopColor="#4a3810" />
        </linearGradient>
      </defs>
      
      <g style={{
        transformOrigin: `${center}px ${center}px`,
        animation: isSpinning 
          ? `gear-spin${reverse ? '-reverse' : ''} ${getDuration()} linear infinite` 
          : 'none'
      }}>
        {/* Sombra da engrenagem */}
        <path
          d={gearPath}
          fill="rgba(0,0,0,0.3)"
          transform={`translate(1, 1)`}
        />
        
        {/* Corpo principal da engrenagem */}
        <path
          d={gearPath}
          fill={`url(#gearGrad-${uniqueId})`}
          stroke={`url(#gearStroke-${uniqueId})`}
          strokeWidth={size > 30 ? 1.5 : 1}
          strokeLinejoin="miter"
        />
        
        {/* Highlight superior */}
        <path
          d={gearPath}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="0.5"
          style={{ clipPath: 'inset(0 0 50% 0)' }}
        />
        
        {/* Circulo central (hub) */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill={`url(#gearGrad-${uniqueId})`}
          stroke="#5a4020"
          strokeWidth={size > 30 ? 1.5 : 1}
        />
        
        {/* Buraco central hexagonal ou circular */}
        {style === 'decorative' ? (
          <polygon
            points={[0,1,2,3,4,5].map(i => {
              const angle = (i * 60 - 90) * Math.PI / 180;
              const r = innerRadius * 0.35;
              return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
            }).join(' ')}
            fill="#1a1208"
            stroke="#6a5030"
            strokeWidth="1"
          />
        ) : (
          <circle
            cx={center}
            cy={center}
            r={innerRadius * 0.3}
            fill="#1a1208"
            stroke="#6a5030"
            strokeWidth="1"
          />
        )}
        
        {/* Raios internos (spokes) - apenas para engrenagens maiores */}
        {size > 25 && style !== 'small' && [0, 90, 180, 270].map((angle, i) => (
          <line
            key={i}
            x1={center + Math.cos(angle * Math.PI / 180) * (innerRadius * 0.4)}
            y1={center + Math.sin(angle * Math.PI / 180) * (innerRadius * 0.4)}
            x2={center + Math.cos(angle * Math.PI / 180) * (innerRadius * 0.9)}
            y2={center + Math.sin(angle * Math.PI / 180) * (innerRadius * 0.9)}
            stroke="#5a4020"
            strokeWidth={size > 40 ? 2 : 1.5}
            strokeLinecap="round"
          />
        ))}
        
        {/* Rebites - apenas para engrenagens grandes */}
        {size > 40 && [45, 135, 225, 315].map((angle, i) => (
          <circle
            key={`rivet-${i}`}
            cx={center + Math.cos(angle * Math.PI / 180) * (innerRadius * 0.7)}
            cy={center + Math.sin(angle * Math.PI / 180) * (innerRadius * 0.7)}
            r={size * 0.025}
            fill="#c8a050"
            stroke="#5a4020"
            strokeWidth="0.5"
          />
        ))}
      </g>
      
      <style>{`
        @keyframes gear-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gear-spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
    </svg>
  );
};

// Componente de engrenagem para toggle (como as flags)
interface GearToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: number;
  label?: string;
  disabled?: boolean;
}

export const GearToggle: React.FC<GearToggleProps> = ({
  checked,
  onChange,
  size = 32,
  label,
  disabled = false
}) => {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        flex items-center gap-2 transition-all duration-300
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        group
      `}
      title={label}
    >
      <div className="relative">
        <Gear
          size={size}
          teeth={8}
          spinning={checked}
          active={checked}
          speed="slow"
        />
        {/* Glow effect quando ativo */}
        {checked && (
          <div 
            className="absolute inset-0 rounded-full animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
              filter: 'blur(4px)'
            }}
          />
        )}
      </div>
      {label && (
        <span className={`
          text-sm font-medium transition-colors
          ${checked ? 'text-amber-400' : 'text-stone-500'}
          ${!disabled && 'group-hover:text-amber-300'}
        `}>
          {label}
        </span>
      )}
    </button>
  );
};

// Componente de decoracao com multiplas engrenagens conectadas
interface GearClusterProps {
  className?: string;
}

export const GearCluster: React.FC<GearClusterProps> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Engrenagem grande central */}
      <div className="relative">
        <Gear size={70} teeth={14} spinning active speed="slow" style="decorative" />
      </div>
      
      {/* Engrenagem media - esquerda superior */}
      <div className="absolute -top-3 -left-5">
        <Gear size={45} teeth={10} spinning reverse active speed="slow" style="decorative" />
      </div>
      
      {/* Engrenagem pequena - direita */}
      <div className="absolute top-6 -right-3">
        <Gear size={32} teeth={8} spinning active speed="medium" style="small" />
      </div>
      
      {/* Engrenagem pequena - inferior */}
      <div className="absolute -bottom-1 left-3">
        <Gear size={28} teeth={8} spinning reverse active speed="medium" style="small" />
      </div>
    </div>
  );
};

// Engrenagens para scroll de texto (nas laterais)
interface ScrollGearsProps {
  side: 'left' | 'right';
  scrollProgress?: number; // 0 to 1
}

export const ScrollGears: React.FC<ScrollGearsProps> = ({ side, scrollProgress = 0 }) => {
  const isLeft = side === 'left';
  
  return (
    <div 
      className={`
        fixed top-1/2 -translate-y-1/2 z-20 pointer-events-none
        ${isLeft ? 'left-2' : 'right-2'}
      `}
      style={{
        opacity: 0.6
      }}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Engrenagem superior */}
        <div style={{ 
          transform: `rotate(${scrollProgress * 720}deg)`,
          transition: 'transform 0.05s linear'
        }}>
          <Gear 
            size={48} 
            teeth={12} 
            spinning={false}
            active
            style="decorative"
          />
        </div>
        
        {/* Barra de conexao */}
        <div className="h-24 w-1.5 rounded-full" style={{
          background: 'linear-gradient(180deg, #8b6914 0%, #c9a227 50%, #8b6914 100%)'
        }} />
        
        {/* Engrenagem inferior - gira oposto */}
        <div style={{ 
          transform: `rotate(${-scrollProgress * 720}deg)`,
          transition: 'transform 0.05s linear'
        }}>
          <Gear 
            size={40} 
            teeth={10} 
            spinning={false}
            active
            style="decorative"
          />
        </div>
      </div>
    </div>
  );
};

export default Gear;
