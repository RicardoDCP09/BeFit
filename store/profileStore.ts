import { profileApi } from '@/utils/api';
import { create } from 'zustand';

interface WeightEntry {
  date: string;
  weight: number;
  notes?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  progress: number;
  target: number;
}

interface DailyQuote {
  quote: string;
  author: string;
  category: 'motivation' | 'health' | 'mindfulness' | 'nutrition';
}

interface ProfileState {
  weightHistory: WeightEntry[];
  achievements: Achievement[];
  dailyQuote: DailyQuote | null;
  streakDays: number;
  totalWorkouts: number;
  totalChatSessions: number;
  weightChange: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadWeightHistory: () => Promise<void>;
  addWeightEntry: (weight: number, notes?: string) => Promise<void>;
  loadAchievements: () => Promise<void>;
  loadDailyQuote: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadAll: () => Promise<void>;
}

// Default quotes for offline/fallback
const defaultQuotes: DailyQuote[] = [
  // Motivation
  { quote: "El único mal entrenamiento es el que no hiciste.", author: "Anónimo", category: 'motivation' },
  { quote: "Tu cuerpo puede soportar casi todo. Es tu mente la que tienes que convencer.", author: "Anónimo", category: 'motivation' },
  { quote: "No se trata de ser perfecto, se trata de ser mejor que ayer.", author: "Anónimo", category: 'motivation' },
  { quote: "El ejercicio es una celebración de lo que tu cuerpo puede hacer, no un castigo por lo que comiste.", author: "Anónimo", category: 'motivation' },
  { quote: "El dolor que sientes hoy será la fuerza que sentirás mañana.", author: "Arnold Schwarzenegger", category: 'motivation' },
  { quote: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali", category: 'motivation' },
  { quote: "El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el coraje de continuar.", author: "Winston Churchill", category: 'motivation' },
  { quote: "Cada logro comienza con la decisión de intentarlo.", author: "John F. Kennedy", category: 'motivation' },
  { quote: "La disciplina es el puente entre metas y logros.", author: "Jim Rohn", category: 'motivation' },
  { quote: "No hay atajos para ningún lugar que valga la pena.", author: "Beverly Sills", category: 'motivation' },
  { quote: "Tu único límite eres tú mismo.", author: "Anónimo", category: 'motivation' },
  { quote: "Haz hoy lo que otros no harán, para tener mañana lo que otros no tendrán.", author: "Jerry Rice", category: 'motivation' },

  // Health
  { quote: "La salud no es solo estar libre de enfermedad, es un estado de bienestar físico, mental y social.", author: "OMS", category: 'health' },
  { quote: "Cuida tu cuerpo. Es el único lugar que tienes para vivir.", author: "Jim Rohn", category: 'health' },
  { quote: "La salud es la mayor posesión. La alegría es el mayor tesoro.", author: "Lao Tzu", category: 'health' },
  { quote: "Un cuerpo sano es la mejor moda que puedes lucir.", author: "Anónimo", category: 'health' },
  { quote: "Invertir en tu salud producirá enormes dividendos.", author: "Anónimo", category: 'health' },
  { quote: "El movimiento es medicina para crear el cambio físico, emocional y mental.", author: "Carol Welch", category: 'health' },
  { quote: "Tu salud es una inversión, no un gasto.", author: "Anónimo", category: 'health' },
  { quote: "El ejercicio no solo cambia tu cuerpo, cambia tu mente, actitud y humor.", author: "Anónimo", category: 'health' },

  // Mindfulness
  { quote: "La paz viene de adentro. No la busques afuera.", author: "Buda", category: 'mindfulness' },
  { quote: "La mente lo es todo. En lo que piensas, te conviertes.", author: "Buda", category: 'mindfulness' },
  { quote: "Respira. Suelta. Y recuerda que este momento es el único que sabes que tienes con certeza.", author: "Oprah Winfrey", category: 'mindfulness' },
  { quote: "La calma es un superpoder.", author: "Anónimo", category: 'mindfulness' },
  { quote: "No puedes detener las olas, pero puedes aprender a surfear.", author: "Jon Kabat-Zinn", category: 'mindfulness' },
  { quote: "El presente es el único momento que tenemos para estar vivos.", author: "Thich Nhat Hanh", category: 'mindfulness' },
  { quote: "La felicidad no es algo hecho. Viene de tus propias acciones.", author: "Dalai Lama", category: 'mindfulness' },
  { quote: "Donde hay paz y meditación, no hay ansiedad ni duda.", author: "San Francisco de Asís", category: 'mindfulness' },

  // Nutrition
  { quote: "Que tu alimento sea tu medicina y tu medicina sea tu alimento.", author: "Hipócrates", category: 'nutrition' },
  { quote: "Come para nutrir tu cuerpo, no para alimentar tus emociones.", author: "Anónimo", category: 'nutrition' },
  { quote: "Una manzana al día mantiene al doctor alejado.", author: "Proverbio", category: 'nutrition' },
  { quote: "Tu dieta es una cuenta bancaria. Las buenas elecciones son buenos depósitos.", author: "Bethenny Frankel", category: 'nutrition' },
  { quote: "La comida que comes puede ser la forma más segura de medicina o la forma más lenta de veneno.", author: "Ann Wigmore", category: 'nutrition' },
  { quote: "No hagas dieta, cambia tu estilo de vida.", author: "Anónimo", category: 'nutrition' },
  { quote: "Come colores. Entre más colorido tu plato, más saludable será.", author: "Anónimo", category: 'nutrition' },
  { quote: "La nutrición adecuada es la base de una vida saludable.", author: "Anónimo", category: 'nutrition' },
];

// Default achievements
const defaultAchievements: Achievement[] = [
  {
    id: 'first_workout',
    title: 'Primera Rutina',
    description: 'Completa tu primera rutina de ejercicios',
    icon: 'trophy',
    unlockedAt: null,
    progress: 0,
    target: 1,
  },
  {
    id: 'week_streak',
    title: 'Semana Perfecta',
    description: 'Entrena 7 días seguidos',
    icon: 'fire',
    unlockedAt: null,
    progress: 0,
    target: 7,
  },
  {
    id: 'first_recipe',
    title: 'Chef Principiante',
    description: 'Genera tu primera receta saludable',
    icon: 'cutlery',
    unlockedAt: null,
    progress: 0,
    target: 1,
  },
  {
    id: 'mindful_week',
    title: 'Mente Clara',
    description: 'Usa el diario mental 7 días',
    icon: 'leaf',
    unlockedAt: null,
    progress: 0,
    target: 7,
  },
  {
    id: 'weight_tracker',
    title: 'Constancia',
    description: 'Registra tu peso 10 veces',
    icon: 'line-chart',
    unlockedAt: null,
    progress: 0,
    target: 10,
  },
];

export const useProfileStore = create<ProfileState>((set, get) => ({
  weightHistory: [],
  achievements: defaultAchievements,
  dailyQuote: null,
  streakDays: 0,
  totalWorkouts: 0,
  totalChatSessions: 0,
  weightChange: null,
  isLoading: false,
  error: null,

  loadWeightHistory: async () => {
    try {
      set({ isLoading: true });
      const response = await profileApi.getWeightHistory(30);
      set({ weightHistory: response.history, isLoading: false });
    } catch (error: any) {
      console.error('Load weight history error:', error);
      set({ weightHistory: [], isLoading: false });
    }
  },

  addWeightEntry: async (weight: number, notes?: string) => {
    try {
      const response = await profileApi.addWeight(weight, undefined, notes);
      const newEntry = response.entry;

      set((state) => {
        const filtered = state.weightHistory.filter(e => e.date !== newEntry.date);
        return {
          weightHistory: [...filtered, newEntry].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        };
      });
    } catch (error: any) {
      console.error('Add weight error:', error);
      set({ error: error.message });
    }
  },

  loadAchievements: async () => {
    try {
      const response = await profileApi.getAchievements();
      set({ achievements: response.achievements });
    } catch (error: any) {
      console.error('Load achievements error:', error);
      set({ achievements: defaultAchievements });
    }
  },

  loadDailyQuote: async () => {
    try {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const quoteIndex = dayOfYear % defaultQuotes.length;
      set({ dailyQuote: defaultQuotes[quoteIndex] });
    } catch (error: any) {
      set({ dailyQuote: defaultQuotes[0] });
    }
  },

  loadStats: async () => {
    try {
      const response = await profileApi.getStats();
      set({
        streakDays: response.streakDays,
        totalWorkouts: response.totalWorkouts,
        totalChatSessions: response.totalChatSessions,
        weightChange: response.weightChange,
      });
    } catch (error: any) {
      console.error('Load stats error:', error);
    }
  },

  loadAll: async () => {
    const { loadWeightHistory, loadAchievements, loadDailyQuote, loadStats } = get();
    await Promise.all([
      loadWeightHistory(),
      loadAchievements(),
      loadDailyQuote(),
      loadStats(),
    ]);
  },
}));
