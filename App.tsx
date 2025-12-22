import React, { useState } from 'react';
import Hero from './components/Hero';
import ChapterView from './components/ChapterView';
import Navigation from './components/Navigation';
import TabNavigation from './components/TabNavigation';
import CharacterInfo from './components/CharacterInfo';
import CharacterSheet from './components/CharacterSheet';
import { CampaignProvider } from './context/CampaignContext';
import { ThemeProvider, useTheme } from './themes/ThemeContext';
import { STORY_DATA } from './constants';

// Steampunk Components
import { 
  SteampunkLayout, 
  SteampunkHeader, 
  SteampunkFooter,
  SteampunkChapterView,
  SteampunkHero
} from './components/steampunk';

// Wildfire Components
import {
  WildfireLayout,
  WildfireHero,
  WildfireChapterView
} from './components/wildfire';

// Importar histórias específicas
import { KAELEN_STORY_DATA } from './stories/kaelen';

// Theme Transition
import { ThemeTransition } from './components/ThemeTransition';

// Componente interno que usa o tema
const ThemedApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('story');
  const { currentCharacter, currentTheme, isTransitioning, transitionType, completeTransition } = useTheme();
  
  // Verificar se é tema steampunk
  const isSteampunk = currentTheme?.id === 'steampunk-victorian';
  const isWildfire = currentTheme?.id === 'wildfire-primal';

  // Renderizar transição se estiver acontecendo
  const transitionOverlay = (
    <ThemeTransition 
      isTransitioning={isTransitioning}
      transitionType={transitionType}
      onComplete={completeTransition}
    />
  );

  // Se for steampunk, usar layout especial
  if (isSteampunk) {
    return (
      <CampaignProvider>
        {transitionOverlay}
        <SteampunkLayout showScrollGears={activeTab === 'story'}>
          <SteampunkHeader activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Navigation (Table of Contents) only shows on Story tab */}
          {activeTab === 'story' && <Navigation />}
          
          <main className="pt-20 relative z-10">
            {activeTab === 'story' && (
              <>
                {/* Hero Steampunk */}
                <SteampunkHero />
                
                <div className="container mx-auto max-w-4xl pt-10 pb-40">
                  <div className="flex flex-col space-y-0">
                    {STORY_DATA.map((chapter, index) => (
                      <SteampunkChapterView 
                        key={chapter.id} 
                        chapter={chapter} 
                        index={index} 
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'info' && (
              <div className="container mx-auto max-w-4xl px-4 py-10">
                <CharacterInfo />
              </div>
            )}

            {activeTab === 'sheet' && (
              <CharacterSheet />
            )}
          </main>

          <SteampunkFooter />
        </SteampunkLayout>
      </CampaignProvider>
    );
  }

  // Se for wildfire (Kaelen), usar layout especial
  if (isWildfire) {
    // Mapear as tabs: o wildfire usa 'bio' mas o resto do app usa 'info'
    const wildfireTab = activeTab === 'info' ? 'bio' : activeTab;
    const handleWildfireTabChange = (tab: 'story' | 'bio' | 'sheet') => {
      setActiveTab(tab === 'bio' ? 'info' : tab);
    };

    return (
      <CampaignProvider>
        {transitionOverlay}
        <WildfireLayout activeTab={wildfireTab as 'story' | 'bio' | 'sheet'} onTabChange={handleWildfireTabChange}>
          {/* Navigation (Table of Contents) only shows on Story tab */}
          {activeTab === 'story' && <Navigation />}
          
          <main className="pt-20 relative z-10">
            {activeTab === 'story' && (
              <>
                {/* Hero Wildfire */}
                <WildfireHero />
                
                <div className="container mx-auto max-w-4xl pt-10 pb-40">
                  <div className="flex flex-col space-y-0">
                    {KAELEN_STORY_DATA.map((chapter) => (
                      <WildfireChapterView 
                        key={chapter.title} 
                        chapter={chapter} 
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'info' && (
              <div className="container mx-auto max-w-4xl px-4 py-10">
                <CharacterInfo />
              </div>
            )}

            {activeTab === 'sheet' && (
              <CharacterSheet />
            )}
          </main>
        </WildfireLayout>
      </CampaignProvider>
    );
  }

  // Layout padrão (para outros temas futuros)
  return (
    <CampaignProvider>
      {transitionOverlay}
      <div className="min-h-screen bg-iron-950 text-slate-300 selection:bg-purple-900 selection:text-white relative">
        {/* Global Texture Overlay */}
        <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none z-0 mix-blend-overlay" />
        
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Navigation (Table of Contents) only shows on Story tab */}
        {activeTab === 'story' && <Navigation />}
        
        <main className="pt-16 relative z-10">
          {activeTab === 'story' && (
            <>
              <Hero />
              <div className="container mx-auto max-w-4xl pt-20 pb-40">
                <div className="flex flex-col space-y-0">
                  {STORY_DATA.map((chapter, index) => (
                    <ChapterView 
                      key={chapter.id} 
                      chapter={chapter} 
                      index={index} 
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'info' && (
            <CharacterInfo />
          )}

          {activeTab === 'sheet' && (
            <CharacterSheet />
          )}
        </main>

        <footer className="py-12 bg-iron-950 border-t border-slate-900 text-center relative z-10">
          <div className="max-w-2xl mx-auto px-4">
            <p className="font-display text-slate-500 mb-2">O Mecanismo da Sombra</p>
            <p className="font-sans text-xs text-slate-700">
              © 2024 Forgotten Realms 5.5 One D&D Fan Content.
              <br/>
              All rights reserved to the respective storytellers.
            </p>
          </div>
        </footer>
      </div>
    </CampaignProvider>
  );
};

// App principal com ThemeProvider
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  );
};

export default App;