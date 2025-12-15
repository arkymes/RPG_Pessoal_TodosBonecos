import React from 'react';
import { Book, User, FileText } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'story', label: 'História', icon: Book },
    { id: 'info', label: 'Grimório', icon: User },
    { id: 'sheet', label: 'Ficha D&D', icon: FileText },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-40 bg-iron-950/90 backdrop-blur-md border-b border-white/5 shadow-lg">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-center h-16 gap-1 md:gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-4 md:px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-300
                  ${isActive 
                    ? 'text-copper-400 bg-white/5 shadow-[inset_0_0_10px_rgba(251,191,36,0.1)] border border-copper-500/30' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-copper-500' : 'opacity-70'}`} />
                <span className={`text-sm font-display tracking-wide ${isActive ? 'font-bold' : 'font-normal'}`}>
                  {tab.label}
                </span>
                
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-copper-500 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;