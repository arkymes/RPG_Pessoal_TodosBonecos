import React, { useState, useEffect, useRef } from 'react';
import { STORY_DATA } from '../constants';
import { BookOpen, X, Download, Upload, Trash2, FolderInput, CheckCircle, Cloud, CloudLightning, Loader2, Copy, AlertTriangle, Database as DatabaseIcon } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

const Navigation: React.FC = () => {
  const { exportCampaign, importCampaign, resetCampaign, connectLocalFolder, isFolderConnected, connectCloud, isCloudConnected, isLoadingCloud } = useCampaign();
  const [isOpen, setIsOpen] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  
  // Configuração completa com os dados fornecidos pelo usuário
  const TEMPLATE_CONFIG = `{
  "apiKey": "AIzaSyA9FhnaHzPzTWiidq1aN0LwKuRnMRpS7vU",
  "authDomain": "rpgdoscria-8659b.firebaseapp.com",
  "databaseURL": "https://rpgdoscria-8659b-default-rtdb.firebaseio.com",
  "projectId": "rpgdoscria-8659b",
  "storageBucket": "rpgdoscria-8659b.firebasestorage.app",
  "messagingSenderId": "854579946178",
  "appId": "1:854579946178:web:7a0943fce204a70ac0915b"
}`;

  const [firebaseConfigStr, setFirebaseConfigStr] = useState(TEMPLATE_CONFIG);
  const [activeChapter, setActiveChapter] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
      let currentId = "";
      for (const chapter of STORY_DATA) {
        const element = document.getElementById(chapter.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top < window.innerHeight / 2 && rect.bottom > 0) currentId = chapter.id;
        }
      }
      if (currentId) setActiveChapter(currentId);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToChapter = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        // @ts-ignore
      await importCampaign(file);
      setIsOpen(false);
    }
    if (event.target) event.target.value = '';
  };

  const handleCloudConnect = () => {
      try {
          // Tenta limpar JSON sujo se o usuário copiar mal
          const cleanStr = firebaseConfigStr.replace(/^[^{]*{/, '{').replace(/}[^}]*$/, '}');
          const config = JSON.parse(cleanStr);
          
          if (!config.databaseURL) {
              alert("Atenção: A 'databaseURL' parece estar faltando. O salvamento gratuito depende dela.");
              return;
          }

          if (connectCloud(config)) {
              setShowCloudModal(false);
              alert("Banco de Dados Conectado! Suas imagens serão salvas na nuvem automaticamente.");
          } else {
              alert("Falha na conexão. Verifique se o banco de dados foi criado no modo 'test' (público) no console do Firebase.");
          }
      } catch (e) {
          alert("JSON inválido. Certifique-se de manter as aspas e o formato correto.");
      }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed top-20 right-4 z-40 p-3 bg-iron-950/90 border border-slate-700 text-copper-500 rounded-full shadow-xl backdrop-blur-md transition-all duration-300 hover:text-white hover:border-copper-500 hover:scale-110 ${scrolled ? 'opacity-100 translate-x-0' : 'opacity-100 translate-x-0'}`}
      >
        <BookOpen className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 backdrop-blur-sm ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-80 bg-iron-950 border-l border-slate-800 z-50 transform transition-transform duration-300 shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-blend-overlay">
            <div className="flex justify-between items-center mb-8">
                <h2 className="font-display text-2xl text-slate-200">Índice</h2>
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white p-1 rounded-full"><X className="w-6 h-6" /></button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
            <nav className="space-y-1 mb-8">
                {STORY_DATA.map((chapter) => (
                    <button
                        key={chapter.id}
                        onClick={() => scrollToChapter(chapter.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden ${activeChapter === chapter.id ? 'bg-copper-900/20 text-copper-400 border border-copper-900/50' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                        {activeChapter === chapter.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-copper-500" />}
                        <span className={`block text-[10px] uppercase tracking-widest mb-1 ${activeChapter === chapter.id ? 'text-copper-600' : 'text-slate-600'}`}>{chapter.number}</span>
                        <span className="font-display tracking-wide">{chapter.title}</span>
                    </button>
                ))}
            </nav>

            <div className="border-t border-slate-800 pt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2">Sistema & Dados</h3>
                
                {/* Cloud Button */}
                <button 
                    onClick={() => setShowCloudModal(true)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium border transition-colors ${isCloudConnected ? 'bg-orange-950/30 border-orange-900/50 text-orange-400' : 'bg-iron-900 border-slate-800 text-slate-400 hover:bg-iron-800'}`}
                >
                    {isLoadingCloud ? <Loader2 className="w-4 h-4 animate-spin" /> : <DatabaseIcon className="w-4 h-4" />}
                    {isCloudConnected ? "Banco de Dados Conectado" : "Conectar Database (Grátis)"}
                </button>

                {/* Local Folder Button */}
                <button 
                    onClick={connectLocalFolder}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium border transition-colors ${isFolderConnected ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' : 'bg-iron-900 border-slate-800 text-slate-400 hover:bg-iron-800'}`}
                >
                    {isFolderConnected ? <CheckCircle className="w-4 h-4" /> : <FolderInput className="w-4 h-4" />}
                    {isFolderConnected ? "Pasta Local Vinculada" : "Vincular Pasta Local"}
                </button>

                {/* Import/Export */}
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={exportCampaign} className="flex items-center justify-center gap-2 px-3 py-3 bg-iron-900 border border-slate-800 rounded text-slate-400 text-xs hover:bg-iron-800"><Download className="w-3 h-3" /> Backup</button>
                    <button onClick={handleImportClick} className="flex items-center justify-center gap-2 px-3 py-3 bg-iron-900 border border-slate-800 rounded text-slate-400 text-xs hover:bg-iron-800"><Upload className="w-3 h-3" /> Restaurar</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".shadow,.json" className="hidden" />
                </div>

                <button onClick={resetCampaign} className="w-full flex items-center justify-center gap-2 px-3 py-3 mt-2 text-red-500/70 hover:text-red-400 hover:bg-red-950/20 rounded text-xs border border-transparent"><Trash2 className="w-3 h-3" /> Resetar Dados Locais</button>
            </div>
        </div>
      </aside>

      {/* Cloud Config Modal */}
      {showCloudModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-iron-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 to-copper-600" />
                  
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-display text-slate-200 flex items-center gap-2">
                          <DatabaseIcon className="w-5 h-5 text-orange-500" /> Configuração Pronta
                      </h3>
                      <button onClick={() => setShowCloudModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
                  </div>
                  
                  <div className="text-sm text-slate-400 mb-4 bg-iron-950/50 p-3 rounded border border-slate-800">
                      <p className="mb-2 font-bold text-orange-400 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Dados Pré-carregados
                      </p>
                      <p className="mb-2">
                        As credenciais do projeto <strong>RPGdosCria</strong> e a URL do banco já foram inseridas abaixo.
                      </p>
                      <div className="text-xs text-slate-500 italic border-t border-slate-800 pt-2 mt-2">
                        Basta clicar em "Conectar Database" para ativar o salvamento na nuvem.
                      </div>
                  </div>

                  <textarea 
                      value={firebaseConfigStr}
                      onChange={(e) => setFirebaseConfigStr(e.target.value)}
                      className="w-full h-48 bg-iron-950 font-mono text-xs text-slate-300 p-3 rounded border border-slate-800 focus:border-orange-500 outline-none mb-4 custom-scrollbar shadow-inner"
                  />

                  <div className="flex gap-3 justify-end">
                      <button onClick={() => setShowCloudModal(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-white">Cancelar</button>
                      <button onClick={handleCloudConnect} className="px-6 py-2 bg-gradient-to-r from-orange-700 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white font-bold rounded text-sm shadow-lg shadow-orange-900/20">
                          Conectar Database
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default Navigation;