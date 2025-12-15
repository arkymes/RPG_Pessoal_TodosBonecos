import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Hammer, Scroll } from 'lucide-react';

const Hero: React.FC = () => {
  const heroImage = "/images/hero.png";
  // Just a simple visual fallback in case image is broken, but SystemInitializer should handle existence
  const fallbackImage = "https://picsum.photos/1920/1080?grayscale&blur=5"; 

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-iron-950">
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0"
        >
            <img 
            src={heroImage} 
            onError={(e) => { e.currentTarget.src = fallbackImage; e.currentTarget.classList.add('opacity-20', 'mix-blend-color-dodge'); }}
            alt="Atmospheric Background" 
            className="w-full h-full object-cover opacity-40 mix-blend-normal"
            />
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-iron-950/80 via-iron-950/60 to-iron-950" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-40 mix-blend-overlay" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex justify-center gap-4 mb-6 text-copper-500/80"
        >
          <Hammer className="w-6 h-6" />
          <Scroll className="w-6 h-6" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-slate-200 tracking-tight mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.15)]"
        >
          O Mecanismo <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-slate-500">
            da Sombra
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-lg md:text-2xl font-serif italic text-copper-400/90 mb-12 tracking-wide"
        >
          A Saga de Logan Rylan
        </motion.p>

        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ duration: 1.5, delay: 1 }}
          className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-auto mb-8"
        />

        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="text-xs md:text-sm font-sans text-slate-500 uppercase tracking-[0.3em]"
        >
            Forgotten Realms • 5.5 One D&D
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, delay: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 cursor-pointer hover:text-copper-400 transition-colors"
        onClick={() => document.getElementById('chapter-1')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <ChevronDown className="w-8 h-8" />
      </motion.div>
    </div>
  );
};

export default Hero;