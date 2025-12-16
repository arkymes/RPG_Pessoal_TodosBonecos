import React, { useState, useEffect } from 'react';
import { Search, Loader2, Download, X, Brain, ChevronRight, Filter, ChevronDown, ChevronUp, Clock, Move, Hourglass, Edit2, Sparkles, Scroll, Shield, Shirt, Box, Layers, Swords, Wrench, MousePointerClick, Star, Award, ListChecks, CheckSquare, Square } from 'lucide-react';

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
    { id: 'tools', label: 'Ferramentas', icon: Wrench, url: 'http://dnd2024.wikidot.com/equipment:tools' },
];

const FEAT_TABS = [
    { id: 'wiki-tab-0-0', label: 'Origin Feats' },
    { id: 'wiki-tab-0-1', label: 'General Feats' },
    { id: 'wiki-tab-0-2', label: 'Fighting Style Feats' },
    { id: 'wiki-tab-0-3', label: 'Epic Boon Feats' },
    { id: 'wiki-tab-0-4', label: 'Dragonmark Feats' },
];

const WikidotImporter: React.FC<WikidotImporterProps> = ({ onImport, onClose, characterClass, mode }) => {
  // --- SPELLS / DETAILS STATE ---
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
      return 'artificer'; // default
  };
  const [currentClassSlug, setCurrentClassSlug] = useState(getWikidotClassSlug(characterClass));
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [spellsByLevel, setSpellsByLevel] = useState<Record<number, SpellSummary[]>>({});
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [isFetchingList, setIsFetchingList] = useState(false);
  
  // Class Spells Batch Selection State
  const [selectedSpells, setSelectedSpells] = useState<Set<string>>(new Set());

  // --- EQUIPMENT / FEATS / CLASSES STATE ---
  const [activeEquipTab, setActiveEquipTab] = useState(mode === 'tools-list' ? 'tools' : (mode === 'weapons-list' ? 'weapons' : 'armor'));
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [classesList, setClassesList] = useState<ClassSummary[]>([]);
  const [isFetchingEquip, setIsFetchingEquip] = useState(false);

  // Common Filter
  const [listFilter, setListFilter] = useState('');

  // --- HELPER: ROBUST FETCH ---
  const fetchWithFallback = async (targetUrl: string): Promise<string> => {
      const proxies = [
          async () => {
              const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
              if (!res.ok) throw new Error('Status ' + res.status);
              const data = await res.json();
              return data.contents;
          },
          async () => {
              const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
              if (!res.ok) throw new Error('Status ' + res.status);
              return await res.text();
          },
          async () => {
              const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
              if (!res.ok) throw new Error('Status ' + res.status);
              return await res.text();
          }
      ];

      for (const proxy of proxies) {
          try {
              const result = await proxy();
              if (result && result.length > 100) return result; 
          } catch (e) {
              console.warn("Proxy failed, trying next...", e);
          }
      }

      throw new Error("Failed to fetch data from Wikidot (All proxies failed).");
  };

  // --- EFFECTS ---
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

  // --- SPELL / FEAT DETAIL LOGIC ---
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

  // NEW: Fetch robust class spell list including extra columns
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
                  
                  // Detect column indices dynamically
                  const headerRow = tabDiv.querySelector('tr');
                  const headers = Array.from(headerRow?.querySelectorAll('th') || []).map(th => th.textContent?.trim().toLowerCase());
                  
                  const idxName = 0; // Usually first
                  const idxSchool = headers.findIndex(h => h?.includes('school'));
                  const idxTime = headers.findIndex(h => h?.includes('time'));
                  const idxRange = headers.findIndex(h => h?.includes('range'));
                  const idxComp = headers.findIndex(h => h?.includes('comp'));
                  const idxDur = headers.findIndex(h => h?.includes('duration'));

                  (Array.from(rows) as HTMLTableRowElement[]).forEach((row, rowIdx) => {
                      if (rowIdx === 0) return; // Skip header
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

          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          const pageContent = doc.getElementById('page-content');
          const pageTitle = doc.querySelector('.page-title')?.textContent || cleanSlug;
          
          if (!pageContent) throw new Error("Estrutura da página desconhecida.");
          
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
              classes: "",
              source: ""
          };

          const paragraphs = Array.from(pageContent.querySelectorAll('p')) as HTMLParagraphElement[];
          let foundStats = false;
          paragraphs.forEach((p) => {
              const text = p.textContent?.trim() || "";
              const html = p.innerHTML;
              if (text.startsWith("Source:")) {
                  spellData.source = text.replace("Source:", "").trim();
                  return;
              }
              if (mode === 'feats') {
                  if (!text.startsWith("Source:")) spellData.description += text + "\n\n";
                  return;
              }

              if (!foundStats && !spellData.school && (text.toLowerCase().includes("cantrip") || text.toLowerCase().includes("level"))) {
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
              if (html.includes("<strong>Casting Time:</strong>") || text.includes("Casting Time:")) {
                  foundStats = true;
                  const lines = html.split('<br>');
                  lines.forEach(line => {
                      const cleanLine = line.replace(/<[^>]*>/g, '').trim(); 
                      if (cleanLine.startsWith("Casting Time:")) spellData.castingTime = cleanLine.replace("Casting Time:", "").trim();
                      if (cleanLine.startsWith("Range:")) spellData.range = cleanLine.replace("Range:", "").trim();
                      if (cleanLine.startsWith("Components:")) spellData.components = cleanLine.replace("Components:", "").trim();
                      if (cleanLine.startsWith("Duration:")) spellData.duration = cleanLine.replace("Duration:", "").trim();
                  });
                  return;
              }
              if (text.startsWith("At Higher Levels")) { spellData.higherLevels = text; return; }
              if (foundStats) spellData.description += text + "\n\n";
          });
          spellData.description = spellData.description.trim();
          if (!spellData.description && paragraphs.length > 0) {
               spellData.description = paragraphs.map(p => p.textContent).join('\n\n');
          }
          
          setDetailData(spellData);
      } catch (e) {
          setDetailData({ name: "Erro ao carregar", description: "Falha de conexão com a Wiki." });
      } finally { setIsDetailLoading(false); }
  };

  const importSpellFromPopup = () => {
      if (!detailData) return;
      
      if (mode === 'feats') {
          onImport({
              name: detailData.name,
              source: detailData.source || "Wikidot",
              description: detailData.description
          }, 'feat');
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

  // --- CLASSES LOGIC ---
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

  const handleClassClick = async (classUrl: string, className: string) => {
      setIsDetailLoading(true);
      try {
          const cleanSlug = classUrl.replace(/^\//, '');
          const targetUrl = `http://dnd2024.wikidot.com/${cleanSlug}`;
          const htmlContent = await fetchWithFallback(targetUrl);
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlContent, 'text/html');
          
          let hitDie = "d8"; // default
          let saves: string[] = [];
          let armor: string[] = [];
          let weapons: string[] = [];
          let progression: Record<number, string[]> = {};
          let definitions: Record<string, string> = {}; 
          let multiclassText = "";
          let skillPrompt = { count: 0, options: [] as string[] };

          const tables = doc.querySelectorAll('table.wiki-content-table');
          
          (Array.from(tables) as HTMLTableElement[]).forEach(table => {
              // Check Header for Core Traits
              const header = table.querySelector('th');
              if (header && header.textContent?.includes('Core')) {
                  const rows = table.querySelectorAll('tr');
                  // Cast to Array<HTMLTableRowElement> to fix unknown type in strict TS
                  (Array.from(rows) as HTMLTableRowElement[]).forEach(row => {
                      const cols = row.querySelectorAll('td');
                      if (cols.length >= 2) {
                          const label = cols[0].textContent?.toLowerCase() || "";
                          const val = cols[1].textContent || "";
                          
                          if (label.includes('hit point')) {
                              const match = val.match(/d\d+/i);
                              if (match) hitDie = match[0];
                          }
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
                              // Parsing: "Choose 2: Arcana, History, ..."
                              const matchCount = val.match(/Choose (\d+)/i);
                              if (matchCount) skillPrompt.count = parseInt(matchCount[1]);
                              
                              const listPart = val.split(':')[1] || val;
                              const opts = listPart.split(/,| or /).map(s => {
                                  const clean = s.trim().replace('.', '').toLowerCase();
                                  // Map common names to keys
                                  if(clean.includes('animal')) return 'animalHandling';
                                  if(clean.includes('sleight')) return 'sleightOfHand';
                                  return clean;
                              }).filter(s => s.length > 2);
                              skillPrompt.options = opts;
                          }
                      }
                  });
              }

              // PARSE "Features Table" - Robust Logic
              // 1. Identify which column is "Features" or "Class Features"
              const ths = table.querySelectorAll('th');
              let featuresColIndex = -1;
              (Array.from(ths) as HTMLElement[]).forEach((thNode, idx) => {
                  const th = thNode as HTMLElement;
                  const txt = th.textContent?.toLowerCase().trim() || "";
                  if (txt === 'features' || txt === 'class features') {
                      featuresColIndex = idx;
                  }
              });

              // Only proceed if we found a Features column, or assume column 2 as fallback for specific tables
              if (featuresColIndex === -1 && ths.length > 2 && ths[2].textContent?.includes('Features')) featuresColIndex = 2;

              if (featuresColIndex !== -1) {
                  const rows = table.querySelectorAll('tr');
                  // Fix: Explicitly handle NodeList iteration to avoid 'unknown' type errors
                  Array.from(rows).forEach((rowNode) => {
                      const row = rowNode as HTMLTableRowElement;
                      const cols = row.querySelectorAll('td');
                      if (cols.length > featuresColIndex) {
                          const levelText = cols[0].textContent?.trim();
                          const featuresText = cols[featuresColIndex].textContent?.trim(); 
                          
                          const level = parseInt(levelText || "0");
                          // Validate: Level must be a number, Feature must exist and not be a number (avoid "2")
                          const isFeatureNameValid = featuresText && featuresText !== '-' && isNaN(parseInt(featuresText));

                          if (!isNaN(level) && isFeatureNameValid) {
                              const feats = featuresText!.split(',').map(f => f.trim()).filter(f => f && isNaN(parseInt(f)));
                              if (feats.length > 0) {
                                  progression[level] = feats;
                              }
                          }
                      }
                  });
              }
          });

          // --- EXTRACT FEATURE DEFINITIONS & MULTICLASS TEXT FROM DOM ---
          const content = doc.getElementById('page-content');
          if (content) {
              const headers = content.querySelectorAll('h2, h3, h4, h5');
              let capturingMulticlass = false;

              (Array.from(headers) as HTMLElement[]).forEach(header => {
                  const name = header.textContent?.trim() || "";
                  
                  // Multiclass Capture (More Robust)
                  if (name.toLowerCase().includes('multiclass') && !capturingMulticlass) {
                      capturingMulticlass = true; // Flag to capture subsequent paragraphs
                      let next = header.nextElementSibling;
                      let mcText = "";
                      // Capture everything until the next major header
                      while (next && !['H1','H2','H3'].includes(next.tagName)) {
                          if (next.tagName === 'P' || next.tagName === 'UL') {
                              mcText += next.textContent + "\n\n";
                          }
                          next = next.nextElementSibling;
                      }
                      multiclassText = mcText.trim();
                      return; 
                  }

                  if (['Spellcasting', 'Subclass'].some(k => name.includes(k))) return; 

                  let desc = "";
                  let next = header.nextElementSibling;
                  // Capture definitions
                  while (next && !['H1','H2','H3','H4','H5','TABLE'].includes(next.tagName)) {
                      desc += next.textContent + "\n\n";
                      next = next.nextElementSibling;
                  }
                  if (name && desc) {
                      definitions[name] = desc.trim();
                      // Also store lowercase key for fuzzy matching
                      definitions[name.toLowerCase()] = desc.trim();
                  }
              });
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

  // --- FEATS LOGIC ---
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

  // --- EQUIPMENT LOGIC ---
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

        const tables = content.querySelectorAll('table.wiki-content-table');
        const parsedItems: EquipmentItem[] = [];

        (Array.from(tables) as HTMLTableElement[]).forEach(table => {
            // Find category header (H2, H3, etc before table)
            let prev = table.previousElementSibling;
            while(prev && !['H1','H2','H3','H4','H5','H6'].includes(prev.tagName)) {
                prev = prev.previousElementSibling;
            }
            let category = prev?.textContent?.trim() || "Diversos";

            const rows = table.querySelectorAll('tr');
            (Array.from(rows) as HTMLTableRowElement[]).forEach((row, idx) => {
                if (idx === 0) return; // Skip Header
                const cols = row.querySelectorAll('td');
                
                if (tabId === 'armor' && cols.length >= 6) {
                    parsedItems.push({
                        name: cols[0].textContent?.trim() || "Item",
                        cost: cols[5].textContent?.trim() || "",
                        ac: cols[1].textContent?.trim() || "",
                        strength: cols[2].textContent?.trim() || "-",
                        stealth: cols[3].textContent?.trim() || "-",
                        weight: cols[4].textContent?.trim() || "",
                        category: category,
                        description: "",
                        sourceType: 'armor'
                    });
                } else if (tabId === 'weapons') {
                     // 2024 Wikidot Weapons Table Logic
                     // Col 0: Name, Col 1: Damage, Col 2: Properties, Col 3: Mastery (New), Col 4: Weight, Col 5: Cost
                     if (cols.length >= 6) {
                         const mastery = cols[3].textContent?.trim() || "-";
                         parsedItems.push({
                            name: cols[0].textContent?.trim() || "Item",
                            damage: cols[1].textContent?.trim() || "",
                            properties: cols[2].textContent?.trim() || "",
                            mastery: mastery,
                            weight: cols[4].textContent?.trim() || "",
                            cost: cols[5].textContent?.trim() || "",
                            category: category,
                            description: "",
                            sourceType: 'weapon'
                        });
                     }
                } else if ((tabId === 'gear' || tabId === 'tools') && cols.length >= 2) {
                     // Gear/Tools usually: Item | Cost | Weight | Function (Optional)
                     const weight = cols[2]?.textContent?.trim() || "-";
                     const description = cols[3]?.textContent?.trim() || "";
                     
                     parsedItems.push({
                        name: cols[0].textContent?.trim() || "Item",
                        cost: cols[1].textContent?.trim() || "",
                        weight: weight,
                        category: category,
                        description: description,
                        sourceType: tabId === 'tools' ? 'tool' : 'gear'
                    });
                }
            });
        });
        setEquipmentList(parsedItems);
    } catch(e) { console.error(e); }
    finally { setIsFetchingEquip(false); }
  };

  const importEquipmentItem = (item: EquipmentItem) => {
      // Special Mode: Just return the name for Proficiency Selection
      if (mode === 'tools-list' || mode === 'weapons-list') {
          onImport({ name: item.name }, 'proficiency');
          return;
      }

      if (mode === 'feats') {
          // If clicked 'Download' directly on Feats list without viewing details
          // We trigger the detail view logic because a Feat without text is bad UX
          // Item.cost holds the URL in this hacky implementation
          if (item.cost) {
              handleSpellClick(item.cost);
          }
          return;
      }

      let newItem: any = {
          id: Math.random().toString(36).substr(2, 9),
          name: item.name,
          equipped: false,
          weight: item.weight // Added weight property assignment
      };

      if (item.sourceType === 'armor') {
          // Detect Shield vs Armor
          const isShield = item.category.toLowerCase().includes('shield');
          newItem.type = isShield ? 'shield' : 'armor';
          
          // Parse AC
          const acMatch = item.ac?.match(/(\d+)/);
          newItem.acBonus = acMatch ? parseInt(acMatch[0]) : 0;
          
          // Max Dex logic
          if (item.category.toLowerCase().includes('heavy')) newItem.maxDex = 0;
          else if (item.category.toLowerCase().includes('medium')) newItem.maxDex = 2;
          else newItem.maxDex = 99;

          newItem.stealthDisadvantage = item.stealth?.toLowerCase().includes('disadvantage');
          newItem.description = `Categoria: ${item.category}\nCusto: ${item.cost}\nPeso: ${item.weight}\nForça: ${item.strength}`;
      
      } else if (item.sourceType === 'weapon') {
          newItem.type = 'weapon';
          // Parse Damage
          newItem.damage = item.damage;
          // Clean damage type
          const dmgParts = item.damage?.split(' ');
          if (dmgParts && dmgParts.length > 1) {
              newItem.damage = dmgParts[0];
              newItem.damageType = dmgParts.slice(1).join(' ');
          }
          
          newItem.properties = item.properties?.split(',').map(s => s.trim());
          newItem.mastery = item.mastery; // Capture Mastery
          newItem.isTwoHandedConfig = false; 
          newItem.description = `Categoria: ${item.category}\nCusto: ${item.cost}\nPeso: ${item.weight}`; 
      
      } else {
          newItem.type = 'misc';
          newItem.quantity = 1;
          newItem.description = `Categoria: ${item.category}\nCusto: ${item.cost}\nPeso: ${item.weight}\n${item.description}`;
      }

      onImport(newItem, 'item');
  };

  // Group items by category for rendering
  const groupedItems = equipmentList.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
  }, {} as Record<string, EquipmentItem[]>);

  // --- RENDER ---
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-iron-900 border border-slate-700 rounded-xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        
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

            {(mode === 'armor') && (
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

            {/* SPELL / FEAT POPUP DETAIL */}
            {(isDetailLoading || detailData) && (mode === 'spells' || mode === 'feats') && (
                <div className="absolute inset-0 z-[70] bg-iron-950/95 backdrop-blur-sm p-4 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    {isDetailLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4">
                            <Sparkles className="w-12 h-12 text-purple-400 animate-spin" />
                            <span className="text-slate-400 font-display tracking-widest animate-pulse">Consultando os Arcanos...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full overflow-hidden bg-iron-900 border border-slate-700 rounded-lg shadow-2xl">
                             {/* Detail Header */}
                             <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-start shrink-0">
                                <div>
                                    <h2 className="text-2xl font-display text-slate-100">{detailData.name}</h2>
                                    {mode === 'spells' && (
                                        <div className="text-xs text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                            <Scroll className="w-3 h-3" />
                                            {detailData.school} • {detailData.level > 0 ? `Level ${detailData.level}` : 'Cantrip'}
                                        </div>
                                    )}
                                    {mode === 'feats' && detailData.source && (
                                        <div className="text-xs text-copper-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                            {detailData.source}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setDetailData(null)}><X className="w-6 h-6 text-slate-400" /></button>
                            </div>
                            {/* Detail Body */}
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
                            {/* Detail Footer */}
                            <div className="p-4 border-t border-slate-800 bg-iron-950 shrink-0 flex gap-3">
                                <button onClick={() => setDetailData(null)} className="flex-1 py-3 bg-iron-800 hover:bg-iron-700 text-slate-300 font-bold rounded-lg border border-slate-700">Voltar</button>
                                <button onClick={importSpellFromPopup} className="flex-[2] py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg flex items-center justify-center gap-2"><Download className="w-4 h-4"/> Adicionar</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

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
                        {/* BATCH IMPORT ACTION BAR */}
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
                                                        'bg-slate-800 text-slate-400'
                                                    }`}>
                                                        {item.sourceType === 'armor' ? <Shield className="w-4 h-4" /> : 
                                                         item.sourceType === 'weapon' ? <Swords className="w-4 h-4" /> : 
                                                         item.sourceType === 'feat' ? <Award className="w-4 h-4" /> :
                                                         <Box className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <div 
                                                            className={`font-bold text-slate-200 group-hover:text-copper-400 transition-colors ${mode === 'feats' ? 'cursor-pointer' : ''}`}
                                                            onClick={() => mode === 'feats' && item.cost && handleSpellClick(item.cost)}
                                                        >
                                                            {item.name}
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