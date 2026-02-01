// User types
export interface User {
  id: number;
  email: string;
  name: string | null;
  onboardingCompleted: boolean;
  healthProfile?: HealthProfile;
}

export interface HealthProfile {
  id: number;
  userId: number;
  weight: number | null;
  height: number | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  goal: 'lose_fat' | 'gain_muscle' | 'maintain' | 'improve_health' | null;
  bmi: number | null;
  tmb: number | null;
  tdee: number | null;
  bodyFatPercentage: number | null;
}

// Auth types
export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Gym types
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  estimatedTime?: number; // Time in seconds for all sets
  notes?: string;
}

export interface DayPlan {
  day: string;
  focus: string;
  exercises: Exercise[];
  duration: string;
  calories: number;
}

export interface RoutinePlan {
  weekPlan: DayPlan[];
  tips: string[];
  weeklyGoal: string;
}

export interface Routine {
  id: number;
  userId: number;
  weekStart: string;
  plan: RoutinePlan;
  progress: Record<string, Record<number, boolean>>;
  isActive: boolean;
}

// Kitchen types
export interface Ingredient {
  name: string;
  quantity: string;
  category: string;
  freshness: string;
}

export interface RecipeIngredient {
  item: string;
  amount: string;
}

export interface Nutrition {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
}

export interface Recipe {
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutrition: Nutrition;
  explanation: string;
  tips: string[];
}

// Mind types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface WellnessCard {
  title: string;
  category: string;
  content: string;
  actionTip: string;
}

// API Response types
export interface ApiResponse<T> {
  message?: string;
  error?: string;
  data?: T;
}

// Workout Session types
export interface ExerciseSessionData {
  exerciseIndex: number;
  name: string;
  timeSpent: number;      // Actual time in seconds
  estimatedTime: number;  // Estimated time in seconds
  setsCompleted: number;
}

export interface WorkoutSession {
  id: number;
  userId: number;
  routineId: number;
  dayName: string;
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  exercisesCompleted: number;
  exerciseData: ExerciseSessionData[];
  restTimeUsed: number;
  isCompleted: boolean;
}

export interface SessionStats {
  totalSessions: number;
  totalTime: number;
  avgSessionDuration: number;
  exercisesCompleted: number;
  thisWeek: number;
  thisMonth: number;
}

export interface RestTimeOption {
  label: string;
  seconds: number;
}
