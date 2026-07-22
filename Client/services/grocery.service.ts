import { apiFetch } from './api';

export interface BackendGroceryItem {
  id: number;
  user: number;
  recipe: number | null;
  name: string;
  quantity: number | null;
  unit: string;
  is_checked: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGroceryItemPayload {
  name: string;
  quantity?: number;
  unit?: string;
  recipe?: number;
  is_checked?: boolean;
}

export const groceryService = {
  listGroceryItems: () =>
    apiFetch<BackendGroceryItem[]>('/grocery/items/'),

  createGroceryItem: (data: CreateGroceryItemPayload) =>
    apiFetch<BackendGroceryItem>('/grocery/items/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateGroceryItem: (id: number, data: Partial<CreateGroceryItemPayload>) =>
    apiFetch<BackendGroceryItem>(`/grocery/items/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteGroceryItem: (id: number) =>
    apiFetch<void>(`/grocery/items/${id}/`, { method: 'DELETE' }),
};
