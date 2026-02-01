import { ChatMessage, WellnessCard } from '@/types';
import { mindApi } from '@/utils/api';
import { create } from 'zustand';

interface MindState {
  messages: ChatMessage[];
  wellnessCards: WellnessCard[];
  currentMood: string | null;
  quickReplies: string[];
  isSending: boolean;
  isLoadingTips: boolean;
  error: string | null;

  // Actions
  loadTodayChat: () => Promise<void>;
  sendMessage: (message: string, mood?: string) => Promise<void>;
  loadWellnessTips: (mood?: string) => Promise<void>;
  setMood: (mood: string) => void;
  clearMessages: () => void;
  clearError: () => void;
}

export const useMindStore = create<MindState>((set, get) => ({
  messages: [],
  wellnessCards: [],
  currentMood: null,
  quickReplies: [],
  isSending: false,
  isLoadingTips: false,
  error: null,

  loadTodayChat: async () => {
    try {
      const response = await mindApi.getTodayChat();
      set({
        messages: response.messages || [],
        currentMood: response.mood || null,
      });
    } catch (error: any) {
      console.error('Load chat error:', error);
    }
  },

  sendMessage: async (message: string, mood?: string) => {
    try {
      set({ isSending: true, error: null, quickReplies: [] });

      // Add user message immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, userMessage],
      }));

      // Send with mood if provided (first message of session)
      const response = await mindApi.sendMessage(message, mood || get().currentMood || undefined);

      // Add AI response
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        quickReplies: response.quickReplies || [],
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

  setMood: (mood: string) => {
    set({ currentMood: mood });
  },

  clearMessages: () => set({ messages: [], quickReplies: [], currentMood: null }),
  clearError: () => set({ error: null }),
}));
