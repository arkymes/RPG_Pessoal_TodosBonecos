import React from 'react';
import { useTheme } from '../../themes/ThemeContext';
import { Gear, GearToggle } from './Gear';
import { SteampunkPanel, VictorianDivider, SteampunkButton } from './SteampunkPanel';

// Diamond Toggle substituído por engrenagem
interface SteampunkToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  theme?: any;
  size?: 'sm' | 'md';
}

export const SteampunkToggle: React.FC<SteampunkToggleProps> = ({
  checked,
  onChange,
  size = 'md'
}) => {
  const gearSize = size === 'sm' ? 20 : 28;
  
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative flex items-center justify-center group outline-none focus:outline-none"
    >
      <Gear
        size={gearSize}
        teeth={size === 'sm' ? 6 : 8}
        spinning={checked}
        active={checked}
        speed="slow"
      />
    </button>
  );
};

// Bloco de atributo com estilo steampunk
interface SteampunkAttributeBlockProps {
  label: string;
  shortLabel: string;
  value: number;
  modifier: number;
  color: string;
  saveProf: boolean;
  skills: Array<{
    key: string;
    label: string;
    isProf: boolean;
    value: number;
    isSuggested?: boolean;
  }>;
  onValueChange: (value: number) => void;
  onSaveChange: (checked: boolean) => void;
  onSkillChange: (skillKey: string, checked: boolean) => void;
  profBonus: number;
}

