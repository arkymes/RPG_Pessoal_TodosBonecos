import React from 'react';

interface FlameProps {
  size?: number;
  active?: boolean;
  color?: 'ember' | 'sprout' | 'spirit';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

// Chama SVG animada
export const Flame: React.FC<FlameProps> = ({
  size = 24,
  active = false,
  color = 'ember',
  intensity = 'medium',
  className = ''
}) => {
  const colors = {
    ember: {
      outer: '#ff4500',
      middle: '#ff6b35',
      inner: '#ffa500',
      core: '#ffff00'
    },
    sprout: {
      outer: '#228b22',
      middle: '#32cd32',
      inner: '#7cfc00',
      core: '#adff2f'
    },
    spirit: {
      outer: '#4169e1',
      middle: '#6495ed',
      inner: '#87ceeb',
      core: '#e0ffff'
    }
  };

  const c = colors[color];
  
  const animationDuration = {
    low: '2s',
    medium: '1s',
    high: '0.5s'
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`${active ? 'wf-flame-active' : 'wf-coal-inactive'} ${className}`}
      style={{
        transition: 'all 0.3s ease',
      }}
    >
      <defs>
        <linearGradient id={`flame-grad-${color}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={c.outer} />
          <stop offset="30%" stopColor={c.middle} />
          <stop offset="60%" stopColor={c.inner} />
          <stop offset="100%" stopColor={c.core} />
        </linearGradient>
        <filter id="flame-glow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Chama principal */}
      <path
        d="M12 2C12 2 8 6 8 10C8 12 9 14 9 14C9 14 8 12 7 12C6 12 5 14 5 16C5 19 8 22 12 22C16 22 19 19 19 16C19 14 18 12 17 12C16 12 15 14 15 14C15 14 16 12 16 10C16 6 12 2 12 2Z"
        fill={active ? `url(#flame-grad-${color})` : '#3a3a3a'}
        filter={active ? "url(#flame-glow)" : "none"}
        style={{
          transformOrigin: 'center bottom',
        }}
      />
      
      {/* Núcleo interno */}
      {active && (
        <path
          d="M12 8C12 8 10 10 10 12C10 14 11 16 12 16C13 16 14 14 14 12C14 10 12 8 12 8Z"
          fill={c.core}
          opacity="0.9"
        />
      )}
    </svg>
  );
};

// Toggle de chama para proficiências
interface FlameToggleProps {
  active: boolean;
  onClick?: () => void;
  size?: number;
  label?: string;
  color?: 'ember' | 'sprout' | 'spirit';
}

export const FlameToggle: React.FC<FlameToggleProps> = ({
  active,
  onClick,
  size = 20,
  label,
  color = 'ember'
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 transition-all hover:scale-110"
      title={label}
    >
      <Flame size={size} active={active} color={color} />
    </button>
  );
};

// Partículas de cinzas flutuantes
export const AshParticles: React.FC<{ count?: number }> = ({ count = 10 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gray-400 rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 20}%`,
            animation: `ash-rise ${5 + Math.random() * 5}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
};

// Partículas de brasas
export const EmberParticles: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 30}%`,
            background: `radial-gradient(circle, #ffa500 0%, #ff4500 50%, transparent 100%)`,
            animation: `ember-float ${3 + Math.random() * 4}s ease-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            boxShadow: '0 0 6px rgba(255, 165, 0, 0.8)',
          }}
        />
      ))}
    </div>
  );
};

// Espírito de fogo (raposa de brasas)
export const FireSpirit: React.FC<{ size?: number; className?: string }> = ({ 
  size = 48,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`wf-flame-active ${className}`}
    >
      <defs>
        <linearGradient id="spirit-grad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff4500" />
          <stop offset="50%" stopColor="#ffa500" />
          <stop offset="100%" stopColor="#ffff00" />
        </linearGradient>
        <filter id="spirit-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Corpo da raposa */}
      <ellipse cx="24" cy="30" rx="12" ry="8" fill="url(#spirit-grad)" filter="url(#spirit-glow)" />
      
      {/* Cabeça */}
      <circle cx="24" cy="18" r="8" fill="url(#spirit-grad)" filter="url(#spirit-glow)" />
      
      {/* Orelhas */}
      <polygon points="18,12 16,4 22,10" fill="#ffa500" />
      <polygon points="30,12 32,4 26,10" fill="#ffa500" />
      
      {/* Olhos */}
      <circle cx="21" cy="17" r="2" fill="#ffff00" />
      <circle cx="27" cy="17" r="2" fill="#ffff00" />
      <circle cx="21" cy="17" r="1" fill="#fff" />
      <circle cx="27" cy="17" r="1" fill="#fff" />
      
      {/* Focinho */}
      <ellipse cx="24" cy="21" rx="2" ry="1" fill="#ff6b35" />
      
      {/* Cauda flamejante */}
      <path
        d="M36 30 Q42 25 40 20 Q44 22 42 28 Q46 24 44 30 Q40 35 36 32"
        fill="url(#spirit-grad)"
        filter="url(#spirit-glow)"
      />
    </svg>
  );
};

export default Flame;
