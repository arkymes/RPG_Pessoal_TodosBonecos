import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, EmberParticles, FireSpirit } from './Flame';
import { useTheme } from '../../themes/ThemeContext';

interface WildfireLayoutProps {
  children: React.ReactNode;
  activeTab?: 'story' | 'bio' | 'sheet';
  onTabChange?: (tab: 'story' | 'bio' | 'sheet') => void;
}

// Header com navegação
const WildfireHeader: React.FC<{
  activeTab: string;
  onTabChange: (tab: 'story' | 'bio' | 'sheet') => void;
}> = ({ activeTab, onTabChange }) => {
  const { currentCharacter, characters, setCharacter } = useTheme();
  const [showSelector, setShowSelector] = useState(false);

  const tabs = [
    { id: 'story', label: 'História' },
    { id: 'bio', label: 'Bio' },
    { id: 'sheet', label: 'Ficha' },
  ];

  return (
    <header className="sticky top-0 z-50 wf-charred-wood border-b-2 border-orange-900/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Character Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSelector(!showSelector)}
              className="flex items-center gap-3 px-4 py-2 wf-stone-circle rounded-lg hover:bg-orange-900/20 transition-colors"
            >
              <Flame size={20} active color="ember" />
              <span className="font-uncial text-orange-300">{currentCharacter.shortName}</span>
              <svg className={`w-4 h-4 text-orange-400 transition-transform ${showSelector ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 mt-2 wf-charred-wood wf-ember-glow rounded-lg shadow-xl min-w-[200px] overflow-hidden"
              >
                {characters.map(char => (
                  <button
                    key={char.id}
                    onClick={() => {
                      setCharacter(char.id);
                      setShowSelector(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-orange-900/30 transition-colors flex items-center gap-3 ${
                      char.id === currentCharacter.id ? 'bg-orange-900/40' : ''
                    }`}
                  >
                    <Flame size={16} active={char.id === currentCharacter.id} color="ember" />
                    <div>
                      <div className="font-uncial text-orange-200">{char.shortName}</div>
                      <div className="text-xs text-gray-500">{char.description}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as 'story' | 'bio' | 'sheet')}
                className={`relative px-6 py-2 font-uncial text-sm tracking-wide transition-all rounded-lg ${
                  activeTab === tab.id
                    ? 'text-orange-300 bg-orange-900/30'
                    : 'text-gray-400 hover:text-orange-400 hover:bg-orange-900/10'
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="wildfire-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Fire Spirit */}
          <div className="flex items-center gap-2">
            <FireSpirit size={32} />
          </div>
        </div>
      </div>
      
      {/* Linha de brasa no fundo */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
    </header>
  );
};

// Footer
const WildfireFooter: React.FC = () => {
  return (
    <footer className="relative wf-charred-wood py-12 mt-16 overflow-hidden">
      <EmberParticles count={12} />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Divisor de vinhas */}
        <div className="wf-vine-divider mb-8">
          <Flame size={24} active color="ember" />
        </div>
        
        {/* Título */}
        <h3 className="font-uncial text-2xl text-transparent bg-clip-text wf-burning-text mb-4">
          Renascimento das Cinzas
        </h3>
        
        <p className="font-merriweather text-sm text-gray-500 italic mb-2">
          "Da destruição nasce a vida, das cinzas brotam sementes."
        </p>
        
        <p className="text-xs text-gray-600">
          © 2024 Forgotten Realms 5.5 One D&D Fan Content.
          <br />
          Onde as chamas dançam, a floresta renasce.
        </p>
      </div>
    </footer>
  );
};

// Layout principal
const WildfireLayout: React.FC<WildfireLayoutProps> = ({
  children,
  activeTab = 'story',
  onTabChange = () => {}
}) => {
  return (
    <div className="min-h-screen theme-wildfire bg-gradient-to-b from-[#1a1a1a] via-[#1f1510] to-[#1a1a1a]">
      {/* Background com efeito de cinzas */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient de fundo queimado */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,0,0,0.1)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(255,69,0,0.05)_0%,_transparent_40%)]" />
        
        {/* Partículas de fundo */}
        <EmberParticles count={15} />
      </div>

      <WildfireHeader activeTab={activeTab} onTabChange={onTabChange} />
      
      <main className="relative z-10">
        {children}
      </main>
      
      <WildfireFooter />
    </div>
  );
};

export default WildfireLayout;
