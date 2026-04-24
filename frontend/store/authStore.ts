import { create } from "zustand";
import type { User } from "@/types/user";
import * as api from "@/lib/api/users";
import { setAuthFailureHandler } from "@/lib/api/client";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasBootstrapped: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; fullName: string; email: string; password: string; role: "Buyer" | "Seller" }) => Promise<void>;
  logout: () => Promise<void>;
  bootstrapAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
}

let bootstrapPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  hasBootstrapped: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.login({ email, password });
      set({
        user: res.user,
        accessToken: res.accessToken,
        isAuthenticated: true,
        hasBootstrapped: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await api.register(data);
      set({
        user: res.user,
        accessToken: res.accessToken,
        isAuthenticated: true,
        hasBootstrapped: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.logout();
    } finally {
      api.clearAuthToken();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        hasBootstrapped: true,
      });
    }
  },

  setUser: (user) => {
    set({
      user,
      accessToken: user ? get().accessToken : null,
      isAuthenticated: !!user,
    });
  },

  clearAuth: () => {
    api.clearAuthToken();
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hasBootstrapped: true,
      isLoading: false,
    });
  },

  bootstrapAuth: async () => {
    if (get().hasBootstrapped) {
      return;
    }

    if (bootstrapPromise) {
      return bootstrapPromise;
    }

    bootstrapPromise = (async () => {
      set({ isLoading: true });
      try {
        const session = await api.refreshSession();
        const user = await api.getCurrentUser();
        set({
          user,
          accessToken: session.accessToken,
          isAuthenticated: true,
          hasBootstrapped: true,
        });
      } catch {
        api.clearAuthToken();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          hasBootstrapped: true,
        });
      } finally {
        set({ isLoading: false });
        bootstrapPromise = null;
      }
    })();

    return bootstrapPromise;
  },
}));

setAuthFailureHandler(() => {
  api.clearAuthToken();
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
    hasBootstrapped: true,
  });
});
