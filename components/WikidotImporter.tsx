import React, { useState, useEffect } from 'react';
import { Search, Loader2, Download, X, Brain, ChevronRight, Filter, ChevronDown, ChevronUp, Clock, Move, Hourglass, Edit2, Sparkles, Scroll, Shield, Shirt, Box, Layers, Swords, Wrench, MousePointerClick, Star, Award, ListChecks, CheckSquare, Square, Info } from 'lucide-react';
import { fetchWithFallback, parseSpellPage } from '../utils/wikidot';

interface WikidotImporterProps {
  onImport: (data: any, type: 'item' | 'spell' | 'proficiency' | 'feat' | 'class' | 'batch-spells') => void;
  onClose: () => void;
  characterClass: string;
  mode: 'spells' | 'armor' | 'tools-list' | 'weapons-list' | 'feats' | 'classes' | 'class-spells';
}

interface SpellSummary {
    name: string;
    url: string;
    school: string;
    castingTime: string;
    range: string;
    duration: string;
    components?: string;
}

interface ClassSummary {
    name: string;
    url: string;
}

// Generic interface for all equipment
interface EquipmentItem {
    name: string;
    cost: string;
    weight: string;
    description: string;
    category: string; 
    
    // Type specific
    ac?: string;
    strength?: string;
    stealth?: string;
    damage?: string;
    properties?: string;
    mastery?: string;
    
    // Internal
    sourceType: 'armor' | 'weapon' | 'gear' | 'tool' | 'feat' | 'class';
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

const EQUIP_TABS = [
    { id: 'armor', label: 'Armaduras', icon: Shirt, url: 'http://dnd2024.wikidot.com/equipment:armor' },
    { id: 'weapons', label: 'Armas', icon: Swords, url: 'http://dnd2024.wikidot.com/equipment:weapon' },
    { id: 'gear', label: 'Aventura', icon: Box, url: 'http://dnd2024.wikidot.com/equipment:adventuring-gear' },
    { id: 'tools', label: 'Ferramentas', icon: Wrench, url: 'http://dnd2024.wikidot.com/equipment:tool' },
];

const FEAT_TABS = [
    { id: 'wiki-tab-0-0', label: 'Origin Feats' },
    { id: 'wiki-tab-0-1', label: 'General Feats' },
    { id: 'wiki-tab-0-2', label: 'Fighting Style Feats' },
    { id: 'wiki-tab-0-3', label: 'Epic Boon Feats' },
    { id: 'wiki-tab-0-4', label: 'Dragonmark Feats' },
];

const normalizeText = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

const cleanCategoryName = (text: string) => {
    return text.replace(/\(.*\)/, '').trim();
};

const WikidotImporter: React.FC<WikidotImporterProps> = ({ onImport, onClose, characterClass, mode }) => {
  const [detailData, setDetailData] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
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
      return 'artificer'; 
  };
  const [currentClassSlug, setCurrentClassSlug] = useState(getWikidotClassSlug(characterClass));
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [spellsByLevel, setSpellsByLevel] = useState<Record<number, SpellSummary[]>>({});
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [selectedSpells, setSelectedSpells] = useState<Set<string>>(new Set());

  const [activeEquipTab, setActiveEquipTab] = useState(mode === 'tools-list' ? 'tools' : (mode === 'weapons-list' ? 'weapons' : 'armor'));
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [classesList, setClassesList] = useState<ClassSummary[]>([]);
  const [isFetchingEquip, setIsFetchingEquip] = useState(false);
  const [listFilter, setListFilter] = useState('');

  useEffect(() => {
      setListFilter('');
      if (mode === 'spells') {
        fetchSpellList();
      } else if (mode === 'class-spells') {
        fetchClassSpellList();
      } else if (mode === 'armor' || mode === 'tools-list' || mode === 'weapons-list') {
        fetchEquipment(mode === 'tools-list' ? 'tools' : (mode === 'weapons-list' ? 'weapons' : activeEquipTab));
      } else if (mode === 'feats') {
        fetchFeats();
      } else if (mode === 'classes') {
        fetchClasses();
      }
  }, [currentClassSlug, mode, activeEquipTab]);

