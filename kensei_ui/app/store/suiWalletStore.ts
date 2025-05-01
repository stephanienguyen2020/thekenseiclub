import { type StateCreator, create } from "zustand";
import { persist, type PersistOptions } from "zustand/middleware";
import { type SuiClient } from "@mysten/sui/client";

interface SuiWalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  balance: string | null;
  network: string | null;
  isLoading: boolean;
}

interface SuiWalletStore extends SuiWalletState {
  connect: (wallet: {
    connect: () => Promise<void>;
    account: any;
  }) => Promise<void>;
  disconnect: (wallet: { disconnect: () => void }) => void;
  updateWallet: (wallet: Partial<SuiWalletState>) => void;
  fetchBalance: (client: SuiClient, address: string) => Promise<void>;
  getNetwork: (client: SuiClient) => Promise<void>;
}

type SuiWalletPersist = (
  config: StateCreator<SuiWalletStore>,
  options: PersistOptions<SuiWalletStore>
) => StateCreator<SuiWalletStore>;

export const useSuiWalletStore = create<SuiWalletStore>()(
  (persist as SuiWalletPersist)(
    (set) => ({
      // Initial state
      isConnected: false,
      address: null,
      isConnecting: false,
      error: null,
      balance: null,
      network: null,
      isLoading: false,

      // Connect wallet
      connect: async (wallet) => {
        try {
          set({ isConnecting: true, error: null });

          await wallet.connect();

          if (wallet.account) {
            set({
              isConnected: true,
              address: wallet.account.address,
              isConnecting: false,
              error: null,
            });
          } else {
            throw new Error("Failed to connect wallet");
          }
        } catch (error) {
          console.error("Error connecting SUI wallet:", error);
          set({
            isConnected: false,
            address: null,
            isConnecting: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          throw error;
        }
      },

      // Disconnect wallet
      disconnect: (wallet) => {
        wallet.disconnect();

        set({
          isConnected: false,
          address: null,
          isConnecting: false,
          error: null,
          balance: null,
          network: null,
        });
      },

      // Update wallet state
      updateWallet: (wallet: Partial<SuiWalletState>) => {
        set((state) => ({ ...state, ...wallet }));
      },

      // Fetch balance
      fetchBalance: async (client, address) => {
        try {
          set({ isLoading: true });

          const balance = await client.getBalance({
            owner: address,
          });

          set({
            balance: balance.totalBalance,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Error fetching balance:", error);
          set({
            error:
              error instanceof Error ? error.message : "Error fetching balance",
            isLoading: false,
          });
        }
      },

      // Get network
      getNetwork: async (client) => {
        try {
          if (!client) {
            throw new Error("No client available");
          }

          const systemState = await client.getLatestSuiSystemState();
          set({
            network: systemState.activeValidators[0].netAddress,
            error: null,
          });
        } catch (error) {
          console.error("Error fetching network:", error);
          set({
            error:
              error instanceof Error ? error.message : "Error fetching network",
          });
        }
      },
    }),
    {
      name: "sui-wallet-storage",
    }
  )
);
