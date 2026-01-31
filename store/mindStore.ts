import { ChatMessage, WellnessCard } from '@/types';
import { mindApi } from '@/utils/api';
import { create } from 'zustand';

interface MindState {
  messages: ChatMessage[];
  wellnessCards: WellnessCard[];
  currentMood: string | null;
  isSending: boolean;
  isLoadingTips: boolean;
  error: string | null;

  // Actions
  loadTodayChat: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  loadWellnessTips: (mood?: string) => Promise<void>;
  updateMood: (mood: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

export const useMindStore = create<MindState>((set, get) => ({
  messages: [],
  wellnessCards: [],
  currentMood: null,
  isSending: false,
  isLoadingTips: false,
  error: null,

  loadTodayChat: async () => {
    try {
      const response = await mindApi.getTodayChat();
      set({ messages: response.messages || [] });
    } catch (error: any) {
      console.error('Load chat error:', error);
    }
  },

  sendMessage: async (message: string) => {
    try {
      set({ isSending: true, error: null });

      // Add user message immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, userMessage],
      }));

      const response = await mindApi.sendMessage(message);

      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isSending: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Error al enviar mensaje',
        isSending: false,
      });
      throw error;
    }
  },

  loadWellnessTips: async (mood?: string) => {
    try {
      set({ isLoadingTips: true, error: null });
      const response = await mindApi.getWellnessTips(mood);

      set({
        wellnessCards: response.cards || [],
        isLoadingTips: false,
      });
    } catch (error: any) {
      console.error('Load wellness tips error:', error);
      set({
        wellnessCards: [],
        error: null, // Don't show error to user, just empty state
        isLoadingTips: false,
      });
    }
  },

  updateMood: async (mood: string) => {
    try {
      await mindApi.updateMood(mood);
      set({ currentMood: mood });

      // Reload tips based on new mood
      get().loadWellnessTips(mood);
    } catch (error: any) {
      set({ error: error.message || 'Error al actualizar estado de ánimo' });
    }
  },

  clearMessages: () => set({ messages: [] }),
  clearError: () => set({ error: null }),
}));
