// Tipos para o sistema de temas por personagem

export type ThemeType = 'steampunk-victorian' | 'dark-fantasy' | 'cosmic-horror' | 'nature-druid' | 'wildfire-primal';

export interface PlayableCharacter {
  id: string;
  name: string;
  shortName: string;
  theme: ThemeType;
  storyData: string; // referência ao arquivo de dados da história
  icon: string; // emoji ou ícone
  description: string;
}

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  cssClass: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  textures: {
    main: string;
    overlay: string;
    border: string;
  };
  fonts: {
    display: string;
    body: string;
    accent: string;
  };
}

// Personagens disponíveis
export const PLAYABLE_CHARACTERS: PlayableCharacter[] = [
  {
    id: 'logan',
    name: 'Logan Rylan',
    shortName: 'Logan',
    theme: 'steampunk-victorian',
    storyData: 'STORY_DATA',
    icon: 'gear',
    description: 'Um inventor sombrio em um mundo de bronze e vapor'
  },
  {
    id: 'kaelen',
    name: 'Kaelen Ashwalker',
    shortName: 'Kaelen',
    theme: 'wildfire-primal',
    storyData: 'KAELEN_STORY_DATA',
    icon: 'flame',
    description: 'Guardião das florestas queimadas, onde a destruição é o prelúdio da vida'
  },
  // Futuros personagens serão adicionados aqui
];

// Configurações de temas
export const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  'steampunk-victorian': {
    id: 'steampunk-victorian',
    name: 'Steampunk Vitoriano',
    cssClass: 'theme-steampunk',
    colors: {
      primary: '#cd7f32', // Bronze
      secondary: '#b87333', // Cobre
      accent: '#ffd700', // Ouro
      background: '#1a1410', // Bronze escuro
      surface: '#2d241c', // Superfície bronze
      text: '#e8dcc8', // Texto pergaminho
      textMuted: '#a89880', // Texto desbotado
    },
    textures: {
      main: 'bronze-plate',
      overlay: 'rivets',
      border: 'brass-frame',
    },
    fonts: {
      display: 'Cinzel',
      body: 'Cormorant Garamond',
      accent: 'IM Fell English SC',
    }
  },
  'dark-fantasy': {
    id: 'dark-fantasy',
    name: 'Fantasia Sombria',
    cssClass: 'theme-dark-fantasy',
    colors: {
      primary: '#6b21a8',
      secondary: '#581c87',
      accent: '#a855f7',
      background: '#0c0a09',
      surface: '#1c1917',
      text: '#e7e5e4',
      textMuted: '#78716c',
    },
    textures: {
      main: 'stone',
      overlay: 'cracks',
      border: 'runes',
    },
    fonts: {
      display: 'Cinzel',
      body: 'Cormorant Garamond',
      accent: 'Cinzel',
    }
  },
  'cosmic-horror': {
    id: 'cosmic-horror',
    name: 'Horror Cósmico',
    cssClass: 'theme-cosmic',
    colors: {
      primary: '#1e3a5f',
      secondary: '#0f172a',
      accent: '#22d3ee',
      background: '#020617',
      surface: '#0f172a',
      text: '#cbd5e1',
      textMuted: '#475569',
    },
    textures: {
      main: 'void',
      overlay: 'stars',
      border: 'tentacles',
    },
    fonts: {
      display: 'Cinzel',
      body: 'Inter',
      accent: 'Cinzel',
    }
  },
  'nature-druid': {
    id: 'nature-druid',
    name: 'Natureza Druídica',
    cssClass: 'theme-nature',
    colors: {
      primary: '#166534',
      secondary: '#14532d',
      accent: '#4ade80',
      background: '#0c1a0f',
      surface: '#1a2e1c',
      text: '#dcfce7',
      textMuted: '#6b8e6b',
    },
    textures: {
      main: 'wood',
      overlay: 'leaves',
      border: 'vines',
    },
    fonts: {
      display: 'Cinzel',
      body: 'Cormorant Garamond',
      accent: 'Cinzel',
    }
  },
  'wildfire-primal': {
    id: 'wildfire-primal',
    name: 'Renascimento das Cinzas',
    cssClass: 'theme-wildfire',
    colors: {
      primary: '#ff4500', // Laranja brasa
      secondary: '#8b0000', // Vermelho sangue seco
      accent: '#7cfc00', // Verde broto neon
      background: '#1a1a1a', // Cinza carvão
      surface: '#2d2d2d', // Superfície cinza escuro
      text: '#e6e6fa', // Cinza fumaça claro
      textMuted: '#a0a0a0', // Cinza médio
    },
    textures: {
      main: 'charred-wood',
      overlay: 'embers',
      border: 'ember-glow',
    },
    fonts: {
      display: 'Uncial Antiqua',
      body: 'Merriweather',
      accent: 'Cinzel Decorative',
    }
  }
};
