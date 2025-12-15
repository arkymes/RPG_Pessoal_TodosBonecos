import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveImageToCache, getAllImages, clearAllImages } from '../utils/db';
import { initCloud, uploadImageToCloud, getImageFromCloud, getAllImagesFromCloud, isCloudActive } from '../utils/cloud';
import { STORY_DATA } from '../constants';

interface CampaignState {
  images: Record<string, string>; // Base64 images mapped by ID
  sheet?: any; // Dados da ficha de personagem
}

interface CampaignContextType {
  images: Record<string, string>;
  setImage: (id: string, base64: string) => Promise<void>;
  exportCampaign: () => void;
  importCampaign: (file: File) => Promise<void>;
  resetCampaign: () => void;
  connectLocalFolder: () => Promise<void>;
  isFolderConnected: boolean;
  connectCloud: (config: any) => boolean;
  isCloudConnected: boolean;
  isLoadingCloud: boolean;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [dirHandle, setDirHandle] = useState<any>(null); // FileSystemDirectoryHandle
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);

  // Carregar dados locais (IndexedDB) ao iniciar
  useEffect(() => {
    const loadData = async () => {
        try {
            const dbImages = await getAllImages();
            setImages(dbImages);

            // Verifica se já tem config do Firebase salva no LocalStorage
            const savedFirebase = localStorage.getItem('shadow_mechanism_firebase_config');
            if (savedFirebase) {
                try {
                    const config = JSON.parse(savedFirebase);
                    if (initCloud(config)) {
                        setIsCloudConnected(true);
                        // Chama o sync global
                        syncWithCloud();
                    }
                } catch(e) {
                    console.error("Configuração Firebase inválida salva.");
                }
            }
        } catch (e) {
            console.error("Erro ao carregar dados:", e);
        }
    };
    loadData();
  }, []);

  // Tenta baixar imagens da nuvem em massa
  const syncWithCloud = async () => {
      setIsLoadingCloud(true);
      try {
          const cloudImages = await getAllImagesFromCloud();
          if (cloudImages) {
              setImages(prev => {
                  const newState = { ...prev };
                  let hasChanges = false;
                  
                  Object.entries(cloudImages).forEach(([safeId, base64]) => {
                      // Converte ID seguro de volta para normal se tiver underscore no lugar de ponto
                      // (embora nosso gerador use IDs sem extensão na maioria das vezes)
                      const id = safeId.replace('_png', '.png'); 
                      
                      // Verifica se já temos essa imagem (otimização)
                      if (!newState[id] && !newState[safeId]) {
                          newState[id] = base64 as string;
                          // Salva no cache local para a próxima vez ser instantâneo
                          saveImageToCache(id, base64 as string);
                          hasChanges = true;
                      }
                  });
                  return hasChanges ? newState : prev;
              });
          }
      } catch (e) {
          console.error("Erro no sync:", e);
      } finally {
          setIsLoadingCloud(false);
      }
  };

  const connectCloud = (config: any) => {
      const success = initCloud(config);
      if (success) {
          setIsCloudConnected(true);
          localStorage.setItem('shadow_mechanism_firebase_config', JSON.stringify(config));
          syncWithCloud();
      }
      return success;
  };

  const connectLocalFolder = async () => {
      try {
          // @ts-ignore
          const handle = await window.showDirectoryPicker({ id: 'project-images', mode: 'readwrite', startIn: 'desktop' });
          setDirHandle(handle);
          alert("Pasta vinculada com sucesso!");
      } catch (err) { console.error(err); }
  };

  const setImage = async (id: string, base64: string) => {
    // 1. Atualiza visual
    setImages(prev => ({ ...prev, [id]: base64 }));
    
    // 2. Salva Cache Navegador
    saveImageToCache(id, base64);

    // 3. Salva no Disco (FileSystem) se conectado
    if (dirHandle) {
        try {
            const byteString = atob(base64.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
            const blob = new Blob([ab], { type: 'image/png' });
            const fh = await dirHandle.getFileHandle(`${id}.png`, { create: true });
            const wr = await fh.createWritable();
            await wr.write(blob);
            await wr.close();
        } catch (err) { console.error("Erro disco:", err); }
    }

    // 4. Salva na Nuvem (Firebase) se conectado
    if (isCloudActive()) {
        uploadImageToCloud(id, base64);
    }
  };

  const exportCampaign = async () => { /* ... existing export logic ... */ };
  const importCampaign = (file: File): Promise<void> => { return Promise.resolve(); /* ... existing import logic ... */ };
  const resetCampaign = async () => { /* ... existing reset logic ... */ };

  return (
    <CampaignContext.Provider value={{ 
        images, setImage, exportCampaign, importCampaign, resetCampaign, connectLocalFolder, isFolderConnected: !!dirHandle,
        connectCloud, isCloudConnected, isLoadingCloud
    }}>
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (!context) throw new Error("useCampaign must be used within a CampaignProvider");
  return context;
};