import QuoteCard from '@/components/QuoteCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useGymStore } from '@/store/gymStore';
import { useProfileStore } from '@/store/profileStore';
import { useUserStore } from '@/store/userStore';
import { getBMIColor } from '@/utils/calculations';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { user, logout } = useAuthStore();
  const { healthProfile, calculations, loadHealthProfile, isLoading: userLoading } = useUserStore();
  const { currentRoutine, completionPercentage, loadCurrentRoutine } = useGymStore();
  const { dailyQuote, loadDailyQuote } = useProfileStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadHealthProfile();
    loadCurrentRoutine();
    loadDailyQuote();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadHealthProfile(), loadCurrentRoutine()]);
    setRefreshing(false);
  };

  const MetricCard = ({
    title,
    value,
    unit,
    icon,
    color
  }: {
    title: string;
    value: string | number | null;
    unit?: string;
    icon: string;
    color?: string;
  }) => (
    <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
      <View style={[styles.metricIcon, { backgroundColor: (color || colors.primary) + '20' }]}>
        <FontAwesome name={icon as any} size={20} color={color || colors.primary} />
      </View>
      <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.metricValue, { color: colors.text }]}>
        {value ?? '--'}{unit && <Text style={styles.metricUnit}> {unit}</Text>}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            ¡Hola, {user?.name || 'Atleta'}!
          </Text>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            ¿Listo para hoy?
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: colors.card }]}
          onPress={logout}
        >
          <FontAwesome name="sign-out" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Daily Quote */}
      {dailyQuote && (
        <View style={styles.section}>
          <QuoteCard
            quote={dailyQuote.quote}
            author={dailyQuote.author}
            category={dailyQuote.category}
          />
        </View>
      )}

      {/* Health Metrics */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tu Perfil de Salud</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="IMC"
            value={typeof calculations.bmi === 'number' ? calculations.bmi.toFixed(1) : null}
            icon="balance-scale"
            color={typeof calculations.bmi === 'number' ? getBMIColor(calculations.bmi) : undefined}
          />
          <MetricCard
            title="TMB"
            value={typeof calculations.tmb === 'number' ? calculations.tmb.toFixed(0) : null}
            unit="kcal"
            icon="fire"
            color={colors.accent}
          />
          <MetricCard
            title="TDEE"
            value={typeof calculations.tdee === 'number' ? calculations.tdee.toFixed(0) : null}
            unit="kcal"
            icon="bolt"
            color={colors.secondary}
          />
          <MetricCard
            title="Grasa"
            value={typeof calculations.bodyFatPercentage === 'number' ? calculations.bodyFatPercentage.toFixed(1) : null}
            unit="%"
            icon="percent"
            color="#9C27B0"
          />
        </View>
      </View>

      {/* Weekly Progress */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Progreso Semanal</Text>
        <View style={[styles.progressCard, { backgroundColor: colors.card }]}>
          <View style={styles.progressHeader}>
            <FontAwesome name="calendar-check-o" size={24} color={colors.primary} />
            <Text style={[styles.progressTitle, { color: colors.text }]}>
              Rutina de Ejercicios
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { backgroundColor: colors.primary, width: `${completionPercentage}%` },
                ]}
              />
            </View>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>
              {completionPercentage}%
            </Text>
          </View>

          {currentRoutine ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/gym')}
            >
              <Text style={styles.actionButtonText}>Continuar Rutina</Text>
              <FontAwesome name="arrow-right" size={14} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/gym')}
            >
              <Text style={styles.actionButtonText}>Generar Rutina</Text>
              <FontAwesome name="magic" size={14} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Acciones Rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/kitchen')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.accent + '20' }]}>
              <FontAwesome name="camera" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Escanear Nevera
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/mind')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary + '20' }]}>
              <FontAwesome name="comment" size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Chat Mental
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    flexGrow: 1,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '400',
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '600',
    width: 45,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
