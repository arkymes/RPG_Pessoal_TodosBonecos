import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer, ShieldAlert, Skull, Anchor, Pencil, Save, Shield, Wand2, Loader2, ImageOff, Info, Wrench, Sparkles, X, Send } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { GoogleGenAI } from "@google/genai";
import { CHAR_LOGAN } from '../constants';

const CharacterInfo: React.FC = () => {
  const { images, setImage } = useCampaign();
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Magic Edit States
  const [showMagicEdit, setShowMagicEdit] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState("");
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  // Estado para os dados editáveis
  const [charData, setCharData] = useState({
    age: "19 anos",
    height: "1.41m (Muito baixo)",
    eyes: "Castanhos (Cercados de olheiras profundas)",
    hair: "Preto, corte irregular",
    marks: "Cicatrizes de queimadura nas mãos, cheiro de ozônio",
    appearance: "Logan veste sua Cota de Escamas (Scale Mail) única, feita de sucata industrial. Na testa, repousam seus óculos de artífice com lentes de latão. Vários cintos cruzam seu peito carregando bolsas de ferramentas estufadas. Ele segura seu Martelo de Forja (Smithing Hammer) modificado, cuja cabeça de aço emite um zumbido grave de energia acumulada."
  });

  const handleChange = (field: string, value: string) => {
    setCharData(prev => ({ ...prev, [field]: value }));
  };

  const characterImageSrc = images['logan_portrait'] || "/images/logan.png";
  const hasCustomImage = !!images['logan_portrait'];

  const handleGeneratePortrait = async (customDescriptionOverride?: string) => {
      // @ts-ignore
      const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : null;
      if (!apiKey) { alert("API Key ausente."); return; }

      setIsGenerating(true);
      try {
          // @ts-ignore
          const ai = new GoogleGenAI({ apiKey });
          
          const descriptionToUse = customDescriptionOverride || charData.appearance;

          // MÁGICA AQUI: Combinamos a descrição OFICIAL (base sólida) com a descrição EDITADA
          const prompt = `
            Base Character Definition: ${CHAR_LOGAN}.
            
            Current Equipment and Style: ${descriptionToUse}.
            
            Key Physical Traits: Age ${charData.age}, Height ${charData.height}, Eyes ${charData.eyes}, Hair ${charData.hair}.
            
            Art Style: Steampunk D&D 5e character concept art, masterpiece, highly detailed, oil painting texture, neutral white background.
          `;

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: prompt }] },
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
      if (!magicPrompt.trim()) return;
      
      // @ts-ignore
      const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : null;
      if (!apiKey) { alert("API Key ausente."); return; }

      setIsMagicLoading(true);
      
      try {
          // @ts-ignore
          const ai = new GoogleGenAI({ apiKey });

          // 1. REESCREVER O TEXTO
          const textModel = 'gemini-2.5-flash';
          const rewritePrompt = `
            Você é um assistente de escrita para RPG.
            Descrição Atual do Personagem: "${charData.appearance}"
            Solicitação de Mudança do Usuário: "${magicPrompt}"
            
            Tarefa: Reescreva a descrição atual para incorporar a mudança solicitada. Mantenha o tom literário, descritivo e em português.
            Mantenha detalhes importantes que não conflitem com a mudança. Seja conciso (máximo 4 frases).
            Retorne APENAS o novo texto.
          `;

          const textResponse = await ai.models.generateContent({
              model: textModel,
              contents: { parts: [{ text: rewritePrompt }] }
          });

          const newDescription = textResponse.text?.trim();
          
          if (newDescription) {
              setCharData(prev => ({ ...prev, appearance: newDescription }));
              setMagicPrompt("");
              setShowMagicEdit(false);
              
              // 2. GERAR A IMAGEM COM O NOVO TEXTO
              // Passamos o novo texto explicitamente pois o state update pode não ter propagado ainda
              await handleGeneratePortrait(newDescription);
          } else {
              throw new Error("A IA não retornou um texto válido.");
          }

      } catch (e: any) {
          console.error(e);
          alert("Erro na Edição Mágica: " + e.message);
      } finally {
          setIsMagicLoading(false);
      }
  };

  return (
    <div className="pt-24 pb-20 container mx-auto max-w-5xl px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-display text-slate-100 mb-4 drop-shadow-lg">
          Logan Rylan
        </h1>
        <p className="text-copper-500 font-serif italic text-xl">"A engrenagem que sobra é a única que pode substituir as outras."</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Coluna Esquerda: Visual e Dados Básicos */}
        <div className="md:col-span-4 space-y-8">
          <div className="bg-iron-900 border border-slate-800 rounded-lg p-1 shadow-2xl relative group overflow-hidden">
            {/* Container da Imagem */}
            <div className="aspect-[3/4] bg-gradient-to-b from-slate-200 to-slate-400 relative overflow-hidden rounded bg-iron-950">
               <img 
                 src={characterImageSrc}
                 className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${hasCustomImage ? 'mix-blend-normal' : 'opacity-90 mix-blend-normal'} ${isGenerating || isMagicLoading ? 'blur-sm scale-105' : 'group-hover:scale-105'}`}
                 alt="Logan Rylan Concept"
                 onError={(e) => {
                     e.currentTarget.src = ""; // Clear broken src
                     e.currentTarget.parentElement?.classList.add('fallback');
                 }}
               />
               
               {/* Loading Overlay */}
               {(isGenerating || isMagicLoading) && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
                       <Loader2 className="w-10 h-10 text-copper-500 animate-spin mb-2" />
                       <span className="text-xs text-copper-400 uppercase font-bold tracking-widest px-4 text-center">
                           {isMagicLoading ? "Reescrevendo a Realidade..." : "Forjando Nova Aparência..."}
                       </span>
                   </div>
               )}

               {/* Fallback Icon if image fails */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-[.fallback]:opacity-100">
                   <ImageOff className="w-12 h-12 text-slate-600" />
               </div>
               
               {/* Generate Button (Manual) */}
               <button 
                   onClick={() => handleGeneratePortrait()}
                   disabled={isGenerating || isMagicLoading}
                   className="absolute top-2 right-2 p-2 bg-iron-950/80 text-copper-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-copper-600 hover:text-white border border-slate-700 z-30 disabled:opacity-50 hover:scale-110 shadow-lg flex items-center gap-2 pr-3"
                   title="Regerar Imagem (Usa descrição atual)"
               >
                   <Wand2 className="w-5 h-5" />
                   <span className="text-[10px] font-bold uppercase hidden group-hover:inline">Regerar</span>
               </button>

               <div className="absolute inset-0 bg-gradient-to-t from-iron-900 via-transparent to-transparent opacity-60 pointer-events-none" />
               
               <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                 <div className="flex items-center gap-2 text-copper-900 font-display text-sm tracking-widest uppercase mb-1 font-bold">
                   <Anchor className="w-4 h-4" /> Exilado de Esmeltaran
                 </div>
                 <div className="h-px bg-copper-900/50 w-full" />
               </div>
            </div>
          </div>

          <div className="bg-iron-900/50 border border-slate-800/50 rounded-lg p-6 relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                <h3 className="font-display text-slate-300 text-lg">Características</h3>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`p-1.5 rounded transition-colors ${isEditing ? 'bg-copper-600 text-white' : 'text-slate-500 hover:text-copper-400'}`}
                    title={isEditing ? "Salvar Alterações" : "Editar Texto Manualmente"}
                >
                    {isEditing ? <Save className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                </button>
            </div>
            
            <ul className="space-y-3 text-sm text-slate-400 font-serif mb-6">
              <li className="flex flex-col gap-1">
                <span className="font-bold text-slate-500 text-xs uppercase">Idade</span> 
                {isEditing ? (
                    <input 
                        value={charData.age}
                        onChange={(e) => handleChange('age', e.target.value)}
                        className="bg-iron-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:border-copper-500 outline-none"
                    />
                ) : (
                    <span className="text-slate-200">{charData.age}</span>
                )}
              </li>
              <li className="flex flex-col gap-1">
                <span className="font-bold text-slate-500 text-xs uppercase">Altura</span> 
                {isEditing ? (
                    <input 
                        value={charData.height}
                        onChange={(e) => handleChange('height', e.target.value)}
                        className="bg-iron-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:border-copper-500 outline-none"
                    />
                ) : (
                    <span className="text-slate-200">{charData.height}</span>
                )}
              </li>
              <li className="flex flex-col gap-1">
                <span className="font-bold text-slate-500 text-xs uppercase">Olhos</span> 
                {isEditing ? (
                    <input 
                        value={charData.eyes}
                        onChange={(e) => handleChange('eyes', e.target.value)}
                        className="bg-iron-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:border-copper-500 outline-none"
                    />
                ) : (
                    <span className="text-slate-200">{charData.eyes}</span>
                )}
              </li>
              <li className="flex flex-col gap-1">
                <span className="font-bold text-slate-500 text-xs uppercase">Cabelo</span> 
                {isEditing ? (
                    <input 
                        value={charData.hair}
                        onChange={(e) => handleChange('hair', e.target.value)}
                        className="bg-iron-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:border-copper-500 outline-none"
                    />
                ) : (
                    <span className="text-slate-200">{charData.hair}</span>
                )}
              </li>
              <li className="flex flex-col gap-1">
                <span className="font-bold text-slate-500 text-xs uppercase">Marcas</span> 
                {isEditing ? (
                    <input 
                        value={charData.marks}
                        onChange={(e) => handleChange('marks', e.target.value)}
                        className="bg-iron-950 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:border-copper-500 outline-none"
                    />
                ) : (
                    <span className="text-slate-200">{charData.marks}</span>
                )}
              </li>
            </ul>

            <div className="border-t border-slate-800 pt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-display text-slate-300 text-sm block">Aparência & Equipamento</span>
                    
                    {!isEditing && (
                        <button 
                            onClick={() => setShowMagicEdit(!showMagicEdit)} 
                            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-colors ${showMagicEdit ? 'bg-purple-900/30 text-purple-300 border border-purple-500/50' : 'bg-iron-950 text-slate-500 hover:text-purple-400 border border-slate-700'}`}
                        >
                            <Sparkles className="w-3 h-3" /> Alterar Aparência
                        </button>
                    )}
                </div>

                {/* MAGIC EDIT PANEL */}
                {showMagicEdit && (
                    <div className="mb-4 bg-purple-900/10 border border-purple-500/30 rounded p-3 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] uppercase font-bold text-purple-400 mb-1 block">O que mudou?</label>
                        <div className="flex gap-2">
                            <input 
                                value={magicPrompt}
                                onChange={(e) => setMagicPrompt(e.target.value)}
                                placeholder="Ex: Ele agora usa uma capa vermelha e segura um escudo brilhante..."
                                className="flex-1 bg-iron-950 border border-purple-900/50 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleMagicUpdate()}
                            />
                            <button 
                                onClick={handleMagicUpdate}
                                disabled={isMagicLoading || !magicPrompt.trim()}
                                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white p-2 rounded transition-colors"
                            >
                                {isMagicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-[9px] text-purple-300/70 mt-2 italic">
                            * Isso irá reescrever a descrição abaixo e gerar uma nova imagem automaticamente.
                        </p>
                    </div>
                )}

                {isEditing ? (
                    <textarea 
                        value={charData.appearance}
                        onChange={(e) => handleChange('appearance', e.target.value)}
                        className="w-full h-40 bg-iron-950 border border-slate-700 rounded p-2 text-sm text-slate-300 font-serif leading-relaxed focus:border-copper-500 outline-none resize-none"
                    />
                ) : (
                    <p className="text-slate-400 text-sm font-serif leading-relaxed italic">
                        {charData.appearance}
                    </p>
                )}
                
                {!isEditing && !showMagicEdit && (
                    <div className="mt-3 p-2 bg-blue-900/10 border border-blue-900/30 rounded flex gap-2 items-start text-xs text-blue-300">
                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Use o botão "Alterar Aparência" para atualizar texto e imagem com IA, ou o lápis para editar o texto manualmente.</span>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Lore Detalhada */}
        <div className="md:col-span-8 space-y-8">
          <section>
            <h2 className="text-2xl font-display text-copper-500 mb-6 flex items-center gap-3">
              <Hammer className="w-6 h-6" /> Arsenal Tecnológico
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-iron-900 border border-slate-700 p-5 rounded-lg hover:border-copper-500/50 transition-colors sm:col-span-2">
                <div className="flex items-center gap-3 mb-3 text-slate-200 font-bold font-display">
                  <Hammer className="w-5 h-5 text-copper-600" />
                  Martelo de Forja (Pneumático)
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Não é uma arma de guerra comum, mas uma ferramenta de criação pesada. Reconstruído com sucata, o cabo possui um sistema pneumático de cobre. Quando imbuído pelo truque <em>Shillelagh</em>, runas druídicas convertidas em equações arcanas brilham na madeira, permitindo que Logan use seu Intelecto em vez de força bruta para desferir golpes devastadores.
                </p>
              </div>

              <div className="bg-iron-900 border border-slate-700 p-5 rounded-lg hover:border-copper-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-3 text-slate-200 font-bold font-display">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                  Ferramentas & Óculos
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Bolsas pesadas de couro presas ao cinto carregam conjuntos completos de ferramentas: Ladrão (Thieves'), Tinkerer, Smithing e Carpenter. Seus óculos de proteção (Goggles) possuem lentes intercambiáveis para análise de materiais.
                </p>
              </div>

              <div className="bg-iron-900 border border-slate-700 p-5 rounded-lg hover:border-copper-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-3 text-slate-200 font-bold font-display">
                  <Shield className="w-5 h-5 text-slate-400" />
                  Escudo Utilitário
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Aço simples com borda reforçada, mas a face interna é um painel de ferramentas. Ganchos magnéticos seguram chaves, alicates e componentes de feitiço para acesso rápido em combate.
                </p>
              </div>

            </div>
          </section>

          <section className="bg-iron-950 border-2 border-slate-800 rounded-lg relative overflow-hidden shadow-lg">
             <div className="bg-slate-900/80 p-4 border-b border-slate-800 flex items-start gap-4">
                <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                    <Skull className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold text-slate-200">Maldição de Shadowmoor</h2>
                    <p className="text-xs text-purple-400 font-mono uppercase tracking-widest mt-1">Origin Feat • Source: Lorwyn - First Light</p>
                </div>
             </div>

             <div className="p-6 font-serif text-slate-300 leading-relaxed space-y-4">
                <p className="italic text-slate-500 border-l-2 border-purple-900/50 pl-4">
                    Você carrega a marca do Grimório da Raiz Retorcida. A entropia segue seus passos, mas você aprendeu a direcioná-la.
                </p>
                
                <div className="space-y-4">
                    <div>
                        <strong className="text-copper-400 font-display block mb-1">Hex</strong>
                        <p className="text-sm">
                            You always have the <em>Hex</em> spell prepared. Intelligence is your spellcasting ability for this spell. You can cast it once without a spell slot, and you regain the ability to cast it in that way when you finish a Long Rest.
                        </p>
                    </div>

                    <div className="h-px bg-slate-800/50 w-full" />

                    <div>
                        <strong className="text-copper-400 font-display block mb-1">Curse Magic</strong>
                        <p className="text-sm">
                            When a creature that you’ve cursed with <em>Hex</em> hits you with an attack roll, the creature takes Psychic damage equal to your Proficiency Bonus.
                        </p>
                    </div>
                </div>
             </div>
          </section>

          <section>
            <h2 className="text-2xl font-display text-red-900/70 mb-6 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6" /> Antagonistas
            </h2>
            <div className="bg-gradient-to-r from-red-950/20 to-transparent border-l-4 border-red-900 pl-6 py-2">
              <h4 className="text-slate-200 font-bold mb-1">Gareth, o "Inventor"</h4>
              <p className="text-slate-500 text-sm italic">
                Antigo parceiro de laboratório. Roubou o projeto do escudo Aegis e incriminou Logan. Atualmente é celebrado como um gênio na Corte das Corujas, embora não consiga consertar nem uma torradeira sem magia.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CharacterInfo;