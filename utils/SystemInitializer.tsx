import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { STORY_DATA } from '../constants';
import { Download, CheckCircle, AlertCircle, Loader2, FolderInput } from 'lucide-react';

const SystemInitializer: React.FC = () => {
  const [needsInit, setNeedsInit] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // Constants
  const HERO_PROMPT = "Dark fantasy industrial city background, magical energy lines in sky, steampunk factories, atmospheric, cinematic, wide shot, masterpiece, 8k, forgotten realms";

  useEffect(() => {
    // Check if Hero image exists to determine if we need to run
    const checkAssets = async () => {
      try {
        const res = await fetch('/images/hero.png', { method: 'HEAD' });
        if (!res.ok) {
          setNeedsInit(true);
        }
      } catch (e) {
        setNeedsInit(true);
      }
    };
    checkAssets();
  }, []);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const generateAndSave = async () => {
    if (!process.env.API_KEY) {
      addLog("ERRO: API_KEY não encontrada.");
      return;
    }

    try {
      // 1. Ask user for permission to write to public/images
      addLog("Aguardando seleção de diretório...");
      // @ts-ignore - File System Access API
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'desktop',
        id: 'project-images'
      });

      setIsGenerating(true);
      addLog("Diretório vinculado. Iniciando Protocolo de Criação...");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const totalTasks = STORY_DATA.length + 1; // Chapters + Hero
      let completed = 0;

      // Helper to generate and write
      const processImage = async (filename: string, prompt: string) => {
        addLog(`Gerando arte: ${filename}...`);
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [{ text: `${prompt}, masterpiece, 8k, oil painting style, dramatic lighting` }]
                },
                config: { imageConfig: { aspectRatio: "16:9" } }
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            
            if (part && part.inlineData) {
                // Convert Base64 to Blob
                const byteCharacters = atob(part.inlineData.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/png' });

                // Write to file
                const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                
                addLog(`[OK] Salvo: ${filename}`);
            } else {
                addLog(`[ERRO] Falha na geracao: ${filename}`);
            }
        } catch (error: any) {
            addLog(`[ERRO] Erro em ${filename}: ${error.message}`);
        }
        
        completed++;
        setProgress((completed / totalTasks) * 100);
      };

      // 1. Generate Hero
      await processImage('hero.png', HERO_PROMPT);

      // 2. Generate Chapters
      for (const chapter of STORY_DATA) {
        await processImage(`${chapter.id}.png`, chapter.imagePrompt || `Fantasy scene ${chapter.title}`);
      }

      addLog("[CONCLUIDO] Protocolo Concluido. Recarregando sistema...");
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error(error);
      addLog(`ERRO CRÍTICO: ${error.message}`);
      setIsGenerating(false);
    }
  };

  if (!needsInit) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-iron-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-iron-900 border border-copper-900/50 rounded-lg p-8 shadow-2xl relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />
        
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-copper-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-copper-500/30">
            {isGenerating ? <Loader2 className="w-8 h-8 text-copper-500 animate-spin" /> : <FolderInput className="w-8 h-8 text-copper-500" />}
          </div>

          <h2 className="text-3xl font-display text-slate-200 mb-2">Assets Ausentes Detectados</h2>
          <p className="text-slate-400 font-serif italic mb-8">
            O sistema detectou que as imagens da história ainda não foram materializadas neste plano.
          </p>

          {!isGenerating ? (
            <button
              onClick={generateAndSave}
              className="group relative inline-flex items-center justify-center px-8 py-3 font-display font-bold text-iron-950 transition-all duration-200 bg-copper-500 rounded hover:bg-copper-400 focus:outline-none ring-offset-2 focus:ring-2 ring-copper-400"
            >
              <FolderInput className="w-5 h-5 mr-2" />
              Selecionar pasta 'public/images' e Gerar
            </button>
          ) : (
            <div className="w-full bg-iron-800 rounded-full h-2 mb-4 overflow-hidden">
              <div 
                className="bg-copper-500 h-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          )}

          <div className="mt-8 h-48 overflow-y-auto bg-iron-950/50 rounded p-4 text-left font-mono text-xs border border-slate-800">
            {logs.length === 0 ? (
              <span className="text-slate-600">Aguardando inicialização...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={`mb-1 ${log.includes('ERRO') || log.includes('[ERRO]') ? 'text-red-400' : log.includes('[OK]') || log.includes('[CONCLUIDO]') ? 'text-green-400' : 'text-slate-400'}`}>
                  {log}
                </div>
              ))
            )}
            <div id="log-end" />
          </div>
          
          <p className="mt-4 text-xs text-slate-600">
            * Este processo usará sua API Key para criar as artes e a File System API para salvar no disco local.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemInitializer;