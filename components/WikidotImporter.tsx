import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Search, Loader2, Download, AlertTriangle, X, Check, Brain, BookOpen, ChevronRight, Filter, ChevronDown, ChevronUp, Clock, Move, Hourglass, Edit2, Sparkles, Scroll } from 'lucide-react';

interface WikidotImporterProps {
  onImport: (data: any, type: 'item' | 'spell') => void;
  onClose: () => void;
  characterClass: string;
}

interface SpellSummary {
    name: string;
    url: string;
    school: string;
    castingTime: string;
    range: string;
    duration: string;
}

const CLASSES = [
    { id: 'artificer', label: 'Artificer' },
    { id: 'bard', label: 'Bard' },
    { id: 'cleric', label: 'Cleric' },
    { id: 'druid', label: 'Druid' },
    { id: 'paladin', label: 'Paladin' },
    { id: 'ranger', label: 'Ranger' },
    { id: 'sorcerer', label: 'Sorcerer' },
    { id: 'warlock', label: 'Warlock' },
    { id: 'wizard', label: 'Wizard' },
];

const WikidotImporter: React.FC<WikidotImporterProps> = ({ onImport, onClose, characterClass }) => {
  // Detalhes Popup (Browse)
  const [detailData, setDetailData] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Browse State
  const getWikidotClassSlug = (className: string) => {
      const lower = className.toLowerCase();
      if (lower.includes('artif')) return 'artificer';
      if (lower.includes('bard')) return 'bard';
      if (lower.includes('clérig') || lower.includes('cleric')) return 'cleric';
      if (lower.includes('druid')) return 'druid';
      if (lower.includes('paladin')) return 'paladin';
      if (lower.includes('ranger') || lower.includes('patrulheiro')) return 'ranger';
      if (lower.includes('sorcer') || lower.includes('feiti')) return 'sorcerer';
      if (lower.includes('warlock') || lower.includes('bruxo')) return 'warlock';
      if (lower.includes('wizard') || lower.includes('mago')) return 'wizard';
      return 'artificer'; // default
  };

  const [currentClassSlug, setCurrentClassSlug] = useState(getWikidotClassSlug(characterClass));
  const [isEditingClass, setIsEditingClass] = useState(false);

  const [spellsByLevel, setSpellsByLevel] = useState<Record<number, SpellSummary[]>>({});
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [listFilter, setListFilter] = useState('');

  // --- BUSCA AUTOMÁTICA DA LISTA AO ABRIR OU TROCAR CLASSE ---
  useEffect(() => {
      fetchSpellList();
  }, [currentClassSlug]);

  const fetchSpellList = async () => {
      setIsFetchingList(true);
      setSpellsByLevel({});
      
      try {
          const targetUrl = `http://dnd2024.wikidot.com/${currentClassSlug}:spell-list`;
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
          
          const response = await fetch(proxyUrl);
          const data = await response.json();
          
          if (!data.contents) throw new Error("Falha ao carregar lista.");

          const parser = new DOMParser();
          const doc = parser.parseFromString(data.contents, 'text/html');
          
          const levels: Record<number, SpellSummary[]> = {};

          for (let i = 0; i <= 9; i++) {
              const tabId = `wiki-tab-0-${i}`;
              const tabDiv = doc.getElementById(tabId);
              
              if (tabDiv) {
                  const spells: SpellSummary[] = [];
                  const rows = tabDiv.querySelectorAll('tr');
                  
                  rows.forEach(row => {
                      if (row.querySelector('th')) return;
                      
                      const cols = row.querySelectorAll('td');
                      if (cols.length >= 6) {
                          const link = cols[0].querySelector('a');
                          if (link) {
                              spells.push({
                                  name: link.textContent || "Desconhecido",
                                  url: link.getAttribute('href')?.replace('/', '') || "",
                                  school: cols[1].textContent?.trim() || "",
                                  castingTime: cols[3].textContent?.trim() || "",
                                  range: cols[4].textContent?.trim() || "",
                                  duration: cols[6].textContent?.trim() || ""
                              });
                          }
                      }
                  });
                  
                  if (spells.length > 0) {
                      levels[i] = spells;
                  }
              }
          }

          setSpellsByLevel(levels);

      } catch (e: any) {
          console.error("Erro ao buscar lista: " + e.message);
      } finally {
          setIsFetchingList(false);
      }
  };

  const toggleLevel = (lvl: number) => {
      setExpandedLevels(prev => ({ ...prev, [lvl]: !prev[lvl] }));
  };

  // --- POPUP DETAILS HANDLER (DIRECT HTML PARSING) ---
  const handleSpellClick = async (partialUrl: string) => {
      setDetailData(null);
      setIsDetailLoading(true);
      
      try {
          // Constrói URL correta
          const cleanSlug = partialUrl.replace(/^\//, '');
          const targetUrl = `http://dnd2024.wikidot.com/${cleanSlug}`;
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

          const response = await fetch(proxyUrl);
          const data = await response.json();

          if (!data.contents) throw new Error("Conteúdo vazio.");

          // Parse HTML Manualmente
          const parser = new DOMParser();
          const doc = parser.parseFromString(data.contents, 'text/html');
          const pageContent = doc.getElementById('page-content');
          const pageTitle = doc.querySelector('.page-title')?.textContent || cleanSlug;
          
          if (!pageContent) throw new Error("Estrutura da página desconhecida.");
          
          // Objeto inicial
          let spellData = {
              name: pageTitle,
              level: 0,
              school: "",
              castingTime: "-",
              range: "-",
              components: "-",
              duration: "-",
              description: "",
              higherLevels: "",
              classes: ""
          };

          const paragraphs = Array.from(pageContent.querySelectorAll('p'));
          let foundStats = false;

          paragraphs.forEach((p) => {
              const text = p.textContent?.trim() || "";
              const html = p.innerHTML;

              // Ignora Fonte
              if (text.startsWith("Source:")) return;

              // Metadata (Escola, Nível, Classes) - Geralmente antes dos stats
              if (!foundStats && !spellData.school && (text.toLowerCase().includes("cantrip") || text.toLowerCase().includes("level")) && !text.includes("Upgrade") && !text.includes("Higher Levels")) {
                  const classMatch = text.match(/\((.*?)\)/);
                  if (classMatch) spellData.classes = classMatch[1];
                  
                  const mainInfo = text.replace(/\(.*\)/, '').trim();
                  
                  if (mainInfo.toLowerCase().includes("cantrip")) {
                      spellData.level = 0;
                      spellData.school = mainInfo.replace(/cantrip/i, '').trim();
                  } else {
                      const levelMatch = mainInfo.match(/(\d+)/);
                      spellData.level = levelMatch ? parseInt(levelMatch[0]) : 1;
                      spellData.school = mainInfo.replace(/(\d+)(st|nd|rd|th)?-level/i, '').trim();
                  }
                  return;
              }

              // Stats Block
              if (html.includes("<strong>Casting Time:</strong>") || text.includes("Casting Time:")) {
                  foundStats = true;
                  const lines = html.split('<br>');
                  lines.forEach(line => {
                      const cleanLine = line.replace(/<[^>]*>/g, '').trim(); // Remove tags
                      if (cleanLine.startsWith("Casting Time:")) spellData.castingTime = cleanLine.replace("Casting Time:", "").trim();
                      if (cleanLine.startsWith("Range:")) spellData.range = cleanLine.replace("Range:", "").trim();
                      if (cleanLine.startsWith("Components:")) spellData.components = cleanLine.replace("Components:", "").trim();
                      if (cleanLine.startsWith("Duration:")) spellData.duration = cleanLine.replace("Duration:", "").trim();
                  });
                  return;
              }

              // Higher Levels
              if (text.startsWith("At Higher Levels") || text.startsWith("Cantrip Upgrade") || html.includes("<strong>At Higher Levels") || html.includes("<strong>Cantrip Upgrade")) {
                  spellData.higherLevels = text;
                  return;
              }

              // Descrição
              if (foundStats) {
                   spellData.description += text + "\n\n";
              }
          });
          
          spellData.description = spellData.description.trim();
          
          // Fallback
          if (!foundStats && paragraphs.length > 2) {
              spellData.description = "Detalhes complexos, verifique a fonte original.\n" + paragraphs.map(p => p.textContent).join('\n\n').substring(0, 500) + "...";
          }

          setDetailData(spellData);

      } catch (e) {
          console.error(e);
          setDetailData({ name: "Erro ao carregar", description: "Não foi possível ler os detalhes desta magia. O layout da Wiki mudou ou houve erro de conexão." });
      } finally {
          setIsDetailLoading(false);
      }
  };

  const importFromPopup = () => {
      if (!detailData) return;
      
      const newSpell = {
        name: detailData.name,
        prepared: false,
        level: detailData.level || 0,
        school: detailData.school,
        fullData: detailData
      };
      
      onImport(newSpell, 'spell');
      setDetailData(null); // Fecha popup
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-iron-900 border border-slate-700 rounded-xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-iron-950/50 rounded-t-xl shrink-0">
            <div>
                <h3 className="font-display text-lg text-slate-200 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    Grimório de&nbsp;
                    {isEditingClass ? (
                         <select 
                            value={currentClassSlug}
                            onChange={(e) => {
                                setCurrentClassSlug(e.target.value);
                                setIsEditingClass(false);
                            }}
                            onBlur={() => setIsEditingClass(false)}
                            autoFocus
                            className="bg-iron-950 border border-slate-700 rounded text-sm text-white px-2 py-1 outline-none"
                        >
                            {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    ) : (
                        <button 
                            onClick={() => setIsEditingClass(true)} 
                            className="border-b border-dashed border-slate-500 hover:text-copper-400 hover:border-copper-400 transition-colors flex items-center gap-1"
                            title="Clique para trocar a classe da lista"
                        >
                            {CLASSES.find(c => c.id === currentClassSlug)?.label || currentClassSlug}
                            <Edit2 className="w-3 h-3 opacity-50" />
                        </button>
                    )}
                </h3>
                <p className="text-xs text-slate-500 font-mono">Fonte: dnd2024.wikidot.com</p>
            </div>
            <button onClick={onClose}><X className="w-5 h-5 text-slate-500 hover:text-white" /></button>
        </div>

        {/* Content */}
        <div className="p-0 overflow-hidden flex flex-col flex-1 min-h-0 relative">

            {/* --- SPELL DETAIL POPUP (Modal interno) --- */}
            {(isDetailLoading || detailData) && (
                <div className="absolute inset-0 z-[70] bg-iron-950/95 backdrop-blur-sm p-4 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    {isDetailLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                                <Sparkles className="w-12 h-12 text-purple-400 animate-spin" />
                            </div>
                            <span className="text-slate-400 font-display tracking-widest animate-pulse">Consultando os Arcanos...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden bg-iron-900 border border-slate-700 rounded-lg shadow-2xl">
                            {/* Card Header */}
                            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-start shrink-0">
                                <div>
                                    <h2 className="text-2xl font-display text-slate-100">{detailData.name}</h2>
                                    <div className="text-xs text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                        <Scroll className="w-3 h-3" />
                                        {detailData.school} • {detailData.level > 0 ? `Level ${detailData.level}` : 'Cantrip'}
                                    </div>
                                </div>
                                <button onClick={() => setDetailData(null)} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800 border-b border-slate-800 shrink-0">
                                {[
                                    { label: 'Tempo', val: detailData.castingTime },
                                    { label: 'Alcance', val: detailData.range },
                                    { label: 'Comp.', val: detailData.components },
                                    { label: 'Duração', val: detailData.duration }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-iron-900 p-2 text-center">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold">{stat.label}</div>
                                        <div className="text-xs text-slate-200 font-mono truncate" title={stat.val}>{stat.val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-iron-950/30">
                                <div className="prose prose-invert prose-sm max-w-none font-serif text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {detailData.description}
                                </div>
                                {detailData.higherLevels && (
                                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                                        <strong className="text-purple-400 font-display text-xs uppercase tracking-wide block mb-1">Em Níveis Superiores</strong>
                                        <p className="text-sm text-slate-400 italic">{detailData.higherLevels}</p>
                                    </div>
                                )}
                                {detailData.classes && (
                                    <div className="mt-4 text-[10px] text-slate-600 font-mono uppercase">
                                        Classes: {detailData.classes}
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-slate-800 bg-iron-950 shrink-0 flex gap-3">
                                <button 
                                    onClick={() => setDetailData(null)}
                                    className="flex-1 py-3 bg-iron-800 hover:bg-iron-700 text-slate-300 font-bold rounded-lg border border-slate-700 transition-colors"
                                >
                                    Voltar
                                </button>
                                <button 
                                    onClick={importFromPopup}
                                    className="flex-[2] py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                                >
                                    <Download className="w-4 h-4" /> Adicionar ao Grimório
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* --- LISTA DE MAGIAS --- */}
            <div className="flex flex-col h-full min-h-0">
                <div className="p-4 border-b border-slate-800 bg-iron-950/30 shrink-0">
                    <div className="relative">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            value={listFilter}
                            onChange={(e) => setListFilter(e.target.value)}
                            placeholder="Filtrar por nome..."
                            className="w-full bg-iron-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-300 focus:outline-none focus:border-copper-500"
                        />
                    </div>
                </div>

                {isFetchingList && (
                    <div className="flex flex-col items-center justify-center flex-1 text-slate-500 gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-copper-500" />
                        <span>Buscando magias de {currentClassSlug}...</span>
                    </div>
                )}

                {!isFetchingList && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                        {Object.entries(spellsByLevel).map(([levelStr, spells]) => {
                            const level = parseInt(levelStr);
                            const filteredSpells = (spells as SpellSummary[]).filter(s => s.name.toLowerCase().includes(listFilter.toLowerCase()));
                            
                            if (filteredSpells.length === 0) return null;

                            return (
                                <div key={level} className="border border-slate-800 rounded-lg bg-iron-950/20 overflow-hidden shrink-0">
                                    <button 
                                        onClick={() => toggleLevel(level)}
                                        className="w-full flex items-center justify-between p-3 bg-slate-900/50 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 sticky top-0 z-10"
                                    >
                                        <span className="font-bold text-copper-400 font-display text-sm">
                                            {level === 0 ? "Truques (Cantrips)" : `${level}º Círculo`}
                                        </span>
                                        {expandedLevels[level] ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                    </button>
                                    
                                    {expandedLevels[level] && (
                                        <div className="divide-y divide-slate-800/50">
                                            {filteredSpells.map((spell, idx) => (
                                                <div key={idx} className="p-3 hover:bg-white/5 transition-colors group">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div 
                                                            className="font-bold text-slate-200 text-sm group-hover:text-purple-400 cursor-pointer flex-1" 
                                                            onClick={() => handleSpellClick(spell.url)}
                                                        >
                                                            {spell.name}
                                                        </div>
                                                        <button 
                                                            onClick={() => handleSpellClick(spell.url)}
                                                            className="text-xs bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded border border-purple-800/50 hover:bg-purple-800 hover:text-white transition-colors flex items-center gap-1"
                                                        >
                                                            Ver <ChevronRight className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 mt-2 font-mono">
                                                        <div className="flex items-center gap-1" title="Tempo de Conjuração">
                                                            <Hourglass className="w-3 h-3" /> {spell.castingTime}
                                                        </div>
                                                        <div className="flex items-center gap-1" title="Alcance">
                                                            <Move className="w-3 h-3" /> {spell.range}
                                                        </div>
                                                        <div className="flex items-center gap-1" title="Duração">
                                                            <Clock className="w-3 h-3" /> {spell.duration}
                                                        </div>
                                                    </div>
                                                    <div className="mt-1 text-[10px] text-slate-600 italic">
                                                        {spell.school}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div className="h-10" />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default WikidotImporter;