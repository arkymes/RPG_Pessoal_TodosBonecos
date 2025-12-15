import { initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase, ref, set, get, child, Database } from "firebase/database";

let app: FirebaseApp | null = null;
let db: Database | null = null;

export const initCloud = (config: any) => {
  try {
    if (!app) {
      app = initializeApp(config);
      db = getDatabase(app);
      console.log("🔥 Firebase Database (RTDB) conectado com sucesso!");
      return true;
    }
    return true;
  } catch (error) {
    console.error("Erro ao conectar Firebase:", error);
    return false;
  }
};

export const isCloudActive = () => !!db;

export const uploadImageToCloud = async (id: string, base64: string): Promise<string | null> => {
  if (!db) return null;

  try {
    // No Realtime Database, salvamos na árvore 'campaign_images'
    // O ID não pode conter '.', então removemos a extensão se houver ou usamos slug
    const safeId = id.replace(/\./g, '_');
    
    // Referência: campaign_images/chapter-1
    const dbRef = ref(db, 'campaign_images/' + safeId);
    
    // Salva a string base64 diretamente
    await set(dbRef, base64);
    
    console.log(`💾 Imagem ${id} salva no Banco de Dados!`);
    return base64; // Retorna o próprio base64 pois não há URL pública de download como no Storage
  } catch (error) {
    console.error(`Erro ao salvar no banco (${id}):`, error);
    return null;
  }
};

export const getImageFromCloud = async (id: string): Promise<string | null> => {
  if (!db) return null;

  try {
    const safeId = id.replace(/\./g, '_');
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `campaign_images/${safeId}`));

    if (snapshot.exists()) {
      return snapshot.val(); // Retorna a string Base64
    } else {
      console.log("Imagem não encontrada na nuvem.");
      return null;
    }
  } catch (error) {
    console.error("Erro ao baixar do banco:", error);
    return null;
  }
};

// NOVA FUNÇÃO: Baixa tudo de uma vez para evitar múltiplas chamadas
export const getAllImagesFromCloud = async (): Promise<Record<string, string> | null> => {
    if (!db) return null;

    try {
        const dbRef = ref(db);
        const snapshot = await get(child(dbRef, 'campaign_images'));

        if (snapshot.exists()) {
            const data = snapshot.val();
            // Converte chaves seguras (chapter-1_png) de volta para chaves normais se necessário
            // Mas nosso app usa IDs sem extensão na maioria das vezes, então vamos mapear
            return data;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Erro ao baixar todas as imagens:", error);
        return null;
    }
}