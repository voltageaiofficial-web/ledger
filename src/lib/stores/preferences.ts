"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Currency } from "@/lib/types";

type Density = "comfortable" | "compact";

type PreferencesState = {
  displayCurrency: Currency;
  density: Density;
  setDisplayCurrency: (c: Currency) => void;
  setDensity: (d: Density) => void;
  toggleCurrency: () => void;
};

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      displayCurrency: "USD",
      density: "comfortable",
      setDisplayCurrency: (c) => set({ displayCurrency: c }),
      setDensity: (d) => set({ density: d }),
      toggleCurrency: () =>
        set({
          displayCurrency: get().displayCurrency === "USD" ? "AUD" : "USD",
        }),
    }),
    { name: "ledger-prefs" },
  ),
);
