import React from 'react';
import { motion } from 'framer-motion';
import { Flame, EmberParticles, AshParticles, FireSpirit } from './Flame';

interface WildfireHeroProps {
  onScrollDown?: () => void;
}

const WildfireHero: React.FC<WildfireHeroProps> = ({ onScrollDown }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0">
        {/* Gradiente de floresta queimada */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#1a0800] to-[#1a1a1a]" />
        
        {/* Efeito de árvores queimadas nas laterais */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent" />
        </div>
        
        {/* Brilho de fogo no horizonte */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-orange-900/20 via-red-900/10 to-transparent" />
        
        {/* Partículas */}
        <EmberParticles count={20} />
        <AshParticles count={30} />
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto max-w-4xl text-center px-4 relative z-10">
        {/* Badge superior */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-4 wf-stone-circle px-6 py-2 rounded-full">
            <Flame size={20} active color="ember" />
            <span className="text-xs font-uncial tracking-[0.3em] uppercase text-orange-400">
              Uma Saga de Fogo & Renascimento
            </span>
            <Flame size={20} active color="sprout" />
          </div>
        </motion.div>
        
        {/* Título principal */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-5xl md:text-8xl font-uncial leading-tight mb-8"
        >
          <span className="text-transparent bg-clip-text wf-burning-text block">
            Renascimento
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-orange-400 via-red-600 to-red-900 wf-embossed block">
            das Cinzas
          </span>
        </motion.h1>
        
        {/* Divider com chamas */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-orange-600/50" />
          <Flame size={32} active color="ember" />
          <div className="h-1 w-16 bg-gradient-to-r from-orange-700/80 via-orange-500/60 to-orange-700/80 rounded-full" />
          <FireSpirit size={40} />
          <div className="h-1 w-16 bg-gradient-to-r from-orange-700/80 via-orange-500/60 to-orange-700/80 rounded-full" />
          <Flame size={32} active color="sprout" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-orange-600/50" />
        </motion.div>
        
        {/* Decoração de raízes/vinhas queimadas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="h-3 flex-1 max-w-xs bg-gradient-to-r from-transparent via-red-900/30 to-orange-700/50 rounded-full" />
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-lime-400 to-green-600 shadow-[0_0_10px_rgba(124,252,0,0.5)]" />
            <div className="h-3 w-32 bg-gradient-to-r from-orange-700/50 via-red-800/30 to-orange-700/50 rounded-full" />
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-lime-400 to-green-600 shadow-[0_0_10px_rgba(124,252,0,0.5)]" />
            <div className="h-3 flex-1 max-w-xs bg-gradient-to-r from-orange-700/50 via-red-900/30 to-transparent rounded-full" />
          </div>
        </motion.div>
      </div>
      
      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
        onClick={onScrollDown}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-orange-500/60 font-uncial tracking-wider">Desça para explorar</span>
          <Flame size={24} active color="ember" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default WildfireHero;
