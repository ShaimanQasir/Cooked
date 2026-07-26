import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { groceryService, BackendGroceryItem } from '../services/grocery.service';

export interface GroceryItem {
  id: string; // string ID for store
  backendId?: number;
  listName: string; // e.g. "Lemon Grilled Salmon" or "My Custom List"
  name: string;
  quantity: string; // e.g. "250", "2", or ""
  unit: string; // e.g. "g", "ml", "tbsp"
  recipeName: string;
  checked: boolean;
}

interface GroceryStore {
  items: GroceryItem[];
  loading: boolean;
  
  // Actions
  fetchGroceryItems: () => Promise<void>;
  addItem: (name: string, quantity?: string, unit?: string, listName?: string) => Promise<void>;
  addRecipeList: (recipeTitle: string, ingredients: { name: string; quantity: string | number; unit: string }[]) => Promise<void>;
  updateItem: (id: string, updates: { name?: string; quantity?: string; unit?: string; listName?: string }) => Promise<void>;
  deleteList: (listName: string) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  toggleItemChecked: (id: string) => Promise<void>;
  clearCheckedItems: () => Promise<void>;
  clearAll: () => Promise<void>;
}

function mapBackendGroceryItem(item: BackendGroceryItem): GroceryItem {
  const qtyStr = item.quantity != null ? String(item.quantity) : '';
  const listNameVal = item.list_name || (item.recipe ? 'Recipe List' : 'Custom Items');
  return {
    id: String(item.id),
    backendId: item.id,
    listName: listNameVal,
    recipeName: listNameVal,
    name: item.name,
    quantity: qtyStr,
    unit: item.unit || '',
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

      addItem: async (name: string, quantity = '', unit = '', listName = 'Custom Items') => {
        const tempId = 'gi_' + Date.now() + Math.random().toString(36).substr(2, 5);
        const newItem: GroceryItem = {
          id: tempId,
          listName,
          recipeName: listName,
          name,
          quantity,
          unit,
          checked: false,
        };
        set((state) => ({ items: [...state.items, newItem] }));

        try {
          const backendItem = await groceryService.createGroceryItem({
            list_name: listName,
            name,
            quantity,
            unit,
          });
          set((state) => ({
            items: state.items.map((i) => (i.id === tempId ? mapBackendGroceryItem(backendItem) : i)),
          }));
        } catch (_) {}
      },

      addRecipeList: async (recipeTitle: string, ingredients: { name: string; quantity: string | number; unit: string }[]) => {
        for (const ing of ingredients) {
          const qtyStr = ing.quantity != null ? String(ing.quantity) : '';
          await get().addItem(ing.name, qtyStr, ing.unit || '', recipeTitle);
        }
      },

      updateItem: async (id: string, updates: { name?: string; quantity?: string; unit?: string; listName?: string }) => {
        const target = get().items.find((i) => i.id === id);
        if (!target) return;

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));

        if (target.backendId) {
          try {
            await groceryService.updateGroceryItem(target.backendId, {
              list_name: updates.listName !== undefined ? updates.listName : target.listName,
              name: updates.name !== undefined ? updates.name : target.name,
              quantity: updates.quantity !== undefined ? updates.quantity : target.quantity,
              unit: updates.unit !== undefined ? updates.unit : target.unit,
            });
          } catch (_) {}
        }
      },

      deleteList: async (listName: string) => {
        const listItems = get().items.filter((i) => i.listName === listName);
        set((state) => ({ items: state.items.filter((item) => item.listName !== listName) }));

        for (const item of listItems) {
          if (item.backendId) {
            try {
              await groceryService.deleteGroceryItem(item.backendId);
            } catch (_) {}
          }
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
