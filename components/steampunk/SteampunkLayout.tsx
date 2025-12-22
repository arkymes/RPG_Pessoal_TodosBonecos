import React, { ReactNode, useState, useEffect } from 'react';
import { Gear, ScrollGears, GearCluster } from './Gear';
import { CharacterSelector } from './CharacterSelector';

interface SteampunkLayoutProps {
  children: ReactNode;
  showScrollGears?: boolean;
}

export const SteampunkLayout: React.FC<SteampunkLayoutProps> = ({
  children,
  showScrollGears = false
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Track scroll para as engrenagens laterais
  useEffect(() => {
    if (!showScrollGears) return;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showScrollGears]);
  
  return (
    <div className="theme-steampunk min-h-screen relative overflow-x-hidden">
      {/* ============================================
          TEXTURAS DE FUNDO - Bronze/Cobre
          ============================================ */}
      
      {/* Fundo base - gradiente de bronze escuro */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: `
            linear-gradient(180deg,
              #1a1410 0%,
              #251d17 20%,
              #2d241c 40%,
              #1f1915 60%,
              #1a1410 80%,
              #0f0c09 100%
            )
          `
        }}
      />
      
      {/* Textura de metal escovado */}
      <div 
        className="fixed inset-0 z-[1] pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              rgba(205, 127, 50, 0.02) 1px,
              transparent 2px,
              transparent 4px
            ),
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              rgba(0, 0, 0, 0.03) 1px,
              transparent 2px,
              transparent 8px
            )
          `
        }}
      />
      
      {/* Placas de bronze soldadas (grid visual) */}
      <div 
        className="fixed inset-0 z-[2] pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 90, 43, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 90, 43, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '200px 150px',
          backgroundPosition: '0 0'
        }}
      />
      
      {/* Rebites nas intersecções */}
      <div 
        className="fixed inset-0 z-[3] pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle 3px at 0px 0px, #daa06d 0%, #8b5a2b 40%, transparent 50%)
          `,
          backgroundSize: '200px 150px',
          backgroundPosition: '0 0'
        }}
      />
      
      {/* Manchas de óleo/patina */}
      <div className="fixed inset-0 z-[4] pointer-events-none">
        <div 
          className="absolute top-[10%] left-[15%] w-[200px] h-[150px] opacity-20"
          style={{
            background: 'radial-gradient(ellipse, rgba(74, 124, 89, 0.3) 0%, transparent 70%)',
            filter: 'blur(30px)'
          }}
        />
        <div 
          className="absolute top-[60%] right-[20%] w-[180px] h-[120px] opacity-15"
          style={{
            background: 'radial-gradient(ellipse, rgba(160, 82, 45, 0.4) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }}
        />
        <div 
          className="absolute top-[30%] right-[10%] w-[150px] h-[200px] opacity-10"
          style={{
            background: 'radial-gradient(ellipse, rgba(0, 0, 0, 0.5) 0%, transparent 70%)',
            filter: 'blur(50px)'
          }}
        />
        <div 
          className="absolute bottom-[20%] left-[25%] w-[220px] h-[100px] opacity-15"
          style={{
            background: 'radial-gradient(ellipse, rgba(74, 124, 89, 0.25) 0%, transparent 70%)',
            filter: 'blur(35px)'
          }}
        />
      </div>
      
      {/* Overlay de vinheta */}
      <div 
        className="fixed inset-0 z-[5] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10, 8, 5, 0.6) 100%)'
        }}
      />
      
      {/* ============================================
          ENGRENAGENS DECORATIVAS FIXAS
          ============================================ */}
      
      {/* Canto superior esquerdo */}
      <div className="fixed top-0 left-0 z-[6] opacity-40 pointer-events-none">
        <div className="relative">
          <div className="absolute top-[-30px] left-[-30px]">
            <Gear size={120} teeth={20} spinning active speed="slow" />
          </div>
          <div className="absolute top-[40px] left-[60px]">
            <Gear size={60} teeth={12} spinning reverse active speed="slow" />
          </div>
        </div>
      </div>
      
      {/* Canto inferior direito */}
      <div className="fixed bottom-0 right-0 z-[6] opacity-30 pointer-events-none">
        <div className="relative">
          <div className="absolute bottom-[-40px] right-[-40px]">
            <Gear size={150} teeth={24} spinning active speed="slow" />
          </div>
          <div className="absolute bottom-[50px] right-[80px]">
            <Gear size={70} teeth={14} spinning reverse active speed="slow" />
          </div>
          <div className="absolute bottom-[90px] right-[30px]">
            <Gear size={40} teeth={10} spinning active speed="medium" />
          </div>
        </div>
      </div>
      
      {/* Engrenagens do scroll (se ativadas) */}
      {showScrollGears && (
        <>
          <ScrollGears side="left" scrollProgress={scrollProgress} />
          <ScrollGears side="right" scrollProgress={scrollProgress} />
        </>
      )}
      
      {/* ============================================
          BORDAS DECORATIVAS
          ============================================ */}
      
      {/* Borda superior com tubos */}
      <div className="fixed top-0 left-0 right-0 h-2 z-[15] pointer-events-none">
        <div className="h-full bg-gradient-to-r from-stone-900 via-amber-900/30 to-stone-900" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent" />
      </div>
      
      {/* ============================================
          CONTEÚDO
          ============================================ */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* ============================================
          ELEMENTOS DE VAPOR (SUTIS)
          ============================================ */}
      <div className="fixed bottom-0 left-[10%] z-[8] pointer-events-none opacity-20">
        <div className="steam-particle" />
      </div>
      <div className="fixed bottom-0 right-[15%] z-[8] pointer-events-none opacity-15">
        <div className="steam-particle" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* CSS para partículas de vapor */}
      <style>{`
        @keyframes steam-rise {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.5);
          }
          20% {
            opacity: 0.3;
          }
          100% {
            opacity: 0;
            transform: translateY(-150px) scale(2);
          }
        }
        
        .steam-particle {
          width: 40px;
          height: 40px;
          background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: steam-rise 8s ease-out infinite;
        }
      `}</style>
    </div>
  );
};

