import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Chapter } from '../../types';
import { Loader2, Wand2, ImageOff } from 'lucide-react';
import { useCampaign } from '../../context/CampaignContext';
import { buildJsonPrompt } from '../../constants';
import { generateContentWithRetry } from '../../utils/gemini';
import { Gear, VictorianDivider, SteampunkPanel } from './index';

interface SteampunkChapterViewProps {
  chapter: Chapter;
  index: number;
}

export const SteampunkChapterView: React.FC<SteampunkChapterViewProps> = ({ chapter, index }) => {
  const { images, setImage } = useCampaign();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasTriedAuto, setHasTriedAuto] = useState(false);
  
  const sectionRef = useRef<HTMLElement>(null);
  
  // Scroll progress para animação das engrenagens
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Transformar scroll em rotação das engrenagens
  const gearRotation = useTransform(scrollYProgress, [0, 1], [0, 720]);
  const gearRotationReverse = useTransform(scrollYProgress, [0, 1], [0, -720]);

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
      const delay = 1000 + (index * 4000);
      const timer = setTimeout(() => {
        if (!images[chapter.id]) {
          generateImage();
        }
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [dynamicImage, hasTriedAuto, index, images, chapter.id]);

  const fallbackImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 400'%3E%3Crect fill='%231a1410' width='800' height='400'/%3E%3C/svg%3E`;

  return (
    <motion.section
      ref={sectionRef}
      id={chapter.id}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative mb-32 md:mb-48 scroll-mt-24 px-4 md:px-0"
    >
      {/* ============================================
          HEADER DO CAPÍTULO - ESTILO PLACA DE BRONZE
          ============================================ */}
      <div className="flex flex-col items-center mb-12 text-center relative">
        {/* Linha decorativa de fundo */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-800/50 to-transparent -z-10" />
        
        {/* Badge do capítulo com engrenagens */}
        <div className="sp-bronze-badge px-8 py-3 rounded-full mb-6 shadow-xl relative overflow-visible">
          {/* Engrenagens nas laterais do badge */}
          <motion.div 
            className="absolute -left-4 top-1/2 -translate-y-1/2"
            style={{ rotate: gearRotation }}
          >
            <Gear size={32} teeth={10} active spinning={false} />
          </motion.div>
          <motion.div 
            className="absolute -right-4 top-1/2 -translate-y-1/2"
            style={{ rotate: gearRotationReverse }}
          >
            <Gear size={32} teeth={10} active spinning={false} />
          </motion.div>
          
          <div className="flex items-center gap-4 relative z-10">
            <span className="text-sm font-display tracking-[0.3em] uppercase text-amber-400 sp-embossed">
              {chapter.number}
            </span>
          </div>
        </div>
        
        {/* Título do capítulo */}
        <h2 className="text-4xl md:text-6xl font-display text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 mb-6 drop-shadow-[0_4px_10px_rgba(205,127,50,0.3)] max-w-2xl leading-tight sp-embossed">
          {chapter.title}
        </h2>
        
        {/* Divider decorativo */}
        <VictorianDivider showGear />
      </div>

      {/* ============================================
          FRAME DA IMAGEM - ESTILO VIEWPORT STEAMPUNK
          ============================================ */}
      <div className="relative w-full max-w-5xl mx-auto mb-16 group">
        {/* Frame exterior com rebites */}
        <div className="sp-bronze-plate sp-rivets-full p-3 rounded-lg relative">
          {/* Engrenagens decorativas nos cantos do frame */}
          <motion.div 
            className="absolute -top-4 -left-4 z-20"
            style={{ rotate: gearRotation }}
          >
            <Gear size={50} teeth={12} active spinning={false} />
          </motion.div>
          <motion.div 
            className="absolute -top-4 -right-4 z-20"
            style={{ rotate: gearRotationReverse }}
          >
            <Gear size={50} teeth={12} active spinning={false} />
          </motion.div>
          <motion.div 
            className="absolute -bottom-4 -left-4 z-20"
            style={{ rotate: gearRotationReverse }}
          >
            <Gear size={50} teeth={12} active spinning={false} />
          </motion.div>
          <motion.div 
            className="absolute -bottom-4 -right-4 z-20"
            style={{ rotate: gearRotation }}
          >
            <Gear size={50} teeth={12} active spinning={false} />
          </motion.div>
          
          {/* Frame interno de latão */}
          <div className="relative border-4 border-amber-700/60 rounded overflow-hidden">
            {/* Efeito de viewport/vidro */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-amber-950/20 pointer-events-none z-10" />
            
            {/* Imagem */}
            <div className="relative aspect-[21/9] overflow-hidden bg-stone-950">
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
                className={`
                  absolute inset-0 w-full h-full object-cover 
                  transition-all duration-1000 ease-out
                  ${isGenerating ? 'blur-sm scale-105 opacity-50' : 'group-hover:scale-105'}
                `}
                style={{
                  filter: isGenerating ? undefined : 'sepia(10%) contrast(105%)'
                }}
              />
              
              {/* Overlay de fallback */}
              {!isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-[.fallback-mode]:opacity-100 transition-opacity">
                  <div className="flex flex-col items-center text-amber-700/50">
                    <ImageOff className="w-12 h-12 mb-2 opacity-50" />
                    <span className="font-display text-xs tracking-widest uppercase">
                      Aguardando Materialização
                    </span>
                  </div>
                </div>
              )}
              
              {/* Overlay de geração */}
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/60 backdrop-blur-sm z-30">
                  <div className="relative">
                    <Gear size={60} teeth={12} spinning active speed="fast" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    </div>
                  </div>
                  <span className="font-display text-amber-400 text-sm tracking-widest uppercase mt-4 animate-pulse">
                    Forjando Visão...
                  </span>
                </div>
              )}
              
              {/* Botão de regenerar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  generateImage();
                }}
                disabled={isGenerating}
                className="
                  absolute top-4 right-4 p-3 
                  sp-bronze-plate
                  rounded-full 
                  opacity-0 group-hover:opacity-100 
                  transition-all duration-300 
                  hover:scale-110
                  disabled:opacity-50 
                  z-30
                  border-2 border-amber-600/50
                "
                title="Regenerar Imagem com IA"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                ) : (
                  <Wand2 className="w-5 h-5 text-amber-400" />
                )}
              </button>
              
              {/* Gradiente inferior */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-60 pointer-events-none" />
            </div>
          </div>
        </div>
        
        {/* Glow de fundo */}
        <div className="absolute -bottom-10 left-10 right-10 h-20 bg-amber-500/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      {/* ============================================
          TEXTO DO CAPÍTULO - COM ENGRENAGENS LATERAIS
          ============================================ */}
      <div className="relative max-w-3xl mx-auto">
        {/* Engrenagens laterais que "puxam" o texto */}
        <div className="hidden lg:block absolute -left-24 top-0 bottom-0 pointer-events-none">
          <div className="sticky top-1/2 -translate-y-1/2">
            <motion.div style={{ rotate: gearRotation }}>
              <Gear size={60} teeth={14} active spinning={false} />
            </motion.div>
            <div className="h-32 w-1 bg-gradient-to-b from-amber-700/50 via-amber-600/30 to-amber-700/50 mx-auto my-2 rounded-full" />
            <motion.div style={{ rotate: gearRotationReverse }}>
              <Gear size={50} teeth={12} active spinning={false} />
            </motion.div>
          </div>
        </div>
        
        <div className="hidden lg:block absolute -right-24 top-0 bottom-0 pointer-events-none">
          <div className="sticky top-1/2 -translate-y-1/2">
            <motion.div style={{ rotate: gearRotationReverse }}>
              <Gear size={60} teeth={14} active spinning={false} />
            </motion.div>
            <div className="h-32 w-1 bg-gradient-to-b from-amber-700/50 via-amber-600/30 to-amber-700/50 mx-auto my-2 rounded-full" />
            <motion.div style={{ rotate: gearRotation }}>
              <Gear size={50} teeth={12} active spinning={false} />
            </motion.div>
          </div>
        </div>
        
        {/* Container do texto estilo pergaminho/placa */}
        <div className="sp-bronze-plate sp-rivets rounded-xl p-8 relative overflow-hidden">
          {/* Textura de papel/pergaminho por cima */}
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }}
          />
          
          {/* Texto */}
          <div className="prose prose-invert prose-lg md:prose-xl max-w-none font-serif leading-relaxed text-amber-100/90 relative z-10">
            {paragraphs.map((para, i) => {
              const processedText = para.split('*').map((part, idx) => {
                return idx % 2 === 1 ? (
                  <em key={idx} className="text-amber-400 font-medium not-italic">
                    {part}
                  </em>
                ) : part;
              });
              
              return (
                <p
                  key={i}
                  className={`
                    mb-8 text-lg md:text-xl text-justify
                    ${i === 0 ? 'first-letter:text-6xl first-letter:font-display first-letter:text-amber-500 first-letter:float-left first-letter:mr-4 first-letter:mt-[-8px] first-letter:drop-shadow-[0_0_10px_rgba(217,119,6,0.5)]' : ''}
                  `}
                >
                  {processedText}
                </p>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Divider final */}
      <div className="flex justify-center mt-16">
        <div className="flex items-center gap-4 opacity-50">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-600/50" />
          <Gear size={24} teeth={8} spinning active speed="slow" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-600/50" />
        </div>
      </div>
    </motion.section>
  );
};

export default SteampunkChapterView;
