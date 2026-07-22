import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { groceryService, BackendGroceryItem } from '../services/grocery.service';

export interface GroceryItem {
  id: string; // number or string representation for store
  backendId?: number;
  name: string;
  quantity: string;
  recipeName: string;
  checked: boolean;
}

interface GroceryStore {
  items: GroceryItem[];
  loading: boolean;
  
  // Actions
  fetchGroceryItems: () => Promise<void>;
  addItem: (name: string, quantity: string, recipeName?: string) => Promise<void>;
  addRecipeIngredients: (recipeName: string, ingredients: { name: string; amount: string }[]) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  toggleItemChecked: (id: string) => Promise<void>;
  clearCheckedItems: () => Promise<void>;
  clearAll: () => Promise<void>;
}

function mapBackendGroceryItem(item: BackendGroceryItem): GroceryItem {
  return {
    id: String(item.id),
    backendId: item.id,
    name: item.name,
    quantity: item.quantity ? `${item.quantity} ${item.unit}`.trim() : item.unit || '',
    recipeName: item.recipe ? 'Recipe Item' : 'Custom',
    checked: item.is_checked,
  };
}

export const useGroceryStore = create<GroceryStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchGroceryItems: async () => {
        set({ loading: true });
        try {
          const res = await groceryService.listGroceryItems();
          if (Array.isArray(res)) {
            set({ items: res.map(mapBackendGroceryItem), loading: false });
          } else {
            set({ loading: false });
          }
        } catch {
          set({ loading: false });
        }
      },

      addItem: async (name, quantity, recipeName = 'Custom') => {
        const tempId = 'gi_' + Date.now() + Math.random().toString(36).substr(2, 5);
        const newItem: GroceryItem = { id: tempId, name, quantity, recipeName, checked: false };
        set((state) => ({ items: [...state.items, newItem] }));

        try {
          const parsedQty = parseFloat(quantity) || undefined;
          const backendItem = await groceryService.createGroceryItem({
            name,
            quantity: parsedQty,
            unit: isNaN(Number(quantity)) ? quantity : undefined,
          });
          set((state) => ({
            items: state.items.map((i) => (i.id === tempId ? mapBackendGroceryItem(backendItem) : i)),
          }));
        } catch (_) {}
      },

      addRecipeIngredients: async (recipeName, ingredients) => {
        for (const ing of ingredients) {
          await get().addItem(ing.name, ing.amount, recipeName);
        }
      },

      removeItem: async (id) => {
        const target = get().items.find((i) => i.id === id);
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
        if (target && target.backendId) {
          try {
            await groceryService.deleteGroceryItem(target.backendId);
          } catch (_) {}
        }
      },

      toggleItemChecked: async (id) => {
        const target = get().items.find((i) => i.id === id);
        if (!target) return;
        const nextChecked = !target.checked;

        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, checked: nextChecked } : item)),
        }));

        if (target.backendId) {
          try {
            await groceryService.updateGroceryItem(target.backendId, { is_checked: nextChecked });
          } catch (_) {}
        }
      },

      clearCheckedItems: async () => {
        const checkedItems = get().items.filter((i) => i.checked);
        set((state) => ({ items: state.items.filter((item) => !item.checked) }));

        for (const item of checkedItems) {
          if (item.backendId) {
            try {
              await groceryService.deleteGroceryItem(item.backendId);
            } catch (_) {}
          }
        }
      },

      clearAll: async () => {
        const allItems = get().items;
        set({ items: [] });
        for (const item of allItems) {
          if (item.backendId) {
            try {
              await groceryService.deleteGroceryItem(item.backendId);
            } catch (_) {}
          }
        }
      },
    }),
    {
      name: 'cooked-grocery-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
