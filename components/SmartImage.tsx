
import React, { useState } from 'react';
import { Loader2, ImageOff, Wand2 } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { buildJsonPrompt } from '../constants';
import { generateContentWithRetry } from '../utils/gemini';

interface SmartImageProps {
  id: string; 
  src: string; 
  prompt: string; 
  fallbackSrc: string; 
  className?: string;
  alt: string;
  aspectRatio?: string;
}

const SmartImage: React.FC<SmartImageProps> = ({ id, src, prompt, fallbackSrc, className, alt, aspectRatio = "16:9" }) => {
  const { images, setImage } = useCampaign();
  const [isGenerating, setIsGenerating] = useState(false);
  
  const dynamicImage = images?.[id]; 
  
  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    if (isGenerating) return;

    setIsGenerating(true);
    try {
        const jsonPrompt = buildJsonPrompt({
            scene: prompt,
            aspect_ratio: aspectRatio
        });

        const response = await generateContentWithRetry({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: jsonPrompt }]
            },
            config: { imageConfig: { aspectRatio: aspectRatio } }
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part && part.inlineData) {
            const base64 = `data:image/png;base64,${part.inlineData.data}`;
            setImage(id, base64);
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

  return (
    <div className={`relative overflow-hidden group ${className || ''}`}>
        <img 
          src={dynamicImage || src}
          onError={(e) => { 
            if (!dynamicImage) {
                e.currentTarget.onerror = null; 
                e.currentTarget.src = fallbackSrc; 
                e.currentTarget.parentElement?.classList.add('fallback-mode');
            }
          }}
          alt={alt || "Image"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-[.fallback-mode]:opacity-100 transition-opacity bg-iron-900/50">
            <div className="flex flex-col items-center text-slate-400">
                <ImageOff className="w-8 h-8 mb-2 opacity-50" />
            </div>
        </div>
        <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="absolute top-2 right-2 p-2 bg-iron-950/80 text-copper-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-copper-600 hover:text-white border border-slate-700 disabled:opacity-50 z-10"
            title="Materializar Imagem (Gerar com IA)"
        >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        </button>
    </div>
  );
};

export default SmartImage;
