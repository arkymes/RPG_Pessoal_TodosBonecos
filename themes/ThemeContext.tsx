import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ThemeType, PlayableCharacter, ThemeConfig, PLAYABLE_CHARACTERS, THEME_CONFIGS } from './types';

type TransitionType = 'fire' | 'steampress' | 'none';

interface ThemeContextType {
  currentCharacter: PlayableCharacter;
  currentTheme: ThemeConfig;
  setCharacter: (characterId: string) => void;
  characters: PlayableCharacter[];
  // Transição
  isTransitioning: boolean;
  transitionType: TransitionType;
  completeTransition: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Determina o tipo de transição baseado no tema de destino
const getTransitionType = (targetTheme: ThemeType): TransitionType => {
  switch (targetTheme) {
    case 'wildfire-primal':
      return 'fire';
    case 'steampunk-victorian':
      return 'steampress';
    default:
      return 'none';
  }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Carregar personagem salvo ao iniciar (síncrono para evitar flash)
  const getInitialCharacter = () => {
    try {
      const saved = localStorage.getItem('rpg_current_character');
      if (saved && PLAYABLE_CHARACTERS.find(c => c.id === saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Erro ao carregar personagem do localStorage:', e);
    }
    return 'logan';
  };

  const [currentCharacterId, setCurrentCharacterId] = useState<string>(getInitialCharacter);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<TransitionType>('none');
  const [pendingCharacterId, setPendingCharacterId] = useState<string | null>(null);
  
  const currentCharacter = PLAYABLE_CHARACTERS.find(c => c.id === currentCharacterId) || PLAYABLE_CHARACTERS[0];
  const currentTheme = THEME_CONFIGS[currentCharacter.theme];

  const setCharacter = useCallback((characterId: string) => {
    const character = PLAYABLE_CHARACTERS.find(c => c.id === characterId);
    if (character && character.id !== currentCharacterId) {
      // Determinar o tipo de transição
      const transition = getTransitionType(character.theme);
      
      if (transition === 'none') {
        // Sem transição, mudar direto
        setCurrentCharacterId(characterId);
        localStorage.setItem('rpg_current_character', characterId);
      } else {
        // Com transição
        setTransitionType(transition);
        setPendingCharacterId(characterId);
        setIsTransitioning(true);
      }
    }
  }, [currentCharacterId]);

  const completeTransition = useCallback(() => {
    if (pendingCharacterId) {
      // Aplicar a mudança de tema
      setCurrentCharacterId(pendingCharacterId);
      localStorage.setItem('rpg_current_character', pendingCharacterId);
    }
    
    // Limpar estado de transição após um pequeno delay
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionType('none');
      setPendingCharacterId(null);
    }, 500);
  }, [pendingCharacterId]);

  return (
    <ThemeContext.Provider value={{
      currentCharacter,
      currentTheme,
      setCharacter,
      characters: PLAYABLE_CHARACTERS,
      isTransitioning,
      transitionType,
      completeTransition
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
