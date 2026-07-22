import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recipeService, BackendRecipe, BackendCookBook } from '../services/recipe.service';

export interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string | null;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  calories: number;
  carbs: number;
  proteins: number;
  fats: number;
  servings: number;
  instructions: string;
  cuisine: string | null;
  ingredients: { name: string; quantity: number; unit: string }[];
  authorId: number;       // for ownership checks
  authorName: string;
  createdAt: string;
  isPublic?: boolean;
  isArchived?: boolean;
  likesCount?: number;
  dislikesCount?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  isSaved?: boolean;
}

export interface SavedRecipe {
  id: number;
  recipeId: number;
  createdAt: string;
}

export interface Cookbook {
  id: number;
  name: string;
  description: string;
  image: string | null;
  recipesCount: number;
  recipes: { recipeId: number; order: number }[];
}

function mapBackendRecipe(r: BackendRecipe): Recipe {
  return {
    id: r.id,
    title: r.title,
    description: r.description || '',
    image: r.image,
    difficulty: r.difficulty,
    prepTime: r.prep_time,
    cookTime: r.cook_time,
    calories: r.calories || 0,
    carbs: r.carbs || 0,
    proteins: r.proteins || 0,
    fats: r.fats || 0,
    servings: r.servings || 1,
    instructions: r.instructions || '',
    // cuisine_type comes as a plain string from to_representation
    cuisine: typeof r.cuisine_type === 'string' ? r.cuisine_type : null,
    // ingredients comes as 'ingredients' array from RecipeSerializer
    ingredients: (r.ingredients || r.ingredient_details || []).map((d: any) => ({
      name: d.name || d.ingredient?.name || '',
      quantity: Number(d.quantity) || 0,
      unit: d.unit || '',
    })),
    authorId: r.author?.id || 0,
    authorName: r.author?.username || '',
    createdAt: r.created_at,
    isPublic: r.is_public,
    isArchived: r.is_archived || false,
    likesCount: r.likes_count || 0,
    dislikesCount: r.dislikes_count || 0,
    isLiked: r.is_liked || false,
    isDisliked: r.is_disliked || false,
    isSaved: r.is_saved || false,
  };
}

interface RecipeStore {
  recipes: Recipe[];
  recipesLoading: boolean;
  recipesNextPage: string | null;

  savedRecipes: SavedRecipe[];
  savedRecipesLoading: boolean;

  cookbooks: Cookbook[];
  cookbooksLoading: boolean;

  recentlyViewedIds: number[];
  scannedIngredients: string[];

  fetchRecipes: (reset?: boolean) => Promise<void>;
  fetchRecipeById: (id: number) => Promise<Recipe | null>;
  fetchSavedRecipes: () => Promise<void>;
  toggleSaveRecipe: (recipeId: number) => Promise<void>;
  fetchCookBooks: () => Promise<void>;
  addCookbook: (name: string, description: string) => Promise<void>;
  deleteCookbook: (id: number) => Promise<void>;
  addToRecentlyViewed: (id: number) => void;
  setScannedIngredients: (ingredients: string[]) => void;
  addScannedIngredient: (ingredient: string) => void;
  removeScannedIngredient: (ingredient: string) => void;
  likeRecipe: (recipeId: number) => Promise<void>;
  dislikeRecipe: (recipeId: number) => Promise<void>;
  clearScannedIngredients: () => void;
  deleteRecipe: (recipeId: number) => Promise<void>;
  archiveRecipe: (recipeId: number) => Promise<void>;
  updateRecipe: (recipeId: number, data: import('../services/recipe.service').CreateRecipePayload) => Promise<Recipe>;
  fetchMyRecipes: (userId: number) => Promise<Recipe[]>;

  // Backward compatibility
  recipesCache: Record<string, any>;
  favorites: string[];
  recentlyViewed: string[];
  toggleFavorite: (id: string) => void;
  editCookbook: (id: string, name: string, recipes?: string[]) => Promise<void>;
  addRecipeToCookbook: (cookbookId: string, recipeId: string) => Promise<void>;
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      recipes: [],
      recipesLoading: false,
      recipesNextPage: null,

      savedRecipes: [],
      savedRecipesLoading: false,

      cookbooks: [],
      cookbooksLoading: false,

      recentlyViewedIds: [],
      scannedIngredients: [],

