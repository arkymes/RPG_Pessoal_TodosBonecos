import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer, Eye, ShieldAlert, Skull, Anchor, Pencil, Save, Wand2, Loader2, RefreshCw, Shield } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useCampaign } from '../context/CampaignContext';

const CharacterInfo: React.FC = () => {
  const { images, setImage } = useCampaign();
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [showImgPrompt, setShowImgPrompt] = useState(false);
  const [imgPromptText, setImgPromptText] = useState("");
  
  // Estado para os dados editáveis
  const [charData, setCharData] = useState({
    age: "19 anos",
    height: "1.41m (Muito baixo)",
    eyes: "Castanhos (Cercados de olheiras profundas)",
    hair: "Preto, corte irregular",
    marks: "Cicatrizes de queimadura nas mãos, cheiro de ozônio",
    appearance: "Logan não se parece com um herói clássico. Extremamente baixo (1.41m) mas com proporções humanas, ele desaparece dentro de sua armadura de talas (Splint Armor) personalizada. A armadura é uma colcha de retalhos de engenharia: tiras de aço vertical rebitadas sobre couro reforçado, com juntas hidráulicas e polias expostas que auxiliam seus movimentos, compensando sua falta de massa muscular com vantagem mecânica. Seu rosto é claro, focado e estoico, sem sinais de doença, apenas uma determinação silenciosa."
  });

  const handleChange = (field: string, value: string) => {
    setCharData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateImage = async () => {
    if (!process.env.API_KEY) {
        alert("API Key não configurada no ambiente.");
        return;
    }

    setIsGeneratingImg(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const currentImage = images['logan_portrait'];
        
        let contents;
        // Prompt base com descrição física TRAVADA para evitar "velhos" ou "homens parrudos" e garantir altura
        const basePrompt = "Full body character concept of Logan Rylan, young human male (18 years old), height 1.41m (very short stature but strictly human proportions, not a dwarf, not a gnome), lean and wiry athletic build, messy black hair, fair skin, focused eyes. Wearing custom splint armor (vertical metal strips over leather) with exposed hydraulic pistons and gears that look like a support exoskeleton. Holding a heavy pneumatic warhammer with glowing blue copper tubes. Stoic, serene, emotionless expression. Steampunk D&D 5e art style, masterpiece. Isolated on pure white background.";
        
        if (currentImage && imgPromptText.trim()) {
            const cleanBase64 = currentImage.split(',')[1] || currentImage;
            contents = {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
                    { text: `Edit this character: ${imgPromptText}. Keep him young, extremely short (1.41m) and human proportions with stoic expression. Keep white background.` }
                ]
            };
        } else {
            const finalPrompt = imgPromptText.trim() 
                ? `${basePrompt} Feature: ${imgPromptText}`
                : basePrompt;
                
            contents = {
                parts: [{ text: finalPrompt }]
            };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: contents,
            config: {
                imageConfig: { aspectRatio: "3:4" }
            }
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (part && part.inlineData) {
            const base64Image = `data:image/png;base64,${part.inlineData.data}`;
            await setImage('logan_portrait', base64Image); // Await para garantir que não houve erro no DB
            setShowImgPrompt(false);
            setImgPromptText("");
        } else {
            alert("Não foi possível gerar a imagem. A IA não retornou dados.");
        }
    } catch (error: any) {
        console.error(error);
        alert(`Erro ao gerar: ${error.message || "Falha de conexão"}`);
    } finally {
        setIsGeneratingImg(false);
    }
  };

  const characterImageSrc = images['logan_portrait'] || "/images/logan.png";
  const hasCustomImage = !!images['logan_portrait'];

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
            <div className="aspect-[3/4] bg-gradient-to-b from-slate-200 to-slate-400 relative overflow-hidden rounded">
               <img 
                 src={characterImageSrc}
                 className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${hasCustomImage ? 'mix-blend-multiply' : 'opacity-90'} group-hover:scale-105`}
                 alt="Logan Rylan Concept"
                 onError={(e) => {
                     e.currentTarget.src = "https://placehold.co/600x800/1a101f/fbbf24?text=Logan+Rylan";
                     e.currentTarget.classList.remove('mix-blend-multiply');
                 }}
               />
               
               <div className="absolute inset-0 bg-gradient-to-t from-iron-900 via-transparent to-transparent opacity-60 pointer-events-none" />
               
               <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                 <div className="flex items-center gap-2 text-copper-900 font-display text-sm tracking-widest uppercase mb-1 font-bold">
                   <Anchor className="w-4 h-4" /> Exilado de Esmeltaran
                 </div>
                 <div className="h-px bg-copper-900/50 w-full" />
               </div>

               <button 
                  onClick={() => setShowImgPrompt(!showImgPrompt)}
                  className="absolute top-2 right-2 p-2 bg-iron-900/80 text-copper-500 rounded-full hover:bg-copper-600 hover:text-white transition-all shadow-lg z-20"
                  title="Alterar Aparência do Personagem"
               >
                  <Wand2 className="w-4 h-4" />
               </button>
            </div>

            {/* Painel de Edição da Imagem */}
            {showImgPrompt && (
                <div className="absolute inset-0 bg-iron-950/95 z-30 flex flex-col p-4 animate-in fade-in duration-200">
                    <h3 className="text-copper-500 font-display text-sm mb-2 flex items-center gap-2">
                        <Wand2 className="w-4 h-4" />
                        {hasCustomImage ? "Editar Visual Atual" : "Gerar Novo Visual"}
                    </h3>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                        {hasCustomImage 
                            ? "Descreva o que mudou (ex: 'adicionar uma capa de couro', 'colocar óculos'). A IA tentará manter a identidade atual." 
                            : "Descreva detalhes específicos para gerar o retrato inicial (armadura, martelo, etc)."}
                    </p>
                    <textarea 
                        value={imgPromptText}
                        onChange={(e) => setImgPromptText(e.target.value)}
                        placeholder={hasCustomImage ? "Ex: Adicionar cicatriz no rosto..." : "Ex: Vestindo armadura pesada e segurando martelo..."}
                        className="w-full flex-1 bg-iron-900 border border-slate-700 rounded p-2 text-sm text-slate-200 focus:border-copper-500 outline-none resize-none mb-3"
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowImgPrompt(false)}
                            className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-300 border border-slate-700 rounded"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleGenerateImage}
                            disabled={isGeneratingImg}
                            className="flex-1 py-2 bg-copper-600 text-iron-950 text-xs font-bold rounded hover:bg-copper-500 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isGeneratingImg ? <Loader2 className="w-3 h-3 animate-spin" /> : (hasCustomImage ? <RefreshCw className="w-3 h-3" /> : <Wand2 className="w-3 h-3" />)}
                            {hasCustomImage ? "Atualizar" : "Gerar"}
                        </button>
                    </div>
                </div>
            )}
          </div>

          <div className="bg-iron-900/50 border border-slate-800/50 rounded-lg p-6 relative">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                <h3 className="font-display text-slate-300 text-lg">Características</h3>
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`p-1.5 rounded transition-colors ${isEditing ? 'bg-copper-600 text-white' : 'text-slate-500 hover:text-copper-400'}`}
                    title={isEditing ? "Salvar Alterações" : "Editar Grimório"}
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
                <span className="font-display text-slate-300 text-sm mb-2 block">Aparência</span>
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
              
              <div className="bg-iron-900 border border-slate-700 p-5 rounded-lg hover:border-copper-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-3 text-slate-200 font-bold font-display">
                  <Hammer className="w-5 h-5 text-copper-600" />
                  Martelo Pneumático (Modificado)
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Reconstruído a partir de sucata gnômica. Um sistema de tubos de cobre percorre o cabo, brilhando com luz azul-pálida quando ativo (True Strike). O impacto libera vapor superaquecido. Feio, pesado, mas compensa a falta de força física com propulsão bruta.
                </p>
              </div>

              <div className="bg-iron-900 border border-slate-700 p-5 rounded-lg hover:border-copper-500/50 transition-colors">
                <div className="flex items-center gap-3 mb-3 text-slate-200 font-bold font-display">
                  <Anchor className="w-5 h-5 text-emerald-600" />
                  Tridente de Foco
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Arma secundária de alcance. Canaletas entalhadas no freixo conduzem mana até as pontas de aço, que brilham em verde esmeralda. Projetado para perfuração precisa em pontos vitais de armaduras inimigas.
                </p>
              </div>

              <div className="bg-iron-900 border border-slate-700 p-5 rounded-lg hover:border-copper-500/50 transition-colors sm:col-span-2">
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