export const SteampunkAttributeBlock: React.FC<SteampunkAttributeBlockProps> = ({
  label,
  shortLabel,
  value,
  modifier,
  color,
  saveProf,
  skills,
  onValueChange,
  onSaveChange,
  onSkillChange,
  profBonus
}) => {
  const saveValue = modifier + (saveProf ? profBonus : 0);
  
  return (
    <div className="sp-bronze-plate sp-rivets rounded-xl overflow-hidden flex flex-col h-full group transition-all hover:shadow-lg">
      {/* Header */}
      <div className="relative p-3 pb-2 flex items-center justify-between border-b-2 border-amber-900/50">
        {/* Overlay de textura */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-transparent pointer-events-none" />
        
        <div className="flex flex-col z-10">
          <span className="text-[10px] uppercase font-display tracking-[0.2em] mb-1 text-amber-500/90">
            {label}
          </span>
          <input
            type="number"
            value={value}
            onChange={(e) => onValueChange(parseInt(e.target.value) || 10)}
            className="bg-stone-900/80 border-2 border-amber-900/50 rounded w-12 text-center text-[11px] text-amber-200/80 focus:outline-none focus:border-amber-600 transition-colors font-mono"
            title="Valor Base"
          />
        </div>
        
        {/* Modificador com estilo de medidor */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-amber-700/50 bg-gradient-to-br from-stone-800 to-stone-950" />
          <div className="absolute inset-1 rounded-full border border-amber-900/30 flex items-center justify-center">
            <span className="text-3xl font-display font-bold text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
              {modifier >= 0 ? `+${modifier}` : modifier}
            </span>
          </div>
        </div>
      </div>
      
      {/* Salvaguarda */}
      <div className="px-3 pt-3 pb-2">
        <div className={`
          flex items-center justify-between rounded px-3 py-2 
          border-2 transition-all duration-300
          ${saveProf 
            ? 'bg-amber-900/20 border-amber-600/50 shadow-[inset_0_0_10px_rgba(217,119,6,0.2)]' 
            : 'bg-stone-900/30 border-amber-900/30 hover:border-amber-800/50'
          }
        `}>
          <div className="flex items-center gap-3">
            <SteampunkToggle
              checked={saveProf}
              onChange={onSaveChange}
              size="md"
            />
            <span className={`
              text-xs font-display uppercase tracking-wider
              ${saveProf ? 'text-amber-300' : 'text-stone-500'}
            `}>
              Salvaguarda
            </span>
          </div>
          <span className={`
            text-sm font-bold font-mono
            ${saveProf ? 'text-amber-400' : 'text-stone-600'}
          `}>
            {saveValue >= 0 ? `+${saveValue}` : saveValue}
          </span>
        </div>
      </div>
      
      {/* Perícias */}
      {skills.length > 0 && (
        <>
          <div className="px-3">
            <VictorianDivider showGear={false} className="my-2" />
          </div>
          
          <div className="px-3 pb-3 space-y-1 flex-1">
            {skills.map((skill) => (
              <div
                key={skill.key}
                onClick={() => onSkillChange(skill.key, !skill.isProf)}
                className={`
                  flex items-center justify-between px-2 py-1.5 rounded
                  border transition-colors cursor-pointer
                  ${skill.isSuggested && !skill.isProf
                    ? 'border-amber-500/60 bg-amber-900/20 animate-pulse'
                    : skill.isProf
                      ? 'border-amber-800/30 bg-amber-900/10'
                      : 'border-transparent hover:bg-stone-800/30'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <SteampunkToggle
                      checked={skill.isProf}
                      onChange={(c) => onSkillChange(skill.key, c)}
                      size="sm"
                    />
                  </div>
                  <span className={`
                    text-xs transition-colors
                    ${skill.isProf ? 'text-amber-200 font-medium' : 'text-stone-500'}
                    ${skill.isSuggested && !skill.isProf ? 'text-amber-400 font-medium' : ''}
                  `}>
                    {skill.label}
                  </span>
                </div>
                <span className={`
                  text-xs font-mono
                  ${skill.isProf ? 'text-amber-400 font-bold' : 'text-stone-600'}
                `}>
                  {skill.value >= 0 ? `+${skill.value}` : skill.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Stat Card steampunk (CA, Iniciativa, etc)
interface SteampunkStatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  suffix?: string;
}

export const SteampunkStatCard: React.FC<SteampunkStatCardProps> = ({
  icon,
  value,
  label,
  color = 'amber',
  editable = false,
  onChange,
  suffix
}) => {
  return (
    <div className="sp-bronze-plate sp-rivets rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Engrenagem decorativa de fundo */}
      <div className="absolute -right-4 -bottom-4 opacity-20">
        <Gear size={60} teeth={12} spinning active speed="slow" />
      </div>
      
      {/* Ícone */}
      <div className="mb-2 text-amber-500 relative z-10">
        {icon}
      </div>
      
      {/* Valor */}
      <div className="relative z-10 flex items-baseline">
        {editable ? (
          <input
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="text-4xl font-display font-bold text-amber-100 bg-transparent w-16 text-center focus:outline-none"
          />
        ) : (
          <span className="text-4xl font-display font-bold text-amber-100 sp-embossed">
            {value}
          </span>
        )}
        {suffix && (
          <span className="text-sm text-amber-600 ml-1">{suffix}</span>
        )}
      </div>
      
      {/* Label */}
      <span className="text-[10px] uppercase font-display tracking-[0.15em] text-amber-600/80 mt-1 relative z-10">
        {label}
      </span>
    </div>
  );
};

// HP Bar Steampunk
interface SteampunkHPBarProps {
  current: number;
  max: number;
  temp: number;
  hitDice: string;
  onCurrentChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  onTempChange: (value: number) => void;
}

export const SteampunkHPBar: React.FC<SteampunkHPBarProps> = ({
  current,
  max,
  temp,
  hitDice,
  onCurrentChange,
  onMaxChange,
  onTempChange
}) => {
  const percentage = Math.min(100, (current / (max || 1)) * 100);
  
  return (
    <div className="sp-bronze-plate sp-rivets rounded-xl p-4 relative overflow-hidden col-span-2">
      {/* Barra lateral decorativa */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-500 via-red-600 to-red-800" />
      
      {/* Engrenagem de fundo */}
      <div className="absolute -right-6 -top-6 opacity-10">
        <Gear size={100} teeth={16} spinning active speed="slow" />
      </div>
      
      <div className="flex items-center gap-4 relative z-10">
        {/* Ícone de coração */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-2 border-red-700/50 bg-stone-900/80 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          {/* Glow quando HP alto */}
          {percentage > 50 && (
            <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md animate-pulse" />
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] uppercase font-display tracking-[0.15em] text-amber-600/80">
              Pontos de Vida
            </span>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-stone-500">Max:</span>
              <input
                value={max}
                onChange={(e) => onMaxChange(parseInt(e.target.value) || 0)}
                className="w-10 bg-stone-900/80 border border-amber-900/30 rounded text-right text-amber-200 focus:outline-none font-mono text-xs px-1"
                type="number"
              />
            </div>
          </div>
          
          {/* Valor atual */}
          <div className="flex items-baseline gap-3">
            <input
              type="number"
              value={current}
              onChange={(e) => onCurrentChange(parseInt(e.target.value) || 0)}
              className="text-4xl font-display font-bold text-amber-100 bg-transparent w-24 focus:outline-none sp-embossed"
            />
            
            {/* Temp HP */}
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-display text-amber-600">Temp</span>
              <input
                value={temp || 0}
                onChange={(e) => onTempChange(parseInt(e.target.value) || 0)}
                className="w-10 bg-stone-900/80 border border-amber-900/30 rounded text-amber-400 text-xs focus:outline-none px-1 font-mono"
                type="number"
              />
            </div>
          </div>
          
          {/* Barra de progresso estilo medidor */}
          <div className="flex items-center gap-2 mt-2">
            <div className="sp-gauge flex-1">
              <div 
                className="sp-gauge-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-[10px] text-stone-500 font-mono" title="Dados de Vida">
              {hitDice}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SteampunkToggle;
