import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveImageToCache, getAllImages, clearAllImages } from '../utils/db';

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
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [dirHandle, setDirHandle] = useState<any>(null); // FileSystemDirectoryHandle

  // Carregar dados (Migração de LocalStorage para IndexedDB inclusa para corrigir bugs antigos)
  useEffect(() => {
    const loadData = async () => {
        try {
            // 1. Carrega imagens seguras do IndexedDB
            const dbImages = await getAllImages();
            let finalImages = { ...dbImages };
            
            // 2. Verifica se existe lixo no LocalStorage que causou o crash e migra
            const dangerousLS = localStorage.getItem('shadow_mechanism_campaign');
            if (dangerousLS) {
                console.log("Detectado armazenamento antigo instável. Migrando...");
                try {
                    const parsed = JSON.parse(dangerousLS);
                    if (parsed.images) {
                        for(const [key, val] of Object.entries(parsed.images)) {
                            if (!finalImages[key]) {
                                await saveImageToCache(key, val as string);
                                finalImages[key] = val as string;
                            }
                        }
                    }
                    if (parsed.sheet) {
                        localStorage.setItem('shadow_mechanism_sheet', JSON.stringify(parsed.sheet));
                    }
                } catch (e) {
                    console.error("Dados corrompidos ignorados.");
                }
                localStorage.removeItem('shadow_mechanism_campaign');
            }

            setImages(finalImages);
        } catch (e) {
            console.error("Erro fatal ao carregar campanha:", e);
        }
    };
    loadData();
  }, []);

  const connectLocalFolder = async () => {
      try {
          // @ts-ignore - File System Access API
          const handle = await window.showDirectoryPicker({
              id: 'project-images',
              mode: 'readwrite',
              startIn: 'desktop'
          });
          setDirHandle(handle);
          alert("Pasta vinculada! As novas imagens geradas serão salvas automaticamente no seu disco.");
      } catch (err) {
          console.error("Usuário cancelou ou navegador não suporta:", err);
      }
  };

  const setImage = async (id: string, base64: string) => {
    // 1. Atualiza estado visual imediatamente
    setImages(prev => ({ ...prev, [id]: base64 }));
    
    // 2. Salva no banco de dados do navegador (IndexedDB) como backup rápido
    try {
        await saveImageToCache(id, base64);
    } catch (e) {
        console.error("Erro ao salvar imagem no cache:", e);
    }

    // 3. SE UMA PASTA ESTIVER VINCULADA, SALVA O ARQUIVO REAL NO DISCO
    if (dirHandle) {
        try {
            // Converte Base64 para Blob binário
            const byteString = atob(base64.split(',')[1]); // Remove o header "data:image/png;base64,"
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: 'image/png' });

            // Cria/Sobrescreve o arquivo
            const fileName = `${id}.png`;
            const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            console.log(`Imagem salva no disco: ${fileName}`);
        } catch (err) {
            console.error("Erro ao gravar arquivo no disco:", err);
            alert("Erro ao salvar arquivo na pasta vinculada. Verifique as permissões.");
        }
    }
  };

  const exportCampaign = async () => {
    const sheetData = localStorage.getItem('shadow_mechanism_sheet');
    const state: CampaignState = { 
        images,
        sheet: sheetData ? JSON.parse(sheetData) : undefined
    };
    
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grimorio_logan_${new Date().toISOString().slice(0, 10)}.shadow`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importCampaign = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const parsed: CampaignState = JSON.parse(content);
          
          if (parsed.images) {
              setImages(parsed.images);
              for (const [key, val] of Object.entries(parsed.images)) {
                  await saveImageToCache(key, val);
              }
          }
          
          if (parsed.sheet) {
              localStorage.setItem('shadow_mechanism_sheet', JSON.stringify(parsed.sheet));
              window.dispatchEvent(new Event('storage')); 
              setTimeout(() => window.location.reload(), 500);
          }
          
          resolve();
        } catch (err) {
          console.error(err);
          reject(new Error("Arquivo de campanha inválido ou corrompido."));
        }
      };
      reader.readAsText(file);
    });
  };

  const resetCampaign = async () => {
      if(confirm("ATENÇÃO: Isso apagará todas as imagens geradas e a ficha atual. Deseja continuar?")) {
          await clearAllImages();
          localStorage.removeItem('shadow_mechanism_campaign');
          localStorage.removeItem('shadow_mechanism_sheet');
          window.location.reload();
      }
  }

  return (
    <CampaignContext.Provider value={{ 
        images, 
        setImage, 
        exportCampaign, 
        importCampaign, 
        resetCampaign,
        connectLocalFolder,
        isFolderConnected: !!dirHandle
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