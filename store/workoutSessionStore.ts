import { DayPlan, ExerciseSessionData, SessionStats, WorkoutSession } from '@/types';
import { gymApi } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { useGymStore } from './gymStore';

const REST_TIME_KEY = 'befit_rest_time';
const DEFAULT_REST_TIME = 60;

interface WorkoutSessionState {
  // Session state
  currentSession: WorkoutSession | null;
  isSessionActive: boolean;
  isPaused: boolean;

  // Current exercise tracking
  currentExerciseIndex: number;
  currentSet: number;
  exerciseStartTime: number | null;
  exerciseElapsedTime: number;

  // Rest timer
  isResting: boolean;
  restTimeRemaining: number;
  restTimeConfig: number;

  // Exercise data for session
  exerciseData: ExerciseSessionData[];

  // Day plan being worked on
  dayPlan: DayPlan | null;
  routineId: number | null;

  // History & stats
  sessionHistory: WorkoutSession[];
  sessionStats: SessionStats | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  loadRestTimeConfig: () => Promise<void>;
  setRestTimeConfig: (seconds: number) => Promise<void>;
  startSession: (routineId: number, dayPlan: DayPlan) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSet: () => void;
  skipRest: () => void;
  nextExercise: () => void;
  updateExerciseTime: (elapsed: number) => void;
  updateRestTime: (remaining: number) => void;
  updateEstimatedTime: (exerciseIndex: number, newTime: number) => void;
  completeSession: () => Promise<void>;
  cancelSession: () => void;
  loadSessionHistory: () => Promise<void>;
  loadSessionStats: () => Promise<void>;
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set, get) => ({
  // Initial state
  currentSession: null,
  isSessionActive: false,
  isPaused: false,
  currentExerciseIndex: 0,
  currentSet: 1,
  exerciseStartTime: null,
  exerciseElapsedTime: 0,
  isResting: false,
  restTimeRemaining: 0,
  restTimeConfig: DEFAULT_REST_TIME,
  exerciseData: [],
  dayPlan: null,
  routineId: null,
  sessionHistory: [],
  sessionStats: null,
  isLoading: false,
  error: null,

  loadRestTimeConfig: async () => {
    try {
      const saved = await AsyncStorage.getItem(REST_TIME_KEY);
      if (saved) {
        set({ restTimeConfig: parseInt(saved, 10) });
      }
    } catch (error) {
      console.error('Error loading rest time config:', error);
    }
  },

  setRestTimeConfig: async (seconds: number) => {
    try {
      await AsyncStorage.setItem(REST_TIME_KEY, seconds.toString());
      set({ restTimeConfig: seconds });
    } catch (error) {
      console.error('Error saving rest time config:', error);
    }
  },

  startSession: async (routineId: number, dayPlan: DayPlan) => {
    try {
      set({ isLoading: true, error: null });

      const { restTimeConfig } = get();
      const response = await gymApi.startSession(routineId, dayPlan.day, restTimeConfig);

      // Initialize exercise data array
      const initialExerciseData: ExerciseSessionData[] = dayPlan.exercises.map((ex, index) => ({
        exerciseIndex: index,
        name: ex.name,
        timeSpent: 0,
        estimatedTime: ex.estimatedTime || 180,
        setsCompleted: 0,
      }));

      set({
        currentSession: response.session,
        isSessionActive: true,
        isPaused: false,
        currentExerciseIndex: 0,
        currentSet: 1,
        exerciseStartTime: Date.now(),
        exerciseElapsedTime: 0,
        isResting: false,
        restTimeRemaining: 0,
        exerciseData: initialExerciseData,
        dayPlan,
        routineId,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to start session',
        isLoading: false,
      });
      throw error;
    }
  },

  pauseSession: () => {
    set({ isPaused: true });
  },

  resumeSession: () => {
    set({ isPaused: false });
  },

  completeSet: () => {
    const { currentSet, currentExerciseIndex, dayPlan, exerciseData, restTimeConfig, exerciseElapsedTime } = get();

    if (!dayPlan) return;

    const currentExercise = dayPlan.exercises[currentExerciseIndex];
    const totalSets = currentExercise.sets;

    // Update exercise data with time spent
    const updatedExerciseData = [...exerciseData];
    updatedExerciseData[currentExerciseIndex] = {
      ...updatedExerciseData[currentExerciseIndex],
      setsCompleted: currentSet,
      timeSpent: updatedExerciseData[currentExerciseIndex].timeSpent + exerciseElapsedTime,
    };

    // If this is the last set, mark exercise as completed in gymStore
    if (currentSet >= totalSets) {
      const gymStore = useGymStore.getState();
      gymStore.updateProgress(dayPlan.day, currentExerciseIndex, true);
    }

    if (currentSet < totalSets) {
      // More sets remaining - start rest timer
      set({
        currentSet: currentSet + 1,
        isResting: true,
        restTimeRemaining: restTimeConfig,
        exerciseData: updatedExerciseData,
        exerciseElapsedTime: 0,
        exerciseStartTime: null,
      });
    } else {
      // Last set completed - move to next exercise or finish
      const nextIndex = currentExerciseIndex + 1;

      if (nextIndex < dayPlan.exercises.length) {
        // More exercises remaining
        set({
          currentExerciseIndex: nextIndex,
          currentSet: 1,
          isResting: true,
          restTimeRemaining: restTimeConfig,
          exerciseData: updatedExerciseData,
          exerciseElapsedTime: 0,
          exerciseStartTime: null,
        });
      } else {
        // All exercises completed
        set({
          exerciseData: updatedExerciseData,
        });
        // Session will be completed by user action
      }
    }
  },

  skipRest: () => {
    set({
      isResting: false,
      restTimeRemaining: 0,
      exerciseStartTime: Date.now(),
    });
  },

  nextExercise: () => {
    const { currentExerciseIndex, dayPlan } = get();

    if (!dayPlan) return;

    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex < dayPlan.exercises.length) {
      set({
        currentExerciseIndex: nextIndex,
        currentSet: 1,
        isResting: false,
        restTimeRemaining: 0,
        exerciseStartTime: Date.now(),
        exerciseElapsedTime: 0,
      });
    }
  },

  updateExerciseTime: (elapsed: number) => {
    set({ exerciseElapsedTime: elapsed });
  },

  updateRestTime: (remaining: number) => {
    if (remaining <= 0) {
      set({
        isResting: false,
        restTimeRemaining: 0,
        exerciseStartTime: Date.now(),
      });
    } else {
      set({ restTimeRemaining: remaining });
    }
  },

  updateEstimatedTime: (exerciseIndex: number, newTime: number) => {
    const { exerciseData } = get();
    const updated = [...exerciseData];
    if (updated[exerciseIndex]) {
      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        estimatedTime: newTime,
      };
      set({ exerciseData: updated });
    }
  },

  completeSession: async () => {
    try {
      const { currentSession, exerciseData, dayPlan } = get();

      if (!currentSession) return;

      set({ isLoading: true });

      const exercisesCompleted = exerciseData.filter(e => e.setsCompleted > 0).length;

      // Sync all completed exercises with gymStore before clearing state
      if (dayPlan) {
        const gymStore = useGymStore.getState();
        exerciseData.forEach((ex, index) => {
          if (ex.setsCompleted >= dayPlan.exercises[index].sets) {
            gymStore.updateProgress(dayPlan.day, index, true);
          }
        });
      }

      await gymApi.completeSession(currentSession.id, {
        exerciseData,
        exercisesCompleted,
      });

      set({
        currentSession: null,
        isSessionActive: false,
        isPaused: false,
        currentExerciseIndex: 0,
        currentSet: 1,
        exerciseStartTime: null,
        exerciseElapsedTime: 0,
        isResting: false,
        restTimeRemaining: 0,
        exerciseData: [],
        dayPlan: null,
        routineId: null,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to complete session',
        isLoading: false,
      });
      throw error;
    }
  },

  cancelSession: () => {
    set({
      currentSession: null,
      isSessionActive: false,
      isPaused: false,
      currentExerciseIndex: 0,
      currentSet: 1,
      exerciseStartTime: null,
      exerciseElapsedTime: 0,
      isResting: false,
      restTimeRemaining: 0,
      exerciseData: [],
      dayPlan: null,
      routineId: null,
    });
  },

  loadSessionHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await gymApi.getSessions();
      set({
        sessionHistory: response.sessions,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load session history',
        isLoading: false,
      });
    }
  },

  loadSessionStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await gymApi.getSessionStats();
      set({
        sessionStats: response.stats,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load session stats',
        isLoading: false,
      });
    }
  },
}));
