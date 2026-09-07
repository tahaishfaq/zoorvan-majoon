"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useCart = create(
  persist(
    (set) => ({
      quantity: 0,
      add: (quantity = 1) =>
        set((state) => ({ quantity: Math.min(20, state.quantity + quantity) })),
      setQuantity: (quantity) =>
        set({ quantity: Math.max(0, Math.min(20, quantity)) }),
      clear: () => set({ quantity: 0 }),
    }),
    {
      name: "zoorvan-cart",
      partialize: (state) => ({ quantity: state.quantity }),
    },
  ),
);
