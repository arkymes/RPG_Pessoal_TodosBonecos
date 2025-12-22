import React from 'react';
import { motion } from 'framer-motion';
import { Flame, EmberParticles, AshParticles } from './Flame';

interface Chapter {
  number: string;
  title: string;
  content: string;
  imagePrompt?: string;
}

interface WildfireChapterViewProps {
  chapter: Chapter;
  imageUrl?: string;
  isGenerating?: boolean;
  onGenerateImage?: () => void;
}

// Divisor de vinha queimada
const BurnedVineDivider: React.FC<{ showFlame?: boolean }> = ({ showFlame = true }) => {
  return (
    <div className="wf-vine-divider my-8">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-800/50 to-orange-600/30" />
        {showFlame && <Flame size={20} active color="ember" />}
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-orange-800/50 to-orange-600/30" />
      </div>
    </div>
  );
};

const WildfireChapterView: React.FC<WildfireChapterViewProps> = ({
  chapter,
  imageUrl,
  isGenerating = false,
  onGenerateImage
}) => {
  return (
    <article className="relative py-16">
      <div className="container mx-auto max-w-4xl px-4">
        {/* ============================================
            HEADER DO CAPÍTULO
            ============================================ */}
        <div className="text-center mb-16 relative">
          {/* Partículas */}
          <div className="absolute inset-0 overflow-hidden">
            <EmberParticles count={8} />
          </div>
          
          {/* Linha decorativa de fundo */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-800/50 to-transparent -z-10" />
          
          {/* Badge do capítulo */}
          <div className="wf-stone-circle px-8 py-3 rounded-full mb-6 shadow-xl relative overflow-visible inline-flex items-center gap-4">
            <Flame size={24} active color="ember" />
            <span className="text-sm font-uncial tracking-[0.3em] uppercase text-orange-400 wf-embossed">
              {chapter.number}
            </span>
            <Flame size={24} active color="ember" />
          </div>
          
          {/* Título do capítulo */}
          <h2 className="text-4xl md:text-6xl font-uncial text-transparent bg-clip-text wf-burning-text mb-6 max-w-2xl mx-auto leading-tight">
            {chapter.title}
          </h2>
          
          {/* Divider decorativo */}
          <BurnedVineDivider showFlame />
        </div>

        {/* ============================================
            FRAME DA IMAGEM
            ============================================ */}
        {(imageUrl || onGenerateImage) && (
          <div className="relative w-full max-w-3xl mx-auto mb-16 group">
            {/* Frame de madeira queimada */}
            <div className="wf-charred-wood wf-ember-glow p-3 rounded-lg relative">
              {/* Partículas de brasa ao redor */}
              <EmberParticles count={6} />
              
              {/* Container da imagem */}
              <div className="relative aspect-video rounded overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]">
                {isGenerating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Flame size={48} active color="ember" />
                    <p className="font-merriweather text-orange-400 mt-4 animate-pulse">
                      Invocando as chamas...
                    </p>
                  </div>
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={chapter.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <button
                    onClick={onGenerateImage}
                    className="absolute inset-0 flex flex-col items-center justify-center hover:bg-orange-900/10 transition-colors"
                  >
                    <Flame size={48} active={false} color="ember" />
                    <p className="font-merriweather text-gray-500 mt-4">
                      Clique para gerar imagem
                    </p>
                  </button>
                )}
                
                {/* Overlay de brilho */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* ============================================
            TEXTO DO CAPÍTULO
            ============================================ */}
        <div className="relative">
          {/* Chamas laterais flutuantes no texto */}
          <motion.div 
            className="absolute -left-16 top-20 hidden xl:block opacity-20"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Flame size={32} active color="ember" />
          </motion.div>
          
          <motion.div 
            className="absolute -right-16 top-40 hidden xl:block opacity-20"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          >
            <Flame size={28} active color="sprout" />
          </motion.div>

          {/* Conteúdo do texto */}
          <div className="wf-charred-wood wf-ember-glow rounded-lg p-8 md:p-12 relative overflow-hidden">
            {/* Partículas sutis */}
            <AshParticles count={5} />
            
            {/* Texto */}
            <div className="prose prose-invert prose-orange max-w-none relative z-10">
              {chapter.content.split('\n\n').map((paragraph, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="font-merriweather text-gray-200 leading-relaxed mb-6 first-letter:text-4xl first-letter:font-uncial first-letter:text-orange-400 first-letter:mr-1 first-letter:float-left"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </div>
        </div>

        {/* Divisor final */}
        <BurnedVineDivider />
        
        {/* Broto verde no final (símbolo de renascimento) */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="w-4 h-4 rounded-full bg-gradient-to-br from-lime-400 to-green-600 shadow-[0_0_15px_rgba(124,252,0,0.6)]"
          />
        </div>
      </div>
    </article>
  );
};

export default WildfireChapterView;
