import { Platform } from 'react-native';
import { storage } from './storage';

// Production API URL
const PRODUCTION_API_URL = 'https://befit-g0zx.onrender.com/api';

// Get API URL from environment or use defaults
const getApiUrl = (): string => {
  // Check for production environment variable (must be a non-empty string)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
    return envUrl;
  }

  // Use production URL for native builds, local for web development
  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'web') {
      return 'http://localhost:3001/api';
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001/api';
    }
    return 'http://localhost:3001/api';
  }

  // Production build - use Render backend
  return PRODUCTION_API_URL;
};

const API_URL = getApiUrl();
console.log('[API] URL:', API_URL, '| Platform:', Platform.OS);

async function getToken(): Promise<string | null> {
  try {
    return await storage.getItemAsync('token');
  } catch {
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const url = `${API_URL}${endpoint}`;

  console.log('[API] Request:', options.method || 'GET', url);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error: any) {
    console.log('[API] Error:', error.message);
    throw error;
  }
}

// Auth API
export const authApi = {
  register: (email: string, password: string, name?: string) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  refresh: (token: string) =>
    request<{ token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
};

// User API
export const userApi = {
  getProfile: () => request<{ user: any }>('/user/profile'),

  updateProfile: (name: string) =>
    request<{ user: any }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  updateHealthProfile: (data: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityLevel: string;
    goal: string;
  }) =>
    request<{ healthProfile: any; calculations: any }>('/user/health-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getHealthProfile: () =>
    request<{ healthProfile: any; bmiCategory: string }>('/user/health-profile'),
};

// Gym API
export const gymApi = {
  generateRoutine: () =>
    request<{ routine: any }>('/gym/generate', {
      method: 'POST',
    }),

  getCurrentRoutine: () => request<{ routine: any }>('/gym/current'),

  updateProgress: (day: string, exerciseIndex: number, completed: boolean) =>
    request<{ progress: any; completionPercentage: number }>('/gym/progress', {
      method: 'PUT',
      body: JSON.stringify({ day, exerciseIndex, completed }),
    }),

  getHistory: () => request<{ routines: any[] }>('/gym/history'),

  // Workout Session endpoints
  startSession: (routineId: number, dayName: string, restTimeUsed: number) =>
    request<{ session: any }>('/gym/session/start', {
      method: 'POST',
      body: JSON.stringify({ routineId, dayName, restTimeUsed }),
    }),

  completeSession: (sessionId: number, data: { exerciseData: any[]; exercisesCompleted: number }) =>
    request<{ session: any }>(`/gym/session/${sessionId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getSessions: (limit?: number) =>
    request<{ sessions: any[] }>(`/gym/sessions${limit ? `?limit=${limit}` : ''}`),

  getSessionStats: () =>
    request<{ stats: any }>('/gym/sessions/stats'),
};

// Kitchen API
export const kitchenApi = {
  analyzeImage: (image: string) =>
    request<{ ingredients: any[]; summary: string }>('/kitchen/analyze', {
      method: 'POST',
      body: JSON.stringify({ image }),
    }),

  generateRecipe: (ingredients: any[]) =>
    request<{ recipe: any }>('/kitchen/recipe', {
      method: 'POST',
      body: JSON.stringify({ ingredients }),
    }),

  smartCook: (image: string) =>
    request<{ ingredients: any[]; summary: string; recipe: any }>(
      '/kitchen/smart-cook',
      {
        method: 'POST',
        body: JSON.stringify({ image }),
      }
    ),

  getHistory: (favoritesOnly = false) =>
    request<{ recipes: any[] }>(
      `/kitchen/history${favoritesOnly ? '?favorites=true' : ''}`
    ),

  toggleFavorite: (id: number) =>
    request<{ isFavorite: boolean }>(`/kitchen/history/${id}/favorite`, {
      method: 'PUT',
    }),

  deleteRecipe: (id: number) =>
    request<{ message: string }>(`/kitchen/history/${id}`, {
      method: 'DELETE',
    }),
};

// Mind API
export const mindApi = {
  sendMessage: (message: string, mood?: string) =>
    request<{ response: string; sessionId: number; quickReplies?: string[] }>('/mind/chat', {
      method: 'POST',
      body: JSON.stringify({ message, mood }),
    }),

  getTodayChat: () =>
    request<{ messages: any[]; sessionId: number | null; mood?: string }>('/mind/chat/today'),

  getChatHistory: () => request<{ sessions: any[] }>('/mind/chat/history'),

  getWellnessTips: (mood?: string) =>
    request<{ cards: any[] }>(`/mind/tips${mood ? `?mood=${mood}` : ''}`),

  updateMood: (mood: string) =>
    request<{ mood: string }>('/mind/mood', {
      method: 'PUT',
      body: JSON.stringify({ mood }),
    }),
};

// Profile API
export const profileApi = {
  getWeightHistory: (limit = 30) =>
    request<{ history: { date: string; weight: number; notes?: string }[] }>(
      `/profile/weight-history?limit=${limit}`
    ),

  addWeight: (weight: number, date?: string, notes?: string) =>
    request<{ entry: { date: string; weight: number; notes?: string } }>(
      '/profile/weight',
      {
        method: 'POST',
        body: JSON.stringify({ weight, date, notes }),
      }
    ),

  getStats: () =>
    request<{
      streakDays: number;
      totalWorkouts: number;
      totalChatSessions: number;
      totalWeightEntries: number;
      weightChange: number | null;
    }>('/profile/stats'),

  getAchievements: () =>
    request<{
      achievements: {
        id: string;
        title: string;
        description: string;
        icon: string;
        progress: number;
        target: number;
        unlockedAt: string | null;
      }[];
    }>('/profile/achievements'),
};