// Header Steampunk com seletor de personagem
interface SteampunkHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SteampunkHeader: React.FC<SteampunkHeaderProps> = ({
  activeTab,
  setActiveTab
}) => {
  const tabs = [
    { id: 'story', label: 'Historia' },
    { id: 'info', label: 'Bio' },
    { id: 'sheet', label: 'Ficha' },
  ];
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Barra principal */}
      <div className="sp-bronze-plate border-b-4 border-amber-900/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Seletor de Personagem (esquerda) */}
          <CharacterSelector />
          
          {/* Tabs de navegacao (centro) */}
          <nav className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-5 py-2 rounded
                  font-display text-sm tracking-wide uppercase
                  transition-all duration-300
                  border-2
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-b from-amber-700 to-amber-900 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-stone-900/50 border-amber-900/30 text-stone-400 hover:text-amber-300 hover:border-amber-800/50'
                  }
                `}
              >
                {tab.label}
                
                {/* Engrenagem indicadora de ativo */}
                {activeTab === tab.id && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                    <Gear size={16} teeth={8} spinning active speed="slow" style="small" />
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          {/* Decoração direita */}
          <div className="w-[200px] flex justify-end">
            <div className="flex items-center gap-2 opacity-60">
              <Gear size={24} teeth={8} spinning active speed="slow" />
              <div className="h-6 w-px bg-amber-800/50" />
              <Gear size={20} teeth={6} spinning reverse active speed="medium" />
            </div>
          </div>
        </div>
        
        {/* Linha decorativa inferior */}
        <div className="h-1 bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />
      </div>
    </header>
  );
};

// Footer Steampunk
export const SteampunkFooter: React.FC = () => {
  return (
    <footer className="relative z-20 mt-20">
      {/* Borda superior decorativa */}
      <div className="h-1 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent" />
      
      <div className="sp-bronze-plate py-8 border-t-4 border-amber-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Engrenagens decorativas */}
          <div className="flex justify-center items-center gap-4 mb-4">
            <Gear size={30} teeth={10} spinning active speed="slow" />
            <div className="h-px w-20 bg-gradient-to-r from-amber-700/50 to-transparent" />
            <Gear size={24} teeth={8} spinning active speed="medium" style="decorative" />
            <div className="h-px w-20 bg-gradient-to-l from-amber-700/50 to-transparent" />
            <Gear size={30} teeth={10} spinning reverse active speed="slow" />
          </div>
          
          <p className="font-display text-amber-600/80 mb-2 text-sm tracking-wide">
            O Mecanismo da Sombra
          </p>
          <p className="font-serif text-xs text-stone-600 italic">
            © 2024 Forgotten Realms 5.5 One D&D Fan Content.
            <br />
            Forjado com bronze e vapor pelos contadores de histórias.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SteampunkLayout;
