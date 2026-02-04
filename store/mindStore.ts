import { ChatMessage, WellnessCard } from '@/types';
import { mindApi } from '@/utils/api';
import { create } from 'zustand';

interface ChatSession {
  id: number;
  createdAt: string;
  messages: ChatMessage[];
  mood: string | null;
}

interface MindState {
  messages: ChatMessage[];
  wellnessCards: WellnessCard[];
  chatHistory: ChatSession[];
  currentMood: string | null;
  quickReplies: string[];
  isSending: boolean;
  isLoadingTips: boolean;
  isLoadingHistory: boolean;
  error: string | null;

  // Actions
  loadTodayChat: () => Promise<void>;
  sendMessage: (message: string, mood?: string) => Promise<void>;
  loadWellnessTips: (mood?: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
  viewPastSession: (session: ChatSession) => void;
  setMood: (mood: string) => void;
  clearMessages: () => void;
  clearError: () => void;
}

export const useMindStore = create<MindState>((set, get) => ({
  messages: [],
  wellnessCards: [],
  chatHistory: [],
  currentMood: null,
  quickReplies: [],
  isSending: false,
  isLoadingTips: false,
  isLoadingHistory: false,
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

  loadChatHistory: async () => {
    try {
      set({ isLoadingHistory: true, error: null });
      const response = await mindApi.getChatHistory();

      // Map sessions to ensure correct field names (handle both camelCase and snake_case)
      const mappedSessions = (response.sessions || []).map((session: any) => ({
        id: session.id,
        createdAt: session.createdAt || session.created_at,
        messages: session.messages || [],
        mood: session.mood,
      }));

      set({
        chatHistory: mappedSessions,
        isLoadingHistory: false,
      });
    } catch (error: any) {
      console.error('Load chat history error:', error);
      set({
        chatHistory: [],
        isLoadingHistory: false,
      });
    }
  },

  viewPastSession: (session) => {
    set({
      messages: session.messages || [],
      currentMood: session.mood,
    });
  },

  clearMessages: () => set({ messages: [], quickReplies: [], currentMood: null }),
  clearError: () => set({ error: null }),
}));
