import { create } from "zustand";
import type { Account, Role, Subject } from "@/data/types";
import { mockRepository } from "@/data/mockRepository";

export interface Filters {
  mon: Subject;
  ki: string;
  khoi: 10 | 11 | 12;
}

interface UiState {
  accountId: string | null;
  account: Account | null;
  role: Role | null;
  theme: "light" | "dark";
  reducedMotion: boolean;
  filters: Filters;
  selectAccount: (id: string) => void;
  logout: () => void;
  toggleTheme: () => void;
  setReducedMotion: (v: boolean) => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

const prefersReduced =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const SESSION_KEY = "ths-insight-account";
const savedId =
  typeof sessionStorage !== "undefined" ? sessionStorage.getItem(SESSION_KEY) : null;
const savedAccount = savedId ? mockRepository.getAccount(savedId) ?? null : null;

export const useUiStore = create<UiState>((set) => ({
  accountId: savedAccount ? savedAccount.id : null,
  account: savedAccount,
  role: savedAccount?.role ?? null,
  theme: "light",
  reducedMotion: prefersReduced,
  filters: { mon: "Địa lí", ki: "Đợt 1 · 2025–2026", khoi: 12 },
  selectAccount: (id) => {
    const account = mockRepository.getAccount(id) ?? null;
    if (account && typeof sessionStorage !== "undefined") sessionStorage.setItem(SESSION_KEY, id);
    set({ accountId: id, account, role: account?.role ?? null });
  },
  logout: () => {
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(SESSION_KEY);
    set({ accountId: null, account: null, role: null });
  },
  toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
  setReducedMotion: (v) => set({ reducedMotion: v }),
  setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
}));
