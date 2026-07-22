import { apiFetch } from './api';

export interface BackendPantryItem {
  id: number;
  ingredient: number | null;
  ingredient_name: string;
  name?: string;
  quantity: number | null;
  unit: string;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePantryItemPayload {
  name?: string;
  ingredient?: number;
  quantity?: number;
  unit?: string;
  expiry_date?: string;
}

export const pantryService = {
  listPantryItems: () =>
    apiFetch<BackendPantryItem[]>('/pantry/items/'),

  createPantryItem: (data: CreatePantryItemPayload) =>
    apiFetch<BackendPantryItem>('/pantry/items/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePantryItem: (id: number, data: Partial<CreatePantryItemPayload>) =>
    apiFetch<BackendPantryItem>(`/pantry/items/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deletePantryItem: (id: number) =>
    apiFetch<void>(`/pantry/items/${id}/`, { method: 'DELETE' }),
};
