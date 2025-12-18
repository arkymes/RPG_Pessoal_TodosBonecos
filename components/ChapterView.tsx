
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Chapter } from '../types';
import { Settings, Sparkles, ImageOff, Loader2, Wand2 } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { buildJsonPrompt } from '../constants';
import { generateContentWithRetry } from '../utils/gemini';

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
  
  const generateImage = async () => {
      if (isGenerating) return;
      setIsGenerating(true);
      
      try {
          const jsonPrompt = buildJsonPrompt({
              scene: chapter.imagePrompt || "",
              camera_angle: chapter.meta?.camera_angle,
              lighting: chapter.meta?.lighting,
              depth_of_field: chapter.meta?.depth_of_field,
              composition_rules: chapter.meta?.composition_rules
          });

          const response = await generateContentWithRetry({
              model: 'gemini-2.5-flash-image',
              contents: {
                  parts: [{ text: jsonPrompt }]
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
          alert(`Erro ao gerar imagem: ${e.message}`);
      } finally {
          setIsGenerating(false);
      }
  };

  useEffect(() => {
      if (!dynamicImage && !hasTriedAuto && !isGenerating) {
          setHasTriedAuto(true);
          const delay = 1000 + (index * 4000); // Increased delay to avoid burst limits
          const timer = setTimeout(() => {
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

      <div className="relative w-full max-w-5xl mx-auto mb-16 group perspective-1000">
        <div className="relative rounded-lg p-1 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl">
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
                {!isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-[.fallback-mode]:opacity-100 transition-opacity">
                        <div className="flex flex-col items-center text-slate-700">
                            <ImageOff className="w-12 h-12 mb-2 opacity-50" />
                            <span className="font-display text-xs tracking-widest uppercase">Aguardando Materialização</span>
                        </div>
                    </div>
                )}
                {isGenerating && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-30">
                        <Loader2 className="w-10 h-10 text-copper-500 animate-spin mb-3" />
                        <span className="font-display text-copper-400 text-sm tracking-widest uppercase animate-pulse">Materializando Visão...</span>
                    </div>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); generateImage(); }}
                    disabled={isGenerating}
                    className="absolute top-4 right-4 p-3 bg-iron-950/80 text-copper-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-copper-600 hover:text-white border border-slate-700 disabled:opacity-50 z-30 shadow-lg backdrop-blur-sm hover:scale-110"
                    title="Regenerar Imagem com IA"
                >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-iron-950 via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>
        </div>
        <div className="absolute -bottom-10 left-10 right-10 h-20 bg-copper-500/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

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
