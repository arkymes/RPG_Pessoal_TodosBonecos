import React from 'react';
import { useTheme } from '../../themes/ThemeContext';
import { ChevronDown } from 'lucide-react';
import { Gear } from './Gear';

interface CharacterSelectorProps {
  className?: string;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({ className = '' }) => {
  const { currentCharacter, characters, setCharacter } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Botão do seletor */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2
          sp-bronze-plate sp-rivets
          rounded-lg
          transition-all duration-300
          hover:scale-[1.02]
          group
        "
      >
        {/* Ícone de engrenagem animada */}
        <div className="relative z-10">
          <Gear 
            size={24} 
            teeth={8} 
            spinning={isOpen}
            active 
            speed="medium"
          />
        </div>
        
        {/* Nome do personagem */}
        <div className="flex-1 text-left relative z-10">
          <span className="text-amber-100 font-display font-bold text-sm whitespace-nowrap">
            {currentCharacter.shortName}
          </span>
        </div>
        
        {/* Chevron */}
        <ChevronDown 
          className={`
            w-4 h-4 text-amber-500 transition-transform duration-300 relative z-10
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <div 
          className="
            absolute top-full left-0 mt-2 w-full
            sp-bronze-plate
            rounded-lg
            overflow-hidden
            z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          "
          style={{
            boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(205,127,50,0.2)'
          }}
        >
          {characters.map((char) => (
            <button
              key={char.id}
              onClick={() => {
                setCharacter(char.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3
                transition-all duration-200
                border-b border-amber-900/30 last:border-b-0
                ${char.id === currentCharacter.id 
                  ? 'bg-amber-900/30' 
                  : 'hover:bg-amber-900/20'
                }
              `}
            >
              {/* Ícone */}
              <span className="text-xl">{char.icon}</span>
              
              {/* Info */}
              <div className="flex-1 text-left">
                <span className={`
                  block font-display text-sm
                  ${char.id === currentCharacter.id ? 'text-amber-400' : 'text-amber-100'}
                `}>
                  {char.shortName}
                </span>
                <span className="text-[10px] text-amber-700/80 line-clamp-1">
                  {char.description}
                </span>
              </div>
              
              {/* Indicador de selecionado */}
              {char.id === currentCharacter.id && (
                <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CharacterSelector;
