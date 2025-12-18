
import { GoogleGenAI } from "@google/genai";

/**
 * Executa uma geração de conteúdo com retry e backoff exponencial para lidar com limites de taxa (429).
 */
export async function generateContentWithRetry(params: {
  model: string;
  contents: any;
  config?: any;
  retries?: number;
  baseDelay?: number;
}) {
  const { model, contents, config, retries = 3, baseDelay = 3000 } = params;
  
  if (!process.env.API_KEY) {
    throw new Error("API Key não configurada.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  for (let i = 0; i < retries; i++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config
      });
      return response;
    } catch (error: any) {
      const isRateLimit = error.message?.includes('429') || 
                          error.status === 429 || 
                          error.message?.toLowerCase().includes('resource_exhausted');
      
      if (isRateLimit && i < retries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        console.warn(`Gemini API Rate Limit (429). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error("Falha após múltiplas tentativas.");
}

/**
 * Utilitário de pausa (sleep)
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
