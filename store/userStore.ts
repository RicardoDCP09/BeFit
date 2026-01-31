import { HealthProfile } from '@/types';
import { userApi } from '@/utils/api';
import { create } from 'zustand';

interface UserState {
  healthProfile: HealthProfile | null;
  isLoading: boolean;
  error: string | null;
  calculations: {
    bmi: number | null;
    bmiCategory: string | null;
    tmb: number | null;
    tdee: number | null;
    bodyFatPercentage: number | null;
  };

  // Actions
  loadHealthProfile: () => Promise<void>;
  updateHealthProfile: (data: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityLevel: string;
    goal: string;
  }) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  healthProfile: null,
  isLoading: false,
  error: null,
  calculations: {
    bmi: null,
    bmiCategory: null,
    tmb: null,
    tdee: null,
    bodyFatPercentage: null,
  },

  loadHealthProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await userApi.getHealthProfile();

      const hp = response.healthProfile;
      set({
        healthProfile: hp,
        calculations: {
          bmi: hp?.bmi ? parseFloat(String(hp.bmi)) : null,
          bmiCategory: response.bmiCategory || null,
          tmb: hp?.tmb ? parseFloat(String(hp.tmb)) : null,
          tdee: hp?.tdee ? parseFloat(String(hp.tdee)) : null,
          bodyFatPercentage: hp?.bodyFatPercentage ? parseFloat(String(hp.bodyFatPercentage)) : null,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar perfil',
        isLoading: false,
      });
    }
  },

  updateHealthProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await userApi.updateHealthProfile(data);

      const calc = response.calculations || {};
      set({
        healthProfile: response.healthProfile,
        calculations: {
          bmi: calc.bmi ? parseFloat(String(calc.bmi)) : null,
          bmiCategory: calc.bmiCategory || null,
          tmb: calc.tmb ? parseFloat(String(calc.tmb)) : null,
          tdee: calc.tdee ? parseFloat(String(calc.tdee)) : null,
          bodyFatPercentage: calc.bodyFatPercentage ? parseFloat(String(calc.bodyFatPercentage)) : null,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error al actualizar perfil',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
