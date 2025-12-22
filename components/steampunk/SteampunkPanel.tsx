import React, { ReactNode } from 'react';
import { Gear } from './Gear';

interface SteampunkPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: ReactNode;
  variant?: 'default' | 'inset' | 'raised' | 'viewport';
  showRivets?: boolean;
  showCornerGears?: boolean;
}

// Painel principal steampunk com textura de bronze
export const SteampunkPanel: React.FC<SteampunkPanelProps> = ({
  children,
  className = '',
  title,
  icon,
  variant = 'default',
  showRivets = true,
  showCornerGears = false
}) => {
  const variantClasses = {
    default: 'sp-bronze-plate',
    inset: 'sp-bronze-plate sp-panel-inset',
    raised: 'sp-bronze-plate sp-panel-raised',
    viewport: 'sp-viewport'
  };

  return (
    <div className={`
      relative overflow-hidden
      ${variantClasses[variant]}
      ${showRivets ? 'sp-rivets' : ''}
      ${className}
    `}>
      {/* Overlay de textura e sujeira */}
      <div className="absolute inset-0 pointer-events-none z-[2]">
        {/* Marcas de uso/sujeira */}
        <div className="absolute top-0 right-[20%] w-[30%] h-[40%] bg-gradient-to-b from-black/10 to-transparent rounded-b-full" />
        <div className="absolute bottom-0 left-[10%] w-[20%] h-[20%] bg-gradient-to-t from-amber-950/20 to-transparent rounded-t-full" />
        
        {/* Reflexo de luz */}
        <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-white/[0.03] to-transparent" />
      </div>
      
      {/* Engrenagens decorativas nos cantos */}
      {showCornerGears && (
        <>
          <div className="absolute -top-3 -left-3 z-10 opacity-60">
            <Gear size={40} teeth={10} spinning active speed="slow" />
          </div>
          <div className="absolute -top-3 -right-3 z-10 opacity-60">
            <Gear size={40} teeth={10} spinning reverse active speed="slow" />
          </div>
        </>
      )}
      
      {/* Header com título */}
      {title && (
        <div className="relative z-10 px-4 py-3 border-b-2 border-amber-900/50 bg-gradient-to-r from-transparent via-amber-950/30 to-transparent">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="text-amber-500">
                {icon}
              </span>
            )}
            <h3 className="font-display text-amber-200 text-lg tracking-wide sp-embossed">
              {title}
            </h3>
          </div>
          
          {/* Linha decorativa */}
          <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />
        </div>
      )}
      
      {/* Conteúdo */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// Cartão de estatística estilo medidor vintage
interface StatGaugeProps {
  label: string;
  value: number | string;
  maxValue?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatGauge: React.FC<StatGaugeProps> = ({
  label,
  value,
  maxValue,
  color = 'amber',
  size = 'md'
}) => {
  const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
  const percentage = maxValue ? (numValue / maxValue) * 100 : 100;
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`
        relative ${sizeClasses[size]}
        sp-viewport
        flex items-center justify-center
      `}>
        {/* Valor central */}
        <span className="font-display text-2xl text-amber-400 sp-embossed relative z-10">
          {value}
        </span>
        
        {/* Barra de progresso circular (se houver maxValue) */}
        {maxValue && (
          <svg className="absolute inset-2" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(139,90,43,0.3)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="4"
              strokeDasharray={`${percentage * 2.83} ${283 - percentage * 2.83}`}
              strokeDashoffset="70.75"
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8b5a2b" />
                <stop offset="50%" stopColor="#cd7f32" />
                <stop offset="100%" stopColor="#ffd700" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>
      
      <span className="text-[10px] uppercase tracking-[0.2em] text-amber-600/80 font-display">
        {label}
      </span>
    </div>
  );
};

// Divisor decorativo vitoriano
interface VictorianDividerProps {
  className?: string;
  showGear?: boolean;
}

export const VictorianDivider: React.FC<VictorianDividerProps> = ({ 
  className = '',
  showGear = true 
}) => {
  return (
    <div className={`flex items-center justify-center my-6 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-amber-800/30" />
      
      {showGear ? (
        <div className="mx-4">
          <Gear size={24} teeth={8} spinning active speed="slow" />
        </div>
      ) : (
        <div className="mx-4 w-3 h-3 rotate-45 bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-400/50" />
      )}
      
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-700/50 to-amber-800/30" />
    </div>
  );
};

// Botão steampunk
interface SteampunkButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const SteampunkButton: React.FC<SteampunkButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const variantClasses = {
    primary: `
      bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800
      hover:from-amber-500 hover:via-amber-600 hover:to-amber-700
      border-amber-500
      text-amber-100
    `,
    secondary: `
      bg-gradient-to-b from-stone-600 via-stone-700 to-stone-800
      hover:from-stone-500 hover:via-stone-600 hover:to-stone-700
      border-stone-500
      text-stone-100
    `,
    danger: `
      bg-gradient-to-b from-red-800 via-red-900 to-red-950
      hover:from-red-700 hover:via-red-800 hover:to-red-900
      border-red-700
      text-red-100
    `
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative font-display uppercase tracking-wider
        border-2 rounded
        transition-all duration-200
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        shadow-[0_4px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
        hover:shadow-[0_2px_0_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2),0_0_20px_rgba(205,127,50,0.2)]
        active:shadow-[0_1px_0_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(0,0,0,0.3)]
        ${className}
      `}
    >
      {/* Rebites decorativos */}
      <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-700" />
      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-700" />
      <span className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-700" />
      <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-700" />
      
      {children}
    </button>
  );
};

// Input steampunk
interface SteampunkInputProps {
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  className?: string;
  label?: string;
}

export const SteampunkInput: React.FC<SteampunkInputProps> = ({
  value,
  onChange,
  type = 'text',
  placeholder,
  className = '',
  label
}) => {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-[10px] uppercase tracking-[0.15em] text-amber-600/80 mb-1 font-display">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full px-3 py-2
          bg-gradient-to-b from-stone-900 to-stone-950
          border-2 border-amber-900/50
          rounded
          text-amber-100 placeholder-stone-600
          focus:outline-none focus:border-amber-600
          focus:shadow-[0_0_10px_rgba(205,127,50,0.3),inset_0_0_10px_rgba(0,0,0,0.5)]
          transition-all duration-200
          font-serif
        "
        style={{
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
        }}
      />
    </div>
  );
};

// Card de item/spell steampunk
interface SteampunkCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const SteampunkCard: React.FC<SteampunkCardProps> = ({
  children,
  className = '',
  onClick,
  selected = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-3
        bg-gradient-to-b from-stone-800/80 to-stone-900/80
        border-2 ${selected ? 'border-amber-500' : 'border-amber-900/30'}
        rounded
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:border-amber-700/50 hover:bg-stone-800/90' : ''}
        ${selected ? 'shadow-[0_0_15px_rgba(205,127,50,0.3)]' : ''}
        ${className}
      `}
      style={{
        boxShadow: selected 
          ? '0 0 15px rgba(205,127,50,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05)'
      }}
    >
      {/* Rebites nos cantos */}
      <span className="absolute top-1 left-1 w-1 h-1 rounded-full bg-amber-700/50" />
      <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-amber-700/50" />
      <span className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-amber-700/50" />
      <span className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-amber-700/50" />
      
      {children}
    </div>
  );
};

export default SteampunkPanel;
