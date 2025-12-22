
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer, ShieldAlert, Skull, Anchor, Pencil, Save, Shield, Wand2, Loader2, ImageOff, Info, Wrench, Sparkles, X, Send, Users, Zap } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { CHAR_LOGAN, buildJsonPrompt } from '../constants';
import { generateContentWithRetry } from '../utils/gemini';
import { useTheme } from '../themes/ThemeContext';

// Sistema de estilos para CharacterInfo
const getThemeStyles = (themeId?: string) => {
  if (themeId === 'steampunk-victorian') {
    return {
      panel: 'sp-bronze-plate sp-rivets',
      panelLight: 'sp-bronze-plate sp-rivets',
      title: 'text-amber-100',
      subtitle: 'text-amber-500',
      text: 'text-amber-100',
      textMuted: 'text-stone-400',
      textDim: 'text-stone-500',
      input: 'sp-input',
      border: 'border-amber-800/30',
      accent: 'text-amber-500',
      accentBg: 'bg-amber-700',
      button: 'bg-stone-900/80 text-amber-500 border-stone-600 hover:bg-amber-700 hover:text-white',
      buttonActive: 'bg-amber-700 text-white',
      highlight: 'bg-amber-900/30 text-amber-300 border-amber-500/50',
      highlightAlt: 'bg-purple-900/30 text-purple-300 border-purple-500/50',
    };
  }
  if (themeId === 'wildfire-primal') {
    return {
      panel: 'wf-charred-wood wf-ember-glow',
      panelLight: 'wf-charred-wood',
      title: 'text-orange-100 font-uncial',
      subtitle: 'text-orange-400',
      text: 'text-orange-100',
      textMuted: 'text-orange-200/70',
      textDim: 'text-orange-300/50',
      input: 'wf-input',
      border: 'border-orange-900/40',
      accent: 'text-orange-400',
      accentBg: 'bg-gradient-to-r from-orange-700 to-red-700',
      button: 'wf-stone-circle text-orange-300/70 hover:text-orange-300 border-transparent',
      buttonActive: 'bg-gradient-to-r from-orange-700 to-red-700 text-white',
      highlight: 'wf-charred-wood border border-orange-600/40',
      highlightAlt: 'wf-charred-wood border border-orange-600/40',
    };
  }
  // Default
  return {
    panel: 'bg-iron-900/50 border border-slate-800/50',
    panelLight: 'bg-iron-900 border border-slate-800',
    title: 'text-slate-100',
    subtitle: 'text-copper-500',
    text: 'text-slate-200',
    textMuted: 'text-slate-400',
    textDim: 'text-slate-500',
    input: 'bg-iron-950 border border-slate-700 text-slate-200 focus:border-copper-500',
    border: 'border-slate-800',
    accent: 'text-copper-500',
    accentBg: 'bg-copper-600',
    button: 'bg-iron-950/80 text-copper-500 border-slate-700 hover:bg-copper-600 hover:text-white',
    buttonActive: 'bg-copper-600 text-white',
    highlight: 'bg-purple-900/30 text-purple-300 border-purple-500/50',
    highlightAlt: 'bg-purple-900/30 text-purple-300 border-purple-500/50',
  };
};

