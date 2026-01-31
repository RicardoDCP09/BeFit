import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useGymStore } from '@/store/gymStore';
import { DayPlan, Exercise } from '@/types';

export default function GymScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const {
    currentRoutine,
    completionPercentage,
    isLoading,
    isGenerating,
    error,
    loadCurrentRoutine,
    generateRoutine,
    updateProgress,
  } = useGymStore();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentRoutine();
  }, []);

  useEffect(() => {
    if (currentRoutine?.plan?.weekPlan && !selectedDay) {
      const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
      const capitalizedToday = today.charAt(0).toUpperCase() + today.slice(1);
      const dayExists = currentRoutine.plan.weekPlan.find(
        (d) => d.day.toLowerCase() === capitalizedToday.toLowerCase()
      );
      setSelectedDay(dayExists ? capitalizedToday : currentRoutine.plan.weekPlan[0]?.day);
    }
  }, [currentRoutine]);

  const handleGenerateRoutine = async () => {
    try {
      await generateRoutine();
      Alert.alert('¡Éxito!', 'Tu rutina personalizada ha sido generada');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo generar la rutina');
    }
  };

  const handleToggleExercise = async (day: string, exerciseIndex: number) => {
    const currentProgress = currentRoutine?.progress?.[day]?.[exerciseIndex] || false;
    await updateProgress(day, exerciseIndex, !currentProgress);
  };

  const selectedDayPlan = currentRoutine?.plan?.weekPlan?.find(
    (d) => d.day === selectedDay
  );

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!currentRoutine) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
          <FontAwesome name="heartbeat" size={64} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Sin rutina activa
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Genera una rutina personalizada basada en tu perfil de salud
          </Text>
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: colors.primary }]}
            onPress={handleGenerateRoutine}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <FontAwesome name="magic" size={18} color="#fff" />
                <Text style={styles.generateButtonText}>Generar con IA</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Header */}
      <View style={[styles.progressHeader, { backgroundColor: colors.card }]}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Progreso semanal
          </Text>
          <Text style={[styles.progressValue, { color: colors.primary }]}>
            {completionPercentage}%
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: `${completionPercentage}%` },
            ]}
          />
        </View>
      </View>

      {/* Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
        contentContainerStyle={styles.daySelectorContent}
      >
        {currentRoutine.plan?.weekPlan?.map((day) => {
          const isSelected = selectedDay === day.day;
          const dayProgress = currentRoutine.progress?.[day.day] || {};
          const completedCount = Object.values(dayProgress).filter(Boolean).length;
          const totalCount = day.exercises?.length || 0;
          const isComplete = completedCount === totalCount && totalCount > 0;

          return (
            <TouchableOpacity
              key={day.day}
              style={[
                styles.dayTab,
                { backgroundColor: isSelected ? colors.primary : colors.card },
              ]}
              onPress={() => setSelectedDay(day.day)}
            >
              <Text
                style={[
                  styles.dayTabText,
                  { color: isSelected ? '#fff' : colors.text },
                ]}
              >
                {day.day.substring(0, 3)}
              </Text>
              {isComplete && (
                <FontAwesome
                  name="check-circle"
                  size={12}
                  color={isSelected ? '#fff' : colors.success}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Day Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {selectedDayPlan && (
          <>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayTitle, { color: colors.text }]}>
                {selectedDayPlan.day}
              </Text>
              <View style={styles.dayMeta}>
                <View style={[styles.metaTag, { backgroundColor: colors.primary + '20' }]}>
                  <FontAwesome name="bullseye" size={12} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.primary }]}>
                    {selectedDayPlan.focus}
                  </Text>
                </View>
                <View style={[styles.metaTag, { backgroundColor: colors.accent + '20' }]}>
                  <FontAwesome name="clock-o" size={12} color={colors.accent} />
                  <Text style={[styles.metaText, { color: colors.accent }]}>
                    {selectedDayPlan.duration}
                  </Text>
                </View>
                <View style={[styles.metaTag, { backgroundColor: colors.error + '20' }]}>
                  <FontAwesome name="fire" size={12} color={colors.error} />
                  <Text style={[styles.metaText, { color: colors.error }]}>
                    {selectedDayPlan.calories} kcal
                  </Text>
                </View>
              </View>
            </View>

            {/* Exercises List */}
            <View style={styles.exercisesList}>
              {selectedDayPlan.exercises?.map((exercise, index) => {
                const isCompleted =
                  currentRoutine.progress?.[selectedDayPlan.day]?.[index] || false;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.exerciseCard,
                      { backgroundColor: colors.card },
                      isCompleted && { opacity: 0.7 },
                    ]}
                    onPress={() => handleToggleExercise(selectedDayPlan.day, index)}
                  >
                    <View
                      style={[
                        styles.checkbox,
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
                    <View style={styles.exerciseInfo}>
                      <Text
                        style={[
                          styles.exerciseName,
                          { color: colors.text },
                          isCompleted && styles.completedText,
                        ]}
                      >
                        {exercise.name}
                      </Text>
                      <View style={styles.exerciseDetails}>
                        <Text style={[styles.exerciseDetail, { color: colors.textSecondary }]}>
                          {exercise.sets} series × {exercise.reps}
                        </Text>
                        <Text style={[styles.exerciseDetail, { color: colors.textSecondary }]}>
                          Descanso: {exercise.rest}
                        </Text>
                      </View>
                      {exercise.notes && (
                        <Text style={[styles.exerciseNotes, { color: colors.textSecondary }]}>
                          💡 {exercise.notes}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tips */}
            {currentRoutine.plan?.tips && currentRoutine.plan.tips.length > 0 && (
              <View style={[styles.tipsCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.tipsTitle, { color: colors.text }]}>
                  💪 Consejos de la semana
                </Text>
                {currentRoutine.plan.tips.map((tip, index) => (
                  <Text key={index} style={[styles.tipText, { color: colors.textSecondary }]}>
                    • {tip}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}

        {/* Regenerate Button */}
        <TouchableOpacity
          style={[styles.regenerateButton, { borderColor: colors.border }]}
          onPress={handleGenerateRoutine}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              <FontAwesome name="refresh" size={16} color={colors.primary} />
              <Text style={[styles.regenerateText, { color: colors.primary }]}>
                Generar nueva rutina
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyState: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressHeader: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '700',
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
  daySelector: {
    marginTop: 16,
    maxHeight: 50,
  },
  daySelectorContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  dayHeader: {
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  dayMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  exerciseDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  exerciseDetail: {
    fontSize: 13,
  },
  exerciseNotes: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    gap: 8,
  },
  regenerateText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
