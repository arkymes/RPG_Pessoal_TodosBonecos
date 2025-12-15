import React, { useState, useEffect, useRef } from 'react';
import { STORY_DATA } from '../constants';
import { BookOpen, X, Download, Upload, Trash2, FolderInput, CheckCircle } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

const Navigation: React.FC = () => {
  const { exportCampaign, importCampaign, resetCampaign, connectLocalFolder, isFolderConnected } = useCampaign();
  const [isOpen, setIsOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);

      // Find active chapter based on scroll position
      let currentId = "";
      // Loop through chapters to find which one is currently in the viewport
      for (const chapter of STORY_DATA) {
        const element = document.getElementById(chapter.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Consider a chapter active if its top is above the midpoint of the screen
          // and its bottom is still below the top of the screen (visible)
          if (rect.top < window.innerHeight / 2 && rect.bottom > 0) {
            currentId = chapter.id;
          }
        }
      }
      
      if (currentId) {
        setActiveChapter(currentId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToChapter = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importCampaign(file);
        setIsOpen(false);
      } catch (err) {
        console.error("Import error:", err);
        alert("Erro ao importar campanha. Verifique se o arquivo é válido.");
      }
    }
    // Reset input value to allow selecting the same file again if needed
    if (event.target) {
        event.target.value = '';
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed top-20 right-4 z-40 p-3 bg-iron-950/90 border border-slate-700 text-copper-500 rounded-full shadow-xl backdrop-blur-md transition-all duration-300 hover:text-white hover:border-copper-500 hover:scale-110 ${scrolled ? 'opacity-100 translate-x-0' : 'opacity-100 translate-x-0'}`}
        aria-label="Abrir Menu de Navegação"
      >
        <BookOpen className="w-6 h-6" />
      </button>

      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`
        fixed top-0 right-0 h-full w-80 bg-iron-950 border-l border-slate-800 z-50 transform transition-transform duration-300 shadow-2xl flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 flex-none">
            <div className="flex justify-between items-center mb-8">
                <h2 className="font-display text-2xl text-slate-200">Índice</h2>
                <button 
                    onClick={() => setIsOpen(false)} 
                    className="text-slate-500 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
            {/* Chapter List */}
            <nav className="space-y-1 mb-8">
                {STORY_DATA.map((chapter) => (
                    <button
                        key={chapter.id}
                        onClick={() => scrollToChapter(chapter.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden ${
                            activeChapter === chapter.id 
                            ? 'bg-copper-900/20 text-copper-400 border border-copper-900/50 shadow-[inset_0_0_10px_rgba(245,158,11,0.05)]' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                        }`}
                    >
                        {activeChapter === chapter.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-copper-500" />
                        )}
                        <span className={`block text-[10px] uppercase tracking-widest mb-1 transition-colors ${activeChapter === chapter.id ? 'text-copper-600' : 'text-slate-600 group-hover:text-slate-500'}`}>
                            {chapter.number}
                        </span>
                        <span className="font-display tracking-wide">{chapter.title}</span>
                    </button>
                ))}
            </nav>

            {/* Campaign Management Section */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    Sistema & Dados
                </h3>
                
                <button 
                    onClick={connectLocalFolder}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium border transition-colors ${isFolderConnected ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' : 'bg-iron-900 border-slate-800 text-slate-400 hover:bg-iron-800 hover:text-slate-200'}`}
                    title="Vincule uma pasta local para salvar as imagens geradas permanentemente"
                >
                    {isFolderConnected ? <CheckCircle className="w-4 h-4" /> : <FolderInput className="w-4 h-4" />}
                    {isFolderConnected ? "Armazenamento Vinculado" : "Vincular Pasta Local"}
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={exportCampaign}
                        className="flex items-center justify-center gap-2 px-3 py-3 bg-iron-900 border border-slate-800 rounded text-slate-400 hover:text-white hover:border-slate-600 text-xs font-medium transition-colors hover:bg-iron-800"
                        title="Baixar arquivo de backup (.json)"
                    >
                        <Download className="w-3 h-3" /> Backup
                    </button>
                    <button 
                        onClick={handleImportClick}
                        className="flex items-center justify-center gap-2 px-3 py-3 bg-iron-900 border border-slate-800 rounded text-slate-400 hover:text-white hover:border-slate-600 text-xs font-medium transition-colors hover:bg-iron-800"
                        title="Carregar arquivo de backup"
                    >
                        <Upload className="w-3 h-3" /> Restaurar
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".shadow,.json" 
                        className="hidden" 
                    />
                </div>

                <button 
                    onClick={resetCampaign}
                    className="w-full flex items-center justify-center gap-2 px-3 py-3 mt-2 text-red-500/70 hover:text-red-400 hover:bg-red-950/20 rounded text-xs font-medium transition-colors border border-transparent hover:border-red-900/30"
                >
                    <Trash2 className="w-3 h-3" /> Resetar Dados Locais
                </button>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Navigation;