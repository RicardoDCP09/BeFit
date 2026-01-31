import { create } from 'zustand';
import { kitchenApi } from '@/utils/api';
import { Ingredient, Recipe } from '@/types';

interface KitchenState {
  ingredients: Ingredient[];
  summary: string | null;
  currentRecipe: Recipe | null;
  isAnalyzing: boolean;
  isGeneratingRecipe: boolean;
  error: string | null;

  // Actions
  analyzeImage: (imageBase64: string) => Promise<void>;
  generateRecipe: () => Promise<void>;
  smartCook: (imageBase64: string) => Promise<void>;
  clearIngredients: () => void;
  clearRecipe: () => void;
  clearError: () => void;
}

export const useKitchenStore = create<KitchenState>((set, get) => ({
  ingredients: [],
  summary: null,
  currentRecipe: null,
  isAnalyzing: false,
  isGeneratingRecipe: false,
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

  clearIngredients: () => set({ ingredients: [], summary: null }),
  clearRecipe: () => set({ currentRecipe: null }),
  clearError: () => set({ error: null }),
}));
