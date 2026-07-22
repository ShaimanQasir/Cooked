import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pantryService, BackendPantryItem } from '../services/pantry.service';

export interface PantryItem {
  id: string;
  backendId?: number;
  name: string;
  quantity: string;
  unit: string;
  expiryDate?: string | null;
}

interface PantryStore {
  items: PantryItem[];
  loading: boolean;

  fetchPantryItems: () => Promise<void>;
  addPantryItem: (name: string, quantity?: string, unit?: string) => Promise<void>;
  removePantryItem: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

function mapBackendPantryItem(item: BackendPantryItem): PantryItem {
  return {
    id: String(item.id),
    backendId: item.id,
    name: item.ingredient_name || item.name || 'Ingredient',
    quantity: item.quantity ? String(item.quantity) : '',
    unit: item.unit || '',
    expiryDate: item.expiry_date,
  };
}

export const usePantryStore = create<PantryStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchPantryItems: async () => {
        set({ loading: true });
        try {
          const res = await pantryService.listPantryItems();
          if (Array.isArray(res)) {
            set({ items: res.map(mapBackendPantryItem), loading: false });
          } else {
            set({ loading: false });
          }
        } catch {
          set({ loading: false });
        }
      },

      addPantryItem: async (name, quantity = '', unit = '') => {
        const tempId = 'pi_' + Date.now() + Math.random().toString(36).substr(2, 5);
        const newItem: PantryItem = { id: tempId, name, quantity, unit };
        set((state) => ({ items: [...state.items, newItem] }));

        try {
          const parsedQty = parseFloat(quantity) || undefined;
          const backendItem = await pantryService.createPantryItem({
            name,
            quantity: parsedQty,
            unit,
          });
          set((state) => ({
            items: state.items.map((i) => (i.id === tempId ? mapBackendPantryItem(backendItem) : i)),
          }));
        } catch (_) {}
      },

      removePantryItem: async (id) => {
        const target = get().items.find((i) => i.id === id);
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        if (target && target.backendId) {
          try {
            await pantryService.deletePantryItem(target.backendId);
          } catch (_) {}
        }
      },

      clearAll: async () => {
        const all = get().items;
        set({ items: [] });
        for (const item of all) {
          if (item.backendId) {
            try {
              await pantryService.deletePantryItem(item.backendId);
            } catch (_) {}
          }
        }
      },
    }),
    {
      name: 'cooked-pantry-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
