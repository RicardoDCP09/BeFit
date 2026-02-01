import RestTimerModal from '@/components/RestTimerModal';
import SessionSummary from '@/components/SessionSummary';
import { useColorScheme } from '@/components/useColorScheme';
import WorkoutTimer from '@/components/WorkoutTimer';
import Colors from '@/constants/Colors';
import { useWorkoutSessionStore } from '@/store/workoutSessionStore';
import { notifyRestComplete } from '@/utils/notifications';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function WorkoutSessionScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const {
    isSessionActive,
    isPaused,
    currentExerciseIndex,
    currentSet,
    exerciseElapsedTime,
    isResting,
    restTimeRemaining,
    restTimeConfig,
    exerciseData,
    dayPlan,
    pauseSession,
    resumeSession,
    completeSet,
    skipRest,
    updateExerciseTime,
    updateRestTime,
    updateEstimatedTime,
    completeSession,
    cancelSession,
    setRestTimeConfig,
  } = useWorkoutSessionStore();

  const [showRestConfig, setShowRestConfig] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const restIntervalRef = useRef<any>(null);

  const currentExercise = dayPlan?.exercises[currentExerciseIndex];
  const totalExercises = dayPlan?.exercises.length || 0;
  const isLastExercise = currentExerciseIndex === totalExercises - 1;
  const isLastSet = currentSet === (currentExercise?.sets || 0);
  const isSessionComplete = isLastExercise && isLastSet && !isResting;

  // Rest timer countdown
  useEffect(() => {
    if (isResting && restTimeRemaining > 0 && !isPaused) {
      restIntervalRef.current = setInterval(() => {
        const newTime = restTimeRemaining - 1;
        if (newTime <= 0) {
          updateRestTime(0);
          notifyRestComplete();
        } else {
          updateRestTime(newTime);
        }
      }, 1000);
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    }

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [isResting, restTimeRemaining, isPaused]);

  // Redirect if no active session
  useEffect(() => {
    if (!isSessionActive && !showSummary) {
      router.back();
    }
  }, [isSessionActive, showSummary]);

  const handleBack = () => {
    Alert.alert(
      'Salir de la sesión',
      '¿Estás seguro de que quieres salir? Se perderá el progreso de esta sesión.',
      [
        { text: 'Continuar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: () => {
            cancelSession();
            router.back();
          },
        },
      ]
    );
  };

  const handleCompleteSet = () => {
    // Always complete the current set first
    completeSet();

    // If this was the last set of the last exercise, show summary
    if (isSessionComplete) {
      setShowSummary(true);
    }
  };

  const handleFinishSession = async () => {
    try {
      await completeSession();
      setShowSummary(false);
      router.replace('/(tabs)/gym');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la sesión');
    }
  };

  const handleRestConfigSelect = (seconds: number) => {
    setRestTimeConfig(seconds);
  };

  if (!dayPlan || !currentExercise) {
    return null;
  }

  const currentExerciseData = exerciseData[currentExerciseIndex];
  const progress = ((currentExerciseIndex + (currentSet - 1) / currentExercise.sets) / totalExercises) * 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <FontAwesome name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {dayPlan.day}
        </Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowRestConfig(true)}
            style={[styles.headerButton, { marginRight: 8 }]}
          >
            <FontAwesome name="cog" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={isPaused ? resumeSession : pauseSession}
            style={styles.headerButton}
          >
            <FontAwesome
              name={isPaused ? 'play' : 'pause'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Exercise Info */}
        <View style={styles.exerciseHeader}>
          <Text style={[styles.exerciseName, { color: colors.text }]}>
            {currentExercise.name}
          </Text>
          <Text style={[styles.setInfo, { color: colors.primary }]}>
            Serie {currentSet} de {currentExercise.sets}
          </Text>
        </View>

        {/* Timer Section */}
        <View style={styles.timerSection}>
          {isResting ? (
            // Rest Timer
            <View style={styles.restTimerContainer}>
              <Text style={[styles.restLabel, { color: colors.textSecondary }]}>
                ⏱️ Descanso
              </Text>
              <View
                style={[
                  styles.restTimer,
                  { borderColor: colors.accent, backgroundColor: colors.accent + '10' },
                ]}
              >
                <Text style={[styles.restTimeText, { color: colors.accent }]}>
                  {Math.floor(restTimeRemaining / 60)}:{(restTimeRemaining % 60).toString().padStart(2, '0')}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.skipButton, { borderColor: colors.border }]}
                onPress={skipRest}
              >
                <FontAwesome name="forward" size={14} color={colors.textSecondary} />
                <Text style={[styles.skipButtonText, { color: colors.textSecondary }]}>
                  Saltar descanso
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Exercise Timer
            <WorkoutTimer
              elapsedTime={exerciseElapsedTime}
              estimatedTime={currentExerciseData?.estimatedTime || 180}
              isRunning={!isPaused}
              onTimeUpdate={updateExerciseTime}
              onEstimatedTimeChange={(newTime) => updateEstimatedTime(currentExerciseIndex, newTime)}
              size="large"
            />
          )}
        </View>

        {/* Exercise Details */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          <View style={styles.detailRow}>
            <FontAwesome name="repeat" size={16} color={colors.primary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Repeticiones
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {currentExercise.reps}
            </Text>
          </View>

          <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <FontAwesome name="clock-o" size={16} color={colors.accent} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Descanso
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {restTimeConfig}s
            </Text>
          </View>

          {currentExercise.notes && (
            <>
              <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
              <View style={styles.notesRow}>
                <FontAwesome name="lightbulb-o" size={16} color={colors.warning} />
                <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                  {currentExercise.notes}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Complete Set Button */}
        {!isResting && (
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: colors.primary }]}
            onPress={handleCompleteSet}
          >
            <FontAwesome name="check" size={20} color="#fff" />
            <Text style={styles.completeButtonText}>
              {isSessionComplete
                ? 'Finalizar Sesión'
                : isLastSet
                  ? 'Siguiente Ejercicio'
                  : 'Serie Completada'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Exercise List with Completion Status */}
        <View style={[styles.exerciseListCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.exerciseListTitle, { color: colors.text }]}>
            Ejercicios de hoy
          </Text>
          {dayPlan.exercises.map((exercise, index) => {
            const exerciseSessionData = exerciseData[index];
            const isCompleted = exerciseSessionData?.setsCompleted >= exercise.sets;
            const isCurrentExercise = index === currentExerciseIndex;
            const setsCompleted = exerciseSessionData?.setsCompleted || 0;

            return (
              <View
                key={index}
                style={[
                  styles.exerciseListItem,
                  isCurrentExercise && { backgroundColor: colors.primary + '15' },
                  index < dayPlan.exercises.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.exerciseCheckbox,
                    {
                      borderColor: isCompleted ? colors.success : colors.border,
                      backgroundColor: isCompleted ? colors.success : 'transparent',
                    },
                  ]}
                >
                  {isCompleted && (
                    <FontAwesome name="check" size={12} color="#fff" />
                  )}
                </View>
                <View style={styles.exerciseListInfo}>
                  <Text
                    style={[
                      styles.exerciseListName,
                      { color: isCompleted ? colors.textSecondary : colors.text },
                      isCompleted && styles.exerciseListNameCompleted,
                    ]}
                  >
                    {exercise.name}
                  </Text>
                  <Text style={[styles.exerciseListMeta, { color: colors.textSecondary }]}>
                    {setsCompleted}/{exercise.sets} series • {exercise.reps} reps
                  </Text>
                </View>
                {isCurrentExercise && (
                  <View style={[styles.currentBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.currentBadgeText}>Actual</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.card }]}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Ejercicio {currentExerciseIndex + 1} de {totalExercises}
          </Text>
          <Text style={[styles.progressPercent, { color: colors.primary }]}>
            {Math.round(progress)}%
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${progress}%` },
            ]}
          />
        </View>
      </View>

      {/* Rest Time Config Modal */}
      <RestTimerModal
        visible={showRestConfig}
        currentRestTime={restTimeConfig}
        onSelect={handleRestConfigSelect}
        onClose={() => setShowRestConfig(false)}
      />

      {/* Session Summary Modal */}
      <SessionSummary
        visible={showSummary}
        totalDuration={exerciseData.reduce((sum, e) => sum + e.timeSpent, 0)}
        exercisesCompleted={exerciseData.filter(e => e.setsCompleted > 0).length}
        totalExercises={totalExercises}
        exerciseData={exerciseData}
        onClose={handleFinishSession}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  exerciseHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  setInfo: {
    fontSize: 18,
    fontWeight: '600',
  },
  timerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  restTimerContainer: {
    alignItems: 'center',
  },
  restLabel: {
    fontSize: 16,
    marginBottom: 16,
  },
  restTimer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restTimeText: {
    fontSize: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    gap: 8,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailDivider: {
    height: 1,
    marginVertical: 4,
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 16,
    gap: 12,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  exerciseListCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    width: '100%',
  },
  exerciseListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  exerciseListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    width: '100%',
  },
  exerciseCheckbox: {
    width: 24,
    height: 24,
    minWidth: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  exerciseListInfo: {
    flex: 1,
    flexShrink: 1,
  },
  exerciseListName: {
    fontSize: 14,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  exerciseListNameCompleted: {
    textDecorationLine: 'line-through',
  },
  exerciseListMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
    flexShrink: 0,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