  // ... (keep fetchSpellList and fetchClassSpellList as is)
  const fetchSpellList = async () => {
      setIsFetchingList(true);
      setSpellsByLevel({});
      try {
          const targetUrl = `http://dnd2024.wikidot.com/${currentClassSlug}:spell-list`;
          const htmlContent = await fetchWithFallback(targetUrl);
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          const levels: Record<number, SpellSummary[]> = {};

          for (let i = 0; i <= 9; i++) {
              const tabId = `wiki-tab-0-${i}`;
              const tabDiv = doc.getElementById(tabId);
              if (tabDiv) {
                  const spells: SpellSummary[] = [];
                  const rows = tabDiv.querySelectorAll('tr');
                  (Array.from(rows) as HTMLTableRowElement[]).forEach(row => {
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
                  if (spells.length > 0) levels[i] = spells;
              }
          }
          setSpellsByLevel(levels);
      } catch (e: any) { console.error("Erro ao buscar lista: " + e.message); } 
      finally { setIsFetchingList(false); }
  };

  const fetchClassSpellList = async () => {
      setIsFetchingList(true);
      setSpellsByLevel({});
      try {
          const targetUrl = `http://dnd2024.wikidot.com/${currentClassSlug}:spell-list`;
          const htmlContent = await fetchWithFallback(targetUrl);
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          const levels: Record<number, SpellSummary[]> = {};

          for (let i = 0; i <= 9; i++) {
              const tabId = `wiki-tab-0-${i}`;
              const tabDiv = doc.getElementById(tabId);
              if (tabDiv) {
                  const spells: SpellSummary[] = [];
                  const rows = tabDiv.querySelectorAll('tr');
                  const headerRow = tabDiv.querySelector('tr');
                  const headers = Array.from(headerRow?.querySelectorAll('th') || []).map(th => th.textContent?.trim().toLowerCase());
                  const idxName = 0; 
                  const idxSchool = headers.findIndex(h => h?.includes('school'));
                  const idxTime = headers.findIndex(h => h?.includes('time'));
                  const idxRange = headers.findIndex(h => h?.includes('range'));
                  const idxComp = headers.findIndex(h => h?.includes('comp'));
                  const idxDur = headers.findIndex(h => h?.includes('duration'));

                  (Array.from(rows) as HTMLTableRowElement[]).forEach((row, rowIdx) => {
                      if (rowIdx === 0) return; 
                      const cols = row.querySelectorAll('td');
                      if (cols.length >= 4) {
                          const link = cols[idxName].querySelector('a');
                          if (link) {
                              spells.push({
                                  name: link.textContent || "Desconhecido",
                                  url: link.getAttribute('href')?.replace('/', '') || "",
                                  school: (idxSchool > -1 ? cols[idxSchool].textContent?.trim() : "") || "Unknown",
                                  castingTime: (idxTime > -1 ? cols[idxTime].textContent?.trim() : "") || "",
                                  range: (idxRange > -1 ? cols[idxRange].textContent?.trim() : "") || "",
                                  components: (idxComp > -1 ? cols[idxComp].textContent?.trim() : "") || "",
                                  duration: (idxDur > -1 ? cols[idxDur].textContent?.trim() : "") || ""
                              });
                          }
                      }
                  });
                  if (spells.length > 0) levels[i] = spells;
              }
          }
          setSpellsByLevel(levels);
      } catch (e: any) { console.error("Erro ao buscar lista: " + e.message); } 
      finally { setIsFetchingList(false); }
  };

  const handleSpellClick = async (partialUrl: string) => {
      setDetailData(null);
      setIsDetailLoading(true);
      try {
          const cleanSlug = partialUrl.replace(/^\//, '');
          const targetUrl = `http://dnd2024.wikidot.com/${cleanSlug}`;
          const htmlContent = await fetchWithFallback(targetUrl);
          const spellData = parseSpellPage(htmlContent, cleanSlug);
          setDetailData(spellData);
      } catch (e) {
          setDetailData({ name: "Erro ao carregar", description: "Falha de conexão com a Wiki ou estrutura de página inesperada." });
      } finally { setIsDetailLoading(false); }
  };

  const handleToolDetailClick = (item: EquipmentItem) => {
    setDetailData({
        name: item.name,
        description: item.description,
        isTool: true,
        source: item.category
    });
  };

  const importDetailFromPopup = () => {
      if (!detailData) return;
      
      if (mode === 'feats') {
          onImport({
              name: detailData.name,
              source: detailData.source || "Wikidot",
              description: detailData.description
          }, 'feat');
      } else if (detailData.isTool) {
          importEquipmentItem({
              name: detailData.name,
              cost: "", 
              weight: "",
              category: detailData.source,
              description: detailData.description,
              sourceType: 'tool'
          });
      } else {
          onImport({
            name: detailData.name,
            prepared: false,
            level: detailData.level || 0,
            school: detailData.school,
            fullData: detailData
          }, 'spell');
      }
      setDetailData(null);
  };

  const toggleSpellSelection = (spellName: string) => {
      const newSet = new Set(selectedSpells);
      if (newSet.has(spellName)) newSet.delete(spellName);
      else newSet.add(spellName);
      setSelectedSpells(newSet);
  };

  const toggleAllInLevel = (level: number, select: boolean) => {
      const newSet = new Set(selectedSpells);
      const spells = spellsByLevel[level] || [];
      spells.forEach(s => {
          if (select) newSet.add(s.name);
          else newSet.delete(s.name);
      });
      setSelectedSpells(newSet);
  };

  const importBatchSpells = () => {
      const spellsToImport: any[] = [];
      Object.entries(spellsByLevel).forEach(([lvlStr, spells]) => {
          const lvl = parseInt(lvlStr);
          spells.forEach(s => {
              if (selectedSpells.has(s.name)) {
                  spellsToImport.push({
                      name: s.name,
                      level: lvl,
                      school: s.school,
                      castingTime: s.castingTime,
                      range: s.range,
                      components: s.components,
                      duration: s.duration
                  });
              }
          });
      });
      onImport(spellsToImport, 'batch-spells');
  };

  const fetchClasses = async () => {
      setIsFetchingEquip(true);
      setClassesList([]);
      try {
          const targetUrl = 'http://dnd2024.wikidot.com/';
          const htmlContent = await fetchWithFallback(targetUrl);
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          
          const links = doc.querySelectorAll('a');
          const parsedClasses: ClassSummary[] = [];
          
          (Array.from(links) as HTMLAnchorElement[]).forEach(link => {
              const href = link.getAttribute('href');
              if (href && href.endsWith(':main') && !href.includes('subclass')) {
                  const name = link.textContent?.trim() || "";
                  if (name && !name.includes('Rules') && !name.includes('Table')) {
                      parsedClasses.push({
                          name: name,
                          url: href
                      });
                  }
              }
          });
          
          const uniqueClasses = Array.from(new Set(parsedClasses.map(c => c.name)))
            .map(name => parsedClasses.find(c => c.name === name) || { name, url: '' }) 
            .filter(c => c.url !== '');

          setClassesList(uniqueClasses.sort((a,b) => a.name.localeCompare(b.name)));
      } catch(e) { console.error(e); }
      finally { setIsFetchingEquip(false); }
  }

  // --- KEY FIX IN HANDLE CLASS CLICK ---
  const handleClassClick = async (classUrl: string, className: string) => {
      setIsDetailLoading(true);
      try {
          const cleanSlug = classUrl.replace(/^\//, '');
          const targetUrl = `http://dnd2024.wikidot.com/${cleanSlug}`;
          const htmlContent = await fetchWithFallback(targetUrl);
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          
          let hitDie = "d8";
          let saves: string[] = [];
          let armor: string[] = [];
          let weapons: string[] = [];
          let progression: Record<number, string[]> = {};
          let definitions: Record<string, string> = {}; 
          let multiclassText = "";
          let skillPrompt = { count: 0, options: [] as string[] };

          const tables = doc.querySelectorAll('table.wiki-content-table');
          
          (Array.from(tables) as HTMLTableElement[]).forEach(table => {
              const header = table.querySelector('th');
              if (header && header.textContent?.includes('Core')) {
                  const rows = table.querySelectorAll('tr');
                  (Array.from(rows) as HTMLTableRowElement[]).forEach(row => {
                      const cols = row.querySelectorAll('td');
                      if (cols.length >= 2) {
                          const label = cols[0].textContent?.toLowerCase() || "";
                          const val = cols[1].textContent || "";
                          if (label.includes('hit point')) { const match = val.match(/d\d+/i); if (match) hitDie = match[0]; }
                          else if (label.includes('saving throw')) {
                              if (val.includes('Strength')) saves.push('Strength');
                              if (val.includes('Dexterity')) saves.push('Dexterity');
                              if (val.includes('Constitution')) saves.push('Constitution');
                              if (val.includes('Intelligence')) saves.push('Intelligence');
                              if (val.includes('Wisdom')) saves.push('Wisdom');
                              if (val.includes('Charisma')) saves.push('Charisma');
                          }
                          else if (label.includes('armor')) {
                              if (val.toLowerCase().includes('light')) armor.push('Leve');
                              if (val.toLowerCase().includes('medium')) armor.push('Média');
                              if (val.toLowerCase().includes('heavy')) armor.push('Pesada');
                              if (val.toLowerCase().includes('shield')) armor.push('Escudos');
                          }
                          else if (label.includes('weapon')) {
                              if (val.toLowerCase().includes('simple')) weapons.push('Simples');
                              if (val.toLowerCase().includes('martial')) weapons.push('Marcial');
                          }
                          else if (label.includes('skill')) {
                              const matchCount = val.match(/Choose (\d+)/i);
                              if (matchCount) skillPrompt.count = parseInt(matchCount[1]);
                              const listPart = val.split(':')[1] || val;
                              const opts = listPart.split(/,| or /).map(s => {
                                  const clean = s.trim().replace('.', '').toLowerCase();
                                  if(clean.includes('animal')) return 'animalHandling';
                                  if(clean.includes('sleight')) return 'sleightOfHand';
                                  return clean;
                              }).filter(s => s.length > 2);
                              skillPrompt.options = opts;
                          }
                      }
                  });
              }

              const ths = table.querySelectorAll('th');
              let featuresColIndex = -1;
              for (let i = 0; i < ths.length; i++) {
                  const txt = ths[i].textContent?.toLowerCase().trim() || "";
                  if (txt === 'features' || txt === 'class features') featuresColIndex = i;
              }
              if (featuresColIndex === -1 && ths.length > 2 && ths[2].textContent?.includes('Features')) featuresColIndex = 2;

              if (featuresColIndex !== -1) {
                  const rows = table.querySelectorAll('tr');
                  (Array.from(rows) as HTMLTableRowElement[]).forEach((row) => {
                      const cols = row.querySelectorAll('td');
                      if (cols.length > featuresColIndex) {
                          const levelText = cols[0].textContent?.trim();
                          const featuresText = cols[featuresColIndex].textContent?.trim(); 
                          const level = parseInt(levelText || "0");
                          if (!isNaN(level) && featuresText && featuresText !== '-' && isNaN(parseInt(featuresText))) {
                              const feats = featuresText!.split(',').map(f => f.trim()).filter(f => f && isNaN(parseInt(f)));
                              if (feats.length > 0) progression[level] = feats;
                          }
                      }
                  });
              }
          });

          const content = doc.getElementById('page-content');
          if (content) {
              const children = Array.from(content.children);
              let currentHeader = "";
              let descriptionBuffer = "";
              let capturingMulticlass = false;

              for (let i = 0; i < children.length; i++) {
                  const node = children[i];
                  const tagName = node.tagName;
                  const text = node.textContent?.trim() || "";

                  if (['H2','H3','H4','H5'].includes(tagName) || (tagName === 'P' && node.querySelector('strong') && text.length < 50)) {
                      
                      if (currentHeader && descriptionBuffer) {
                          // Clean "Level X: " prefix to ensure mapping works
                          const cleanH = currentHeader.replace(/^Level \d+:\s*/i, '').trim();
                          definitions[normalizeText(cleanH)] = descriptionBuffer.trim();
                          definitions[currentHeader] = descriptionBuffer.trim();
                      }

                      if (text.toLowerCase().includes('multiclass') && !text.includes('Feature')) {
                          capturingMulticlass = true;
                          currentHeader = "Multiclassing";
                      } else {
                          capturingMulticlass = false;
                          currentHeader = text.replace(/\(.*\)/, '').trim(); 
                      }
                      
                      descriptionBuffer = ""; 
                  } else {
                      if (currentHeader && !['TABLE', 'SCRIPT'].includes(tagName)) {
                          if (capturingMulticlass) multiclassText += text + "\n\n";
                          else descriptionBuffer += text + "\n\n";
                      }
                  }
              }
              if (currentHeader && descriptionBuffer) {
                   const cleanH = currentHeader.replace(/^Level \d+:\s*/i, '').trim();
                   definitions[normalizeText(cleanH)] = descriptionBuffer.trim();
              }
          }

          onImport({
              name: className,
              hitDie: hitDie,
              savingThrows: saves,
              armor: armor,
              weapons: weapons,
              progression: progression,
              definitions: definitions, 
              multiclassText: multiclassText, 
              skillPrompt: skillPrompt 
          }, 'class');

      } catch (e) { console.error(e); }
      finally { setIsDetailLoading(false); }
  }

  const fetchFeats = async () => {
      setIsFetchingEquip(true);
      setEquipmentList([]);
      try {
          const targetUrl = 'http://dnd2024.wikidot.com/feat:all';
          const htmlContent = await fetchWithFallback(targetUrl);
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          
          const parsedFeats: EquipmentItem[] = [];

          FEAT_TABS.forEach(tab => {
              const tabDiv = doc.getElementById(tab.id);
              if (tabDiv) {
                  const rows = tabDiv.querySelectorAll('tr');
                  (Array.from(rows) as HTMLTableRowElement[]).forEach(row => {
                      if (row.querySelector('th')) return;
                      const cols = row.querySelectorAll('td');
                      if (cols.length > 0) {
                          const link = cols[0].querySelector('a');
                          if (link) {
                              parsedFeats.push({
                                  name: link.textContent || "Talento",
                                  cost: link.getAttribute('href') || "", 
                                  weight: "",
                                  description: "",
                                  category: tab.label,
                                  sourceType: 'feat'
                              });
                          }
                      }
                  });
              }
          });
          setEquipmentList(parsedFeats);
      } catch (e) { console.error(e); }
      finally { setIsFetchingEquip(false); }
  }

  const fetchEquipment = async (tabId: string) => {
    setIsFetchingEquip(true);
    setEquipmentList([]);
    try {
        const tabConfig = EQUIP_TABS.find(t => t.id === tabId);
        if(!tabConfig) return;

        const htmlContent = await fetchWithFallback(tabConfig.url);
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const content = doc.getElementById('page-content');
        if (!content) return;

        const toolDetailMap: Record<string, string> = {};
        if (tabId === 'tools') {
            const tabs = content.querySelectorAll('.yui-navset');
            tabs.forEach(tabSet => {
                const navItems = tabSet.querySelectorAll('.yui-nav li');
                const contentItems = tabSet.querySelectorAll('.yui-content > div');
                navItems.forEach((li, i) => {
                    const name = li.textContent?.trim() || "";
                    const div = contentItems[i] as HTMLElement;
                    const desc = div?.innerText || div?.textContent || "";
                    if (name) toolDetailMap[name.toLowerCase()] = desc.trim();
                });
            });
        }

        const tables = content.querySelectorAll('table.wiki-content-table');
        const parsedItems: EquipmentItem[] = [];

        (Array.from(tables) as HTMLTableElement[]).forEach(table => {
            // ROBUST CATEGORY FINDING (Look up for H1-H6)
            let category = "Diversos";
            let prev = table.previousElementSibling;
            for(let i=0; i<5; i++) {
                if(!prev) break;
                if(['H1','H2','H3','H4','H5','H6'].includes(prev.tagName)) {
                    category = cleanCategoryName(prev.textContent?.trim() || "Diversos");
                    break;
                }
                prev = prev.previousElementSibling;
            }

            // DYNAMIC HEADER DETECTION - Scan up to 5 rows to find the header row
            const rows = Array.from(table.querySelectorAll('tr'));
            let headerMap: Record<string, number> = {};
            let hasDetectedHeaders = false;
            let headerRowIndex = -1;

            // Find the true header row that contains column names like 'Cost', 'Damage', 'AC', etc.
            for(let r=0; r<Math.min(rows.length, 5); r++) {
                const ths = Array.from(rows[r].querySelectorAll('th')).map(t => t.textContent?.trim().toLowerCase() || "");
                // Check if this row looks like a header row
                if (ths.some(h => h.includes('cost') || h.includes('damage') || h.includes('weight') || h.includes('armor') || h.includes('mastery'))) {
                    headerRowIndex = r;
                    ths.forEach((h, i) => {
                        if(h.includes('name') || h === 'armor' || h === 'weapon' || h === 'item') headerMap['name'] = i;
                        if(h.includes('damage')) headerMap['damage'] = i;
                        if(h.includes('properties')) headerMap['properties'] = i;
                        if(h.includes('mastery')) headerMap['mastery'] = i;
                        if(h.includes('weight')) headerMap['weight'] = i;
                        if(h.includes('cost')) headerMap['cost'] = i;
                        if(h.includes('armor class') || h === 'ac' || h.includes('armor')) headerMap['ac'] = i;
                        if(h.includes('strength') || h === 'str') headerMap['strength'] = i;
                        if(h.includes('stealth')) headerMap['stealth'] = i;
                    });
                    hasDetectedHeaders = true;
                    break;
                }
            }

            rows.forEach((row, idx) => {
                // Skip header row(s)
                if (hasDetectedHeaders && idx <= headerRowIndex) return;
                if (idx === 0 && !hasDetectedHeaders) return; // Fallback skip first row if no header found

                const cols = row.querySelectorAll('td');
                if (cols.length === 0) return; 

                const getVal = (key: string, defIdx: number) => {
                    const idx = hasDetectedHeaders ? (headerMap[key] ?? defIdx) : defIdx;
                    return cols[idx]?.textContent?.trim() || "";
                };
                
                if (tabId === 'armor') {
                    parsedItems.push({
                        name: getVal('name', 0),
                        cost: getVal('cost', 5),
                        ac: getVal('ac', 1),
                        strength: getVal('strength', 2),
                        stealth: getVal('stealth', 3),
                        weight: getVal('weight', 4),
                        category: category,
                        description: "",
                        sourceType: 'armor'
                    });
                } else if (tabId === 'weapons') {
                     parsedItems.push({
                        name: getVal('name', 0),
                        damage: getVal('damage', 1),
                        properties: getVal('properties', 2),
                        mastery: getVal('mastery', 3),
                        weight: getVal('weight', 4),
                        cost: getVal('cost', 5),
                        category: category,
                        description: "",
                        sourceType: 'weapon'
                    });
                } else if (tabId === 'tools' && cols.length >= 4) {
                     const name = cols[0].textContent?.trim() || "Item";
                     const ability = cols[1].textContent?.trim() || "-";
                     const weight = cols[2]?.textContent?.trim() || "-";
                     const cost = cols[3]?.textContent?.trim() || "";
                     const detail = toolDetailMap[name.toLowerCase()] || "";
                     
                     parsedItems.push({
                        name: name,
                        cost: cost,
                        weight: weight,
                        category: category,
                        description: detail || `Habilidade: ${ability}`,
                        sourceType: 'tool'
                    });
                } else if (tabId === 'gear' && cols.length >= 2) {
                     const weight = cols[2]?.textContent?.trim() || "-";
                     const description = cols[3]?.textContent?.trim() || "";
                     
                     parsedItems.push({
                        name: cols[0].textContent?.trim() || "Item",
                        cost: cols[1].textContent?.trim() || "",
                        weight: weight,
                        category: category,
                        description: description,
                        sourceType: 'gear'
                    });
                }
            });
        });
        setEquipmentList(parsedItems);
    } catch(e) { console.error(e); }
    finally { setIsFetchingEquip(false); }
  };

  const importEquipmentItem = (item: EquipmentItem) => {
      if (mode === 'tools-list' || mode === 'weapons-list') {
          onImport({ name: item.name }, 'proficiency');
          return;
      }

      if (mode === 'feats') {
          if (item.cost) handleSpellClick(item.cost);
          return;
      }

      let newItem: any = {
          id: Math.random().toString(36).substr(2, 9),
          name: item.name,
          equipped: false,
          weight: item.weight,
          category: item.category
      };

      if (item.sourceType === 'armor') {
          const isShield = item.category.toLowerCase().includes('shield');
          newItem.type = isShield ? 'shield' : 'armor';
          const acMatch = item.ac?.match(/(\d+)/);
          newItem.acBonus = acMatch ? parseInt(acMatch[0]) : 0;
          
          const cat = item.category.toLowerCase();
          // Correctly set Max Dex based on category
          if (cat.includes('heavy') || cat.includes('pesada')) newItem.maxDex = 0;
          else if (cat.includes('medium') || cat.includes('médio') || cat.includes('media')) newItem.maxDex = 2;
          else newItem.maxDex = 99; // Light armor / Shields usually no limit
          
          // Fallback check AC string for "(max 2)" text
          if (item.ac?.toLowerCase().includes('max 2')) newItem.maxDex = 2;

          newItem.stealthDisadvantage = item.stealth?.toLowerCase().includes('disadvantage');
          // Update description with all relevant stats since they are not shown in main card
          newItem.description = `Categoria: ${item.category}\nCusto: ${item.cost}\nPeso: ${item.weight}\nForça: ${item.strength}\nFurtividade: ${item.stealth}`;
          
          // Also set strength req explicit property
          if (item.strength && item.strength !== '-') newItem.strengthReq = item.strength;

      } else if (item.sourceType === 'weapon') {
          newItem.type = 'weapon';
          newItem.damage = item.damage;
          const dmgParts = item.damage?.split(' ');
          if (dmgParts && dmgParts.length > 1) {
              newItem.damage = dmgParts[0];
              newItem.damageType = dmgParts.slice(1).join(' ');
          }
          newItem.properties = item.properties?.split(',').map(s => s.trim());
          newItem.mastery = item.mastery;
          newItem.isTwoHandedConfig = false; 
          newItem.description = `Categoria: ${item.category}\nCusto: ${item.cost}\nPeso: ${item.weight}\nMaestria: ${item.mastery}\nPropriedades: ${item.properties || "Nenhuma"}`; 
      } else {
          newItem.type = 'misc';
          newItem.quantity = 1;
          newItem.description = `Categoria: ${item.category}\nCusto: ${item.cost}\nPeso: ${item.weight}\n${item.description}`;
      }

      onImport(newItem, 'item');
  };

  const groupedItems = equipmentList.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
  }, {} as Record<string, EquipmentItem[]>);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-iron-900 border border-slate-700 rounded-xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        {/* ... (rest of the component UI remains similar but uses the imported functions) ... */}
        
        {/* Header */}
        <div className="bg-iron-950/50 rounded-t-xl shrink-0">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                     {mode === 'spells' || mode === 'class-spells' ? (
                        <div className="bg-purple-900/20 p-2 rounded">
                            <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                     ) : mode === 'feats' ? (
                        <div className="bg-copper-900/20 p-2 rounded">
                            <Award className="w-5 h-5 text-copper-400" />
                        </div>
                     ) : mode === 'classes' ? (
                        <div className="bg-blue-900/20 p-2 rounded">
                            <Star className="w-5 h-5 text-blue-400" />
                        </div>
                     ) : (
                        <div className="bg-copper-900/20 p-2 rounded">
                            <Shield className="w-5 h-5 text-copper-400" />
                        </div>
                     )}
                     <h3 className="font-display text-lg text-slate-200">
                        {mode === 'spells' ? "Grimório Online" : 
                         (mode === 'class-spells' ? `Lista de Magias: ${CLASSES.find(c => c.id === currentClassSlug)?.label}` :
                         (mode === 'tools-list' ? "Selecionar Ferramenta (Proficiência)" : 
                          mode === 'weapons-list' ? "Selecionar Arma (Proficiência)" :
                          mode === 'feats' ? "Banco de Talentos" :
                          mode === 'classes' ? "Lista de Classes" :
                          "Catálogo de Equipamentos"))}
                     </h3>
                </div>
                <button onClick={onClose}><X className="w-5 h-5 text-slate-500 hover:text-white" /></button>
            </div>
            
            {/* Mode Specific Headers */}
            {(mode === 'spells' || mode === 'class-spells') && (
                <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-3 bg-iron-900/30">
                     <span className="text-xs text-slate-500 uppercase font-bold">Classe:</span>
                     {isEditingClass ? (
                         <select 
                            value={currentClassSlug}
                            onChange={(e) => { setCurrentClassSlug(e.target.value); setIsEditingClass(false); }}
                            onBlur={() => setIsEditingClass(false)}
                            autoFocus
                            className="bg-iron-950 border border-slate-700 rounded text-sm text-white px-2 py-1 outline-none"
                        >
                            {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                    ) : (
                        <button 
                            onClick={() => setIsEditingClass(true)} 
                            className="text-sm font-bold text-slate-300 border-b border-dashed border-slate-500 hover:text-copper-400 hover:border-copper-400 transition-colors flex items-center gap-1"
                        >
                            {CLASSES.find(c => c.id === currentClassSlug)?.label || currentClassSlug}
                            <Edit2 className="w-3 h-3 opacity-50" />
                        </button>
                    )}
                </div>
            )}

            {(mode === 'armor' || mode === 'tools-list' || mode === 'weapons-list') && (
                <div className="flex bg-iron-950 border-b border-slate-800">
                    {EQUIP_TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeEquipTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveEquipTab(tab.id)}
                                className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${
                                    isActive 
                                    ? 'border-copper-500 text-copper-400 bg-white/5' 
                                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Content Area */}
        <div className="p-0 overflow-hidden flex flex-col flex-1 min-h-0 relative">
            
            {/* CLASS LOADING OVERLAY */}
            {isDetailLoading && mode === 'classes' && (
                <div className="absolute inset-0 z-[70] bg-iron-950/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                    <Sparkles className="w-12 h-12 text-blue-400 animate-spin" />
                    <span className="text-slate-400 font-display tracking-widest animate-pulse mt-4">Decifrando Classe...</span>
                </div>
            )}

            {/* POPUP DETAIL (SPELL / FEAT / TOOL) */}
            {(isDetailLoading || detailData) && (mode === 'spells' || mode === 'feats' || mode === 'tools-list') && (
                <div className="absolute inset-0 z-[70] bg-iron-950/95 backdrop-blur-sm p-4 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    {isDetailLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Sparkles className="w-12 h-12 text-purple-400 animate-spin" />
                            <span className="text-slate-400 font-display tracking-widest animate-pulse">Consultando os Arcanos...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden bg-iron-900 border border-slate-700 rounded-lg shadow-2xl">
                             <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-start shrink-0">
                                <div>
                                    <h2 className="text-2xl font-display text-slate-100">{detailData.name}</h2>
                                    {mode === 'spells' && (
                                        <div className="text-xs text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                            <Scroll className="w-3 h-3" />
                                            {detailData.school} • {detailData.level > 0 ? `Level ${detailData.level}` : 'Cantrip'}
                                        </div>
                                    )}
                                    {(mode === 'feats' || mode === 'tools-list') && detailData.source && (
                                        <div className="text-xs text-copper-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                            {detailData.source}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setDetailData(null)}><X className="w-6 h-6 text-slate-400" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-iron-950/30">
                                {mode === 'spells' && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800 border-b border-slate-800 mb-4">
                                        {[{l:'Tempo',v:detailData.castingTime},{l:'Alcance',v:detailData.range},{l:'Comp.',v:detailData.components},{l:'Duração',v:detailData.duration}].map((s,i)=>(
                                            <div key={i} className="bg-iron-900 p-2 text-center"><div className="text-[10px] text-slate-500 uppercase font-bold">{s.l}</div><div className="text-xs text-slate-200 truncate">{s.v}</div></div>
                                        ))}
                                    </div>
                                )}
                                <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap">{detailData.description}</div>
                            </div>
                            <div className="p-4 border-t border-slate-800 bg-iron-950 shrink-0 flex gap-3">
                                <button onClick={() => setDetailData(null)} className="flex-1 py-3 bg-iron-800 hover:bg-iron-700 text-slate-300 font-bold rounded-lg border border-slate-700">Voltar</button>
                                <button onClick={importDetailFromPopup} className="flex-[2] py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"><Download className="w-4 h-4"/> {(mode === 'tools-list') ? "Selecionar" : "Adicionar"}</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* ... (Existing List Logic for Spells, Classes, Equipment) ... */}
            
            {/* FILTER BAR */}
            <div className="p-4 border-b border-slate-800 bg-iron-950/30 shrink-0">
                <div className="relative">
                    <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        value={listFilter}
                        onChange={(e) => setListFilter(e.target.value)}
                        placeholder={mode === 'spells' ? "Filtrar magias..." : mode === 'feats' ? "Filtrar talentos..." : mode === 'classes' ? "Filtrar classes..." : "Filtrar itens..."}
                        className="w-full bg-iron-950 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-300 focus:outline-none focus:border-copper-500"
                        autoFocus
                    />
                </div>
            </div>

            {/* LIST AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                
                {/* SPELLS LIST */}
                {mode === 'spells' && (
                    <>
                        {isFetchingList && <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-500"/></div>}
                        {!isFetchingList && Object.entries(spellsByLevel).map(([levelStr, spells]: [string, SpellSummary[]]) => {
                            const level = parseInt(levelStr);
                            const filtered = spells.filter(s => s.name.toLowerCase().includes(listFilter.toLowerCase()));
                            if (filtered.length === 0) return null;
                            
                            return (
                                <div key={level} className="border border-slate-800 rounded-lg bg-iron-950/20 overflow-hidden shrink-0">
                                    <button 
                                        onClick={() => setExpandedLevels(p => ({...p, [level]: !p[level]}))}
                                        className="w-full flex items-center justify-between p-3 bg-slate-900/50 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50"
                                    >
                                        <span className="font-bold text-purple-400 font-display text-sm">{level === 0 ? "Truques (Cantrips)" : `${level}º Círculo`}</span>
                                        {expandedLevels[level] ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                    </button>
                                    {expandedLevels[level] && (
                                        <div className="divide-y divide-slate-800/50">
                                            {filtered.map((spell, idx) => (
                                                <div key={idx} className="p-3 hover:bg-white/5 transition-colors flex justify-between items-center group">
                                                    <div>
                                                        <div onClick={() => handleSpellClick(spell.url)} className="font-bold text-slate-200 text-sm group-hover:text-purple-400 cursor-pointer">{spell.name}</div>
                                                        <div className="text-[10px] text-slate-500 mt-1">{spell.school} • {spell.castingTime}</div>
                                                    </div>
                                                    <button onClick={() => handleSpellClick(spell.url)} className="text-xs bg-purple-900/30 text-purple-300 px-3 py-1 rounded border border-purple-800/50 hover:bg-purple-800 hover:text-white transition-colors">Ver</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </>
                )}

                {/* CLASS SPELL LIST SELECTION MODE */}
                {mode === 'class-spells' && (
                    <>
                        {isFetchingList && <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-purple-500"/></div>}
                        {!isFetchingList && Object.entries(spellsByLevel).map(([levelStr, spells]: [string, SpellSummary[]]) => {
                            const level = parseInt(levelStr);
                            const filtered = spells.filter(s => s.name.toLowerCase().includes(listFilter.toLowerCase()));
                            if (filtered.length === 0) return null;
                            
                            const allSelected = filtered.length > 0 && filtered.every(s => selectedSpells.has(s.name));

                            return (
                                <div key={level} className="border border-slate-800 rounded-lg bg-iron-950/20 overflow-hidden shrink-0">
                                    <div className="w-full flex items-center justify-between p-3 bg-slate-900/50 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => toggleAllInLevel(level, !allSelected)} className="text-slate-400 hover:text-white">
                                                {allSelected ? <CheckSquare className="w-4 h-4 text-copper-500" /> : <Square className="w-4 h-4" />}
                                            </button>
                                            <span className="font-bold text-purple-400 font-display text-sm">{level === 0 ? "Truques" : `${level}º Círculo`}</span>
                                        </div>
                                        <button onClick={() => setExpandedLevels(p => ({...p, [level]: !p[level]}))}>
                                            {expandedLevels[level] ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                        </button>
                                    </div>
                                    
                                    {expandedLevels[level] && (
                                        <div className="divide-y divide-slate-800/50">
                                            {filtered.map((spell, idx) => {
                                                const isSelected = selectedSpells.has(spell.name);
                                                return (
                                                    <div key={idx} className={`p-3 transition-colors flex justify-between items-center group cursor-pointer ${isSelected ? 'bg-purple-900/10' : 'hover:bg-white/5'}`} onClick={() => toggleSpellSelection(spell.name)}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'border-copper-500 bg-copper-500' : 'border-slate-600'}`}>
                                                                {isSelected && <CheckSquare className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <div>
                                                                <div className={`font-bold text-sm ${isSelected ? 'text-copper-400' : 'text-slate-200'}`}>{spell.name}</div>
                                                                <div className="text-[10px] text-slate-500 mt-1">{spell.school} • {spell.castingTime} • {spell.range}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
                            <div className="bg-iron-900 border border-copper-500/50 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4">
                                <span className="text-slate-300 text-sm font-bold">{selectedSpells.size} selecionados</span>
                                <div className="h-4 w-px bg-slate-700" />
                                <button 
                                    onClick={importBatchSpells}
                                    disabled={selectedSpells.size === 0}
                                    className="bg-copper-600 hover:bg-copper-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Importar
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* CLASSES LIST */}
                {mode === 'classes' && (
                    <>
                        {isFetchingEquip && <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-500"/></div>}
                        {!isFetchingEquip && classesList.filter(c => c.name.toLowerCase().includes(listFilter.toLowerCase())).map((cls, idx) => (
                            <div key={idx} className="bg-iron-950/40 border border-slate-800 rounded p-3 flex justify-between items-center hover:border-slate-700 transition-colors group mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-900/20 text-blue-400">
                                        <Star className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-200 group-hover:text-copper-400 transition-colors">{cls.name}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5 font-mono uppercase">Classe Oficial</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleClassClick(cls.url, cls.name)}
                                    className="p-2 bg-copper-900/30 text-copper-400 hover:bg-copper-600 hover:text-white rounded transition-colors"
                                    title="Selecionar Classe"
                                >
                                    <MousePointerClick className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </>
                )}

                {/* EQUIPMENT / FEATS LIST (Categorized) */}
                {(mode === 'armor' || mode === 'tools-list' || mode === 'weapons-list' || mode === 'feats') && (
                    <>
                        {isFetchingEquip && <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-copper-500"/></div>}
                        {!isFetchingEquip && Object.entries(groupedItems).map(([category, items]: [string, EquipmentItem[]]) => {
                             const filtered = items.filter(a => a.name.toLowerCase().includes(listFilter.toLowerCase()));
                             if (filtered.length === 0) return null;
                             
                             return (
                                <div key={category} className="mb-6 last:mb-0">
                                    <div className="bg-iron-900/95 py-2 px-1 border-b border-copper-900/30 mb-2">
                                        <h4 className="text-xs font-bold text-copper-500 uppercase tracking-widest flex items-center gap-2">
                                            <Layers className="w-3 h-3" /> {category}
                                        </h4>
                                    </div>
                                    <div className="space-y-2">
                                        {filtered.map((item, idx) => (
                                            <div key={idx} className="bg-iron-950/40 border border-slate-800 rounded p-3 flex justify-between items-center hover:border-slate-700 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${
                                                        item.sourceType === 'armor' ? 'bg-blue-900/20 text-blue-400' : 
                                                        item.sourceType === 'weapon' ? 'bg-red-900/20 text-red-400' :
                                                        item.sourceType === 'feat' ? 'bg-orange-900/20 text-orange-400' :
                                                        item.sourceType === 'tool' ? 'bg-copper-900/20 text-copper-400' :
                                                        'bg-slate-800 text-slate-400'
                                                    }`}>
                                                        {item.sourceType === 'armor' ? <Shield className="w-4 h-4" /> : 
                                                         item.sourceType === 'weapon' ? <Swords className="w-4 h-4" /> : 
                                                         item.sourceType === 'feat' ? <Award className="w-4 h-4" /> :
                                                         item.sourceType === 'tool' ? <Wrench className="w-4 h-4" /> :
                                                         <Box className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div 
                                                            className={`font-bold text-slate-200 group-hover:text-copper-400 transition-colors truncate ${(mode === 'feats' || (mode === 'tools-list' && item.sourceType === 'tool')) ? 'cursor-pointer' : ''}`}
                                                            onClick={() => {
                                                                if (mode === 'feats' && item.cost) handleSpellClick(item.cost);
                                                                else if (mode === 'tools-list' && item.sourceType === 'tool') handleToolDetailClick(item);
                                                            }}
                                                        >
                                                            <span className="flex items-center gap-1.5">
                                                                {item.name}
                                                                {(mode === 'tools-list' && item.sourceType === 'tool' && item.description) && <Info className="w-3 h-3 text-slate-600 group-hover:text-copper-500" />}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 mt-0.5 font-mono uppercase">
                                                            {item.ac && <span className="text-slate-300 font-bold">CA {item.ac}</span>}
                                                            {item.damage && <span className="text-red-300 font-bold">{item.damage}</span>}
                                                            {item.mastery && item.mastery !== '-' && <span className="text-purple-300 font-bold" title="Maestria">{item.mastery}</span>}
                                                            {item.weight !== '-' && item.weight !== "" && <span>{item.weight}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => importEquipmentItem(item)}
                                                    className="p-2 bg-copper-900/30 text-copper-400 hover:bg-copper-600 hover:text-white rounded transition-colors"
                                                    title={(mode === 'tools-list' || mode === 'weapons-list') ? "Selecionar Proficiência" : "Adicionar"}
                                                >
                                                    {(mode === 'tools-list' || mode === 'weapons-list') ? <MousePointerClick className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             );
                        })}
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default WikidotImporter;