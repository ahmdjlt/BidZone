import { create } from "zustand";
import type { Bid } from "@/types/bid";
import * as api from "@/lib/api/bids";

interface BidState {
  bids: Bid[];
  userBids: Bid[];
  latestBid: Bid | null;
  isLoading: boolean;

  addBid: (bid: Bid) => void;
  setBids: (bids: Bid[]) => void;
  setUserBids: (bids: Bid[]) => void;
  fetchBids: (auctionId: number | string) => Promise<void>;
  fetchUserBids: () => Promise<void>;
  placeBid: (auctionId: number, amount: number) => Promise<Bid>;
}

export const useBidStore = create<BidState>((set, get) => ({
  bids: [],
  userBids: [],
  latestBid: null,
  isLoading: false,

  addBid: (bid) => {
    set((state) => ({
      bids: [bid, ...state.bids],
      latestBid: bid,
    }));
  },

  setBids: (bids) => set({ bids }),

  setUserBids: (bids) => set({ userBids: bids }),

  fetchBids: async (auctionId) => {
    set({ isLoading: true });
    try {
      const bids = await api.getBidsByAuction(auctionId);
      set({ bids, latestBid: bids[0] ?? null });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUserBids: async () => {
    set({ isLoading: true });
    try {
      const userBids = await api.getMyBids();
      set({ userBids });
    } finally {
      set({ isLoading: false });
    }
  },

  placeBid: async (auctionId, amount) => {
    set({ isLoading: true });
    try {
      const bid = await api.placeBid(auctionId, amount);
      get().addBid(bid);
      return bid;
    } finally {
      set({ isLoading: false });
    }
  },
}));
