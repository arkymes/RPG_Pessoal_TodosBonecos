import React from 'react';
import { Gear } from './Gear';

// Toggle de engrenagem para substituir o DiamondToggle
interface GearToggleInlineProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md';
  theme?: any; // Para compatibilidade com o código existente
}

export const GearToggleInline: React.FC<GearToggleInlineProps> = ({
  checked,
  onChange,
  size = 'md'
}) => {
  const gearSize = size === 'sm' ? 18 : 26;
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className="relative flex items-center justify-center group outline-none focus:outline-none"
      style={{ width: gearSize, height: gearSize }}
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

export default GearToggleInline;