      fetchRecipes: async (reset = false) => {
        const state = get();
        if (state.recipesLoading) return;
        if (!reset && !state.recipesNextPage) return;

        set({ recipesLoading: true });
        try {
          const url = reset ? undefined : state.recipesNextPage?.split('/api')[1]?.replace(/^\?/, '');
          const res = await recipeService.listRecipes(url);
          const mapped = res.results.map(mapBackendRecipe);
          set((s) => ({
            recipes: reset ? mapped : [...s.recipes, ...mapped],
            recipesNextPage: res.next,
            recipesLoading: false,
          }));
        } catch {
          set({ recipesLoading: false });
        }
      },

      fetchRecipeById: async (id) => {
        try {
          const r = await recipeService.getRecipe(id);
          return mapBackendRecipe(r);
        } catch {
          return null;
        }
      },

      fetchSavedRecipes: async () => {
        set({ savedRecipesLoading: true });
        try {
          const res = await recipeService.listSavedRecipes();
          const mapped: SavedRecipe[] = res.results.map((s) => ({
            id: s.id,
            recipeId: s.recipe,
            createdAt: s.created_at,
          }));
          set({ savedRecipes: mapped, savedRecipesLoading: false });
        } catch {
          set({ savedRecipesLoading: false });
        }
      },

      toggleSaveRecipe: async (recipeId) => {
        const state = get();
        const existing = state.savedRecipes.find((s) => s.recipeId === recipeId);
        if (existing) {
          set({ savedRecipes: state.savedRecipes.filter((s) => s.recipeId !== recipeId) });
          try {
            await recipeService.unsaveRecipe(existing.id);
          } catch {
            set({ savedRecipes: state.savedRecipes });
          }
        } else {
          const temp: SavedRecipe = { id: -Date.now(), recipeId, createdAt: new Date().toISOString() };
          set({ savedRecipes: [...state.savedRecipes, temp] });
          try {
            const res = await recipeService.saveRecipe(recipeId);
            set((s) => ({
              savedRecipes: s.savedRecipes.map((r) =>
                r.id === temp.id ? { id: res.id, recipeId: res.recipe, createdAt: res.created_at } : r
              ),
            }));
          } catch {
            set({ savedRecipes: state.savedRecipes });
          }
        }
      },

      fetchCookBooks: async () => {
        set({ cookbooksLoading: true });
        try {
          const res = await recipeService.listCookBooks();
          
          const additionalRecipes: Recipe[] = [];
          res.results.forEach((cb) => {
            (cb.recipes || []).forEach((item) => {
              if (item.recipe) {
                const mappedR = mapBackendRecipe(item.recipe);
                if (!additionalRecipes.some((r) => r.id === mappedR.id)) {
                  additionalRecipes.push(mappedR);
                }
              }
            });
          });

          const mapped: Cookbook[] = res.results.map((cb) => ({
            id: cb.id,
            name: cb.name,
            description: cb.description,
            image: cb.image,
            recipesCount: cb.recipes_count,
            recipes: (cb.recipes || []).map((r) => ({ recipeId: r.recipe.id, order: r.order })),
          }));

          set((s) => {
            const mergedRecipes = [...s.recipes];
            additionalRecipes.forEach((ar) => {
              if (!mergedRecipes.some((r) => r.id === ar.id)) {
                mergedRecipes.push(ar);
              }
            });
            return {
              cookbooks: mapped,
              recipes: mergedRecipes,
              cookbooksLoading: false,
            };
          });
        } catch {
          set({ cookbooksLoading: false });
        }
      },

      addCookbook: async (name, description) => {
        try {
          const res = await recipeService.createCookBook({ name, description });
          set((s) => ({
            cookbooks: [
              ...s.cookbooks,
              { id: res.id, name: res.name, description: res.description, image: res.image, recipesCount: 0, recipes: [] },
            ],
          }));
        } catch {}
      },

      deleteCookbook: async (id) => {
        const state = get();
        set({ cookbooks: state.cookbooks.filter((cb) => cb.id !== id) });
        try {
          await recipeService.deleteCookBook(id);
        } catch {
          set({ cookbooks: state.cookbooks });
        }
      },

      addToRecentlyViewed: (id) =>
        set((state) => {
          const filtered = state.recentlyViewedIds.filter((rId) => rId !== id);
          return { recentlyViewedIds: [id, ...filtered].slice(0, 10) };
        }),

      setScannedIngredients: (ingredients) => set({ scannedIngredients: ingredients }),

