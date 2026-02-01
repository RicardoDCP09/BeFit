import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { ExerciseSessionData } from '@/types';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface SessionSummaryProps {
  visible: boolean;
  totalDuration: number;
  exercisesCompleted: number;
  totalExercises: number;
  exerciseData: ExerciseSessionData[];
  onClose: () => void;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
};

const formatTimeShort = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function SessionSummary({
  visible,
  totalDuration,
  exercisesCompleted,
  totalExercises,
  exerciseData,
  onClose,
}: SessionSummaryProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const completionRate = totalExercises > 0 
    ? Math.round((exercisesCompleted / totalExercises) * 100) 
    : 0;

  const totalEstimatedTime = exerciseData.reduce((sum, e) => sum + e.estimatedTime, 0);
  const totalActualTime = exerciseData.reduce((sum, e) => sum + e.timeSpent, 0);
  const timeDifference = totalActualTime - totalEstimatedTime;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
              <FontAwesome name="trophy" size={48} color={colors.success} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>
              ¡Sesión Completada!
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Excelente trabajo, sigue así 💪
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <FontAwesome name="clock-o" size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatTime(totalDuration)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Duración Total
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <FontAwesome name="check-circle" size={24} color={colors.success} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {exercisesCompleted}/{totalExercises}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Ejercicios
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <FontAwesome name="percent" size={24} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {completionRate}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Completado
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <FontAwesome 
                name={timeDifference <= 0 ? 'arrow-down' : 'arrow-up'} 
                size={24} 
                color={timeDifference <= 0 ? colors.success : colors.warning} 
              />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {timeDifference <= 0 ? '-' : '+'}{formatTimeShort(Math.abs(timeDifference))}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                vs Estimado
              </Text>
            </View>
          </View>

          {/* Exercise Details */}
          <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>
              Detalles por Ejercicio
            </Text>
            
            {exerciseData.map((exercise, index) => (
              <View 
                key={index} 
                style={[
                  styles.exerciseRow,
                  index < exerciseData.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                ]}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseName, { color: colors.text }]}>
                    {exercise.name}
                  </Text>
                  <Text style={[styles.exerciseSets, { color: colors.textSecondary }]}>
                    {exercise.setsCompleted} series completadas
                  </Text>
                </View>
                <View style={styles.exerciseTimes}>
                  <Text style={[styles.timeActual, { color: colors.text }]}>
                    {formatTimeShort(exercise.timeSpent)}
                  </Text>
                  <Text style={[styles.timeEstimated, { color: colors.textSecondary }]}>
                    / {formatTimeShort(exercise.estimatedTime)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Close Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Finalizar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseSets: {
    fontSize: 12,
    marginTop: 2,
  },
  exerciseTimes: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeActual: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeEstimated: {
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  closeButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
