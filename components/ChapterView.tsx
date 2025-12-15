import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Chapter } from '../types';
import { Settings, Sparkles, ImageOff, Wand2, Loader2 } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { GoogleGenAI } from "@google/genai";

interface ChapterViewProps {
  chapter: Chapter;
  index: number;
}

const ChapterView: React.FC<ChapterViewProps> = ({ chapter, index }) => {
  const { images, setImage } = useCampaign();
  const [isGenerating, setIsGenerating] = useState(false);

  const paragraphs = chapter.content.split('\n\n');
  
  // Lógica de Prioridade da Imagem:
  // 1. Imagem gerada dinamicamente (no contexto)
  // 2. Imagem estática (no arquivo)
  // 3. Fallback
  const dynamicImage = images[chapter.id];
  const staticImage = `/images/${chapter.id}.png`;
  
  const handleGenerate = async () => {
      if (!process.env.API_KEY) {
          alert("Erro: API Key não encontrada.");
          return;
      }

      setIsGenerating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: [{ text: `${chapter.imagePrompt}, masterpiece, 8k, highly detailed, cinematic lighting, forgotten realms style, oil painting` }]
              },
              config: { imageConfig: { aspectRatio: "16:9" } }
          });

          const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          if (part && part.inlineData) {
              const base64 = `data:image/png;base64,${part.inlineData.data}`;
              setImage(chapter.id, base64);
          } else {
              alert("Falha ao gerar imagem.");
          }
      } catch (e: any) {
          console.error(e);
          alert(`Erro: ${e.message}`);
      } finally {
          setIsGenerating(false);
      }
  };

  const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Crect fill='%230f172a' width='800' height='400'/%3E%3Cpath d='M400 350 L400 350' stroke='%23334155' stroke-width='2'/%3E%3C/svg%3E`;

  return (
    <motion.section
      id={chapter.id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative mb-24 md:mb-32 scroll-mt-24 px-4 md:px-0"
    >
      {/* Decorative Chapter Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="flex items-center gap-3 text-copper-500 mb-2 opacity-80">
          <Settings className={`w-4 h-4 ${index % 2 === 0 ? 'animate-[spin_10s_linear_infinite]' : 'animate-[spin_10s_linear_infinite_reverse]'}`} />
          <span className="text-sm font-display tracking-widest uppercase">{chapter.number}</span>
          <Settings className={`w-4 h-4 ${index % 2 === 0 ? 'animate-[spin_10s_linear_infinite_reverse]' : 'animate-[spin_10s_linear_infinite]'}`} />
        </div>
        
        <h2 className="text-3xl md:text-5xl font-display text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-400 mb-6 drop-shadow-lg">
          {chapter.title}
        </h2>

        {/* Decorative Divider */}
        <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-copper-600 to-transparent mb-12 opacity-50" />
      </div>

      {/* Chapter Image */}
      <div className="relative w-full aspect-[21/9] mb-12 rounded-lg overflow-hidden border border-slate-800 shadow-2xl group bg-iron-900">
        <img 
          src={dynamicImage || staticImage}
          onError={(e) => { 
            if (!dynamicImage) { // Só usa fallback se não tivermos imagem gerada
                e.currentTarget.onerror = null; 
                e.currentTarget.src = fallbackImage; 
                e.currentTarget.parentElement?.classList.add('fallback-mode');
            }
          }}
          alt={chapter.title}
          className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
        />
        
        {/* Aviso discreto caso esteja no modo fallback e sem imagem dinâmica */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-[.fallback-mode]:opacity-100 transition-opacity">
            <div className="flex flex-col items-center text-slate-700">
                <ImageOff className="w-12 h-12 mb-2 opacity-50" />
                <span className="font-display text-xs tracking-widest uppercase">Aguardando Materialização</span>
            </div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-iron-950 via-iron-950/20 to-transparent pointer-events-none" />

        {/* Botão de Geração */}
        <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="absolute top-4 right-4 p-2 bg-iron-950/80 text-copper-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-copper-600 hover:text-white border border-slate-700 disabled:opacity-50"
            title="Materializar Imagem (Gerar com IA)"
        >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Text Content */}
      <div className="prose prose-invert prose-lg md:prose-xl max-w-3xl mx-auto font-serif leading-relaxed text-slate-300">
        {paragraphs.map((para, i) => {
          const processedText = para.split('*').map((part, idx) => {
             return idx % 2 === 1 ? <em key={idx} className="text-copper-400">{part}</em> : part;
          });

          return (
            <p key={i} className={`mb-6 ${i === 0 ? 'first-letter:text-5xl first-letter:font-display first-letter:text-copper-500 first-letter:float-left first-letter:mr-3 first-letter:mt-[-6px]' : ''}`}>
              {processedText}
            </p>
          );
        })}
      </div>

      {/* Chapter Footer Icon */}
      <div className="flex justify-center mt-12 opacity-30">
        <Sparkles className="w-6 h-6 text-purple-400" />
      </div>
    </motion.section>
  );
};

export default ChapterView;