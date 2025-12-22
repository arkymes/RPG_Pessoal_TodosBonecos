import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, Shield, Heart, Zap, Swords, Scroll, ChevronDown, ChevronUp, Flame, Trash2, Plus, AlertTriangle, Globe, BookOpen, X, Download, Star, Box, Activity, ArrowUpCircle, Info, ListChecks, Lock, Loader2 } from 'lucide-react';
import WikidotImporter from './WikidotImporter';
import { fetchWithFallback, parseSpellPage, slugifySpell } from '../utils/wikidot';
import { useTheme } from '../themes/ThemeContext';
import { Gear } from './steampunk/Gear';

type ItemType = 'weapon' | 'armor' | 'shield' | 'misc';

interface Item {
  id: string;
  name: string;
  type: ItemType;
  equipped: boolean;
  weight?: string;
  damage?: string;
  damageType?: string;
  properties?: string[];
  mastery?: string;
  isTwoHandedConfig?: boolean;
  acBonus?: number;
  maxDex?: number;
  stealthDisadvantage?: boolean;
  strengthReq?: string; // New field for strength Requirement display
  quantity?: number;
  description?: string;
  category?: string; // "Simple", "Martial", "Light", "Medium", etc.
  overrideAbility?: string; // 'auto', 'str', 'dex', 'int', 'wis', 'cha', 'con'
}

interface Spell {
  id: string;
  name: string;
  prepared: boolean;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
}

interface Feat {
    id: string;
    name: string;
    source: string;
    description: string;
}

interface ClassFeature {
    id?: string;
    level: number;
    name: string;
    description?: string;
    sourceClass?: string;
}

interface ClassEntry {
    name: string;
    level: number;
}

interface SkillPrompt {
    className: string;
    count: number;
    options: string[];
}

interface CharacterSheetData {
  info: {
    name: string;
    className: string;
    classes: ClassEntry[];
    level: number;
    background: string;
    playerName: string;
    race: string;
    alignment: string;
    xp: string;
  };
  stats: {
    str: number; dex: number; con: number; int: number; wis: number; cha: number;
  };
  proficiencyBonus: number;
  inspiration: boolean;
  savingThrows: Record<string, boolean>;
  skills: Record<string, boolean>;
  skillPrompts?: SkillPrompt[];
  proficiencies: {
      armor: string[];
      weapons: string[];
      tools: string[];
      languages: string[];
  };
  feats: Feat[];
  classFeatures: ClassFeature[];
  classProgression?: Record<string, Record<number, string[]>>;
  classFeatureDefinitions?: Record<string, string>;
  hitDieType: number;
  combat: {
    hpMax: number;
    hpCurrent: number;
    hpTemp: number;
    hitDiceTotal: number;
    hitDiceUsed: number;
    deathSaveSuccess: number;
    deathSaveFailure: number;
    speed: number;
    manualACModifier: number;
  };
  inventory: Item[];
  currency: { cp: string; sp: string; ep: string; gp: string; pp: string };
  features: string; 
  magic: {
    class: string;
    ability: string;
    saveDC: string;
    attackBonus: string;
    slots: Array<{ total: string; used: string }>;
    spells: Array<Array<Spell>>;
  };
}

const DEFAULT_DATA: CharacterSheetData = {
  info: {
    name: "Novo Personagem",
    className: "Aventureiro",
    classes: [{ name: "Aventureiro", level: 1 }],
    level: 1,
    background: "",
    playerName: "",
    race: "",
    alignment: "",
    xp: "0",
  },
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  proficiencyBonus: 2,
  inspiration: false,
  savingThrows: {},
  skills: {},
  skillPrompts: [],
  proficiencies: {
      armor: [],
      weapons: [],
      tools: [],
      languages: ['Comum']
  },
  feats: [],
  classFeatures: [],
  classProgression: {},
  classFeatureDefinitions: {},
  hitDieType: 8,
  combat: {
    hpMax: 10,
    hpCurrent: 10,
    hpTemp: 0,
    hitDiceTotal: 1,
    hitDiceUsed: 0,
    deathSaveSuccess: 0,
    deathSaveFailure: 0,
    speed: 9,
    manualACModifier: 0,
  },
  inventory: [],
  currency: { cp: "0", sp: "0", ep: "0", gp: "0", pp: "0" },
  features: "",
  magic: {
    class: "",
    ability: "INT",
    saveDC: "8",
    attackBonus: "+0",
    slots: Array(10).fill({ total: "0", used: "0" }),
    spells: Array(10).fill([]).map(() => [])
  }
};

const ABILITY_CONFIG = [
  { key: 'str', label: 'Força', short: 'FOR', theme: { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500', shadow: 'shadow-red-500' }, skills: { athletics: 'Atletismo' } },
  { key: 'dex', label: 'Destreza', short: 'DES', theme: { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500', shadow: 'shadow-emerald-500' }, skills: { acrobatics: 'Acrobacia', sleightOfHand: 'Prestidigitação', stealth: 'Furtividade' } },
  { key: 'con', label: 'Constituição', short: 'CON', theme: { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500', shadow: 'shadow-orange-500' }, skills: {} },
  { key: 'int', label: 'Inteligência', short: 'INT', theme: { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500', shadow: 'shadow-cyan-500' }, skills: { arcana: 'Arcanismo', history: 'História', investigation: 'Investigação', nature: 'Natureza', religion: 'Religião' } },
  { key: 'wis', label: 'Sabedoria', short: 'SAB', theme: { text: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500', shadow: 'shadow-purple-500' }, skills: { animalHandling: 'Lidar c/ Animais', insight: 'Intuição', medicine: 'Medicina', perception: 'Percepção', survival: 'Sobrevivência' } },
  { key: 'cha', label: 'Carisma', short: 'CAR', theme: { text: 'text-pink-400', bg: 'bg-pink-500', border: 'border-pink-500', shadow: 'shadow-pink-500' }, skills: { deception: 'Enganação', intimidation: 'Intimidação', performance: 'Atuação', persuasion: 'Persuasão' } },
] as const;

// --- SPELLCASTING RULES ---
const CLASS_SPELL_DATA: Record<string, { type: 'full' | 'half' | 'third' | 'warlock' | 'none', stat: string, knownType: 'prepared' | 'known', cantripBase: number }> = {
    'artificer': { type: 'half', stat: 'int', knownType: 'prepared', cantripBase: 2 }, 
    'bard': { type: 'full', stat: 'cha', knownType: 'known', cantripBase: 2 },
    'bardo': { type: 'full', stat: 'cha', knownType: 'known', cantripBase: 2 },
    'cleric': { type: 'full', stat: 'wis', knownType: 'prepared', cantripBase: 3 },
    'clérigo': { type: 'full', stat: 'wis', knownType: 'prepared', cantripBase: 3 },
    'druid': { type: 'full', stat: 'wis', knownType: 'prepared', cantripBase: 2 },
    'druida': { type: 'full', stat: 'wis', knownType: 'prepared', cantripBase: 2 },
    'paladin': { type: 'half', stat: 'cha', knownType: 'prepared', cantripBase: 0 }, 
    'paladino': { type: 'half', stat: 'cha', knownType: 'prepared', cantripBase: 0 },
    'ranger': { type: 'half', stat: 'wis', knownType: 'known', cantripBase: 0 }, 
    'patrulheiro': { type: 'half', stat: 'wis', knownType: 'known', cantripBase: 0 },
    'sorcerer': { type: 'full', stat: 'cha', knownType: 'known', cantripBase: 4 },
    'feiticeiro': { type: 'full', stat: 'cha', knownType: 'known', cantripBase: 4 },
    'warlock': { type: 'warlock', stat: 'cha', knownType: 'known', cantripBase: 2 },
    'bruxo': { type: 'warlock', stat: 'cha', knownType: 'known', cantripBase: 2 },
    'wizard': { type: 'full', stat: 'int', knownType: 'prepared', cantripBase: 3 },
    'mago': { type: 'full', stat: 'int', knownType: 'prepared', cantripBase: 3 },
    'arcane trickster': { type: 'third', stat: 'int', knownType: 'known', cantripBase: 3 },
    'eldritch knight': { type: 'third', stat: 'int', knownType: 'known', cantripBase: 2 }
};

const SLOT_TABLE = [
    [2,0,0,0,0,0,0,0,0], [3,0,0,0,0,0,0,0,0], [4,2,0,0,0,0,0,0,0], [4,3,0,0,0,0,0,0,0],
    [4,3,2,0,0,0,0,0,0], [4,3,3,0,0,0,0,0,0], [4,3,3,1,0,0,0,0,0], [4,3,3,2,0,0,0,0,0],
    [4,3,3,3,1,0,0,0,0], [4,3,3,3,2,0,0,0,0], [4,3,3,3,2,1,0,0,0], [4,3,3,3,2,1,0,0,0],
    [4,3,3,3,2,1,1,0,0], [4,3,3,3,2,1,1,0,0], [4,3,3,3,2,1,1,1,0], [4,3,3,3,2,1,1,1,0],
    [4,3,3,3,2,1,1,1,1], [4,3,3,3,3,1,1,1,1], [4,3,3,3,3,2,1,1,1], [4,3,3,3,3,2,2,1,1]
];

const MOD = (score: number | undefined) => Math.floor(((score || 10) - 10) / 2);

const upgradeDie = (damage: string, properties: string[] = []) => {
    if (!damage) return "";
    const versatileProp = properties.find(p => p.toLowerCase().includes('versatile') || p.toLowerCase().includes('versátil'));
    if (versatileProp) {
        const match = versatileProp.match(/\((.*?)\)/);
        if (match && match[1]) return match[1];
    }
    if (damage.includes('d4')) return damage.replace('d4', 'd6');
    if (damage.includes('d6')) return damage.replace('d6', 'd8');
    if (damage.includes('d8')) return damage.replace('d8', 'd10');
    if (damage.includes('d10')) return damage.replace('d10', 'd12');
    if (damage.includes('d12')) return damage.replace('d12', '2d6'); 
    return damage;
};

const normalizeKey = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

// Toggle dinamico que muda baseado no tema
const DynamicToggle = ({ checked, onChange, theme, size = "md", isSteampunk = false }: { checked: boolean, onChange: (v: boolean) => void, theme: any, size?: "sm"|"md", isSteampunk?: boolean }) => {
    const gearSize = size === "sm" ? 20 : 28;
    
    if (isSteampunk) {
        return (
            <button 
                onClick={() => onChange(!checked)}
                className="relative flex items-center justify-center group outline-none focus:outline-none"
                style={{ width: gearSize, height: gearSize }}
            >
                <Gear
                    size={gearSize}
                    teeth={size === "sm" ? 8 : 10}
                    spinning={checked}
                    active={checked}
                    speed="slow"
                    style="small"
                />
            </button>
        );
    }
    
    // Fallback para o DiamondToggle original
    return (
        <button 
            onClick={() => onChange(!checked)}
            className="relative flex items-center justify-center group outline-none focus:outline-none"
            style={{ width: size === "sm" ? 16 : 24, height: size === "sm" ? 16 : 24 }}
        >
            <div className={`absolute inset-0 transition-all duration-300 rounded-sm rotate-45 ${checked ? `opacity-60 blur-[4px] ${theme.bg}` : 'opacity-0'}`} />
            <div className={`relative w-full h-full rotate-45 border transition-all duration-300 flex items-center justify-center ${checked ? `${theme.bg} ${theme.border}` : 'bg-iron-950 border-slate-700 group-hover:border-slate-500'} ${size === "sm" ? "border" : "border-2"}`}>
                {checked && <div className="w-[40%] h-[40%] bg-white rounded-full shadow-inner opacity-80" />}
            </div>
        </button>
    );
};

// Manter DiamondToggle para compatibilidade
const DiamondToggle = ({ checked, onChange, theme, size = "md" }: { checked: boolean, onChange: (v: boolean) => void, theme: any, size?: "sm"|"md" }) => {
    return (
        <button 
            onClick={() => onChange(!checked)}
            className="relative flex items-center justify-center group outline-none focus:outline-none"
            style={{ width: size === "sm" ? 16 : 24, height: size === "sm" ? 16 : 24 }}
        >
            <div className={`absolute inset-0 transition-all duration-300 rounded-sm rotate-45 ${checked ? `opacity-60 blur-[4px] ${theme.bg}` : 'opacity-0'}`} />
            <div className={`relative w-full h-full rotate-45 border transition-all duration-300 flex items-center justify-center ${checked ? `${theme.bg} ${theme.border}` : 'bg-iron-950 border-slate-700 group-hover:border-slate-500'} ${size === "sm" ? "border" : "border-2"}`}>
                {checked && <div className="w-[40%] h-[40%] bg-white rounded-full shadow-inner opacity-80" />}
            </div>
        </button>
    );
};

const AttributeBlock = React.memo(({ config, data, update, isSteampunk = false }: { config: any, data: CharacterSheetData, update: any, isSteampunk?: boolean }) => {
    if (!data?.stats) return null;
    const attrKey = config.key as keyof CharacterSheetData['stats'];
    const score = data.stats[attrKey] ?? 10;
    const mod = MOD(score);
    const profBonus = data.proficiencyBonus || 2;
    const isSaveProf = data.savingThrows?.[attrKey] || false;
    const saveVal = mod + (isSaveProf ? profBonus : 0);

    // Classes condicionais baseadas no tema
    const panelClass = isSteampunk 
        ? "sp-bronze-plate sp-rivets overflow-hidden flex flex-col h-full group transition-all p-1"
        : "bg-iron-900/60 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col h-full group transition-all hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/20";
    
    const headerClass = isSteampunk
        ? "relative p-3 pb-2 flex items-center justify-between bg-gradient-to-b from-amber-900/20 to-transparent"
        : "relative p-3 pb-2 flex items-center justify-between bg-gradient-to-b from-iron-800/40 to-transparent";
    
    const inputClass = isSteampunk
        ? "sp-input w-10 text-center text-[10px]"
        : "bg-iron-950/50 border border-slate-800 rounded w-10 text-center text-[10px] text-slate-500 focus:outline-none focus:text-slate-200 focus:border-slate-600 transition-colors";

    return (
        <div className={panelClass}>
            <div className={headerClass}>
                <div className="flex flex-col z-10">
                    <span className={`text-[10px] uppercase font-bold tracking-[0.2em] mb-1 ${isSteampunk ? 'text-amber-200' : config.theme.text} opacity-80`}>{config.label}</span>
                    <input 
                        type="number"
                        value={score}
                        onChange={(e) => update(`stats.${attrKey}`, parseInt(e.target.value) || 10)}
                        className={inputClass}
                        title="Valor Base"
                    />
                </div>
                <div className="flex items-center justify-center relative w-12 h-12">
                    <div className="absolute inset-0 opacity-10 rounded-full blur-xl bg-white" />
                    <span className={`text-4xl font-display font-bold ${isSteampunk ? 'text-amber-100' : config.theme.text} drop-shadow-sm`}>
                        {mod >= 0 ? `+${mod}` : mod}
                    </span>
                </div>
            </div>
            <div className="px-3 pb-3 space-y-3 flex-1">
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 border transition-all duration-300 ${isSaveProf ? (isSteampunk ? 'bg-amber-900/20 border-amber-700/30' : `bg-${config.key === 'cha' || config.key === 'str' ? 'white' : 'black'}/5 ${config.theme.border} border-opacity-30`) : (isSteampunk ? 'bg-stone-900/30 border-stone-700/30' : 'bg-iron-950/30 border-slate-800/50')}`}>
                    <div className="flex items-center gap-3">
                        <DynamicToggle checked={isSaveProf} onChange={(c) => update(`savingThrows.${attrKey}`, c)} theme={config.theme} size="md" isSteampunk={isSteampunk} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isSaveProf ? (isSteampunk ? 'text-amber-100' : 'text-slate-200') : (isSteampunk ? 'text-stone-400' : 'text-slate-500')}`}>Salvaguarda</span>
                    </div>
                    <span className={`text-sm font-bold font-mono ${isSaveProf ? (isSteampunk ? 'text-amber-200' : config.theme.text) : (isSteampunk ? 'text-stone-500' : 'text-slate-600')}`}>{saveVal >= 0 ? `+${saveVal}` : saveVal}</span>
                </div>
                {Object.keys(config.skills).length > 0 && <div className={`h-px w-full ${isSteampunk ? 'bg-amber-800/30' : 'bg-slate-800/50'}`} />}
                <div className="space-y-1">
                    {Object.entries(config.skills).map(([skillKey, skillLabel]) => {
                        // @ts-ignore
                        const isProf = data.skills?.[skillKey] || false;
                        const skillVal = mod + (isProf ? profBonus : 0);
                        
                        let highlightClass = "";
                        let isSuggested = false;
                        if (data.skillPrompts && data.skillPrompts.length > 0) {
                            const activePrompt = data.skillPrompts[0];
                            if (activePrompt.options) {
                                const currentPicks = activePrompt.options.filter(opt => data.skills[opt]).length;
                                const needed = activePrompt.count;
                                isSuggested = activePrompt.options.includes(skillKey);
                                if (isSuggested && !isProf && currentPicks < needed) {
                                    highlightClass = isSteampunk 
                                        ? "border-amber-500/80 bg-amber-900/20 shadow-[0_0_8px_rgba(217,119,6,0.3)] animate-pulse"
                                        : "border-copper-500/80 bg-copper-900/10 shadow-[0_0_8px_rgba(245,158,11,0.2)] animate-pulse";
                                }
                            }
                        }

                        return (
                            <div key={skillKey} className={`flex items-center justify-between px-2 py-1.5 rounded border border-transparent transition-colors group/skill cursor-pointer ${highlightClass} ${!highlightClass ? 'hover:bg-white/5' : ''}`} onClick={() => update(`skills.${skillKey}`, !isProf)}>
                                <div className="flex items-center gap-3">
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <DynamicToggle checked={isProf} onChange={(c) => update(`skills.${skillKey}`, c)} theme={config.theme} size="sm" isSteampunk={isSteampunk} />
                                    </div>
                                    <span className={`text-xs transition-colors ${isProf ? (isSteampunk ? 'text-amber-100 font-medium' : 'text-slate-200 font-medium') : (isSteampunk ? 'text-stone-400 group-hover/skill:text-stone-300' : 'text-slate-500 group-hover/skill:text-slate-400')} ${isSuggested && !isProf ? (isSteampunk ? 'text-amber-400 font-medium' : 'text-copper-400 font-medium') : ''}`}>
                                        {skillLabel as string}
                                    </span>
                                </div>
                                <span className={`text-xs font-mono transition-colors ${isProf ? (isSteampunk ? 'text-amber-200 font-bold' : `${config.theme.text} font-bold`) : (isSteampunk ? 'text-stone-500' : 'text-slate-600')}`}>{skillVal >= 0 ? `+${skillVal}` : skillVal}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
});

const CharacterSheet: React.FC = () => {
  const { currentTheme, currentCharacter } = useTheme();
  const isSteampunk = currentTheme?.id === 'steampunk-victorian';
  
  const [data, setData] = useState<CharacterSheetData>(DEFAULT_DATA);
  const [isSaved, setIsSaved] = useState(false);
  const [showSpells, setShowSpells] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [importerMode, setImporterMode] = useState<'spells' | 'armor' | 'tools-list' | 'weapons-list' | 'feats' | 'classes' | 'class-spells'>('spells');
  const [activeTab, setActiveTab] = useState<'combat' | 'items' | 'features'>('combat');
  const [viewingSpell, setViewingSpell] = useState<Spell | null>(null);
  const [isLoadingSpellDetail, setIsLoadingSpellDetail] = useState(false);
  const [viewingFeature, setViewingFeature] = useState<ClassFeature | null>(null);
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [multiclassNote, setMulticlassNote] = useState<{className: string, text: string} | null>(null);
  const [weaponInput, setWeaponInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('shadow_mechanism_sheet_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
            setData(prev => ({ 
                ...prev, 
                ...parsed,
                info: {
                    ...parsed.info,
                    classes: parsed.info.classes || [{ name: parsed.info.className || "Aventureiro", level: parsed.info.level || 1 }]
                },
                classFeatures: parsed.classFeatures || prev.classFeatures || []
            }));
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
      if (data.skillPrompts && data.skillPrompts.length > 0) {
          const prompt = data.skillPrompts[0];
          if (!prompt || !prompt.options) return;
          const currentPicks = prompt.options.filter(opt => data.skills[opt]).length;
          if (currentPicks >= prompt.count) {
              const newPrompts = [...data.skillPrompts];
              newPrompts.shift(); 
              setData(prev => ({ ...prev, skillPrompts: newPrompts }));
          }
      }
  }, [data.skills, data.skillPrompts]);

  const saveSheet = () => {
    localStorage.setItem('shadow_mechanism_sheet_v3', JSON.stringify(data));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const update = useCallback((path: string, value: any) => {
    setData(prev => {
        try {
            const newData = JSON.parse(JSON.stringify(prev));
            const parts = path.split('.');
            let current = newData;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
            return newData;
        } catch (e) { return prev; }
    });
    setIsSaved(false);
  }, []);

  const updateSpellInList = (level: number, id: string, newDetails: Partial<Spell>) => {
    const newSpells = [...(data.magic.spells || [])];
    if (!newSpells[level]) newSpells[level] = [];
    const idx = newSpells[level].findIndex(s => s.id === id);
    if (idx !== -1) {
        newSpells[level][idx] = { ...newSpells[level][idx], ...newDetails };
        update('magic.spells', newSpells);
    }
  };

  // --- AUTO FETCH SPELL DETAILS IF MISSING ---
  useEffect(() => {
    const fetchMissingDescription = async () => {
      if (viewingSpell && (!viewingSpell.description || viewingSpell.description.length < 5) && !isLoadingSpellDetail) {
         setIsLoadingSpellDetail(true);
         try {
             // 1. Construct target URL slug from spell name
             const slug = slugifySpell(viewingSpell.name);
             const targetUrl = `http://dnd2024.wikidot.com/${slug}`;
             
             // 2. Fetch using our shared utility
             const htmlContent = await fetchWithFallback(targetUrl);
             
             // 3. Parse content
             const details = parseSpellPage(htmlContent, viewingSpell.name);
             
             if (details && details.description) {
                 const updatedData = {
                     description: details.description,
                     school: details.school || viewingSpell.school,
                     castingTime: details.castingTime !== '-' ? details.castingTime : viewingSpell.castingTime,
                     range: details.range !== '-' ? details.range : viewingSpell.range,
                     components: details.components !== '-' ? details.components : viewingSpell.components,
                     duration: details.duration !== '-' ? details.duration : viewingSpell.duration,
                 };

                 // Update modal state instantly for better UX
                 setViewingSpell(prev => prev ? ({ ...prev, ...updatedData }) : null);
                 // Persist to sheet
                 updateSpellInList(viewingSpell.level, viewingSpell.id, updatedData);
             }
         } catch(e) { 
             console.error("Auto-fetch failed:", e); 
         } finally {
             setIsLoadingSpellDetail(false);
         }
      }
    };
    
    // Slight delay to prevent flashing if closing quickly
    const timeout = setTimeout(() => {
        fetchMissingDescription();
    }, 100);
    return () => clearTimeout(timeout);
  }, [viewingSpell?.id, viewingSpell?.description]); // Only trigger when ID changes or description is verified

  // ... (Rest of the component functions: toggleProficiency, handleAddMulticlass, etc.) ...
  
  const handleReset = () => {
      if(confirm("Isso apagará seus dados salvos e restaurará a ficha padrão (Nível 1). Continuar?")) {
          localStorage.removeItem('shadow_mechanism_sheet_v3');
          window.location.reload();
      }
  };

  const toggleProficiency = (category: 'armor' | 'weapons' | 'tools' | 'languages', value: string) => {
    const current = data.proficiencies[category] || [];
    let newProfs;
    if (current.includes(value)) newProfs = current.filter(p => p !== value);
    else newProfs = [...current, value];
    update(`proficiencies.${category}`, newProfs);
  };

  const addSpecificProficiency = (category: 'weapons' | 'languages' | 'tools', value: string) => {
    if (!value) return;
    const current = data.proficiencies[category] || [];
    if (!current.includes(value)) update(`proficiencies.${category}`, [...current, value]);
  };

  const deleteFeature = (id: string | undefined) => {
    if (!id) return;
    const newFeatures = data.classFeatures.filter(f => f.id !== id);
    update('classFeatures', newFeatures);
    setViewingFeature(null);
  };

  const initiateLevelUp = () => setShowLevelSelection(true);
  const handleAddMulticlass = () => { handleOpenImporter('classes'); setShowLevelSelection(false); };

  const confirmLevelUp = (className: string) => {
    const classIdx = data.info.classes.findIndex(c => c.name === className);
    if (classIdx === -1) return;
    
    const newClasses = [...data.info.classes];
    const newClassLevel = newClasses[classIdx].level + 1;
    newClasses[classIdx].level = newClassLevel;
    
    const newTotalLevel = data.info.level + 1;

    // --- AUTOMATIC FEATURE ADDITION LOGIC ---
    let newFeatures = [...data.classFeatures];
    // Retrieve the progression map for this specific class
    const classProg = data.classProgression?.[className];
    
    if (classProg && classProg[newClassLevel]) {
        const featuresToAdd = classProg[newClassLevel];
        featuresToAdd.forEach(fName => {
            const defs = data.classFeatureDefinitions || {};
            const normName = normalizeKey(fName); 
            
            // Try different ways to find the description key
            // 1. Exact normalized match
            // 2. Original name match
            // 3. Partial match (fallback)
            let desc = defs[normName] || defs[fName] || "";
            
            if (!desc) {
                 const key = Object.keys(defs).find(k => k.toLowerCase().includes(fName.toLowerCase()));
                 if(key) desc = defs[key];
            }

            // Check if feature already exists to avoid duplicates (optional but good)
            const exists = newFeatures.some(f => f.name === fName && f.sourceClass === className);
            if (!exists) {
                newFeatures.push({
                    id: Math.random().toString(36),
                    level: newClassLevel,
                    name: fName,
                    description: desc,
                    sourceClass: className
                });
            }
        });
    }

    setData(prev => ({
        ...prev,
        info: { ...prev.info, level: newTotalLevel, classes: newClasses, className: newClasses.map(c => `${c.name} ${c.level}`).join(' / ') },
        proficiencyBonus: Math.ceil(1 + (newTotalLevel / 4)),
        classFeatures: newFeatures
    }));
    setShowLevelSelection(false);
  };

  const handleImportedData = (imported: any, type: string) => {
    const dataAny = imported as any;

    if (type === 'class') {
        const existingClassIndex = data.info.classes.findIndex(c => c.name === dataAny.name);
        if (existingClassIndex === -1) {
            const newClassEntry = { name: dataAny.name, level: 1 };
            const newClasses = [...data.info.classes, newClassEntry];
            let finalClasses = newClasses;
            if (data.info.classes.length === 1 && data.info.classes[0].name === "Aventureiro") finalClasses = [newClassEntry];

            let hitDie = data.hitDieType;
            if (finalClasses.length === 1) {
                const hd = parseInt(dataAny.hitDie.replace('d', ''));
                if (!isNaN(hd)) hitDie = hd;
            }

            const level1Features = dataAny.progression?.[1] || [];
            const newFeatures: ClassFeature[] = level1Features.map((fName: string) => {
                const defs = dataAny.definitions || {};
                const normName = normalizeKey(fName);
                const desc = defs[normName] || defs[fName] || "";

                return {
                    id: Math.random().toString(36),
                    level: 1,
                    name: fName,
                    description: desc,
                    sourceClass: dataAny.name
                };
            });
            
            const allFeatures = [...data.classFeatures, ...newFeatures];
            const isPrimary = finalClasses.length === 1;
            let newSaves = { ...data.savingThrows };
            
            if (isPrimary) {
                dataAny.savingThrows.forEach((s: string) => {
                    // @ts-ignore
                    newSaves[s.toLowerCase().substring(0,3)] = true;
                });
            }

            let newProfs = { ...data.proficiencies };
            if (isPrimary) {
                if (dataAny.armor) newProfs.armor = [...new Set([...newProfs.armor, ...dataAny.armor])];
                if (dataAny.weapons) newProfs.weapons = [...new Set([...newProfs.weapons, ...dataAny.weapons])];
            }

            let newSkillPrompts = [...(data.skillPrompts || [])];
            if (dataAny.skillPrompt && dataAny.skillPrompt.count > 0) {
                newSkillPrompts.push({
                    className: dataAny.name,
                    count: dataAny.skillPrompt.count,
                    options: dataAny.skillPrompt.options
                });
            }

            // CRITICAL UPDATE: Save progression map to state so level ups work later
            const newClassProgression = { 
                ...(data.classProgression || {}),
                [dataAny.name]: dataAny.progression 
            };

            setData(prev => ({
                ...prev,
                info: { ...prev.info, classes: finalClasses, className: finalClasses.map(c => `${c.name} ${c.level}`).join(' / '), level: isPrimary ? 1 : prev.info.level + 1 },
                classFeatures: allFeatures,
                hitDieType: hitDie,
                savingThrows: isPrimary ? newSaves : prev.savingThrows,
                proficiencies: isPrimary ? newProfs : prev.proficiencies,
                skillPrompts: newSkillPrompts,
                classFeatureDefinitions: { ...prev.classFeatureDefinitions, ...dataAny.definitions },
                classProgression: newClassProgression
            }));

            if (!isPrimary && dataAny.multiclassText) setMulticlassNote({ className: dataAny.name, text: dataAny.multiclassText });
        } else {
            alert("Você já possui níveis nesta classe. Use o botão de 'Level Up' ao lado do nível.");
        }
    } else if (type === 'item') {
        const newItem = {
            ...dataAny,
            properties: Array.isArray(dataAny.properties) ? dataAny.properties : (dataAny.properties ? dataAny.properties.split(',').map((s: string) => s.trim()) : [])
        };
        // Ensure strength and stealth are parsed correctly from description if not explicit (legacy support)
        if (dataAny.sourceType === 'armor' && dataAny.description) {
             const strMatch = dataAny.description.match(/Força: (.*)/);
             if (strMatch) newItem.strengthReq = strMatch[1];
             if (dataAny.description.toLowerCase().includes('desvantagem') || dataAny.description.toLowerCase().includes('disadvantage')) {
                 newItem.stealthDisadvantage = true;
             }
        }
        
        update('inventory', [...data.inventory, newItem]);
    } else if (type === 'spell') {
        const lvl = dataAny.level;
        const currentLevelSpells = [...(data.magic.spells[lvl] || [])];
        if (!currentLevelSpells.find(s => s.name === dataAny.name)) {
            currentLevelSpells.push({
                id: Math.random().toString(36),
                name: String(dataAny.name),
                prepared: false,
                level: lvl,
                school: String(dataAny.school || ""),
                castingTime: dataAny.fullData?.castingTime,
                range: dataAny.fullData?.range,
                components: dataAny.fullData?.components,
                duration: dataAny.fullData?.duration,
                description: dataAny.fullData?.description
            });
            const allSpells = [...data.magic.spells];
            allSpells[lvl] = currentLevelSpells;
            update('magic.spells', allSpells);
        }
    } else if (type === 'batch-spells') {
        const allSpells = JSON.parse(JSON.stringify(data.magic.spells) || "[]");
        let addedCount = 0;
        (dataAny as any[]).forEach((spell: any) => {
             const lvl = typeof spell.level === 'number' ? spell.level : (parseInt(String(spell.level)) || 0);
             if (!allSpells[lvl]) allSpells[lvl] = [];
             if (!allSpells[lvl].find((s: any) => String(s.name) === String(spell.name))) {
                 allSpells[lvl].push({
                     id: Math.random().toString(36),
                     name: String(spell.name || "Magia"),
                     prepared: false,
                     level: lvl,
                     school: String(spell.school || ""),
                     castingTime: String(spell.castingTime || ""),
                     range: String(spell.range || ""),
                     components: String(spell.components || ""),
                     duration: String(spell.duration || ""),
                     description: ""
                 });
                 addedCount++;
             }
        });
        update('magic.spells', allSpells);
        alert(`${addedCount} magias importadas!`);
    } else if (type === 'feat') {
        const featData = dataAny;
        const newFeat = {
            id: Math.random().toString(36).substring(2, 9),
            name: String(featData.name || "Novo Talento"),
            source: String(featData.source || "Manual"),
            description: String(featData.description || "")
        };
        update('feats', [...data.feats, newFeat]);
    } else if (type === 'proficiency') {
         const profData = dataAny as { name?: string };
         const profName = String(profData?.name || "");
         if (importerMode === 'tools-list') addSpecificProficiency('tools', profName);
         else if (importerMode === 'weapons-list') addSpecificProficiency('weapons', profName);
    }
    setShowImporter(false);
  };

  const magicStats = useMemo(() => {
      let totalCasterLevel = 0;
      let maxCantrips = 0;
      let maxPrepared = 0;
      let pactSlots = 0;
      let pactSlotLevel = 0;

      data.info.classes.forEach(cls => {
          const lowerName = cls.name.toLowerCase();
          const config = CLASS_SPELL_DATA[lowerName];
          if (!config) return;

          let cantripBonus = 0;
          if (cls.level >= 1) cantripBonus = config.cantripBase;
          if (cls.level >= 4) cantripBonus += 1;
          if (cls.level >= 10) cantripBonus += 1;
          maxCantrips += cantripBonus;

          if (config.knownType === 'prepared') {
              // @ts-ignore
              const statVal = data.stats[config.stat] || 10;
              const mod = Math.floor((statVal - 10) / 2);
              maxPrepared += Math.max(1, mod + cls.level); 
          } else if (config.knownType === 'known' && config.type !== 'warlock') {
              maxPrepared += Math.min(22, cls.level + 1); 
          }

          if (config.type === 'full') totalCasterLevel += cls.level;
          else if (config.type === 'half') totalCasterLevel += Math.floor(cls.level / 2);
          else if (config.type === 'third') totalCasterLevel += Math.floor(cls.level / 3);
          else if (config.type === 'warlock') {
              const wTable = [1,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4];
              const lTable = [1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5];
              const idx = Math.min(19, cls.level - 1);
              pactSlots += wTable[idx];
              pactSlotLevel = Math.max(pactSlotLevel, lTable[idx]);
          }
      });

      const slots = Array(9).fill(0);
      if (totalCasterLevel > 0) {
          const tableIdx = Math.min(19, Math.floor(totalCasterLevel) - 1);
          if (tableIdx >= 0) {
              const row = SLOT_TABLE[tableIdx];
              row.forEach((val, i) => slots[i] = val);
          }
      }

      if (pactSlots > 0 && pactSlotLevel > 0) slots[pactSlotLevel - 1] += pactSlots;

      let currentPrepared = 0;
      let currentCantrips = 0;
      data.magic.spells.forEach((levelSpells, lvl) => {
          const preparedInLevel = levelSpells.filter(s => s.prepared).length;
          if (lvl === 0) currentCantrips += preparedInLevel;
          else currentPrepared += preparedInLevel;
      });

      return { slots, maxPrepared, maxCantrips, currentPrepared, currentCantrips, casterLevel: totalCasterLevel };
  }, [data.info.classes, data.stats, data.magic.spells]);

  const calculatedStats = useMemo(() => {
    const dexMod = MOD(data.stats.dex);
    const strMod = MOD(data.stats.str);
    const profBonus = data.proficiencyBonus;

    let ac = 10 + dexMod;
    let shieldBonus = 0;
    let armorAc = 0;
    let hasArmor = false;

    data.inventory.forEach(item => {
        if (!item.equipped) return;
        if (item.type === 'shield') shieldBonus += (item.acBonus || 2); 
        if (item.type === 'armor') {
            hasArmor = true;
            const baseAc = item.acBonus || 10;
            const maxDex = item.maxDex ?? 99;
            armorAc = baseAc + Math.min(dexMod, maxDex);
        }
    });

    if (hasArmor) ac = armorAc + shieldBonus;
    else ac = 10 + dexMod + shieldBonus;
    
    ac += (data.combat.manualACModifier || 0);
    const initiative = dexMod; 

    let totalWeight = 0;
    data.inventory.forEach(i => {
        const wVal = parseFloat((i.weight || "0").replace(/[^\d.]/g, '')) || 0;
        totalWeight += wVal * (i.quantity || 1);
    });
    let totalCoins = 0;
    Object.values(data.currency).forEach(v => totalCoins += parseInt(v) || 0);
    totalWeight += totalCoins / 50;

    const maxCapacity = data.stats.str * 15;
    const isOverloaded = totalWeight > maxCapacity;

    const attacks = data.inventory
        .filter(i => i.type === 'weapon' && i.equipped)
        .map(w => {
            let ab = "str";
            if (w.overrideAbility && w.overrideAbility !== 'auto') ab = w.overrideAbility;
            else if (w.properties?.some(p => p.toLowerCase().includes('finesse'))) ab = dexMod > strMod ? "dex" : "str";
            else if (w.properties?.some(p => p.toLowerCase().includes('range') || p.toLowerCase().includes('distância'))) ab = "dex";

            // @ts-ignore
            const statMod = MOD(data.stats[ab]);
            
            const isProficient = data.proficiencies.weapons.some(p => 
                p.toLowerCase() === w.name.toLowerCase() ||
                (w.category && w.category.toLowerCase().includes('simple') && p.toLowerCase() === 'simples') ||
                (w.category && w.category.toLowerCase().includes('martial') && p.toLowerCase() === 'marcial') ||
                (w.category && w.category.toLowerCase().includes('simple') && p.toLowerCase() === 'simple') ||
                (w.category && w.category.toLowerCase().includes('martial') && p.toLowerCase() === 'martial')
            );
            
            const atkBonus = statMod + (isProficient ? profBonus : 0);
            const dmgBonus = statMod;

            let damageDie = w.damage || "1d4";
            if (w.isTwoHandedConfig) damageDie = upgradeDie(damageDie, w.properties || []);

            return {
                name: w.name,
                type: w.damageType || "Dano",
                bonus: atkBonus >= 0 ? `+${atkBonus}` : `${atkBonus}`,
                damage: `${damageDie}${dmgBonus >= 0 ? '+' : ''}${dmgBonus}`,
                isProficient
            };
        });
    
    return { ac, initiative, totalWeight, maxCapacity, isOverloaded, attacks };
  }, [data.stats, data.inventory, data.currency, data.proficiencyBonus, data.proficiencies, data.combat.manualACModifier]);

  const { totalWeight, maxCapacity, isOverloaded } = calculatedStats;

  const handleDeleteItem = (id: string) => update('inventory', data.inventory.filter(i => i.id !== id));
  const handleDeleteFeat = (id: string) => update('feats', data.feats.filter(f => f.id !== id));
  
  const handleAddItem = () => {
    const newItem: Item = {
      id: Math.random().toString(36).substring(2, 9),
      name: "Novo Item",
      type: 'misc',
      equipped: false,
      quantity: 1,
      weight: '0',
      description: ''
    };
    update('inventory', [...(data.inventory || []), newItem]);
  };

  const handleAddFeat = () => {
    const newFeat: Feat = {
      id: Math.random().toString(36).substring(2, 9),
      name: "Novo Talento",
      source: "Manual",
      description: ""
    };
    update('feats', [...(data.feats || []), newFeat]);
  };

  const handleOpenImporter = (mode: 'spells' | 'armor' | 'tools-list' | 'weapons-list' | 'feats' | 'classes' | 'class-spells') => {
      setImporterMode(mode);
      setShowImporter(true);
  };

  const handleEquipToggle = (id: string) => {
      const items = [...data.inventory];
      const target = items.find(i => i.id === id);
      if(!target) return;
      target.equipped = !target.equipped;
      if (target.equipped) {
           if(target.type === 'armor') items.forEach(i => i.type === 'armor' && i.id !== id && (i.equipped = false));
           if(target.type === 'shield') {
               items.forEach(i => i.type === 'shield' && i.id !== id && (i.equipped = false));
               items.forEach(i => {
                   const isTwoHanded = i.type === 'weapon' && i.properties?.some(p => ['two-handed', 'duas mãos', 'pesada', 'heavy'].some(k => p.toLowerCase().includes(k)));
                   if (isTwoHanded) i.equipped = false;
               });
           }
           if(target.type === 'weapon') {
               const isTwoHanded = target.properties?.some(p => ['two-handed', 'duas mãos', 'pesada', 'heavy'].some(k => p.toLowerCase().includes(k)));
               if (isTwoHanded) items.forEach(i => i.type === 'shield' && (i.equipped = false));
           }
      }
      update('inventory', items);
  };
  const handleVersatileToggle = (id: string) => {
      const items = [...data.inventory];
      const target = items.find(i => i.id === id);
      if(!target) return;
      target.isTwoHandedConfig = !target.isTwoHandedConfig;
      update('inventory', items);
  };
  const handleAbilityOverrideChange = (id: string, newVal: string) => {
      const items = [...data.inventory];
      const target = items.find(i => i.id === id);
      if(target) { target.overrideAbility = newVal; update('inventory', items); }
  }

  if (!data || !data.stats) {
      return (
          <div className="pt-32 pb-20 flex flex-col items-center justify-center text-slate-400">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <button onClick={handleReset} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded font-bold">Resetar Ficha</button>
          </div>
      );
  }

  const detectedClass = (data.info.classes && data.info.classes.length > 0) ? data.info.classes[0].name : "Artificer";

  return (
    <div className="pt-24 pb-20 container mx-auto max-w-[90rem] px-2 md:px-6 font-sans text-slate-300">
      
      {showImporter && (
          <WikidotImporter 
            onImport={handleImportedData}
            onClose={() => setShowImporter(false)}
            characterClass={detectedClass}
            mode={importerMode}
          />
      )}

      {/* ... (Multiclass and Level Up Modals remain unchanged) ... */}
      
      {/* --- SPELL DETAIL MODAL --- */}
      {viewingSpell && (
          <div className="fixed inset-0 z-[120] bg-iron-950/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-iron-900 border border-slate-700 rounded-xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh]">
                 <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-start shrink-0 rounded-t-xl">
                     <div>
                         <h2 className="text-2xl font-display text-slate-100 flex items-center gap-3">
                             {viewingSpell.name}
                             {isLoadingSpellDetail && (
                                 <span className="flex items-center gap-1 text-[10px] bg-copper-900/30 text-copper-400 px-2 py-0.5 rounded border border-copper-800 animate-pulse">
                                     <Loader2 className="w-3 h-3 animate-spin" /> Buscando na Wiki...
                                 </span>
                             )}
                         </h2>
                         <div className="text-xs text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                             <Scroll className="w-3 h-3" />
                             {viewingSpell.school || "Escola Desconhecida"} • {viewingSpell.level > 0 ? `Level ${viewingSpell.level}` : 'Cantrip'}
                         </div>
                     </div>
                     <button onClick={() => setViewingSpell(null)} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
                         <X className="w-6 h-6" />
                     </button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-800 border-b border-slate-800 shrink-0">
                     {[
                         { label: 'Tempo', val: viewingSpell.castingTime || "-" },
                         { label: 'Alcance', val: viewingSpell.range || "-" },
                         { label: 'Comp.', val: viewingSpell.components || "-" },
                         { label: 'Duração', val: viewingSpell.duration || "-" }
                     ].map((stat, i) => (
                         <div key={i} className="bg-iron-900 p-2 text-center">
                             <div className="text-[10px] text-slate-500 uppercase font-bold">{stat.label}</div>
                             <div className="text-xs text-slate-200 font-mono truncate" title={stat.val}>{stat.val}</div>
                         </div>
                     ))}
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-iron-950/30">
                     <div className="prose prose-invert prose-sm max-w-none font-serif text-slate-300 leading-relaxed whitespace-pre-wrap">
                         {viewingSpell.description ? viewingSpell.description : (
                             <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                                 {isLoadingSpellDetail ? (
                                     <>
                                         <Loader2 className="w-6 h-6 animate-spin text-copper-500" />
                                         <span className="text-xs">Consultando a enciclopédia arcana...</span>
                                     </>
                                 ) : (
                                     <>
                                        <Info className="w-6 h-6" />
                                        <span>Nenhuma descrição encontrada.</span>
                                     </>
                                 )}
                             </div>
                         )}
                     </div>
                 </div>
                 <div className="p-4 border-t border-slate-800 bg-iron-950 shrink-0 rounded-b-xl">
                     <button onClick={() => setViewingSpell(null)} className="w-full py-3 bg-iron-800 hover:bg-iron-700 text-slate-300 font-bold rounded-lg border border-slate-700 transition-colors">Fechar</button>
                 </div>
             </div>
          </div>
      )}

      {/* --- CLASS FEATURE MODAL --- */}
      {viewingFeature && (
          <div className="fixed inset-0 z-[120] bg-iron-950/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-iron-900 border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[80vh]">
                 <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-start shrink-0 rounded-t-xl">
                     <div>
                         <h2 className="text-2xl font-display text-slate-100 flex items-center gap-3">
                             {viewingFeature.name}
                         </h2>
                         <div className="text-xs text-copper-400 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                             <Info className="w-3 h-3" />
                             Habilidade de Classe • Nível {viewingFeature.level}
                         </div>
                     </div>
                     <button onClick={() => setViewingFeature(null)} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
                         <X className="w-6 h-6" />
                     </button>
                 </div>
                 <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-iron-950/30">
                     <div className="prose prose-invert prose-sm max-w-none font-serif text-slate-300 leading-relaxed whitespace-pre-wrap">
                         {viewingFeature.description || <span className="text-slate-500 italic">Sem descrição.</span>}
                     </div>
                 </div>
                 <div className="p-4 border-t border-slate-800 bg-iron-950 shrink-0 rounded-b-xl flex gap-3">
                     <button onClick={() => deleteFeature(viewingFeature.id)} className="flex-1 py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 font-bold rounded-lg border border-red-900/50 transition-colors flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Esquecer</button>
                     <button onClick={() => setViewingFeature(null)} className="flex-[2] py-3 bg-iron-800 hover:bg-iron-700 text-slate-300 font-bold rounded-lg border border-slate-700 transition-colors">Fechar</button>
                 </div>
             </div>
          </div>
      )}

      {/* --- LEVEL UP MODAL --- */}
      {showLevelSelection && (
          <div className="fixed inset-0 z-[120] bg-iron-950/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
             <div className="bg-iron-900 border border-slate-700 rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
                 <div className="p-6 bg-slate-900 border-b border-slate-800 text-center">
                     <h2 className="text-2xl font-display text-slate-100 mb-1">Subir de Nível</h2>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Escolha a classe para evoluir</p>
                 </div>
                 <div className="p-4 space-y-3 bg-iron-950/30">
                     {data.info.classes.map((c, i) => (
                         <button 
                            key={i} 
                            onClick={() => confirmLevelUp(c.name)}
                            className="w-full p-4 bg-iron-900 border border-slate-700 hover:border-copper-500 rounded-lg flex justify-between items-center group transition-all"
                         >
                             <div className="text-left">
                                 <div className="font-bold text-slate-200 group-hover:text-copper-400 transition-colors">{c.name}</div>
                                 <div className="text-xs text-slate-500">Nível Atual: {c.level}</div>
                             </div>
                             <div className="bg-iron-950 p-2 rounded-full border border-slate-800 group-hover:border-copper-500/50">
                                 <ArrowUpCircle className="w-5 h-5 text-slate-500 group-hover:text-copper-500" />
                             </div>
                         </button>
                     ))}
                     <button 
                        onClick={handleAddMulticlass}
                        className="w-full p-4 bg-iron-900/50 border border-dashed border-slate-700 hover:border-slate-500 hover:bg-iron-900 rounded-lg flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 transition-all"
                     >
                         <Plus className="w-4 h-4" />
                         <span className="font-bold text-sm">Adicionar Nova Classe (Multiclasse)</span>
                     </button>
                 </div>
                 <div className="p-4 bg-iron-950 border-t border-slate-800">
                     <button onClick={() => setShowLevelSelection(false)} className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">Cancelar</button>
                 </div>
             </div>
          </div>
      )}
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 border-b border-slate-800 pb-4 gap-4">
        {/* Left Column: Name & Details */}
        <div className="flex-1 w-full">
            {/* Name Row */}
            <div className="mb-3">
                {isSteampunk ? (
                    <h1 className="text-3xl md:text-5xl font-display leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 sp-embossed">
                            {currentCharacter.name}
                        </span>
                    </h1>
                ) : (
                    <input 
                        value={data.info.name || ""}
                        onChange={(e) => update('info.name', e.target.value)}
                        className="text-3xl md:text-5xl font-display font-bold bg-transparent focus:outline-none w-full text-slate-100 placeholder:text-slate-700"
                        placeholder="Nome do Personagem"
                    />
                )}
            </div>
            
            {/* Details Row: Class Box, XP, Race/Bg */}
            <div className="flex flex-wrap items-center gap-4">
                
                {/* Class & Level Box */}
                <div className={`flex items-center gap-2 p-1.5 rounded-lg ${isSteampunk ? 'sp-bronze-plate sp-rivets' : 'bg-iron-900/50 border border-slate-800/50'}`}>
                    <span className={`font-serif text-lg italic pl-2 pr-1 ${isSteampunk ? 'text-amber-400' : 'text-copper-500'}`}>{data.info.className}</span>
                    
                    <div className={`flex items-center gap-1 rounded px-2 py-0.5 ${isSteampunk ? 'sp-wood-inset' : 'bg-iron-950 border border-slate-700'}`}>
                        <span className={`text-[10px] font-bold uppercase ${isSteampunk ? 'text-stone-500' : 'text-slate-500'}`}>NV</span>
                        <span className={`text-base font-bold ${isSteampunk ? 'text-amber-100' : 'text-white'}`}>{data.info.level}</span>
                    </div>

                    <button 
                        onClick={initiateLevelUp}
                        className={`p-1 rounded transition-colors ${isSteampunk ? 'bg-amber-700 hover:bg-amber-600 text-amber-100' : 'bg-copper-600 hover:bg-copper-500 text-white'}`}
                        title="Level Up!"
                    >
                        <ArrowUpCircle className="w-4 h-4" />
                    </button>

                    <button 
                        onClick={() => handleOpenImporter('classes')}
                        className={`p-1 rounded transition-colors border-l ml-1 pl-2 ${isSteampunk ? 'hover:bg-amber-900/30 text-stone-500 hover:text-amber-400 border-stone-700' : 'hover:bg-white/10 text-slate-500 hover:text-copper-400 border-slate-700'}`}
                        title="Importar Classe"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>

                {/* XP Display */}
                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-2 rounded ${isSteampunk ? 'sp-wood-inset text-stone-500' : 'bg-iron-900/30 border border-slate-800/50 text-slate-500'}`}>
                     <span>XP</span>
                     <input 
                        value={data.info.xp} 
                        onChange={(e) => update('info.xp', e.target.value)} 
                        className={`bg-transparent w-16 focus:outline-none font-mono text-right ${isSteampunk ? 'text-amber-100' : 'text-slate-300'}`}
                        placeholder="0"
                     />
                </div>

                {/* Static Details (Race/Background) */}
                {(data.info.race || data.info.background) && (
                    <div className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest pl-2 hidden md:flex ${isSteampunk ? 'text-stone-500 border-l border-stone-700/50' : 'text-slate-500 border-l border-slate-800/50'}`}>
                        {data.info.race && <span>{data.info.race}</span>}
                        {data.info.race && data.info.background && <span className={`w-1 h-1 rounded-full ${isSteampunk ? 'bg-stone-600' : 'bg-slate-700'}`}/>}
                        {data.info.background && <span>{data.info.background}</span>}
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Actions */}
        <div className="flex gap-3 shrink-0">
             <button onClick={() => update('inspiration', !data.inspiration)} className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${data.inspiration ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-iron-900 border-slate-700 text-slate-500'}`}>
                <Flame className={`w-4 h-4 ${data.inspiration ? 'fill-current' : ''}`} /> Inspiração
            </button>
            <button onClick={saveSheet} className="flex items-center gap-2 px-4 py-1.5 rounded bg-copper-600 text-white text-sm font-bold hover:bg-copper-500 shadow-lg shadow-copper-900/20">
                <Save className="w-4 h-4" /> {isSaved ? "Salvo" : "Salvar"}
            </button>
        </div>
      </div>

      {/* ... (Rest of UI Components: Attributes, Skills, Combat Grid, Inventory, Spellbook) ... */}
      
      {/* Just returning the rest of the layout wrapper for context, actual logic is above */}
      {/* --- SKILL PROMPT INDICATOR --- */}
      {data.skillPrompts && data.skillPrompts.length > 0 && (
          <div className="mb-6 bg-copper-900/20 border border-copper-900/50 p-3 rounded flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                  <div className="relative">
                      <AlertTriangle className="w-6 h-6 text-copper-500" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  </div>
                  <div className="text-sm text-copper-400">
                      <strong>Escolhas Pendentes:</strong> 
                      {(() => {
                          const prompt = data.skillPrompts[data.skillPrompts.length-1];
                          const selected = prompt.options.filter(opt => data.skills[opt]).length;
                          const remaining = Math.max(0, prompt.count - selected);
                          return <span className="ml-1">Selecione <span className="text-white font-bold text-base">{remaining}</span> perícia(s) para <span className="text-slate-200 font-bold">{prompt.className}</span>.</span>;
                      })()}
                  </div>
              </div>
              <button onClick={() => update('skillPrompts', [])} className="text-xs uppercase font-bold text-slate-500 hover:text-white px-2 py-1 rounded hover:bg-white/5">Dispensar</button>
          </div>
      )}

      {/* --- COMBAT STATS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
         <div className={`col-span-2 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden ${isSteampunk ? 'sp-bronze-plate sp-rivets' : 'bg-iron-900/50 border border-slate-800'}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isSteampunk ? 'bg-red-700' : 'bg-red-600'}`} />
            <div className={`p-3 rounded-full ${isSteampunk ? 'bg-stone-900 border border-red-800/30' : 'bg-iron-950 border border-red-900/30'}`}>
                <Heart className={`w-6 h-6 ${isSteampunk ? 'text-red-400' : 'text-red-500'}`} />
            </div>
            <div className="flex-1 z-10">
                <div className="flex justify-between items-end mb-1">
                    <span className={`text-[10px] uppercase font-bold ${isSteampunk ? 'text-stone-400' : 'text-slate-500'}`}>Pontos de Vida</span>
                    <div className="flex items-center gap-1 text-xs">
                         <span className={isSteampunk ? 'text-stone-400' : 'text-slate-500'}>Max:</span>
                         <input value={data.combat.hpMax} onChange={(e) => update('combat.hpMax', parseInt(e.target.value))} className={`w-8 bg-transparent text-right focus:outline-none font-bold ${isSteampunk ? 'text-amber-100' : 'text-slate-300'}`} type="number" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <input type="number" value={data.combat.hpCurrent} onChange={(e) => update('combat.hpCurrent', parseInt(e.target.value))} className={`text-4xl font-display font-bold bg-transparent w-24 focus:outline-none ${isSteampunk ? 'text-amber-50' : 'text-slate-100'}`} />
                    <div className="flex flex-col">
                        <span className={`text-[9px] uppercase font-bold ${isSteampunk ? 'text-amber-500' : 'text-copper-500'}`}>Temp</span>
                        <input value={data.combat.hpTemp || 0} onChange={(e) => update('combat.hpTemp', parseInt(e.target.value))} className={`w-8 bg-transparent text-xs focus:outline-none border-b ${isSteampunk ? 'text-stone-300 border-stone-700' : 'text-slate-400 border-slate-800'}`} type="number" />
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                    <div className={`h-1.5 flex-1 rounded-full overflow-hidden border ${isSteampunk ? 'bg-stone-900 border-stone-700/50' : 'bg-iron-950 border-slate-800/50'}`}>
                        <div className={`h-full ${isSteampunk ? 'bg-red-700 shadow-[0_0_10px_rgba(185,28,28,0.5)]' : 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]'}`} style={{ width: `${Math.min(100, (data.combat.hpCurrent / (data.combat.hpMax || 1)) * 100)}%` }} />
                    </div>
                    <div className={`text-[10px] font-mono ${isSteampunk ? 'text-stone-500' : 'text-slate-500'}`} title="Dados de Vida">{data.info.level}d{data.hitDieType}</div>
                </div>
            </div>
         </div>

         <div className={`rounded-xl p-3 flex flex-col items-center justify-center ${isSteampunk ? 'sp-bronze-plate sp-rivets' : 'bg-iron-900/50 border border-slate-800'}`}>
             <Shield className={`w-6 h-6 mb-1 ${isSteampunk ? 'text-amber-400' : 'text-slate-400'}`} />
             <span className={`text-4xl font-display font-bold ${isSteampunk ? 'text-amber-50' : 'text-white'}`}>{calculatedStats.ac}</span>
             <span className={`text-[10px] uppercase font-bold ${isSteampunk ? 'text-stone-400' : 'text-slate-500'}`}>CA</span>
         </div>

         <div className={`rounded-xl p-3 flex flex-col items-center justify-center ${isSteampunk ? 'sp-bronze-plate sp-rivets' : 'bg-iron-900/50 border border-slate-800'}`}>
             <Zap className={`w-6 h-6 mb-1 ${isSteampunk ? 'text-amber-400' : 'text-yellow-500'}`} />
             <span className={`text-4xl font-display font-bold ${isSteampunk ? 'text-amber-50' : 'text-white'}`}>{calculatedStats.initiative >= 0 ? `+${calculatedStats.initiative}` : calculatedStats.initiative}</span>
             <span className={`text-[10px] uppercase font-bold ${isSteampunk ? 'text-stone-400' : 'text-slate-500'}`}>Iniciativa</span>
         </div>

         <div className={`hidden lg:flex rounded-xl p-3 flex-col items-center justify-center ${isSteampunk ? 'sp-bronze-plate sp-rivets' : 'bg-iron-900/50 border border-slate-800'}`}>
             <div className={`text-sm font-bold mb-1 ${isSteampunk ? 'text-amber-300' : 'text-slate-400'}`}>Deslocamento</div>
             <div className="flex items-baseline gap-1">
                <input value={data.combat.speed} onChange={(e) => update('combat.speed', e.target.value)} className={`text-3xl font-display font-bold bg-transparent w-12 text-center focus:outline-none ${isSteampunk ? 'text-amber-50' : 'text-white'}`} />
                <span className={`text-xs ${isSteampunk ? 'text-stone-500' : 'text-slate-600'}`}>m</span>
             </div>
         </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 xl:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {ABILITY_CONFIG.map(config => <AttributeBlock key={config.key} config={config} data={data} update={update} isSteampunk={isSteampunk} />)}
              </div>
              
              <div className={`mt-6 rounded-xl p-4 ${isSteampunk ? 'sp-bronze-plate sp-rivets' : 'bg-iron-900/30 border border-slate-800'}`}>
                  <h3 className={`flex items-center gap-2 font-display text-sm mb-4 ${isSteampunk ? 'text-amber-200' : 'text-slate-300'}`}><Activity className={`w-4 h-4 ${isSteampunk ? 'text-amber-400' : 'text-copper-500'}`} /> Proficiências & Idiomas</h3>
                  {/* ... Proficiencies UI ... */}
                  <div className={`mb-4 pb-4 border-b ${isSteampunk ? 'border-amber-800/30' : 'border-slate-800/50'}`}>
                       <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 block ${isSteampunk ? 'text-stone-400' : 'text-slate-500'}`}>Armaduras</span>
                       <div className="flex flex-wrap gap-2">
                           {['Leve', 'Média', 'Pesada', 'Escudos'].map(type => (
                               <button key={type} onClick={() => toggleProficiency('armor', type)} className={`text-xs px-3 py-1.5 rounded border transition-colors ${data.proficiencies?.armor?.includes(type) ? (isSteampunk ? 'bg-amber-900/30 border-amber-500/50 text-amber-200' : 'bg-blue-900/30 border-blue-500/50 text-blue-300') : (isSteampunk ? 'bg-stone-900 border-stone-700 text-stone-400 hover:text-amber-200' : 'bg-iron-950 border-slate-800 text-slate-500 hover:text-slate-300')}`}>{type}</button>
                           ))}
                       </div>
                  </div>
                  
                  <div className="mb-4 pb-4 border-b border-slate-800/50">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Armas</span>
                       <div className="flex flex-wrap gap-2 mb-2 items-center">
                           {['Simples', 'Marcial', 'Fogo'].map(type => (
                               <button key={type} onClick={() => toggleProficiency('weapons', type)} className={`text-xs px-3 py-1.5 rounded border transition-colors ${data.proficiencies?.weapons?.includes(type) ? 'bg-red-900/30 border-red-500/50 text-red-300' : 'bg-iron-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}>{type}</button>
                           ))}
                           <div className="flex items-center bg-iron-950 border border-slate-800 rounded px-2">
                               <input className="bg-transparent text-xs text-slate-300 w-24 py-1.5 focus:outline-none" placeholder="Específica..." value={weaponInput} onChange={(e) => setWeaponInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { addSpecificProficiency('weapons', weaponInput); setWeaponInput(''); } }} />
                               <button onClick={() => { addSpecificProficiency('weapons', weaponInput); setWeaponInput(''); }} className="text-slate-500 hover:text-white"><Plus className="w-3 h-3"/></button>
                           </div>
                           <button onClick={() => handleOpenImporter('weapons-list')} className="bg-iron-800 text-slate-400 p-1.5 rounded hover:bg-copper-600 hover:text-white transition-colors border border-slate-700"><Download className="w-3 h-3" /></button>
                       </div>
                       <div className="flex flex-wrap gap-2">
                            {data.proficiencies?.weapons?.filter(p => !['Simples', 'Marcial', 'Fogo'].includes(p)).map(p => (
                                <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-iron-800 border border-slate-700 text-[10px] text-slate-300">{p} <button onClick={() => toggleProficiency('weapons', p)} className="hover:text-red-400"><X className="w-3 h-3" /></button></span>
                            ))}
                       </div>
                  </div>
                  <div className="mb-4 pb-4 border-b border-slate-800/50">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ferramentas</span>
                           <button onClick={() => handleOpenImporter('tools-list')} className="bg-iron-800 text-slate-400 p-1 rounded hover:bg-copper-600 hover:text-white transition-colors border border-slate-700"><Download className="w-3 h-3" /></button>
                       </div>
                       <div className="flex flex-wrap gap-2">
                            {data.proficiencies?.tools?.map(p => (
                                <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-copper-900/20 border border-copper-900/50 text-xs text-copper-400">{p} <button onClick={() => toggleProficiency('tools', p)} className="hover:text-red-400"><X className="w-3 h-3" /></button></span>
                            ))}
                       </div>
                  </div>
                   <div>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Idiomas & Outros</span>
                       <div className="flex items-center gap-2 mb-2">
                            <input className="bg-iron-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-300 w-full focus:outline-none focus:border-slate-600" placeholder="Adicionar idioma..." value={languageInput} onChange={(e) => setLanguageInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { addSpecificProficiency('languages', languageInput); setLanguageInput(''); } }} />
                            <button onClick={() => { addSpecificProficiency('languages', languageInput); setLanguageInput(''); }} className="bg-iron-800 p-1.5 rounded border border-slate-700 hover:text-white text-slate-400"><Plus className="w-4 h-4"/></button>
                       </div>
                       <div className="flex flex-wrap gap-2">
                            {data.proficiencies?.languages?.map(p => (
                                <span key={p} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-iron-950 border border-slate-800 text-xs text-slate-400">{p} <button onClick={() => toggleProficiency('languages', p)} className="hover:text-red-400"><X className="w-3 h-3" /></button></span>
                            ))}
                       </div>
                   </div>
              </div>

              <div className={`mt-6 rounded-xl p-4 ${isSteampunk ? 'sp-bronze-plate sp-rivets' : 'bg-iron-900/30 border border-slate-800'}`}>
                  <div className={`flex justify-between items-center mb-4 pb-2 border-b ${isSteampunk ? 'border-amber-700/30' : 'border-slate-800/50'}`}>
                      <h3 className={`flex items-center gap-2 font-display text-sm ${isSteampunk ? 'text-amber-200' : 'text-slate-300'}`}><Star className={`w-4 h-4 ${isSteampunk ? 'text-amber-400' : 'text-copper-500'}`} /> Talentos (Feats)</h3>
                      <div className="flex gap-2">
                           <button onClick={() => handleOpenImporter('feats')} className="bg-iron-800 text-slate-400 p-1 rounded hover:bg-copper-600 hover:text-white transition-colors border border-slate-700"><Download className="w-3 h-3" /></button>
                           <button onClick={handleAddFeat} className="bg-copper-600/20 text-copper-500 p-1 rounded hover:bg-copper-600 hover:text-white transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                  </div>
                  <div className="space-y-3">
                      {(data.feats || []).map((feat, index) => {
                          const i = index; 
                          return (
                              <div key={feat.id} className={`rounded p-3 text-xs group ${isSteampunk ? 'sp-wood-inset' : 'bg-iron-950/50 border border-slate-800'}`}>
                                  <div className="flex justify-between items-center mb-1">
                                      <input value={feat.name} onChange={(e) => {const f = [...(data.feats || [])]; f[i].name = e.target.value; update('feats', f)}} className={`bg-transparent font-bold w-full focus:outline-none ${isSteampunk ? 'text-amber-100' : 'text-slate-200'}`} placeholder="Nome do Talento" />
                                      <div className="flex items-center gap-2 shrink-0">
                                          <span className={`text-[9px] uppercase tracking-wide ${isSteampunk ? 'text-stone-500' : 'text-slate-600'}`}>{feat.source}</span>
                                          <button onClick={() => handleDeleteFeat(feat.id)} className={`${isSteampunk ? 'text-stone-600 hover:text-red-400' : 'text-slate-700 hover:text-red-500'}`}><Trash2 className="w-3.5 h-3.5"/></button>
                                      </div>
                                  </div>
                                  <textarea value={feat.description} onChange={(e) => {const f = [...(data.feats || [])]; f[i].description = e.target.value; update('feats', f)}} className={`w-full bg-transparent focus:outline-none resize-none min-h-[40px] border-l-2 pl-2 ${isSteampunk ? 'text-stone-400 focus:text-amber-100 border-amber-800/50' : 'text-slate-400 focus:text-slate-300 border-slate-800'}`} placeholder="Descrição..." />
                              </div>
                          )
                      })}
                      {(!data.feats || data.feats.length === 0) && <div className={`text-center text-xs italic py-4 ${isSteampunk ? 'text-stone-500' : 'text-slate-600'}`}>Nenhum talento adicionado.</div>}
                  </div>
              </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <div className={`rounded-xl p-5 ${isSteampunk ? 'sp-bronze-plate sp-rivets' : 'bg-iron-900/30 border border-slate-800/60'}`}>
                   <h3 className={`flex items-center gap-2 font-display mb-4 pb-2 border-b ${isSteampunk ? 'text-amber-100 border-amber-700/30' : 'text-slate-200 border-slate-800'}`}><Swords className={`w-4 h-4 ${isSteampunk ? 'text-amber-400' : 'text-copper-500'}`} /> Ações</h3>
                   <div className="space-y-2">
                       {calculatedStats.attacks.map((atk, i) => (
                           <div key={i} className={`rounded p-3 flex justify-between items-center transition-all group ${isSteampunk ? 'sp-wood-inset hover:brightness-110' : 'bg-iron-950/80 border border-slate-700 hover:border-copper-500/50'}`}>
                               <div>
                                   <div className={`font-bold text-sm group-hover:text-white ${isSteampunk ? 'text-amber-100' : 'text-slate-200'}`}>{atk.name}</div>
                                   <div className={`text-[10px] uppercase font-bold ${isSteampunk ? 'text-stone-500' : 'text-slate-500'}`}>{atk.type}</div>
                               </div>
                               <div className="flex gap-2 text-right">
                                   <div className="text-center">
                                       <div className={`text-[9px] uppercase font-bold ${isSteampunk ? 'text-stone-500' : 'text-slate-600'}`}>Atq</div>
                                       <div className={`text-sm font-bold ${atk.isProficient ? (isSteampunk ? 'text-amber-400' : 'text-copper-400') : (isSteampunk ? 'text-stone-400' : 'text-slate-400')}`}>{atk.bonus}</div>
                                   </div>
                                   <div className="text-center w-16">
                                       <div className={`text-[9px] uppercase font-bold ${isSteampunk ? 'text-stone-500' : 'text-slate-600'}`}>Dano</div>
                                       <div className={`text-sm font-bold ${isSteampunk ? 'text-amber-100' : 'text-slate-200'}`}>{atk.damage}</div>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
              </div>

              <div className={`rounded-xl p-5 ${isSteampunk ? 'sp-bronze-plate sp-rivets' : 'bg-iron-900/30 border border-slate-800/60'}`}>
                   <div className="flex justify-between items-center mb-4">
                       <h3 className={`flex items-center gap-2 font-display ${isSteampunk ? 'text-amber-100' : 'text-slate-200'}`}><Box className={`w-4 h-4 ${isSteampunk ? 'text-amber-400' : 'text-copper-500'}`} /> Inventário & Habilidades</h3>
                       <div className="flex gap-2">
                           <button onClick={() => handleOpenImporter('armor')} className={`p-1 rounded transition-colors border ${isSteampunk ? 'bg-stone-800 text-stone-400 border-stone-600 hover:bg-amber-700 hover:text-white' : 'bg-iron-800 text-slate-400 border-slate-700 hover:bg-copper-600 hover:text-white'}`} title="Importar Equipamento"><Download className="w-4 h-4" /></button>
                           <button onClick={handleAddItem} className={`p-1 rounded transition-colors ${isSteampunk ? 'bg-amber-700/20 text-amber-500 hover:bg-amber-700 hover:text-white' : 'bg-copper-600/20 text-copper-500 hover:bg-copper-600 hover:text-white'}`} title="Adicionar Item"><Plus className="w-4 h-4" /></button>
                       </div>
                   </div>

                   <div className={`flex border-b mb-4 ${isSteampunk ? 'border-amber-800/30' : 'border-slate-800'}`}>
                       <button onClick={() => setActiveTab('combat')} className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${activeTab === 'combat' ? (isSteampunk ? 'text-amber-400 border-b-2 border-amber-500' : 'text-copper-400 border-b-2 border-copper-500') : (isSteampunk ? 'text-stone-500 hover:text-stone-300' : 'text-slate-500 hover:text-slate-300')}`}>Combate</button>
                       <button onClick={() => setActiveTab('items')} className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${activeTab === 'items' ? (isSteampunk ? 'text-amber-400 border-b-2 border-amber-500' : 'text-copper-400 border-b-2 border-copper-500') : (isSteampunk ? 'text-stone-500 hover:text-stone-300' : 'text-slate-500 hover:text-slate-300')}`}>Mochila</button>
                       <button onClick={() => setActiveTab('features')} className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${activeTab === 'features' ? (isSteampunk ? 'text-amber-400 border-b-2 border-amber-500' : 'text-copper-400 border-b-2 border-copper-500') : (isSteampunk ? 'text-stone-500 hover:text-stone-300' : 'text-slate-500 hover:text-slate-300')}`}>Habilidades</button>
                   </div>
                   
                   {activeTab !== 'features' && (
                       <div className={`flex items-center gap-2 mb-4 p-2 rounded ${isSteampunk ? 'sp-wood-inset' : 'bg-iron-950 border border-slate-800'}`}>
                            <div className={`flex flex-col items-center justify-center px-3 border-r min-w-[90px] ${isSteampunk ? 'border-amber-800/30' : 'border-slate-800'}`}>
                                <ChevronDown className={`w-4 h-4 mb-0.5 ${isOverloaded ? 'text-red-500' : (isSteampunk ? 'text-stone-500' : 'text-slate-500')}`} />
                                <div className={`text-xs font-bold ${isOverloaded ? 'text-red-400' : (isSteampunk ? 'text-amber-100' : 'text-slate-200')}`}>{totalWeight.toFixed(1)} <span className={isSteampunk ? 'text-stone-600' : 'text-slate-600'}>/</span> {maxCapacity}</div>
                            </div>
                            <div className="flex-1 grid grid-cols-5 gap-1.5">
                                {['pp', 'ep', 'gp', 'sp', 'cp'].map(coin => (
                                    <div key={coin} className="flex flex-col items-center justify-center">
                                        <span className={`text-[9px] font-bold uppercase mb-0.5 ${isSteampunk ? 'text-stone-500' : 'text-slate-500'}`}>{coin.toUpperCase()}</span>
                                        {/* @ts-ignore */}
                                        <input value={data.currency?.[coin] || "0"} onChange={(e) => update(`currency.${coin}`, e.target.value)} className={`w-full bg-transparent text-center font-mono text-[10px] focus:outline-none rounded py-0.5 ${isSteampunk ? 'text-amber-100 bg-amber-900/10' : 'text-slate-200 bg-white/5'}`} />
                                    </div>
                                ))}
                            </div>
                       </div>
                   )}

                   <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                       {activeTab !== 'features' && (data.inventory || [])
                            .filter(item => {
                                if (activeTab === 'combat') return ['weapon', 'armor', 'shield'].includes(item.type);
                                return !['weapon', 'armor', 'shield'].includes(item.type);
                            })
                            .map((item, originalIdx) => {
                                const idx = data.inventory.findIndex(i => i.id === item.id);
                                return (
                                   <div key={item.id} className={`rounded p-3 text-xs group ${isSteampunk ? 'sp-wood-inset' : 'bg-iron-950/50 border border-slate-800'}`}>
                                       <div className="flex justify-between items-start mb-2 gap-2">
                                           <div className="flex items-center gap-2 flex-1 min-w-0">
                                               {activeTab === 'combat' ? (
                                                    <button onClick={() => handleEquipToggle(item.id)} className={`p-1.5 rounded shrink-0 transition-all ${item.equipped ? (isSteampunk ? 'text-amber-400 bg-amber-900/30 ring-1 ring-amber-500/30' : 'text-copper-400 bg-copper-900/20 ring-1 ring-copper-500/30') : (isSteampunk ? 'text-stone-600 hover:text-stone-400' : 'text-slate-600 hover:text-slate-400')}`}>
                                                        {item.type === 'weapon' ? <Swords className="w-3.5 h-3.5"/> : item.type === 'armor' ? <Shield className="w-3.5 h-3.5"/> : <Box className="w-3.5 h-3.5"/>}
                                                    </button>
                                               ) : (<div className={`p-1.5 ${isSteampunk ? 'text-stone-600' : 'text-slate-600'}`}><Box className="w-3.5 h-3.5" /></div>)}
                                               <input value={item.name} onChange={(e) => { const inv = [...data.inventory]; inv[idx].name = e.target.value; update('inventory', inv); }} className={`bg-transparent font-bold w-full focus:outline-none min-w-0 flex-1 ${item.equipped ? (isSteampunk ? 'text-amber-100' : 'text-slate-200') : (isSteampunk ? 'text-stone-500' : 'text-slate-500')}`} />
                                           </div>
                                           <div className="flex items-center bg-iron-900 rounded px-1.5 py-0.5 border border-slate-800 shrink-0">
                                                <input value={item.weight || ""} onChange={(e) => {const i=[...data.inventory]; i[idx].weight=e.target.value; update('inventory', i)}} className="bg-transparent w-8 text-right text-[10px] text-slate-400 focus:outline-none focus:text-slate-200" placeholder="0" />
                                                <span className="text-[9px] text-slate-600 ml-1">lb</span>
                                           </div>
                                           <button onClick={() => handleDeleteItem(item.id)} className="text-slate-700 hover:text-red-500 shrink-0"><Trash2 className="w-3.5 h-3.5"/></button>
                                       </div>
                                       {(item.type === 'weapon') && (
                                           <div className="pl-7 space-y-2">
                                               <div className="flex gap-2">
                                                   <div className="flex items-center bg-iron-900 border border-slate-700 rounded px-1.5 py-0.5">
                                                       <input value={item.damage} onChange={(e) => {const i=[...data.inventory]; i[idx].damage=e.target.value; update('inventory', i)}} className="bg-transparent w-8 text-center text-slate-300 font-mono focus:outline-none" title="Dano Base"/>
                                                       {item.properties?.some(p => p.toLowerCase().includes('versatile') || p.toLowerCase().includes('versátil')) && item.isTwoHandedConfig && <span className="text-[9px] text-copper-500 ml-1 font-mono">→ {upgradeDie(item.damage || "", item.properties)}</span>}
                                                   </div>
                                                   <input value={item.damageType || ""} onChange={(e) => {const i=[...data.inventory]; i[idx].damageType=e.target.value; update('inventory', i)}} placeholder="Tipo" className="bg-transparent border-b border-slate-800 text-slate-400 focus:border-slate-600 focus:outline-none flex-1"/>
                                               </div>
                                               {item.mastery && item.mastery !== '-' && (
                                                   <div className="flex items-center gap-2 px-2 py-1 bg-purple-900/20 border border-purple-500/30 rounded">
                                                       <Star className="w-3 h-3 text-purple-400" />
                                                       <span className="text-xs text-purple-300 font-bold uppercase tracking-wide">Mastery: {item.mastery}</span>
                                                   </div>
                                               )}

                                               <div className="flex items-center gap-2">
                                                   <input value={item.properties?.join(', ') || ""} onChange={(e) => {const i=[...data.inventory]; i[idx].properties=e.target.value.split(',').map(s=>s.trim()); update('inventory', i)}} placeholder="Propriedades..." className="flex-1 bg-transparent text-[10px] text-slate-500 focus:text-slate-300 focus:outline-none italic"/>
                                                    <div className="relative group/ability">
                                                        <select value={item.overrideAbility || 'auto'} onChange={(e) => handleAbilityOverrideChange(item.id, e.target.value)} className="appearance-none bg-iron-900 text-[9px] text-copper-500 font-bold uppercase border border-slate-700 rounded px-2 py-0.5 focus:border-copper-500 outline-none cursor-pointer hover:bg-iron-800">
                                                            <option value="auto">AUTO</option>
                                                            {ABILITY_CONFIG.map(ab => <option key={ab.key} value={ab.key}>{ab.short}</option>)}
                                                        </select>
                                                    </div>
                                               </div>
                                               <div className="flex gap-3 mt-1">
                                                    {item.properties?.some(p => p.toLowerCase().includes('versatile') || p.toLowerCase().includes('versátil')) && <button onClick={() => handleVersatileToggle(item.id)} className={`text-[9px] px-2 py-0.5 rounded border ${item.isTwoHandedConfig ? 'bg-copper-900/20 border-copper-800 text-copper-400' : 'border-slate-700 text-slate-500'}`}>{item.isTwoHandedConfig ? '2 Mãos (2H)' : '1 Mão (1H)'}</button>}
                                               </div>
                                           </div>
                                       )}
                                       {(item.type === 'armor' || item.type === 'shield') && (
                                           <div className="pl-7 grid grid-cols-1 gap-2">
                                               <div className="flex items-center gap-2 flex-wrap">
                                                   <div className="px-2 py-1 bg-iron-900 border border-slate-700 rounded flex items-center gap-1.5">
                                                       <span className="text-[10px] text-slate-500 uppercase font-bold">CA</span>
                                                       <input 
                                                            type="number" 
                                                            value={item.acBonus} 
                                                            onChange={(e) => {const i=[...data.inventory]; i[idx].acBonus=parseInt(e.target.value); update('inventory', i)}} 
                                                            className="bg-transparent w-10 text-center font-bold text-slate-200 focus:outline-none text-xs" 
                                                       />
                                                   </div>
                                                   {(item.maxDex !== undefined && item.maxDex < 10) && (
                                                       <div className="px-2 py-1 bg-iron-900 border border-slate-700 text-slate-400 text-[10px] rounded flex items-center gap-1 uppercase font-bold" title="Bônus Máximo de Destreza na CA">
                                                           DES Max: <span className="text-white">+{item.maxDex}</span>
                                                       </div>
                                                   )}
                                                   {item.strengthReq && item.strengthReq !== '-' && item.strengthReq !== '' && (
                                                       <div className="px-2 py-1 bg-iron-900 border border-slate-700 text-slate-400 text-[10px] rounded flex items-center gap-1 uppercase font-bold">
                                                           Força: <span className="text-white">{item.strengthReq}</span>
                                                       </div>
                                                   )}
                                                   {item.stealthDisadvantage && (
                                                       <div className="px-2 py-1 bg-red-900/20 border border-red-800 text-red-400 text-[10px] rounded flex items-center gap-1 uppercase font-bold">
                                                           <AlertTriangle className="w-3 h-3" /> Furtividade
                                                       </div>
                                                   )}
                                               </div>
                                           </div>
                                       )}
                                        {activeTab === 'items' && <div className="pl-7 mt-2"><textarea value={item.description || ""} onChange={(e) => {const i=[...data.inventory]; i[idx].description=e.target.value; update('inventory', i)}} className="w-full bg-transparent text-[10px] text-slate-500 focus:text-slate-300 focus:outline-none resize-none h-12 border-l-2 border-slate-800 pl-2" placeholder="Descrição..." /></div>}
                                   </div>
                               );
                        })}
                        {activeTab === 'features' && (
                            <div className="space-y-4">
                                {(data.classFeatures || []).sort((a,b) => a.level - b.level).map((feature, idx) => (
                                    <div key={idx} onClick={() => setViewingFeature(feature)} className={`rounded p-3 text-xs flex gap-3 cursor-pointer transition-colors group ${isSteampunk ? 'sp-bronze-plate sp-rivets hover:brightness-110' : 'bg-iron-950/50 border border-slate-800 hover:bg-white/5'}`}>
                                        <div className={`flex flex-col items-center justify-center p-2 rounded h-fit transition-colors ${isSteampunk ? 'sp-wood-inset group-hover:border-amber-700' : 'bg-iron-900 border border-slate-800 group-hover:border-slate-600'}`}>
                                            <span className={`text-[9px] font-bold uppercase ${isSteampunk ? 'text-stone-500' : 'text-slate-500'}`}>Nível</span>
                                            <span className={`text-lg font-display ${isSteampunk ? 'text-amber-400' : 'text-copper-500'}`}>{feature.level}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div className={`font-bold text-sm mb-1 ${isSteampunk ? 'text-amber-100 group-hover:text-amber-300' : 'text-slate-200 group-hover:text-copper-400'}`}>{feature.name}</div>
                                                <Info className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${isSteampunk ? 'text-stone-500' : 'text-slate-600'}`} />
                                            </div>
                                            <div className={`leading-relaxed line-clamp-2 ${isSteampunk ? 'text-stone-400' : 'text-slate-500'}`}>{feature.description || "Clique para ver detalhes."}</div>
                                        </div>
                                    </div>
                                ))}
                                {data.classFeatures.length === 0 && <div className={`text-center italic py-8 ${isSteampunk ? 'text-stone-500' : 'text-slate-500'}`}>Nenhuma habilidade de classe registrada. Use o botão de Importar Classe para carregar.</div>}
                            </div>
                        )}
                   </div>
              </div>

              <div className={`rounded-xl overflow-hidden ${isSteampunk ? 'sp-bronze-plate sp-rivets' : 'bg-iron-900/30 border border-slate-800/60'}`}>
                   <button onClick={() => setShowSpells(!showSpells)} className={`w-full flex items-center justify-between p-4 transition-colors ${isSteampunk ? 'bg-transparent hover:bg-amber-900/20' : 'bg-iron-950/50 hover:bg-iron-900'}`}>
                       <div className={`flex items-center gap-2 font-display ${isSteampunk ? 'text-amber-200' : 'text-slate-200'}`}><Flame className={`w-4 h-4 ${isSteampunk ? 'text-amber-500' : 'text-purple-500'}`} /> Grimório</div>
                       {showSpells ? <ChevronUp className={`w-4 h-4 ${isSteampunk ? 'text-stone-500' : 'text-slate-500'}`} /> : <ChevronDown className={`w-4 h-4 ${isSteampunk ? 'text-stone-500' : 'text-slate-500'}`} />}
                   </button>
                   
                   {showSpells && (
                       <div className={`p-4 border-t ${isSteampunk ? 'border-stone-700/50' : 'border-slate-800'}`}>
                           <div className={`grid grid-cols-2 gap-3 mb-6 p-3 rounded-lg ${isSteampunk ? 'sp-wood-inset' : 'bg-iron-950/50 border border-slate-800/50'}`}>
                               <div>
                                   <div className={`flex justify-between text-[10px] uppercase font-bold mb-1 ${isSteampunk ? 'text-stone-500' : 'text-slate-500'}`}>
                                       <span>Preparadas</span>
                                       <span className={magicStats.currentPrepared > magicStats.maxPrepared ? "text-red-500" : (isSteampunk ? "text-stone-400" : "text-slate-400")}>{magicStats.currentPrepared} / {magicStats.maxPrepared}</span>
                                   </div>
                                   <div className={`h-1.5 rounded-full overflow-hidden ${isSteampunk ? 'bg-stone-800' : 'bg-iron-900'}`}>
                                       <div className={`h-full transition-all ${magicStats.currentPrepared > magicStats.maxPrepared ? 'bg-red-500' : (isSteampunk ? 'bg-amber-500' : 'bg-purple-500')}`} style={{ width: `${Math.min(100, (magicStats.currentPrepared / (magicStats.maxPrepared || 1)) * 100)}%` }} />
                                   </div>
                               </div>
                               <div>
                                   <div className={`flex justify-between text-[10px] uppercase font-bold mb-1 ${isSteampunk ? 'text-stone-500' : 'text-slate-500'}`}>
                                       <span>Truques</span>
                                       <span className={magicStats.currentCantrips > magicStats.maxCantrips ? "text-yellow-500" : (isSteampunk ? "text-stone-400" : "text-slate-400")}>{magicStats.currentCantrips} / {magicStats.maxCantrips}</span>
                                   </div>
                                   <div className={`h-1.5 rounded-full overflow-hidden ${isSteampunk ? 'bg-stone-800' : 'bg-iron-900'}`}>
                                       <div className={`h-full transition-all ${magicStats.currentCantrips > magicStats.maxCantrips ? 'bg-yellow-500' : (isSteampunk ? 'bg-cyan-500' : 'bg-blue-500')}`} style={{ width: `${Math.min(100, (magicStats.currentCantrips / (magicStats.maxCantrips || 1)) * 100)}%` }} />
                                   </div>
                               </div>
                           </div>

                           <div className={`flex justify-between text-center mb-4 text-xs p-2 rounded ${isSteampunk ? 'bg-stone-900/50' : 'bg-iron-950/50'}`}>
                               <div><div className={`font-bold ${isSteampunk ? 'text-stone-400' : 'text-slate-500'}`}>ATQ</div><div className={isSteampunk ? 'text-amber-100' : 'text-slate-200'}>{data.magic.attackBonus}</div></div>
                               <div><div className={`font-bold ${isSteampunk ? 'text-stone-400' : 'text-slate-500'}`}>CD</div><div className={isSteampunk ? 'text-amber-100' : 'text-slate-200'}>{data.magic.saveDC}</div></div>
                               <div><div className={`font-bold ${isSteampunk ? 'text-stone-400' : 'text-slate-500'}`}>HAB</div><div className={isSteampunk ? 'text-amber-400' : 'text-copper-400'}>{data.magic.ability}</div></div>
                               <div><div className={`font-bold ${isSteampunk ? 'text-stone-400' : 'text-slate-500'}`}>NV. CONJ.</div><div className={isSteampunk ? 'text-emerald-300' : 'text-emerald-400'}>{magicStats.casterLevel}</div></div>
                           </div>

                           <div className="flex gap-2 mb-6">
                               <button onClick={() => handleOpenImporter('spells')} className={`flex-1 py-3 border rounded flex items-center justify-center gap-2 font-bold transition-all text-xs ${isSteampunk ? 'bg-amber-900/30 text-amber-200 border-amber-700 hover:bg-amber-800/50 hover:shadow-lg hover:shadow-amber-900/20' : 'bg-purple-900/30 text-purple-300 border-purple-800 hover:bg-purple-800/50 hover:shadow-lg hover:shadow-purple-900/20'}`}><Globe className="w-4 h-4" /> Buscar</button>
                               <button onClick={() => handleOpenImporter('class-spells')} className={`flex-1 py-3 border rounded flex items-center justify-center gap-2 font-bold transition-all text-xs ${isSteampunk ? 'bg-stone-800 text-stone-300 border-stone-600 hover:bg-stone-700 hover:text-amber-100' : 'bg-iron-800 text-slate-300 border-slate-700 hover:bg-iron-700 hover:text-white'}`}><ListChecks className="w-4 h-4" /> Lista da Classe</button>
                           </div>
                           
                           <div className="space-y-4">
                               {data.magic.slots.map((slot, lvl) => {
                                   const autoTotal = lvl === 0 ? 0 : magicStats.slots[lvl - 1]; 
                                   const displayTotal = autoTotal > 0 ? autoTotal : slot.total; 
                                   
                                   return (
                                   <div key={lvl} className={`rounded border p-2 ${isSteampunk ? 'bg-stone-900/30 border-stone-700/50' : 'bg-iron-950/30 border-slate-800/50'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-[10px] font-bold uppercase ${isSteampunk ? 'text-amber-400' : 'text-purple-400'}`}>{lvl === 0 ? 'Truques' : `Nv ${lvl}`}</span>
                                            {lvl > 0 && (
                                                <div className="flex items-center gap-1 text-[10px]">
                                                    <input value={slot.used} onChange={(e) => {const s=[...data.magic.slots]; s[lvl].used=e.target.value; update('magic.slots', s)}} className={`w-6 text-center border rounded outline-none ${isSteampunk ? 'bg-stone-900 border-stone-600 text-amber-100 focus:border-amber-500' : 'bg-iron-900 border-slate-700 text-white focus:border-purple-500'}`} />
                                                    <span className={isSteampunk ? 'text-stone-500' : 'text-slate-600'}>/</span>
                                                    <div className={`w-6 text-center bg-transparent font-mono relative group ${isSteampunk ? 'text-stone-400' : 'text-slate-500'}`}>{displayTotal}{autoTotal > 0 && <Lock className={`w-2 h-2 absolute top-0 right-0 opacity-50 ${isSteampunk ? 'text-stone-600' : 'text-slate-700'}`} />}</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            {data.magic.spells[lvl]?.map((spell, i) => (
                                                <div key={i} className={`hover:bg-white/5 rounded transition-all duration-300 border border-transparent ${isSteampunk ? 'hover:border-stone-700' : 'hover:border-slate-800'}`}>
                                                    <div className="flex items-center gap-2 p-1.5 cursor-pointer" onClick={() => setViewingSpell(spell)}>
                                                        <div onClick={(e) => e.stopPropagation()}><DynamicToggle checked={spell.prepared} onChange={(c) => {const s=JSON.parse(JSON.stringify(data.magic.spells)); s[lvl][i].prepared=c; update('magic.spells', s)}} theme={{bg: isSteampunk ? 'bg-amber-500' : 'bg-purple-500', border: isSteampunk ? 'border-amber-500' : 'border-purple-500'}} size="sm" isSteampunk={isSteampunk} /></div>
                                                        <div className="flex-1 flex items-center justify-between">
                                                            <input value={spell.name} onChange={(e) => {const s=JSON.parse(JSON.stringify(data.magic.spells)); s[lvl][i].name=e.target.value; update('magic.spells', s)}} className={`bg-transparent w-full text-xs focus:outline-none cursor-pointer ${spell.prepared ? (isSteampunk ? 'text-amber-100 font-medium' : 'text-slate-200 font-medium') : (isSteampunk ? 'text-stone-500' : 'text-slate-500')}`} placeholder="Magia..." onClick={(e) => e.stopPropagation()} />
                                                            <div className="flex items-center gap-2">{spell.school && <span className={`text-[9px] uppercase ${isSteampunk ? 'text-stone-500' : 'text-slate-600'}`}>{spell.school.substring(0,3)}</span>}<BookOpen className={`w-3 h-3 ${isSteampunk ? 'text-stone-500 hover:text-amber-400' : 'text-slate-600 hover:text-purple-400'}`} /></div>
                                                        </div>
                                                        <button onClick={(e) => {e.stopPropagation(); const s=JSON.parse(JSON.stringify(data.magic.spells)); s[lvl].splice(i,1); update('magic.spells', s)}} className={`opacity-20 hover:opacity-100 hover:text-red-500 ${isSteampunk ? 'text-stone-600' : 'text-slate-700'}`}><Trash2 className="w-3 h-3"/></button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => {const s=JSON.parse(JSON.stringify(data.magic.spells)); if(!s[lvl]) s[lvl]=[]; s[lvl].push({id: Math.random().toString(36), name:"", prepared:false, level: lvl}); update('magic.spells', s)}} className={`text-[10px] flex items-center gap-1 mt-2 pl-2 ${isSteampunk ? 'text-stone-500 hover:text-amber-400' : 'text-slate-600 hover:text-purple-400'}`}><Plus className="w-3 h-3" /> Manual</button>
                                        </div>
                                   </div>
                               )})}
                           </div>
                       </div>
                   )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default CharacterSheet;