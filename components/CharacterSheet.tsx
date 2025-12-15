import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, Shield, Heart, Zap, Swords, Brain, Scroll, Coins, Backpack, ChevronDown, ChevronUp, Dna, Flame, Trash2, Plus, Shirt, Anchor, AlertTriangle, Hexagon } from 'lucide-react';

// --- TIPOS E INTERFACES ---

type ItemType = 'weapon' | 'armor' | 'shield' | 'misc';

interface Item {
  id: string;
  name: string;
  type: ItemType;
  equipped: boolean;
  damage?: string;
  damageType?: string;
  properties?: string[];
  isTwoHandedConfig?: boolean;
  acBonus?: number;
  maxDex?: number;
  stealthDisadvantage?: boolean;
  quantity?: number;
  description?: string;
}

interface Spell {
  id: string;
  name: string;
  prepared: boolean;
}

interface CharacterSheetData {
  info: {
    name: string;
    classLevel: string;
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
  otherProficiencies: string;
  combat: {
    hpMax: number;
    hpCurrent: number;
    hpTemp: number;
    hitDiceTotal: string;
    hitDiceCurrent: string;
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

// --- DADOS PADRÃO ---

const DEFAULT_INVENTORY: Item[] = [
    { id: 'wpn_1', name: 'Manopla Trovejante', type: 'weapon', equipped: true, damage: '1d8', damageType: 'Trovão', properties: ['Simples'] },
    { id: 'wpn_2', name: 'Martelo Pneumático', type: 'weapon', equipped: true, damage: '1d8', damageType: 'Concussão', properties: ['Versátil'], isTwoHandedConfig: false },
    { id: 'arm_1', name: 'Armadura de Talas (Splint)', type: 'armor', equipped: true, acBonus: 17, maxDex: 0, stealthDisadvantage: true },
    { id: 'shd_1', name: 'Escudo Reforçado', type: 'shield', equipped: true, acBonus: 2 },
    { id: 'pot_1', name: 'Poção de Cura', type: 'misc', quantity: 2, equipped: false },
];

const DEFAULT_DATA: CharacterSheetData = {
  info: {
    name: "Logan Rylan",
    classLevel: "Artífice 3",
    background: "Nobre Exilado",
    playerName: "Jogador",
    race: "Humano",
    alignment: "NB",
    xp: "900",
  },
  stats: { str: 10, dex: 14, con: 14, int: 17, wis: 12, cha: 8 },
  proficiencyBonus: 2,
  inspiration: false,
  savingThrows: { con: true, int: true },
  skills: { arcana: true, history: true, investigation: true, perception: true, sleightOfHand: true },
  otherProficiencies: "Ferramentas: Ferreiro, Ladrão, Tinker.\nIdiomas: Comum, Gnomico.",
  combat: {
    hpMax: 24,
    hpCurrent: 24,
    hpTemp: 0,
    hitDiceTotal: "3d8",
    hitDiceCurrent: "3d8",
    deathSaveSuccess: 0,
    deathSaveFailure: 0,
    speed: 9,
    manualACModifier: 0,
  },
  inventory: DEFAULT_INVENTORY,
  currency: { cp: "0", sp: "0", ep: "0", gp: "12", pp: "0" },
  features: "Infusões: Armadura Arcana (+1 Defesa, Manoplas).\nMaldição: Hex (1/dia).\nArmadura de Poder: Usa INT para ataques.",
  magic: {
    class: "Artífice",
    ability: "INT",
    saveDC: "13",
    attackBonus: "+5",
    slots: Array(10).fill({ total: "0", used: "0" }),
    spells: Array(10).fill([]).map(() => [])
  }
};

// --- CONFIGURAÇÃO VISUAL AVANÇADA ---
// Cores hardcoded para o Tailwind pegar nas classes dinâmicas ou usando style inline
const ABILITY_CONFIG = [
  { 
    key: 'str', label: 'Força', 
    theme: { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500', shadow: 'shadow-red-500' },
    skills: { athletics: 'Atletismo' } 
  },
  { 
    key: 'dex', label: 'Destreza', 
    theme: { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500', shadow: 'shadow-emerald-500' },
    skills: { acrobatics: 'Acrobacia', sleightOfHand: 'Prestidigitação', stealth: 'Furtividade' } 
  },
  { 
    key: 'con', label: 'Constituição', 
    theme: { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500', shadow: 'shadow-orange-500' },
    skills: {} 
  },
  { 
    key: 'int', label: 'Inteligência', 
    theme: { text: 'text-cyan-400', bg: 'bg-cyan-500', border: 'border-cyan-500', shadow: 'shadow-cyan-500' },
    skills: { arcana: 'Arcanismo', history: 'História', investigation: 'Investigação', nature: 'Natureza', religion: 'Religião' } 
  },
  { 
    key: 'wis', label: 'Sabedoria', 
    theme: { text: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500', shadow: 'shadow-purple-500' },
    skills: { animalHandling: 'Lidar c/ Animais', insight: 'Intuição', medicine: 'Medicina', perception: 'Percepção', survival: 'Sobrevivência' } 
  },
  { 
    key: 'cha', label: 'Carisma', 
    theme: { text: 'text-pink-400', bg: 'bg-pink-500', border: 'border-pink-500', shadow: 'shadow-pink-500' },
    skills: { deception: 'Enganação', intimidation: 'Intimidação', performance: 'Atuação', persuasion: 'Persuasão' } 
  },
] as const;


// --- UTILITÁRIOS ---
const MOD = (score: number | undefined) => Math.floor(((score || 10) - 10) / 2);

// --- COMPONENTES VISUAIS ---

// Toggle Estilizado (Diamante/Losango)
const DiamondToggle = ({ checked, onChange, theme, size = "md" }: { checked: boolean, onChange: (v: boolean) => void, theme: any, size?: "sm"|"md" }) => {
    return (
        <button 
            onClick={() => onChange(!checked)}
            className="relative flex items-center justify-center group outline-none focus:outline-none"
            style={{ width: size === "sm" ? 16 : 24, height: size === "sm" ? 16 : 24 }}
        >
            {/* Glow Effect */}
            <div className={`absolute inset-0 transition-all duration-300 rounded-sm rotate-45 ${checked ? `opacity-60 blur-[4px] ${theme.bg}` : 'opacity-0'}`} />
            
            {/* The Shape */}
            <div className={`
                relative w-full h-full rotate-45 border transition-all duration-300 flex items-center justify-center
                ${checked ? `${theme.bg} ${theme.border}` : 'bg-iron-950 border-slate-700 group-hover:border-slate-500'}
                ${size === "sm" ? "border" : "border-2"}
            `}>
                {checked && <div className="w-[40%] h-[40%] bg-white rounded-full shadow-inner opacity-80" />}
            </div>
        </button>
    );
};

// Bloco de Atributo Redesenhado
const AttributeBlock = React.memo(({ config, data, update }: { config: any, data: CharacterSheetData, update: any }) => {
    if (!data?.stats) return null;

    const attrKey = config.key as keyof CharacterSheetData['stats'];
    const score = data.stats[attrKey] ?? 10;
    const mod = MOD(score);
    const profBonus = data.proficiencyBonus || 2;
    
    const isSaveProf = data.savingThrows?.[attrKey] || false;
    const saveVal = mod + (isSaveProf ? profBonus : 0);

    return (
        <div className="bg-iron-900/60 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col h-full group transition-all hover:border-slate-700/80 hover:shadow-lg hover:shadow-black/20">
            {/* Header Moderno */}
            <div className="relative p-3 pb-2 flex items-center justify-between bg-gradient-to-b from-iron-800/40 to-transparent">
                <div className="flex flex-col z-10">
                    <span className={`text-[10px] uppercase font-bold tracking-[0.2em] mb-1 ${config.theme.text} opacity-80`}>{config.label}</span>
                    <input 
                        type="number"
                        value={score}
                        onChange={(e) => update(`stats.${attrKey}`, parseInt(e.target.value) || 10)}
                        className="bg-iron-950/50 border border-slate-800 rounded w-10 text-center text-[10px] text-slate-500 focus:outline-none focus:text-slate-200 focus:border-slate-600 transition-colors"
                        title="Valor Base"
                    />
                </div>
                
                <div className="flex items-center justify-center relative w-12 h-12">
                    <div className={`absolute inset-0 opacity-10 rounded-full blur-xl ${config.theme.bg}`} />
                    <span className={`text-4xl font-display font-bold ${config.theme.text} drop-shadow-sm`}>
                        {mod >= 0 ? `+${mod}` : mod}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="px-3 pb-3 space-y-3 flex-1">
                {/* Saving Throw Row - Destaque */}
                <div className={`
                    flex items-center justify-between rounded-lg px-3 py-2 border transition-all duration-300
                    ${isSaveProf ? `bg-${config.key === 'cha' || config.key === 'str' ? 'white' : 'black'}/5 ${config.theme.border} border-opacity-30` : 'bg-iron-950/30 border-slate-800/50'}
                `}>
                    <div className="flex items-center gap-3">
                        <DiamondToggle 
                            checked={isSaveProf} 
                            onChange={(c) => update(`savingThrows.${attrKey}`, c)} 
                            theme={config.theme}
                            size="md"
                        />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isSaveProf ? 'text-slate-200' : 'text-slate-500'}`}>Salvaguarda</span>
                    </div>
                    <span className={`text-sm font-bold font-mono ${isSaveProf ? config.theme.text : 'text-slate-600'}`}>
                        {saveVal >= 0 ? `+${saveVal}` : saveVal}
                    </span>
                </div>

                {/* Skills Divider */}
                {Object.keys(config.skills).length > 0 && <div className="h-px bg-slate-800/50 w-full" />}

                {/* Skills List */}
                <div className="space-y-1">
                    {Object.entries(config.skills).map(([skillKey, skillLabel]) => {
                        // @ts-ignore
                        const isProf = data.skills?.[skillKey] || false;
                        const skillVal = mod + (isProf ? profBonus : 0);
                        return (
                            <div key={skillKey} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/5 transition-colors group/skill cursor-pointer" onClick={() => update(`skills.${skillKey}`, !isProf)}>
                                <div className="flex items-center gap-3">
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <DiamondToggle 
                                            checked={isProf} 
                                            onChange={(c) => update(`skills.${skillKey}`, c)} 
                                            theme={config.theme}
                                            size="sm"
                                        />
                                    </div>
                                    <span className={`text-xs transition-colors ${isProf ? 'text-slate-200 font-medium' : 'text-slate-500 group-hover/skill:text-slate-400'}`}>
                                        {skillLabel as string}
                                    </span>
                                </div>
                                <span className={`text-xs font-mono transition-colors ${isProf ? `${config.theme.text} font-bold` : 'text-slate-600'}`}>
                                    {skillVal >= 0 ? `+${skillVal}` : skillVal}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
});

// --- COMPONENTE PRINCIPAL ---

const CharacterSheet: React.FC = () => {
  const [data, setData] = useState<CharacterSheetData>(DEFAULT_DATA);
  const [isSaved, setIsSaved] = useState(false);
  const [showSpells, setShowSpells] = useState(false);
  const [newItemType, setNewItemType] = useState<ItemType>('weapon');

  // Load Logic
  useEffect(() => {
    const saved = localStorage.getItem('shadow_mechanism_sheet_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
            setData(prev => ({
                ...prev,
                ...parsed,
                stats: { ...prev.stats, ...(parsed.stats || {}) },
                savingThrows: { ...prev.savingThrows, ...(parsed.savingThrows || {}) },
                skills: { ...prev.skills, ...(parsed.skills || {}) },
                combat: { ...prev.combat, ...(parsed.combat || {}) },
                info: { ...prev.info, ...(parsed.info || {}) },
                inventory: Array.isArray(parsed.inventory) ? parsed.inventory : prev.inventory,
                magic: { 
                    ...prev.magic, 
                    ...(parsed.magic || {}), 
                    slots: parsed.magic?.slots || prev.magic.slots,
                    spells: Array.isArray(parsed.magic?.spells) ? parsed.magic.spells : prev.magic.spells 
                },
            }));
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  const saveSheet = () => {
    localStorage.setItem('shadow_mechanism_sheet_v2', JSON.stringify(data));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
      if(confirm("Isso apagará seus dados salvos e restaurará a ficha padrão. Continuar?")) {
          localStorage.removeItem('shadow_mechanism_sheet_v2');
          window.location.reload();
      }
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

  const calculatedStats = useMemo(() => {
      if (!data?.stats) return { ac: 10, initiative: 0, attacks: [] };
      const dexMod = MOD(data.stats.dex);
      let armorAC = 10;
      let shieldBonus = 0;
      let armorDexCap = 99;

      const inventory = data.inventory || [];
      const equippedArmor = inventory.find(i => i.type === 'armor' && i.equipped);
      const equippedShield = inventory.find(i => i.type === 'shield' && i.equipped);

      if (equippedArmor) {
          armorAC = equippedArmor.acBonus || 10;
          armorDexCap = equippedArmor.maxDex ?? 99;
      }
      if (equippedShield) {
          shieldBonus = equippedShield.acBonus || 2;
      }

      const effectiveDex = Math.min(dexMod, armorDexCap);
      const totalAC = armorAC + effectiveDex + shieldBonus + (data.combat.manualACModifier || 0);

      const strMod = MOD(data.stats.str);
      const intMod = MOD(data.stats.int);

      const generatedAttacks = inventory
        .filter(i => i.type === 'weapon' && i.equipped)
        .map(wpn => {
            const isFinesse = wpn.properties?.includes('Finesse');
            let usedMod = strMod;
            if (isFinesse) usedMod = Math.max(strMod, dexMod);
            if (data.info.classLevel?.toLowerCase().includes('artífice') || data.info.classLevel?.toLowerCase().includes('artificer')) {
                 usedMod = intMod;
            }

            const hitBonus = usedMod + (data.proficiencyBonus || 2);
            let dmg = wpn.damage || "1d4";
            if (wpn.properties?.includes('Versátil') && wpn.isTwoHandedConfig) {
                if (dmg.includes('d8')) dmg = dmg.replace('d8', 'd10');
                else if (dmg.includes('d6')) dmg = dmg.replace('d6', 'd8');
            }

            const dmgBonus = usedMod;
            return {
                id: wpn.id,
                name: wpn.name,
                bonus: hitBonus >= 0 ? `+${hitBonus}` : `${hitBonus}`,
                damage: `${dmg}${dmgBonus >= 0 ? `+${dmgBonus}` : dmgBonus}`,
                type: wpn.damageType || "Dano"
            };
        });
      
      return { ac: totalAC, initiative: dexMod, attacks: generatedAttacks };
  }, [data]);

  const handleAddItem = () => {
      const newItem: Item = {
          id: Math.random().toString(36).substr(2, 9),
          name: "Novo Item",
          type: newItemType,
          equipped: false,
          damage: newItemType === 'weapon' ? '1d6' : undefined,
          acBonus: 0
      };
      update('inventory', [...(data.inventory || []), newItem]);
  };
  const handleDeleteItem = (id: string) => update('inventory', data.inventory.filter(i => i.id !== id));
  const handleEquipToggle = (id: string) => {
      const items = [...data.inventory];
      const target = items.find(i => i.id === id);
      if(!target) return;
      target.equipped = !target.equipped;
      if (target.equipped) {
           if(target.type === 'armor') items.forEach(i => i.type === 'armor' && i.id !== id && (i.equipped = false));
           if(target.type === 'shield') items.forEach(i => i.type === 'shield' && i.id !== id && (i.equipped = false));
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

  if (!data || !data.stats) {
      return (
          <div className="pt-32 pb-20 flex flex-col items-center justify-center text-slate-400">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
              <button onClick={handleReset} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded font-bold">Resetar Ficha</button>
          </div>
      );
  }

  return (
    <div className="pt-24 pb-20 container mx-auto max-w-[90rem] px-2 md:px-6 font-sans text-slate-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 border-b border-slate-800 pb-4 gap-4">
        <div className="flex-1 w-full">
            <div className="flex items-baseline gap-3 mb-1">
                <input 
                    value={data.info.name || ""}
                    onChange={(e) => update('info.name', e.target.value)}
                    className="text-3xl md:text-5xl font-display font-bold text-slate-100 bg-transparent focus:outline-none w-full md:w-auto"
                />
                <span className="text-copper-500 font-serif text-xl italic">{data.info.classLevel}</span>
            </div>
            <div className="flex gap-4 text-xs text-slate-500 uppercase tracking-widest font-bold items-center">
                 <span>{data.info.race}</span>
                 <span className="w-1 h-1 bg-slate-700 rounded-full"/>
                 <span>{data.info.background}</span>
                 <span className="w-1 h-1 bg-slate-700 rounded-full"/>
                 <span className="flex items-center gap-1">XP: <input value={data.info.xp} onChange={(e) => update('info.xp', e.target.value)} className="bg-transparent w-16 focus:outline-none text-slate-400" /></span>
            </div>
        </div>
        <div className="flex gap-3">
             <button onClick={() => update('inspiration', !data.inspiration)} className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all ${data.inspiration ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-iron-900 border-slate-700 text-slate-500'}`}>
                <Flame className={`w-4 h-4 ${data.inspiration ? 'fill-current' : ''}`} /> Inspiração
            </button>
            <button onClick={saveSheet} className="flex items-center gap-2 px-4 py-1.5 rounded bg-copper-600 text-white text-sm font-bold hover:bg-copper-500 shadow-lg shadow-copper-900/20">
                <Save className="w-4 h-4" /> {isSaved ? "Salvo" : "Salvar"}
            </button>
        </div>
      </div>

      {/* VITALS HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
         <div className="col-span-2 bg-iron-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
            <div className="bg-iron-950 p-3 rounded-full border border-red-900/30">
                <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1 z-10">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Pontos de Vida</span>
                    <div className="flex items-center gap-1 text-xs">
                         <span className="text-slate-500">Max:</span>
                         <input value={data.combat.hpMax} onChange={(e) => update('combat.hpMax', e.target.value)} className="w-8 bg-transparent text-right text-slate-300 focus:outline-none font-bold" type="number" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <input 
                        type="number" 
                        value={data.combat.hpCurrent} 
                        onChange={(e) => update('combat.hpCurrent', e.target.value)}
                        className="text-4xl font-display font-bold text-slate-100 bg-transparent w-24 focus:outline-none" 
                    />
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-copper-500">Temp</span>
                        <input value={data.combat.hpTemp || 0} onChange={(e) => update('combat.hpTemp', e.target.value)} className="w-8 bg-transparent text-slate-400 text-xs focus:outline-none border-b border-slate-800" type="number" />
                    </div>
                </div>
                <div className="h-1.5 w-full bg-iron-950 rounded-full mt-2 overflow-hidden border border-slate-800/50">
                    <div className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" style={{ width: `${Math.min(100, (data.combat.hpCurrent / (data.combat.hpMax || 1)) * 100)}%` }} />
                </div>
            </div>
         </div>

         <div className="bg-iron-900/50 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center">
             <Shield className="w-6 h-6 text-slate-400 mb-1" />
             <span className="text-4xl font-display font-bold text-white">{calculatedStats.ac}</span>
             <span className="text-[10px] uppercase font-bold text-slate-500">CA</span>
         </div>

         <div className="bg-iron-900/50 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center">
             <Zap className="w-6 h-6 text-yellow-500 mb-1" />
             <span className="text-4xl font-display font-bold text-white">{calculatedStats.initiative >= 0 ? `+${calculatedStats.initiative}` : calculatedStats.initiative}</span>
             <span className="text-[10px] uppercase font-bold text-slate-500">Iniciativa</span>
         </div>

         <div className="hidden lg:flex bg-iron-900/50 border border-slate-800 rounded-xl p-3 flex-col items-center justify-center">
             <div className="text-sm font-bold text-slate-400 mb-1">Deslocamento</div>
             <div className="flex items-baseline gap-1">
                <input value={data.combat.speed} onChange={(e) => update('combat.speed', e.target.value)} className="text-3xl font-display font-bold text-white bg-transparent w-12 text-center focus:outline-none" />
                <span className="text-xs text-slate-600">m</span>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ATRIBUTOS & PERÍCIAS (LAYOUT 2024 ESTILIZADO) */}
          <div className="lg:col-span-7 xl:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {ABILITY_CONFIG.map(config => (
                      <AttributeBlock 
                          key={config.key} 
                          config={config} 
                          data={data} 
                          update={update} 
                      />
                  ))}
              </div>
              
              <div className="mt-6 bg-iron-900/30 border border-slate-800 rounded-xl p-4">
                  <h3 className="flex items-center gap-2 font-display text-slate-300 text-sm mb-2">
                      <Dna className="w-4 h-4 text-copper-500" /> Proficiências & Idiomas
                  </h3>
                  <textarea 
                        value={data.otherProficiencies || ""}
                        onChange={(e) => update('otherProficiencies', e.target.value)}
                        className="w-full h-24 bg-iron-950/50 border border-slate-800 rounded p-3 text-sm text-slate-300 font-serif leading-relaxed focus:border-copper-500/50 focus:outline-none resize-none"
                   />
              </div>
          </div>

          {/* COLUNA LATERAL */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* ATAQUES */}
              <div className="bg-iron-900/30 border border-slate-800/60 rounded-xl p-5">
                   <h3 className="flex items-center gap-2 font-display text-slate-200 mb-4 pb-2 border-b border-slate-800">
                      <Swords className="w-4 h-4 text-copper-500" /> Ações
                   </h3>
                   <div className="space-y-2">
                       {calculatedStats.attacks.map((atk, i) => (
                           <div key={i} className="bg-iron-950/80 border border-slate-700 rounded p-3 flex justify-between items-center hover:border-copper-500/50 transition-all group">
                               <div>
                                   <div className="font-bold text-slate-200 text-sm group-hover:text-white">{atk.name}</div>
                                   <div className="text-[10px] text-slate-500 uppercase font-bold">{atk.type}</div>
                               </div>
                               <div className="flex gap-2 text-right">
                                   <div className="text-center">
                                       <div className="text-[9px] text-slate-600 uppercase font-bold">Atq</div>
                                       <div className="text-sm font-bold text-copper-400">{atk.bonus}</div>
                                   </div>
                                   <div className="text-center w-16">
                                       <div className="text-[9px] text-slate-600 uppercase font-bold">Dano</div>
                                       <div className="text-sm font-bold text-slate-200">{atk.damage}</div>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
              </div>

              {/* INVENTÁRIO */}
              <div className="bg-iron-900/30 border border-slate-800/60 rounded-xl p-5">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="flex items-center gap-2 font-display text-slate-200">
                           <Backpack className="w-4 h-4 text-copper-500" /> Inventário
                       </h3>
                       <button onClick={handleAddItem} className="bg-copper-600/20 text-copper-500 p-1 rounded hover:bg-copper-600 hover:text-white transition-colors">
                           <Plus className="w-4 h-4" />
                       </button>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-2 mb-4 bg-iron-950 p-2 rounded border border-slate-800">
                        {['gp', 'sp', 'cp'].map(coin => (
                            <div key={coin} className="flex items-center gap-1 justify-center">
                                <Coins className={`w-3 h-3 ${coin === 'gp' ? 'text-yellow-500' : coin === 'sp' ? 'text-slate-400' : 'text-orange-700'}`} />
                                <input 
                                    // @ts-ignore
                                    value={data.currency?.[coin] || "0"} 
                                    onChange={(e) => update(`currency.${coin}`, e.target.value)}
                                    className="w-full bg-transparent text-right font-mono text-xs text-slate-200 focus:outline-none"
                                />
                            </div>
                        ))}
                   </div>

                   <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                       {(data.inventory || []).map((item, idx) => (
                           <div key={item.id} className="bg-iron-950/50 border border-slate-800 rounded p-2 text-xs">
                               <div className="flex justify-between items-start mb-1">
                                   <div className="flex items-center gap-2">
                                       <button 
                                          onClick={() => handleEquipToggle(item.id)}
                                          className={`p-1 rounded ${item.equipped ? 'text-copper-400 bg-copper-900/20' : 'text-slate-600'}`}
                                       >
                                           {item.type === 'weapon' ? <Swords className="w-3 h-3"/> : item.type === 'armor' ? <Shirt className="w-3 h-3"/> : <Anchor className="w-3 h-3"/>}
                                       </button>
                                       <input 
                                         value={item.name} 
                                         onChange={(e) => { const inv = [...data.inventory]; inv[idx].name = e.target.value; update('inventory', inv); }}
                                         className="bg-transparent font-bold text-slate-300 w-24 sm:w-32 focus:outline-none" 
                                       />
                                   </div>
                                   <button onClick={() => handleDeleteItem(item.id)} className="text-slate-700 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                               </div>
                               {/* Detalhes Compactos */}
                               {(item.type === 'weapon' || item.type === 'armor' || item.type === 'shield') && (
                                   <div className="pl-6 flex gap-2 text-[10px] text-slate-500">
                                       {item.type === 'weapon' && (
                                            <>
                                                <input value={item.damage} onChange={(e) => {const i=[...data.inventory]; i[idx].damage=e.target.value; update('inventory', i)}} className="bg-transparent w-10 text-slate-400" />
                                                {item.properties?.includes('Versátil') && (
                                                    <span onClick={() => handleVersatileToggle(item.id)} className={`cursor-pointer ${item.isTwoHandedConfig ? 'text-copper-500' : ''}`}>
                                                        {item.isTwoHandedConfig ? '2H' : '1H'}
                                                    </span>
                                                )}
                                            </>
                                       )}
                                       {(item.type === 'armor' || item.type === 'shield') && (
                                            <span className="flex gap-1">CA: <input type="number" value={item.acBonus} onChange={(e) => {const i=[...data.inventory]; i[idx].acBonus=parseInt(e.target.value); update('inventory', i)}} className="bg-transparent w-6 text-slate-400" /></span>
                                       )}
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>
              </div>

              {/* MAGIAS */}
              <div className="bg-iron-900/30 border border-slate-800/60 rounded-xl overflow-hidden">
                   <button onClick={() => setShowSpells(!showSpells)} className="w-full flex items-center justify-between p-4 bg-iron-950/50 hover:bg-iron-900 transition-colors">
                       <div className="flex items-center gap-2 font-display text-slate-200">
                           <Flame className="w-4 h-4 text-purple-500" /> Grimório
                       </div>
                       {showSpells ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                   </button>
                   {showSpells && (
                       <div className="p-4 border-t border-slate-800">
                           <div className="flex justify-between text-center mb-4 text-xs">
                               <div><div className="text-slate-500 font-bold">ATQ</div><div className="text-slate-200">{data.magic.attackBonus}</div></div>
                               <div><div className="text-slate-500 font-bold">CD</div><div className="text-slate-200">{data.magic.saveDC}</div></div>
                               <div><div className="text-slate-500 font-bold">HAB</div><div className="text-copper-400">{data.magic.ability}</div></div>
                           </div>
                           <div className="space-y-4">
                               {data.magic.slots.map((slot, lvl) => (
                                   <div key={lvl} className="bg-iron-950/30 rounded border border-slate-800/50 p-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-purple-400 uppercase">{lvl === 0 ? 'Truques' : `Nv ${lvl}`}</span>
                                            {lvl > 0 && (
                                                <div className="flex items-center gap-1 text-[10px]">
                                                    <input value={slot.used} onChange={(e) => {const s=[...data.magic.slots]; s[lvl].used=e.target.value; update('magic.slots', s)}} className="w-5 text-center bg-iron-900 border border-slate-700 text-white rounded" />
                                                    <span className="text-slate-600">/</span>
                                                    <input value={slot.total} onChange={(e) => {const s=[...data.magic.slots]; s[lvl].total=e.target.value; update('magic.slots', s)}} className="w-5 text-center bg-transparent text-slate-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            {data.magic.spells[lvl]?.map((spell, i) => (
                                                <div key={i} className="flex items-center gap-2 text-xs group">
                                                    <DiamondToggle checked={spell.prepared} onChange={(c) => {const s=JSON.parse(JSON.stringify(data.magic.spells)); s[lvl][i].prepared=c; update('magic.spells', s)}} theme={{bg:'bg-purple-500', border:'border-purple-500'}} size="sm" />
                                                    <input value={spell.name} onChange={(e) => {const s=JSON.parse(JSON.stringify(data.magic.spells)); s[lvl][i].name=e.target.value; update('magic.spells', s)}} className={`bg-transparent w-full focus:outline-none ${spell.prepared ? 'text-slate-200' : 'text-slate-500'}`} placeholder="Magia..." />
                                                    <button onClick={() => {const s=JSON.parse(JSON.stringify(data.magic.spells)); s[lvl].splice(i,1); update('magic.spells', s)}} className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                                                </div>
                                            ))}
                                            <button onClick={() => {const s=JSON.parse(JSON.stringify(data.magic.spells)); if(!s[lvl]) s[lvl]=[]; s[lvl].push({name:"", prepared:false}); update('magic.spells', s)}} className="text-[9px] text-slate-600 hover:text-purple-400">+ Add</button>
                                        </div>
                                   </div>
                               ))}
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