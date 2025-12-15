import React, { useState } from 'react';
import Hero from './components/Hero';
import ChapterView from './components/ChapterView';
import Navigation from './components/Navigation';
import TabNavigation from './components/TabNavigation';
import CharacterInfo from './components/CharacterInfo';
import CharacterSheet from './components/CharacterSheet';
import { CampaignProvider } from './context/CampaignContext';
import { STORY_DATA } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('story');

  return (
    <CampaignProvider>
      <div className="min-h-screen bg-iron-950 text-slate-300 selection:bg-purple-900 selection:text-white">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Navigation (Table of Contents) only shows on Story tab */}
        {activeTab === 'story' && <Navigation />}
        
        <main className="pt-16">
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

        <footer className="py-12 bg-iron-950 border-t border-slate-900 text-center">
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

export default App;