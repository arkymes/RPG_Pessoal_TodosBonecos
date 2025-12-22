
import React, { useState, useEffect } from 'react';
import { STORY_DATA, HERO_PROMPT, buildJsonPrompt } from '../constants';
import { Loader2, FolderInput, Terminal, AlertTriangle } from 'lucide-react';
import { generateContentWithRetry, sleep } from '../utils/gemini';

const SystemInitializer: React.FC = () => {
  const [needsInit, setNeedsInit] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  useEffect(() => {
    const checkAssets = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('/images/hero.png', { 
            method: 'HEAD', 
            signal: controller.signal 
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
           setNeedsInit(true);
           addLog("[AVISO] Assets visuais nao detectados.");
        }
      } catch (e) {
        setNeedsInit(true);
        addLog("[AVISO] Verificacao de arquivos falhou ou expirou.");
      }
    };
    checkAssets();
  }, []);

  const generateAndSave = async () => {
    setError(null);
    if (!process.env.API_KEY) {
      setError("API_KEY não encontrada.");
      return;
    }

    try {
      setIsGenerating(true);
      addLog("[...] Inicializando conexao com Gemini 2.5...");
      let dirHandle: any;
      try {
        addLog("[...] Selecione a pasta 'images' na raiz do seu projeto...");
         // @ts-ignore
        dirHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
            id: 'project-images',
            startIn: 'desktop'
        });
        addLog("[OK] Diretorio vinculado.");
      } catch (err: any) {
        throw new Error("Acesso ao diretório cancelado.");
      }

      const tasks = [
        { id: 'hero.png', prompt: HERO_PROMPT },
        ...STORY_DATA.map(c => ({
          id: `${c.id}.png`,
          prompt: buildJsonPrompt({
            scene: c.imagePrompt || "",
            camera_angle: c.meta?.camera_angle,
            lighting: c.meta?.lighting,
            depth_of_field: c.meta?.depth_of_field,
            composition_rules: c.meta?.composition_rules
          })
        }))
      ];

      const totalTasks = tasks.length;
      let completed = 0;

      for (const task of tasks) {
        try {
            try {
                await dirHandle.getFileHandle(task.id);
                addLog(`[INFO] ${task.id} existe. Pulando.`);
                completed++;
                setProgress(Math.round((completed / totalTasks) * 100));
                continue;
            } catch (e) { }

            addLog(`[...] Gerando: ${task.id}...`);
            
            // Add a mandatory delay between generations to respect rate limits
            if (completed > 0) {
              addLog(`[AGUARDE] Respeitando limites de cota (pausa de 3s)...`);
              await sleep(3000);
            }

            const response = await generateContentWithRetry({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: task.prompt }] },
                config: { imageConfig: { aspectRatio: "16:9" } }
            });

            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part && part.inlineData) {
                const binaryString = atob(part.inlineData.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'image/png' });
                const fileHandle = await dirHandle.getFileHandle(task.id, { create: true });
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                addLog(`[OK] Salvo: ${task.id}`);
            } else {
                throw new Error("Sem imagem na resposta.");
            }
        } catch (taskErr: any) {
            addLog(`[ERRO] Erro em ${task.id}: ${taskErr.message}`);
        }
        completed++;
        setProgress(Math.round((completed / totalTasks) * 100));
      }

      addLog("[CONCLUIDO] Recarregando...");
      await sleep(3000);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsGenerating(false);
    }
  };

  if (!needsInit) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-iron-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-iron-900 border border-copper-900/50 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-iron-800/30 via-iron-950/80 to-iron-950 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-copper-500/20 blur-xl rounded-full animate-pulse" />
            <div className="w-20 h-20 bg-iron-950 border-2 border-copper-500/50 rounded-2xl flex items-center justify-center relative">
               {isGenerating ? <Loader2 className="w-10 h-10 text-copper-500 animate-spin" /> : <Terminal className="w-10 h-10 text-copper-500" />}
            </div>
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-100 mb-2">Protocolo de Materialização</h2>
          {error && <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded flex items-center gap-3 text-red-200"><AlertTriangle className="w-5 h-5" /><p className="text-sm">{error}</p></div>}
          {!isGenerating ? <button onClick={generateAndSave} className="px-8 py-4 bg-copper-600 hover:bg-copper-500 text-white font-display font-bold rounded shadow-lg flex items-center gap-3 transition-all hover:-translate-y-1"><FolderInput className="w-6 h-6" /> GERAR NA PASTA 'IMAGES'</button> : (
            <div className="w-full max-w-lg space-y-2">
              <div className="flex justify-between text-xs font-mono text-copper-400"><span>STATUS</span><span>{progress}%</span></div>
              <div className="h-4 bg-iron-950 rounded-full overflow-hidden border border-iron-800"><div className="h-full bg-gradient-to-r from-copper-700 to-copper-500 transition-all duration-300" style={{ width: `${progress}%` }} /></div>
            </div>
          )}
          <div className="mt-8 w-full max-w-2xl bg-black/40 rounded border border-white/5 p-4 font-mono text-xs text-left h-48 overflow-y-auto shadow-inner">
             {logs.length === 0 && <span className="text-slate-600 animate-pulse">Aguardando comando...</span>}
             {logs.map((log, i) => <div key={i} className={`mb-1 ${log.includes('[ERRO]') ? 'text-red-400' : log.includes('[OK]') || log.includes('[CONCLUIDO]') ? 'text-green-400' : 'text-slate-400'}`}>{log}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemInitializer;
