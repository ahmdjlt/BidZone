import { create } from "zustand";
import type { Auction, AuctionSummary } from "@/types/auction";
import { getAuctions, getAuctionById, type AuctionFilters } from "@/lib/api/auctions";

interface AuctionState {
  auctions: AuctionSummary[];
  selectedAuction: Auction | null;
  filters: AuctionFilters;
  isLoading: boolean;
  error: string | null;

  setAuctions: (auctions: AuctionSummary[]) => void;
  setSelectedAuction: (auction: Auction | null) => void;
  setFilters: (filters: AuctionFilters) => void;
  fetchAuctions: (filters?: AuctionFilters) => Promise<void>;
  fetchAuction: (id: string | number) => Promise<void>;
}

export const useAuctionStore = create<AuctionState>((set, get) => ({
  auctions: [],
  selectedAuction: null,
  filters: {},
  isLoading: false,
  error: null,

  setAuctions: (auctions) => set({ auctions }),

  setSelectedAuction: (auction) => set({ selectedAuction: auction }),

  setFilters: (filters) => set({ filters }),

  fetchAuctions: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const f = filters ?? get().filters;
      const auctions = await getAuctions(f);
      set({ auctions, filters: f });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load auctions." });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAuction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const auction = await getAuctionById(id);
      set({ selectedAuction: auction });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load auction." });
    } finally {
      set({ isLoading: false });
    }
  },
}));