const CharacterInfo: React.FC = () => {
  const { images, setImage } = useCampaign();
  const { currentTheme } = useTheme();
  const isSteampunk = currentTheme?.id === 'steampunk-victorian';
  const isWildfire = currentTheme?.id === 'wildfire-primal';
  const ts = getThemeStyles(currentTheme?.id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [showMagicEdit, setShowMagicEdit] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState("");
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  const [charData, setCharData] = useState({
    age: "17 anos",
    height: "1.41m (Muito baixo)",
    eyes: "Castanhos (Intensos)",
    hair: "Preto, bagunçado",
    marks: "Cicatrizes de trabalho, Olheiras (Cansaço)",
    appearance: "Logan veste sua Cota de Escamas (Scale Mail) industrial que foi criada por ele mesmo com restos de metais e centenas de engrenagens sucateadas fundidas a uma tunica de courodura. Ele possui cintos com várias bolsas de ferramentas cruzando o peito. Uma scimitarra repousa na cintura e um escudo de aço está preso às costas. Seus óculos de artífice estão na testa e ele empunha seu Martelo de Forja Pneumático (Um martelo de forja pequeno com tubos e canos de bronze e runas druidicas)."
  });
  const handleChange = (field: string, value: string) => {
    setCharData(prev => ({ ...prev, [field]: value }));
  };

  const characterImageSrc = images['logan_portrait'] || "/images/logan.png";

  const handleGeneratePortrait = async (customDescriptionOverride?: string) => {
      if (isGenerating) return;
      setIsGenerating(true);
      try {
          const descriptionToUse = customDescriptionOverride || charData.appearance;
          const jsonPrompt = buildJsonPrompt({
              scene: `Official character concept art portrait of ${CHAR_LOGAN}. Cinematic fantasy atmosphere. He is wearing: ${descriptionToUse}. Human proportions, 17 years old, NO beard, thin frame. High detail, sharp focus, masterpiece.`,
              camera_angle: "waist-up portrait, eye-level",
              lighting: "dramatic cinematic lighting with volumetric steam",
              composition_rules: ["rule of thirds", "character focus"],
              aspect_ratio: "3:4"
          });
          
          const response = await generateContentWithRetry({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: jsonPrompt }] },
              config: { imageConfig: { aspectRatio: "3:4" } }
          });

          const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          if (part && part.inlineData) {
              const base64 = `data:image/png;base64,${part.inlineData.data}`;
              setImage('logan_portrait', base64);
          }
      } catch (e: any) {
          console.error(e);
          alert("Erro ao gerar retrato: " + e.message);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleMagicUpdate = async () => {
      if (!magicPrompt.trim() || isMagicLoading) return;
      setIsMagicLoading(true);
      try {
          const textModel = 'gemini-3-flash-preview';
          const rewritePrompt = `
            Logan Rylan é um jovem de 17 anos, baixo (1.41m) e franzino.
            Descrição Atual: "${charData.appearance}"
            Mudança desejada pelo usuário: "${magicPrompt}"
            Tarefa: Reescreva a descrição de aparência baseada na mudança, mantendo Logan baixo, franzino, humano e sem barba. Ele sempre tem ferramentas, escudo e scimitarra. Retorne APENAS o novo texto em português.
          `;
          
          const textResponse = await generateContentWithRetry({
              model: textModel,
              contents: rewritePrompt
          });

          const newDescription = textResponse.text?.trim();
          if (newDescription) {
              setCharData(prev => ({ ...prev, appearance: newDescription }));
              setMagicPrompt("");
              setShowMagicEdit(false);
              await handleGeneratePortrait(newDescription);
          }
      } catch (e: any) {
          console.error(e);
          alert("Erro na Edição Mágica: " + e.message);
      } finally {
          setIsMagicLoading(false);
      }
  };

  return (
    <div className="pt-24 pb-20 container mx-auto max-w-5xl px-4 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className={`text-4xl md:text-6xl font-display mb-4 drop-shadow-lg ${ts.title}`}>Logan Rylan</h1>
        <p className={`font-serif italic text-xl ${ts.subtitle}`}>"A engrenagem que sobra é a única que pode substituir as outras."</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-4 space-y-8">
          <div className={`rounded-lg p-1 shadow-2xl relative group overflow-hidden ${ts.panelLight}`}>
            <div className={`aspect-[3/4] relative overflow-hidden rounded ${isWildfire ? 'bg-[#1a1510]' : isSteampunk ? 'bg-stone-900' : 'bg-iron-950'}`}>
               <img src={characterImageSrc} className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${isGenerating || isMagicLoading ? 'blur-sm scale-105' : 'group-hover:scale-105'}`} alt="Logan Rylan Portrait" />
               {(isGenerating || isMagicLoading) && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                       <Loader2 className={`w-10 h-10 animate-spin mb-2 ${ts.accent}`} />
                       <span className={`text-xs uppercase font-bold tracking-widest px-4 text-center ${ts.accent}`}>{isMagicLoading ? "Alterando Realidade..." : "Materializando Retrato..."}</span>
                   </div>
               )}
               <button onClick={() => handleGeneratePortrait()} disabled={isGenerating || isMagicLoading} className={`absolute top-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 border z-30 shadow-lg flex items-center gap-2 pr-3 ${ts.button}`}>
                   <Wand2 className="w-5 h-5" /><span className="text-[10px] font-bold uppercase hidden group-hover:inline">Atualizar Retrato</span>
               </button>
               <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-60 pointer-events-none ${isWildfire ? 'from-[#1a1510]' : isSteampunk ? 'from-stone-900' : 'from-iron-900'}`} />
            </div>
          </div>

          <div className={`rounded-lg p-6 relative ${ts.panel}`}>
            <div className={`flex justify-between items-center mb-4 border-b pb-2 ${ts.border}`}>
                <h3 className={`font-display text-lg ${ts.text}`}>Especificações</h3>
                <button onClick={() => setIsEditing(!isEditing)} className={`p-1.5 rounded transition-colors ${isEditing ? ts.buttonActive : ts.textDim + ' hover:' + ts.accent}`}>{isEditing ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}</button>
            </div>
            <ul className={`space-y-3 text-sm font-serif mb-6 ${ts.textMuted}`}>
              {[
                  {k:'age', l:'Idade'}, {k:'height', l:'Altura'}, {k:'eyes', l:'Olhos'}, {k:'hair', l:'Cabelo'}, {k:'marks', l:'Marcas'}
              ].map(field => (
                <li key={field.k} className="flex flex-col gap-1">
                    <span className={`font-bold text-xs uppercase ${ts.textDim}`}>{field.l}</span>
                    {isEditing ? (
                        <input value={charData[field.k as keyof typeof charData]} onChange={(e) => handleChange(field.k, e.target.value)} className={`rounded px-2 py-1 focus:outline-none w-full ${ts.input}`} />
                    ) : (
                        <span className={ts.text}>{charData[field.k as keyof typeof charData]}</span>
                    )}
                </li>
              ))}
            </ul>
            <div className={`border-t pt-4 ${ts.border}`}>
                <div className="flex justify-between items-center mb-2">
                    <span className={`font-display text-sm block ${ts.text}`}>Aparência Ativa</span>
                    {!isEditing && (
                        <button onClick={() => setShowMagicEdit(!showMagicEdit)} className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border transition-colors ${showMagicEdit ? ts.highlight : ts.button}`}>
                            <Sparkles className="w-3 h-3" /> IA Edit
                        </button>
                    )}
                </div>
                {showMagicEdit && (
                    <div className={`mb-4 border rounded p-3 animate-in slide-in-from-top-2 duration-300 ${ts.highlight}`}>
                        <div className="flex gap-2">
                            <input value={magicPrompt} onChange={(e) => setMagicPrompt(e.target.value)} placeholder="Ex: Adicione uma capa..." className={`flex-1 rounded px-3 py-2 text-xs focus:outline-none ${ts.input}`} onKeyDown={(e) => e.key === 'Enter' && handleMagicUpdate()} />
                            <button onClick={handleMagicUpdate} disabled={isMagicLoading || !magicPrompt.trim()} className={`disabled:opacity-50 text-white p-2 rounded ${ts.accentBg} hover:opacity-90`}>{isMagicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</button>
                        </div>
                    </div>
                )}
                {isEditing ? (
                    <textarea value={charData.appearance} onChange={(e) => handleChange('appearance', e.target.value)} className={`w-full h-40 rounded p-2 text-sm font-serif leading-relaxed outline-none resize-none ${ts.input}`} />
                ) : (
                    <p className={`text-sm font-serif leading-relaxed italic ${ts.textMuted}`}>{charData.appearance}</p>
                )}
            </div>
          </div>
        </div>

        <div className="md:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className={`rounded-xl p-6 relative overflow-hidden group ${ts.panel}`}>
              <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${ts.accent}`}>
                <Skull className="w-16 h-16" />
              </div>
              <h3 className={`font-display text-xl mb-4 flex items-center gap-3 ${ts.accent}`}>
                <ShieldAlert className="w-5 h-5" /> Maldição de Shadowmoor
              </h3>
              <div className={`prose prose-sm font-serif leading-relaxed ${ts.textMuted}`}>
                <p className="mb-3">Logan carrega o fardo do Grimoire da Raiz Retorcida:</p>
                <ul className="space-y-2 list-none p-0">
                  <li className="flex gap-2"><span className={`font-bold ${ts.accent}`}>●</span><span><strong className={ts.text}>O Zumbido:</strong> Estática no ouvido que avisa sobre magia selvagem.</span></li>
                  <li className="flex gap-2"><span className={`font-bold ${ts.accent}`}>●</span><span><strong className={ts.text}>A Sombra Densa:</strong> Uma sombra que parece se mover de forma independente.</span></li>
                </ul>
              </div>
            </section>

            <section className={`rounded-xl p-6 group ${ts.panel}`}>
              <h3 className={`font-display text-xl mb-4 flex items-center gap-3 ${ts.accent}`}>
                <Users className="w-5 h-5" /> Relacionamentos
              </h3>
              <div className="space-y-4">
                <div className={`border-l-2 pl-4 py-1 ${ts.border}`}>
                  <h4 className={`text-sm font-bold ${ts.text}`}>Gareth Aldren <span className="text-[10px] text-red-500 uppercase ml-2 tracking-widest">Rival</span></h4>
                  <p className={`text-xs italic mt-1 font-serif ${ts.textDim}`}>O outro bolsista que usou o carisma para subir, enquanto Logan usava a mente. O roubo do Aégis foi o golpe final.</p>
                </div>
                <div className={`border-l-2 pl-4 py-1 ${ts.border}`}>
                  <h4 className={`text-sm font-bold ${ts.text}`}>Koggle Sprocketwhistle <span className="text-[10px] text-emerald-500 uppercase ml-2 tracking-widest">Mentor</span></h4>
                  <p className={`text-xs italic mt-1 font-serif ${ts.textDim}`}>O gnomo que ensinou a Logan que ferramentas são extensões da alma.</p>
                </div>
              </div>
            </section>
          </div>

          <section className={`rounded-xl p-8 relative ${ts.panel}`}>
            <div className={`absolute top-0 right-0 p-6 opacity-5 ${ts.accent}`}><Wrench className="w-32 h-32" /></div>
            <h3 className={`font-display text-2xl mb-6 flex items-center gap-4 ${ts.text}`}><Zap className={`w-6 h-6 ${ts.accent}`} /> Arsenais de um Exilado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-serif">
              <div>
                <h4 className={`font-display text-sm uppercase tracking-widest mb-3 border-b pb-1 ${ts.accent} ${ts.border}`}>Set de Combate</h4>
                <p className={`text-sm leading-relaxed ${ts.textMuted}`}>Logan mantém sua scimitarra pronta para vetores de ataque rápidos e seu escudo de aço para defesas calculadas. Sua Cota de Escamas protege seu corpo franzino sem tirar a agilidade.</p>
              </div>
              <div>
                <h4 className={`font-display text-sm uppercase tracking-widest mb-3 border-b pb-1 ${ts.accent} ${ts.border}`}>Bolsas de Ferramentas</h4>
                <p className={`text-sm leading-relaxed ${ts.textMuted}`}>Cruzando o peito, as bolsas guardam gazuas, chaves de precisão e óleos rúnicos. Cada ferramenta é uma solução para um problema mecânico ou físico.</p>
              </div>
            </div>
          </section>

          <section className={`rounded-xl p-8 italic font-serif text-center ${ts.panel} ${ts.textDim}`}>
            <p className="max-w-2xl mx-auto italic">"Aos 17 anos, ele já sabe que a maior ferramenta não é o martelo, mas o carisma que ele não tem e a verdade que ele busca."</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CharacterInfo;
