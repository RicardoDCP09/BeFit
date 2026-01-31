import { Routine } from '@/types';
import { gymApi } from '@/utils/api';
import { create } from 'zustand';

interface GymState {
  currentRoutine: Routine | null;
  routineHistory: Routine[];
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  completionPercentage: number;

  // Actions
  loadCurrentRoutine: () => Promise<void>;
  generateRoutine: () => Promise<void>;
  updateProgress: (day: string, exerciseIndex: number, completed: boolean) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearError: () => void;
}

export const useGymStore = create<GymState>((set, get) => ({
  currentRoutine: null,
  routineHistory: [],
  isLoading: false,
  isGenerating: false,
  error: null,
  completionPercentage: 0,

  loadCurrentRoutine: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await gymApi.getCurrentRoutine();

      // Calculate completion percentage
      const routine = response.routine;
      let percentage = 0;

      if (routine && routine.plan && routine.plan.weekPlan) {
        let total = 0;
        let completed = 0;

        routine.plan.weekPlan.forEach((day: any) => {
          if (day.exercises) {
            total += day.exercises.length;
            const dayProgress = routine.progress?.[day.day] || {};
            Object.values(dayProgress).forEach((isCompleted) => {
              if (isCompleted) completed++;
            });
          }
        });

        percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      }

      set({
        currentRoutine: routine,
        completionPercentage: percentage,
        isLoading: false,
      });
    } catch (error: any) {
      // 404 means no routine - that's okay, not an error
      const isNotFound = error.message?.includes('No active routine') || error.message?.includes('404');
      set({
        currentRoutine: null,
        completionPercentage: 0,
        error: isNotFound ? null : error.message,
        isLoading: false,
      });
    }
  },

  generateRoutine: async () => {
    try {
      set({ isGenerating: true, error: null });
      const response = await gymApi.generateRoutine();

      set({
        currentRoutine: response.routine,
        completionPercentage: 0,
        isGenerating: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error al generar rutina',
        isGenerating: false,
      });
      throw error;
    }
  },

  updateProgress: async (day: string, exerciseIndex: number, completed: boolean) => {
    try {
      const response = await gymApi.updateProgress(day, exerciseIndex, completed);

      const currentRoutine = get().currentRoutine;
      if (currentRoutine) {
        set({
          currentRoutine: {
            ...currentRoutine,
            progress: response.progress,
          },
          completionPercentage: response.completionPercentage,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Error al actualizar progreso' });
    }
  },

  loadHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await gymApi.getHistory();

      set({
        routineHistory: response.routines,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar historial',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
