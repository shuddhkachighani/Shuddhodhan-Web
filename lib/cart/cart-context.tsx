"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/types";
import {
  cartItemCount,
  cartSubtotal,
  cartWeightGrams,
  hydrateCartLines,
} from "@/lib/cart/pricing";

const STORAGE_KEY = "shuddhodhan_cart_v1";

interface CartContextValue {
  lines: CartLine[];
  detailedLines: ReturnType<typeof hydrateCartLines>;
  itemCount: number;
  subtotal: number;
  weightGrams: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (productId: string, variantId: string, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from an external system (localStorage) on mount, not derived state.
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // localStorage unavailable (private browsing, SSR edge cases) — start empty.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore write failures
    }
  }, [lines, hydrated]);

  const addItem = useCallback(
    (productId: string, variantId: string, quantity = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.variantId === variantId);
        if (existing) {
          return prev.map((l) =>
            l.variantId === variantId
              ? { ...l, quantity: l.quantity + quantity }
              : l
          );
        }
        return [...prev, { productId, variantId, quantity }];
      });
      setDrawerOpen(true);
    },
    []
  );

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.variantId !== variantId);
      return prev.map((l) =>
        l.variantId === variantId ? { ...l, quantity } : l
      );
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const detailedLines = useMemo(() => hydrateCartLines(lines), [lines]);
  const subtotal = useMemo(() => cartSubtotal(detailedLines), [detailedLines]);
  const weightGrams = useMemo(
    () => cartWeightGrams(detailedLines),
    [detailedLines]
  );
  const itemCount = useMemo(() => cartItemCount(lines), [lines]);

  const value: CartContextValue = {
    lines,
    detailedLines,
    itemCount,
    subtotal,
    weightGrams,
    isDrawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
