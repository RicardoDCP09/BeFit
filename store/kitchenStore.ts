import { Ingredient, Recipe } from '@/types';
import { kitchenApi } from '@/utils/api';
import { create } from 'zustand';

interface RecipeHistoryItem {
  id: number;
  recipe: Recipe;
  ingredients: Ingredient[];
  isFavorite: boolean;
  createdAt: string;
}

interface KitchenState {
  ingredients: Ingredient[];
  summary: string | null;
  currentRecipe: Recipe | null;
  recipeHistory: RecipeHistoryItem[];
  isAnalyzing: boolean;
  isGeneratingRecipe: boolean;
  isLoadingHistory: boolean;
  error: string | null;

  // Actions
  analyzeImage: (imageBase64: string) => Promise<void>;
  generateRecipe: () => Promise<void>;
  smartCook: (imageBase64: string) => Promise<void>;
  loadHistory: (favoritesOnly?: boolean) => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  deleteRecipe: (id: number) => Promise<void>;
  viewRecipe: (recipe: Recipe) => void;
  clearIngredients: () => void;
  clearRecipe: () => void;
  clearError: () => void;
}

export const useKitchenStore = create<KitchenState>((set, get) => ({
  ingredients: [],
  summary: null,
  currentRecipe: null,
  recipeHistory: [],
  isAnalyzing: false,
  isGeneratingRecipe: false,
  isLoadingHistory: false,
  error: null,

  analyzeImage: async (imageBase64: string) => {
    try {
      set({ isAnalyzing: true, error: null });
      const response = await kitchenApi.analyzeImage(imageBase64);

      set({
        ingredients: response.ingredients,
        summary: response.summary,
        isAnalyzing: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error al analizar imagen',
        isAnalyzing: false,
      });
      throw error;
    }
  },

  generateRecipe: async () => {
    try {
      const ingredients = get().ingredients;
      if (ingredients.length === 0) {
        throw new Error('No hay ingredientes para generar receta');
      }

      set({ isGeneratingRecipe: true, error: null });
      const response = await kitchenApi.generateRecipe(ingredients);

      set({
        currentRecipe: response.recipe,
        isGeneratingRecipe: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error al generar receta',
        isGeneratingRecipe: false,
      });
      throw error;
    }
  },

  smartCook: async (imageBase64: string) => {
    try {
      set({ isAnalyzing: true, isGeneratingRecipe: true, error: null });
      const response = await kitchenApi.smartCook(imageBase64);

      set({
        ingredients: response.ingredients,
        summary: response.summary,
        currentRecipe: response.recipe,
        isAnalyzing: false,
        isGeneratingRecipe: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error en cocina inteligente',
        isAnalyzing: false,
        isGeneratingRecipe: false,
      });
      throw error;
    }
  },

  loadHistory: async (favoritesOnly = false) => {
    try {
      set({ isLoadingHistory: true, error: null });
      const response = await kitchenApi.getHistory(favoritesOnly);
      set({
        recipeHistory: response.recipes,
        isLoadingHistory: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar historial',
        isLoadingHistory: false,
      });
    }
  },

  toggleFavorite: async (id: number) => {
    try {
      const response = await kitchenApi.toggleFavorite(id);
      // Update local state
      set((state) => ({
        recipeHistory: state.recipeHistory.map((item) =>
          item.id === id ? { ...item, isFavorite: response.isFavorite } : item
        ),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Error al actualizar favorito' });
    }
  },

  deleteRecipe: async (id: number) => {
    try {
      await kitchenApi.deleteRecipe(id);
      // Remove from local state
      set((state) => ({
        recipeHistory: state.recipeHistory.filter((item) => item.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Error al eliminar receta' });
    }
  },

  viewRecipe: (recipe: Recipe) => {
    set({ currentRecipe: recipe });
  },

  clearIngredients: () => set({ ingredients: [], summary: null }),
  clearRecipe: () => set({ currentRecipe: null }),
  clearError: () => set({ error: null }),
}));