      addScannedIngredient: (ingredient) =>
        set((state) => {
          const normalized = ingredient.trim();
          if (!normalized) return {};
          const exists = state.scannedIngredients.some(
            (i) => i.toLowerCase() === normalized.toLowerCase()
          );
          if (exists) return {};
          return { scannedIngredients: [...state.scannedIngredients, normalized] };
        }),

      removeScannedIngredient: (ingredient) =>
        set((state) => ({
          scannedIngredients: state.scannedIngredients.filter(
            (i) => i.toLowerCase() !== ingredient.toLowerCase()
          ),
        })),

      clearScannedIngredients: () => set({ scannedIngredients: [] }),

      likeRecipe: async (recipeId) => {
        try {
          const res = await recipeService.likeRecipe(recipeId);
          set((s) => ({
            recipes: s.recipes.map((r) =>
              r.id === recipeId
                ? {
                    ...r,
                    isLiked: res.liked,
                    isDisliked: res.liked ? false : r.isDisliked,
                    likesCount: res.likes_count,
                    dislikesCount: res.dislikes_count,
                  }
                : r
            ),
          }));
        } catch (_) {}
      },

      dislikeRecipe: async (recipeId) => {
        try {
          const res = await recipeService.dislikeRecipe(recipeId);
          set((s) => ({
            recipes: s.recipes.map((r) =>
              r.id === recipeId
                ? {
                    ...r,
                    isDisliked: res.disliked,
                    isLiked: res.disliked ? false : r.isLiked,
                    likesCount: res.likes_count,
                    dislikesCount: res.dislikes_count,
                  }
                : r
            ),
          }));
        } catch (_) {}
      },

      deleteRecipe: async (recipeId) => {
        // Optimistic removal
        const prev = get().recipes;
        set((s) => ({ recipes: s.recipes.filter((r) => r.id !== recipeId) }));
        try {
          await recipeService.deleteRecipe(recipeId);
        } catch {
          set({ recipes: prev }); // Roll back on error
        }
      },

      archiveRecipe: async (recipeId) => {
        try {
          const res = await recipeService.archiveRecipe(recipeId);
          set((s) => ({
            recipes: s.recipes.map((r) =>
              r.id === recipeId ? { ...r, isArchived: res.archived } : r
            ),
          }));
        } catch (_) {}
      },

      updateRecipe: async (recipeId, data) => {
        const res = await recipeService.updateRecipe(recipeId, data);
        const mapped = mapBackendRecipe(res);
        set((s) => ({
          recipes: s.recipes.map((r) => (r.id === recipeId ? mapped : r)),
        }));
        return mapped;
      },

      fetchMyRecipes: async (userId) => {
        // Always fetch fresh from backend using reset=true, then filter
        await get().fetchRecipes(true);
        return get().recipes.filter((r) => r.authorId === userId);
      },

      // Backward compatibility for old screens
      get recipesCache() {
        const state = get();
        const cache: Record<string, any> = {};
        state.recipes.forEach((r) => {
          cache[String(r.id)] = {
            id: String(r.id),
            title: r.title,
            time: `${r.prepTime + r.cookTime} min`,
            kcal: `${r.calories} kcal`,
            servings: `${r.servings} People`,
            image: r.image,
            ingredients: r.ingredients.map((i) => ({ name: i.name, amount: `${i.quantity} ${i.unit}` })),
            steps: r.instructions ? r.instructions.split(/\n|\r/).filter((s: string) => s.trim()) : [],
          };
        });
        return cache;
      },
      get favorites() { return get().savedRecipes.filter((s) => s.recipeId > 0).map((s) => String(s.recipeId)); },
      get recentlyViewed() { return get().recentlyViewedIds.map(String); },
      toggleFavorite: (id: string) => {
        const numId = Number(id);
        get().toggleSaveRecipe(numId);
      },
      editCookbook: async (id: string, name: string, recipes?: string[]) => {
        try {
          await recipeService.updateCookBook(Number(id), { name } as any);
          get().fetchCookBooks();
        } catch {}
      },
      addRecipeToCookbook: async (cookbookId: string, recipeId: string) => {
        // TODO: implement add recipe to cookbook API
      },
    }),
    {
      name: 'cooked-recipe-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recentlyViewedIds: state.recentlyViewedIds,
        scannedIngredients: state.scannedIngredients,
      }),
    }
  )
);
