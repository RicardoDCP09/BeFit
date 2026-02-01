import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  isLoading: boolean;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
  resolveTheme: (systemColorScheme: 'light' | 'dark' | null) => void;
}

const THEME_STORAGE_KEY = 'befit_theme_mode';

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  isDark: false,
  isLoading: true,

  loadTheme: async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        set({ mode: savedMode as ThemeMode, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      set({ isLoading: false });
    }
  },

  setMode: async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      // Calculate isDark immediately based on new mode
      if (mode === 'dark') {
        set({ mode, isDark: true });
      } else if (mode === 'light') {
        set({ mode, isDark: false });
      } else {
        // For 'system', just set mode - isDark will be resolved by resolveTheme
        set({ mode });
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  toggleTheme: async () => {
    const { isDark, setMode } = get();
    const newMode = isDark ? 'light' : 'dark';
    await setMode(newMode);
  },

  resolveTheme: (systemColorScheme: 'light' | 'dark' | null) => {
    const { mode } = get();
    let isDark = false;

    if (mode === 'system') {
      isDark = systemColorScheme === 'dark';
    } else {
      isDark = mode === 'dark';
    }

    set({ isDark });
  },
}));
