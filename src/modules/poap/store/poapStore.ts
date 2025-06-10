
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MintLink {
  id: string;
  url: string;
  claimed: boolean;
  claimedBy: string | null;
  claimedAt: string | null;
}

interface PoapState {
  // State
  mintLinks: MintLink[];
  whitelistedWallets: string[];
  isLoading: boolean;
  message: string;
  isError: boolean;
  claimStatus: string;

  // Computed values
  availableCount: () => number;
  totalCount: () => number;

  // Actions
  setLoading: (loading: boolean) => void;
  setMessage: (message: string, isError?: boolean) => void;
  setClaimStatus: (status: string) => void;
  clearMessage: () => void;
  
  // POAP operations
  getWalletAssignedLink: (wallet: string) => MintLink | null;
  checkIfWalletAlreadyClaimed: (wallet: string) => boolean;
  isWalletWhitelisted: (wallet: string) => boolean;
  claimPOAP: (wallet: string) => Promise<{ success: boolean; link?: MintLink; error?: string; isExisting?: boolean }>;
  resetPOAPs: () => void;
}

const initialMintLinks: MintLink[] = [
  { id: 'nq1ez5', url: 'https://poap.xyz/mint/nq1ez5', claimed: false, claimedBy: null, claimedAt: null },
  { id: 'slr6qp', url: 'https://poap.xyz/mint/slr6qp', claimed: false, claimedBy: null, claimedAt: null },
  { id: 'a7ky2s', url: 'https://poap.xyz/mint/a7ky2s', claimed: false, claimedBy: null, claimedAt: null },
  { id: '8eme57', url: 'https://poap.xyz/mint/8eme57', claimed: false, claimedBy: null, claimedAt: null },
  { id: 'oouh5j', url: 'https://poap.xyz/mint/oouh5j', claimed: false, claimedBy: null, claimedAt: null },
  { id: 'pzn97u', url: 'https://poap.xyz/mint/pzn97u', claimed: false, claimedBy: null, claimedAt: null },
  { id: 'yizp36', url: 'https://poap.xyz/mint/yizp36', claimed: false, claimedBy: null, claimedAt: null },
  { id: 'f48xpe', url: 'https://poap.xyz/mint/f48xpe', claimed: false, claimedBy: null, claimedAt: null },
  { id: '8wa9ea', url: 'https://poap.xyz/mint/8wa9ea', claimed: false, claimedBy: null, claimedAt: null }
];

const initialWhitelistedWallets: string[] = [
  '0x1234567890123456789012345678901234567890',
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  '0x9876543210987654321098765432109876543210',
  '0xfedcbafedcbafedcbafedcbafedcbafedcbafedcba',
  '0x1111222211112222111122221111222211112222',
  '0x3333444433334444333344443333444433334444',
  '0x5555666655556666555566665555666655556666',
  '0x7777888877778888777788887777888877778888',
  '0x9999aaaa9999aaaa9999aaaa9999aaaa9999aaaa',
  '0x77B7f7E65BDcF87958B99a1Adb1ADBa6F388f2aa'
];

export const usePoapStore = create<PoapState>()(
  persist(
    (set, get) => ({
      // Initial state
      mintLinks: initialMintLinks,
      whitelistedWallets: initialWhitelistedWallets,
      isLoading: false,
      message: '',
      isError: false,
      claimStatus: '',

      // Computed values
      availableCount: () => get().mintLinks.filter(link => !link.claimed).length,
      totalCount: () => get().mintLinks.length,

      // Basic actions
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setMessage: (message: string, isError: boolean = false) => 
        set({ message, isError }),
      
      setClaimStatus: (status: string) => set({ claimStatus: status }),
      
      clearMessage: () => set({ message: '', isError: false, claimStatus: '' }),

      // POAP operations
      getWalletAssignedLink: (wallet: string) => {
        const { mintLinks } = get();
        return mintLinks.find(link => link.claimedBy === wallet) || null;
      },

      checkIfWalletAlreadyClaimed: (wallet: string) => {
        const { mintLinks } = get();
        return mintLinks.some(link => link.claimedBy === wallet);
      },

      isWalletWhitelisted: (wallet: string) => {
        const { whitelistedWallets } = get();
        return whitelistedWallets.includes(wallet);
      },

      claimPOAP: async (wallet: string) => {
        const { 
          checkIfWalletAlreadyClaimed, 
          getWalletAssignedLink, 
          mintLinks,
          setClaimStatus 
        } = get();
        
        set({ isLoading: true });
        setClaimStatus('Verificando disponibilidad...');
        
        // Simular delay de red/procesamiento
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Verificar si la wallet ya reclamó (doble verificación por concurrencia)
        if (checkIfWalletAlreadyClaimed(wallet)) {
          const assignedLink = getWalletAssignedLink(wallet);
          if (assignedLink) {
            set({ isLoading: false, claimStatus: '' });
            return { success: true, link: assignedLink, isExisting: true };
          }
          set({ isLoading: false, claimStatus: '' });
          return { success: false, error: 'Esta wallet ya reclamó un POAP' };
        }
        
        // Buscar primer mint link disponible
        const availableLinks = mintLinks.filter(link => !link.claimed);
        
        if (availableLinks.length === 0) {
          set({ isLoading: false, claimStatus: '' });
          return { success: false, error: 'No hay más POAPs disponibles' };
        }
        
        // Tomar el primero disponible (FIFO)
        const selectedLink = availableLinks[0];
        
        setClaimStatus('Asignando POAP...');
        
        // Simular otro pequeño delay para el procesamiento
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Actualizar estado - marcar como reclamado
        set(state => ({
          mintLinks: state.mintLinks.map(link => 
            link.id === selectedLink.id 
              ? { 
                  ...link, 
                  claimed: true, 
                  claimedBy: wallet,
                  claimedAt: new Date().toISOString()
                }
              : link
          ),
          isLoading: false,
          claimStatus: ''
        }));
        
        return { success: true, link: selectedLink, isExisting: false };
      },

      resetPOAPs: () => {
        set({
          mintLinks: initialMintLinks,
          message: 'POAPs reseteados para testing',
          isError: false,
          claimStatus: ''
        });
      }
    }),
    {
      name: 'poap-storage',
      partialize: (state) => ({ 
        mintLinks: state.mintLinks 
      }),
    }
  )
);