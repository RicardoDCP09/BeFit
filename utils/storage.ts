import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Web fallback using localStorage
const webStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

// Use SecureStore on native, localStorage on web
export const storage = Platform.OS === 'web' ? webStorage : SecureStore;
