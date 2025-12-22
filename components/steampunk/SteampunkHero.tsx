import React from 'react';
import { motion } from 'framer-motion';
import { Gear, GearCluster } from './Gear';

export const SteampunkHero: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Cluster de engrenagens de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none scale-150">
        <div className="relative">
          <Gear size={300} teeth={32} spinning active speed="slow" />
          <div className="absolute top-[80px] left-[-60px]">
            <Gear size={150} teeth={20} spinning reverse active speed="slow" />
          </div>
          <div className="absolute top-[-30px] right-[-80px]">
            <Gear size={120} teeth={16} spinning active speed="medium" />
          </div>
          <div className="absolute bottom-[-50px] left-[100px]">
            <Gear size={100} teeth={14} spinning reverse active speed="medium" />
          </div>
        </div>
      </div>
      
      {/* Conteúdo */}
      <div className="container mx-auto max-w-4xl text-center px-4 relative z-10">
        {/* Badge superior */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-4 sp-bronze-badge px-6 py-2 rounded-full">
            <Gear size={20} teeth={8} spinning active speed="slow" />
            <span className="text-xs font-display tracking-[0.3em] uppercase text-amber-400">
              Uma Saga de Bronze & Vapor
            </span>
            <Gear size={20} teeth={8} spinning reverse active speed="slow" />
          </div>
        </motion.div>
        
        {/* Título principal */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-5xl md:text-8xl font-display leading-tight mb-8"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 sp-embossed block">
            O Mecanismo
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 sp-embossed block">
            da Sombra
          </span>
        </motion.h1>
        
        {/* Divider com engrenagens */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex items-center justify-center gap-4 mb-8"
        >
          <div className="h-px w-24 bg-gradient-to-r from-transparent to-amber-600/50" />
          <Gear size={32} teeth={10} spinning active speed="slow" />
          <div className="h-1 w-16 bg-gradient-to-r from-amber-700/80 via-amber-500/60 to-amber-700/80 rounded-full" />
          <Gear size={32} teeth={10} spinning reverse active speed="slow" />
          <div className="h-px w-24 bg-gradient-to-l from-transparent to-amber-600/50" />
        </motion.div>
        
        {/* Decoração de tubos/canos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="h-3 flex-1 max-w-xs bg-gradient-to-r from-transparent via-amber-800/30 to-amber-700/50 rounded-full" />
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-800 border-2 border-amber-600/50 shadow-lg" />
            <div className="h-3 w-32 bg-gradient-to-r from-amber-700/50 via-amber-600/30 to-amber-700/50 rounded-full" />
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-800 border-2 border-amber-600/50 shadow-lg" />
            <div className="h-3 flex-1 max-w-xs bg-gradient-to-r from-amber-700/50 via-amber-800/30 to-transparent rounded-full" />
          </div>
        </motion.div>
      </div>
      
      {/* Indicador de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-display tracking-widest uppercase text-amber-600/60">
            Desça para explorar
          </span>
          <div className="w-6 h-10 border-2 border-amber-700/50 rounded-full flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-3 bg-amber-500 rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SteampunkHero;
