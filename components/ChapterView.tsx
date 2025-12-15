import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chapter } from '../types';
import { Settings, Sparkles, ImageOff, Loader2 } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { GoogleGenAI } from "@google/genai";

interface ChapterViewProps {
  chapter: Chapter;
  index: number;
}

const ChapterView: React.FC<ChapterViewProps> = ({ chapter, index }) => {
  const { images, setImage } = useCampaign();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasTriedAuto, setHasTriedAuto] = useState(false);

  const paragraphs = chapter.content.split('\n\n');
  
  const dynamicImage = images[chapter.id];
  const staticImage = `/images/${chapter.id}.png`;
  
  // Prompt builder completo com o estilo
  const fullPrompt = `${chapter.imagePrompt}, masterpiece, 8k, highly detailed, cinematic lighting, forgotten realms style, oil painting texture, dramatic atmosphere`;

  // Função de Geração
  const generateImage = async () => {
      // Safety check for environment
      // @ts-ignore
      const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : null;

      if (!apiKey || isGenerating) return;

      setIsGenerating(true);
      
      try {
          // @ts-ignore
          const ai = new GoogleGenAI({ apiKey: apiKey });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: [{ text: fullPrompt }]
              },
              config: { imageConfig: { aspectRatio: "16:9" } }
          });

          const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          if (part && part.inlineData) {
              const base64 = `data:image/png;base64,${part.inlineData.data}`;
              setImage(chapter.id, base64);
          }
      } catch (e: any) {
          console.error(`Erro ao gerar cap ${chapter.id}:`, e);
      } finally {
          setIsGenerating(false);
      }
  };

  // Efeito para Auto-Geração
  useEffect(() => {
      // Se não tem imagem no contexto e ainda não tentamos gerar nesta sessão
      if (!dynamicImage && !hasTriedAuto && !isGenerating) {
          setHasTriedAuto(true);
          
          // Delay escalonado baseado no índice para não sobrecarregar a API
          // Capítulo 1 começa em 1s, Cap 2 em 3s, Cap 3 em 5s, etc.
          const delay = 1000 + (index * 2000);
          
          const timer = setTimeout(() => {
              // Verifica novamente se a imagem apareceu (ex: carregou do cache nesse meio tempo)
              if (!images[chapter.id]) {
                  generateImage();
              }
          }, delay);

          return () => clearTimeout(timer);
      }
  }, [dynamicImage, hasTriedAuto, index, images, chapter.id]);

  const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Crect fill='%230f172a' width='800' height='400'/%3E%3Cpath d='M400 350 L400 350' stroke='%23334155' stroke-width='2'/%3E%3C/svg%3E`;

  return (
    <motion.section
      id={chapter.id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative mb-32 md:mb-48 scroll-mt-24 px-4 md:px-0"
    >
      {/* Decorative Chapter Header */}
      <div className="flex flex-col items-center mb-12 text-center relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent -z-10" />
        
        <div className="bg-iron-950 px-6 py-2 border border-slate-800/50 rounded-full mb-4 shadow-xl">
            <div className="flex items-center gap-3 text-copper-500 opacity-90">
            <Settings className={`w-3 h-3 text-copper-600 ${index % 2 === 0 ? 'animate-[spin_10s_linear_infinite]' : 'animate-[spin_10s_linear_infinite_reverse]'}`} />
            <span className="text-xs font-display tracking-[0.3em] uppercase text-slate-400">{chapter.number}</span>
            <Settings className={`w-3 h-3 text-copper-600 ${index % 2 === 0 ? 'animate-[spin_10s_linear_infinite_reverse]' : 'animate-[spin_10s_linear_infinite]'}`} />
            </div>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-display text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-500 mb-6 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] max-w-2xl leading-tight">
          {chapter.title}
        </h2>
      </div>

      {/* Chapter Image with RPG Frame */}
      <div className="relative w-full max-w-5xl mx-auto mb-16 group perspective-1000">
        
        {/* The Frame */}
        <div className="relative rounded-lg p-1 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl">
            {/* Inner Gold Border */}
            <div className="absolute inset-[3px] border border-copper-500/30 rounded z-20 pointer-events-none" />
            
            <div className="relative aspect-[21/9] overflow-hidden rounded bg-iron-900">
                <img 
                src={dynamicImage || staticImage}
                onError={(e) => { 
                    if (!dynamicImage) {
                        e.currentTarget.onerror = null; 
                        e.currentTarget.src = fallbackImage; 
                        e.currentTarget.parentElement?.classList.add('fallback-mode');
                    }
                }}
                alt={chapter.title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out ${isGenerating ? 'blur-sm scale-105 opacity-50' : 'group-hover:scale-105 group-hover:contrast-110'}`}
                />
                
                {/* Fallback Warning */}
                {!isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-[.fallback-mode]:opacity-100 transition-opacity">
                        <div className="flex flex-col items-center text-slate-700">
                            <ImageOff className="w-12 h-12 mb-2 opacity-50" />
                            <span className="font-display text-xs tracking-widest uppercase">Aguardando Materialização</span>
                        </div>
                    </div>
                )}

                {/* Loading State Overlay */}
                {isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                        <Loader2 className="w-10 h-10 text-copper-500 animate-spin mb-3" />
                        <span className="font-display text-copper-400 text-sm tracking-widest uppercase animate-pulse">Materializando Visão...</span>
                    </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-iron-950 via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>
        </div>
        
        {/* Reflection/Glow below image */}
        <div className="absolute -bottom-10 left-10 right-10 h-20 bg-copper-500/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      {/* Text Content */}
      <div className="prose prose-invert prose-lg md:prose-xl max-w-3xl mx-auto font-serif leading-relaxed text-slate-300 relative">
        {paragraphs.map((para, i) => {
          const processedText = para.split('*').map((part, idx) => {
             return idx % 2 === 1 ? <em key={idx} className="text-copper-400 font-medium not-italic">{part}</em> : part;
          });

          return (
            <p key={i} className={`mb-8 text-lg md:text-xl text-justify ${i === 0 ? 'first-letter:text-6xl first-letter:font-display first-letter:text-copper-500 first-letter:float-left first-letter:mr-4 first-letter:mt-[-8px] first-letter:shadow-sm' : ''}`}>
              {processedText}
            </p>
          );
        })}
      </div>

      {/* Chapter Footer Icon */}
      <div className="flex justify-center mt-16 opacity-30">
        <div className="flex items-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-600" />
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-600" />
        </div>
      </div>
    </motion.section>
  );
};

export default ChapterView;