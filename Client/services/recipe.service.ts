import { apiFetch } from './api';

// -------------------------------------------------------
// Types matching the Django backend serializer output
// -------------------------------------------------------

export interface BackendIngredientDetail {
  name: string;       // flat field from RecipeIngredientSerializer
  quantity: number;
  unit: string;
}

export interface BackendRecipe {
  id: number;
  title: string;
  description: string;
  image: string | null;
  video_url: string;
  difficulty: 'easy' | 'medium' | 'hard';   // backend stores lowercase
  prep_time: number;
  cook_time: number;
  fats: number;
  carbs: number;
  proteins: number;
  calories: number;
  servings: number;
  instructions: string;
  is_public: boolean;
  is_archived: boolean;
  // computed fields from serializer
  likes_count: number;
  dislikes_count: number;
  is_liked: boolean;
  is_disliked: boolean;
  is_saved: boolean;
  // relations — read form
  cuisine_type: string | null;            // to_representation returns name string
  allergen_info: string[];                // to_representation returns list of name strings
  ingredients?: BackendIngredientDetail[];
  ingredient_details?: BackendIngredientDetail[];
  author: {
    id: number;
    username: string;
    email: string;
    profile_picture: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface BackendSavedRecipe {
  id: number;
  user: number;
  recipe: number;
  recipe_details: BackendRecipe;
  created_at: string;
}

export interface BackendCookBook {
  id: number;
  name: string;
  description: string;
  image: string | null;
  author: { id: number; username: string; email: string; profile_picture: string | null };
  recipes: {
    recipe: BackendRecipe;
    order: number;
    added_at: string;
  }[];
  recipes_count: number;
  created_at: string;
  updated_at: string;
}

export interface BackendRecipeRating {
  id: number;
  user: { id: number; username: string; email: string; profile_picture: string | null };
  recipe: number;
  review: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

// Paginated list wrapper returned by all list endpoints
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Payload for creating / updating a recipe
export interface CreateRecipePayload {
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prep_time: number;
  cook_time: number;
  servings?: number;
  instructions: string;
  is_public?: boolean;
  is_archived?: boolean;
  fats?: number;
  carbs?: number;
  proteins?: number;
  calories?: number;
  cuisine_type?: string;            // plain string — backend resolves FK
  allergen_info?: string[];         // plain strings — backend resolves FK
  ingredients?: BackendIngredientDetail[];
}

// -------------------------------------------------------
// Service
// -------------------------------------------------------

export const recipeService = {
  // ---------- Recipes ----------
  listRecipes: (params?: string) =>
    apiFetch<PaginatedResponse<BackendRecipe>>(
      `/recipe/recipes/${params ? `?${params}` : ''}`
    ),

  getRecipe: (id: number) =>
    apiFetch<BackendRecipe>(`/recipe/recipes/${id}/`),

  createRecipe: (data: CreateRecipePayload) =>
    apiFetch<BackendRecipe>('/recipe/recipes/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRecipe: (id: number, data: Partial<CreateRecipePayload>) =>
    apiFetch<BackendRecipe>(`/recipe/recipes/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteRecipe: (id: number) =>
    apiFetch<void>(`/recipe/recipes/${id}/`, { method: 'DELETE' }),

  likeRecipe: (id: number) =>
    apiFetch<{ liked: boolean; likes_count: number; dislikes_count: number }>(
      `/recipe/recipes/${id}/like/`,
      { method: 'POST' }
    ),

  dislikeRecipe: (id: number) =>
    apiFetch<{ disliked: boolean; likes_count: number; dislikes_count: number }>(
      `/recipe/recipes/${id}/dislike/`,
      { method: 'POST' }
    ),

  archiveRecipe: (id: number) =>
    apiFetch<{ archived: boolean; message: string }>(
      `/recipe/recipes/${id}/archive/`,
      { method: 'POST' }
    ),

  // ---------- Saved Recipes ----------
  listSavedRecipes: () =>
    apiFetch<PaginatedResponse<BackendSavedRecipe>>('/recipe/saved/'),

  saveRecipe: (recipeId: number) =>
    apiFetch<BackendSavedRecipe>('/recipe/saved/', {
      method: 'POST',
      body: JSON.stringify({ recipe: recipeId }),
    }),

  unsaveRecipe: (savedId: number) =>
    apiFetch<void>(`/recipe/saved/${savedId}/`, { method: 'DELETE' }),

  // ---------- Ratings ----------
  listRatings: (recipeId?: number) =>
    apiFetch<PaginatedResponse<BackendRecipeRating>>(
      `/recipe/ratings/${recipeId ? `?recipe=${recipeId}` : ''}`
    ),

  createRating: (recipeId: number, rating: number, review?: string) =>
    apiFetch<BackendRecipeRating>('/recipe/ratings/', {
      method: 'POST',
      body: JSON.stringify({ recipe: recipeId, rating, review: review || '' }),
    }),

  updateRating: (ratingId: number, rating: number, review?: string) =>
    apiFetch<BackendRecipeRating>(`/recipe/ratings/${ratingId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ rating, review: review || '' }),
    }),

  deleteRating: (ratingId: number) =>
    apiFetch<void>(`/recipe/ratings/${ratingId}/`, { method: 'DELETE' }),

  // ---------- CookBooks ----------
  listCookBooks: () =>
    apiFetch<PaginatedResponse<BackendCookBook>>('/cookbook/'),

  getCookBook: (id: number) =>
    apiFetch<BackendCookBook>(`/cookbook/${id}/`),

  createCookBook: (data: { name: string; description: string; recipes?: { recipe: number; order: number }[] }) =>
    apiFetch<BackendCookBook>('/cookbook/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCookBook: (id: number, data: { name?: string; description?: string; recipes?: { recipe: number; order: number }[] }) =>
    apiFetch<BackendCookBook>(`/cookbook/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteCookBook: (id: number) =>
    apiFetch<void>(`/cookbook/${id}/`, { method: 'DELETE' }),

  // ---------- AI ----------
  generateRecipes: (prompt: string) =>
    apiFetch<{ recipes: any[] }[]>('/ai/generate-recipes/', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  getRecommendations: () =>
    apiFetch<any[]>('/ai/recommendations/'),
};
