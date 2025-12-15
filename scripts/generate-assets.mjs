/**
 * SCRIPT GERADOR DE ASSETS - "O Mecanismo da Sombra"
 * 
 * EXECUÇÃO:
 * node scripts/generate-assets.mjs
 */

import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Buffer } from 'buffer';

// --- CONFIGURAÇÃO DA HISTÓRIA ---
// Personagens padronizados para consistência
const CHAR_LOGAN = "Logan Rylan (young human male, 18 years old, height 1.41m, short stature but strictly human proportions, not a dwarf, not a gnome, lean and wiry athletic build, messy black hair, fair skin, stoic and emotionless face)";
const CHAR_GARETH = "Gareth Aldren (young human male student, 19 years old, fresh youthful face, tall, blonde hair, charming smile, wearing expensive magical academy student uniform - not old robes)";
const CHAR_KOGGLE = "Koggle (gnome tinkerer, multi-lens goggles, oil-stained leather apron)";
const CHAR_KING = "King Felipe (adult half-elf male, sharp noble features, vibrant red hair, groomed red beard, royal regalia, regal posture)";

const STORY_DATA = [
  {
    id: "chapter-1",
    imagePrompt: `steampunk workshop basement, ${CHAR_KOGGLE} standing next to ${CHAR_LOGAN} (who is noticeably short for a human but has human anatomy), Logan is wearing simple workman clothes, brass gears, copper pipes, hydraulic components, warm lighting, detailed clutter, fantasy art style`
  },
  {
    id: "chapter-2",
    imagePrompt: `futuristic fantasy city street, mix of ancient elven white stone architecture and brutalist bunkers, crowd of tall people queuing for a temple, ${CHAR_LOGAN} walking in the crowd, he is noticeably shorter than everyone else but clearly human, wearing a backpack and simple traveler clothes looking up at magical glowing scaffolds, cinematic shot`
  },
  {
    id: "chapter-3",
    imagePrompt: `magic academy laboratory, ${CHAR_GARETH} standing beside ${CHAR_LOGAN}, contrast in height is visible (Gareth is much taller), Logan wearing a student uniform apron fixing a mechanical construct, messy workbench, cinematic lighting, magical sparks, contrast between the handsome noble student and the short human worker`
  },
  {
    id: "chapter-4",
    imagePrompt: `dark forest clearing, unnaturally dark, black organic pedestal with pulsating purple veins, ominous dark grimoire on top, ${CHAR_LOGAN} wearing medieval academy student tunic and robes reaching out to touch the book, Logan looks small and vulnerable next to the pedestal, terrified and mesmerized expression, liquid shadows, horror atmosphere`
  },
  {
    id: "chapter-5",
    imagePrompt: `steampunk workshop at night, ${CHAR_GARETH} (looking like a young student) offering a glass of wine to ${CHAR_LOGAN} (short human stature), dismantled mechanical hound (Iron Shepherd) on table, glowing hexagonal shield device 'Aegis' floating with blue runes, atmosphere of exhaustion and betrayal, cinematic lighting, 8k masterpiece`
  },
  {
    id: "chapter-6",
    imagePrompt: `grand royal presentation hall, golden lighting, ${CHAR_GARETH} (young handsome student) on stage demonstrating a floating magical shield to ${CHAR_KING}, ${CHAR_LOGAN} (very short human figure) watching from the shadows of a doorway wearing simple dirty clothes looking disheveled and betrayed, deep emotional contrast, cinematic, fantasy art`
  },
  {
    id: "epilogue",
    imagePrompt: ` a big bicicle in the backgroun of a dwarf forge interior, ${CHAR_LOGAN} (human with short stature 1.41m) putting on a custom made splint armor made of vertical metal strips and leather, holding warhammer with glowing blue copper tubes (pneumatic), expression is calm and emotionless, serene determination, lean and wiry body frame in armor, gritty realistic fantasy style, volumetric lighting`
  }
];

// Prompt específico para a capa do site (Hero)
const HERO_PROMPT = "Dark fantasy industrial city background, magical energy lines in sky, steampunk factories, atmospheric, cinematic, wide shot, masterpiece, 8k, forgotten realms, epic scale";

// Prompt específico para o Retrato do Personagem (Grimório) - Agora atualizado com a armadura
const LOGAN_PROMPT = `Full body character concept of ${CHAR_LOGAN}, wearing custom splint armor (vertical metal strips over leather) with exposed hydraulic pistons and gears. Holding a heavy pneumatic warhammer with glowing blue copper tubes. Stoic, serene, emotionless expression. Steampunk D&D 5e art style, masterpiece. Isolated on pure white background.`;

// --- CONFIGURAÇÃO DO AMBIENTE ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// CORREÇÃO: Aponta para a pasta 'images' na raiz do projeto (um nível acima de scripts)
const OUTPUT_DIR = path.resolve(__dirname, '../images');

// Garante que a pasta de destino existe
if (!fs.existsSync(OUTPUT_DIR)){
    console.log(`📁 Criando diretório: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Inicializa a API
if (!process.env.API_KEY) {
    console.error("❌ ERRO CRÍTICO: Variável de ambiente API_KEY não definida.");
    console.error("   Por favor, defina sua chave antes de executar o script: export API_KEY=sua_chave");
    // @ts-ignore
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Função principal de geração
 */
async function generateAndSave(filename, prompt, aspectRatio = "16:9") {
    const filePath = path.join(OUTPUT_DIR, filename);

    // 1. Verificação de Existência (Para não gastar créditos à toa)
    if (fs.existsSync(filePath)) {
        console.log(`⏭️  [PULANDO] ${filename} já existe.`);
        return;
    }

    console.log(`🎨 [GERANDO] ${filename}...`);
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ 
                    text: `${prompt}, masterpiece, 8k, highly detailed, oil painting style` 
                }]
            },
            config: { 
                imageConfig: { aspectRatio: aspectRatio } 
            }
        });

        const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        
        if (part && part.inlineData) {
            const buffer = Buffer.from(part.inlineData.data, 'base64');
            fs.writeFileSync(filePath, buffer);
            console.log(`✅ [SUCESSO] Salvo em images/${filename}`);
        } else {
            console.error(`❌ [FALHA] A API não retornou dados de imagem para ${filename}`);
        }
    } catch (e) {
        console.error(`❌ [ERRO] Falha ao gerar ${filename}:`, e.message);
    }
}

/**
 * Loop de Execução
 */
async function run() {
    console.log("==================================================");
    console.log("   GERADOR DE ASSETS - O MECANISMO DA SOMBRA");
    console.log("   Salvando em: " + OUTPUT_DIR);
    console.log("==================================================");
    
    // 1. Gerar Capa (Hero)
    await generateAndSave('hero.png', HERO_PROMPT, "16:9");

    // 2. Gerar Retrato do Logan (Para o Grimório) - Aspecto Retrato
    await generateAndSave('logan.png', LOGAN_PROMPT, "3:4");

    // 3. Gerar Capítulos
    for (const chapter of STORY_DATA) {
        await generateAndSave(`${chapter.id}.png`, chapter.imagePrompt, "16:9");
    }

    console.log("--------------------------------------------------");
    console.log("✨ Processo finalizado. As imagens estão na pasta 'images' do projeto.");
}

run();