import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ThemeType, PlayableCharacter, ThemeConfig, PLAYABLE_CHARACTERS, THEME_CONFIGS } from './types';

interface ThemeContextType {
  currentCharacter: PlayableCharacter;
  currentTheme: ThemeConfig;
  setCharacter: (characterId: string) => void;
  characters: PlayableCharacter[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentCharacterId, setCurrentCharacterId] = useState<string>('logan');
  
  const currentCharacter = PLAYABLE_CHARACTERS.find(c => c.id === currentCharacterId) || PLAYABLE_CHARACTERS[0];
  const currentTheme = THEME_CONFIGS[currentCharacter.theme];

  const setCharacter = (characterId: string) => {
    const character = PLAYABLE_CHARACTERS.find(c => c.id === characterId);
    if (character) {
      setCurrentCharacterId(characterId);
      // Salvar preferência
      localStorage.setItem('rpg_current_character', characterId);
    }
  };

  // Carregar personagem salvo ao iniciar
  React.useEffect(() => {
    const saved = localStorage.getItem('rpg_current_character');
    if (saved && PLAYABLE_CHARACTERS.find(c => c.id === saved)) {
      setCurrentCharacterId(saved);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{
      currentCharacter,
      currentTheme,
      setCharacter,
      characters: PLAYABLE_CHARACTERS
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
