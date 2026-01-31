import Card from '@/components/Card';
import ProgressRing from '@/components/ProgressRing';
import QuoteCard from '@/components/QuoteCard';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { useUserStore } from '@/store/userStore';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { user } = useAuthStore();
  const { healthProfile, calculations } = useUserStore();
  const {
    weightHistory,
    achievements,
    dailyQuote,
    streakDays,
    totalWorkouts,
    totalChatSessions,
    loadAll,
    addWeightEntry,
  } = useProfileStore();

  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddWeight = () => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight < 20 || weight > 300) {
      Alert.alert('Error', 'Por favor ingresa un peso válido');
      return;
    }
    addWeightEntry(weight);
    setNewWeight('');
    setShowWeightInput(false);
  };

  const chartData = {
    labels: weightHistory.slice(-7).map(e => {
      const date = new Date(e.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: weightHistory.slice(-7).map(e => e.weight),
        color: () => colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const inProgressAchievements = achievements.filter(a => !a.unlockedAt && a.progress > 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <FontAwesome name="user" size={40} color="#fff" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Días racha</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalWorkouts}</Text>
            <Text style={styles.statLabel}>Entrenamientos</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalChatSessions}</Text>
            <Text style={styles.statLabel}>Sesiones</Text>
          </View>
        </View>
      </View>

      {/* Daily Quote */}
      {dailyQuote && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            💡 Consejo del día
          </Text>
          <QuoteCard
            quote={dailyQuote.quote}
            author={dailyQuote.author}
            category={dailyQuote.category}
          />
        </View>
      )}

      {/* Current Metrics */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          📊 Tus métricas actuales
        </Text>
        <View style={styles.metricsRow}>
          <Card variant="elevated" style={styles.metricCard}>
            <ProgressRing
              progress={calculations.bmi ? Math.min((calculations.bmi / 30) * 100, 100) : 0}
              size={80}
              strokeWidth={8}
              color={colors.primary}
              showPercentage={false}
            />
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {typeof calculations.bmi === 'number' ? calculations.bmi.toFixed(1) : '--'}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>IMC</Text>
          </Card>

          <Card variant="elevated" style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: colors.accent + '20' }]}>
              <FontAwesome name="fire" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {typeof calculations.tdee === 'number' ? calculations.tdee.toFixed(0) : '--'}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>TDEE kcal</Text>
          </Card>

          <Card variant="elevated" style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: colors.secondary + '20' }]}>
              <FontAwesome name="tint" size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {typeof calculations.bodyFatPercentage === 'number'
                ? calculations.bodyFatPercentage.toFixed(1) + '%'
                : '--'}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Grasa</Text>
          </Card>
        </View>
      </View>

      {/* Weight History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ⚖️ Historial de peso
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowWeightInput(!showWeightInput)}
          >
            <FontAwesome name="plus" size={14} color="#fff" />
          </TouchableOpacity>
        </View>

        {showWeightInput && (
          <Card variant="outlined" style={styles.weightInputCard}>
            <View style={styles.weightInputRow}>
              <TextInput
                style={[styles.weightInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Peso en kg"
                placeholderTextColor={colors.textSecondary}
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleAddWeight}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {weightHistory.length > 0 ? (
          <Card variant="elevated">
            <LineChart
              data={chartData}
              width={width - 64}
              height={180}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 1,
                color: () => colors.primary,
                labelColor: () => colors.textSecondary,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: colors.primary,
                },
              }}
              bezier
              style={styles.chart}
            />
            <View style={styles.weightStats}>
              <View style={styles.weightStat}>
                <Text style={[styles.weightStatValue, { color: colors.primary }]}>
                  {weightHistory[weightHistory.length - 1]?.weight.toFixed(1)} kg
                </Text>
                <Text style={[styles.weightStatLabel, { color: colors.textSecondary }]}>
                  Actual
                </Text>
              </View>
              {weightHistory.length > 1 && (
                <View style={styles.weightStat}>
                  <Text style={[
                    styles.weightStatValue,
                    {
                      color: weightHistory[weightHistory.length - 1].weight < weightHistory[0].weight
                        ? colors.success
                        : colors.error
                    }
                  ]}>
                    {(weightHistory[weightHistory.length - 1].weight - weightHistory[0].weight).toFixed(1)} kg
                  </Text>
                  <Text style={[styles.weightStatLabel, { color: colors.textSecondary }]}>
                    Cambio
                  </Text>
                </View>
              )}
            </View>
          </Card>
        ) : (
          <Card variant="outlined">
            <View style={styles.emptyState}>
              <FontAwesome name="line-chart" size={32} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aún no hay registros de peso
              </Text>
            </View>
          </Card>
        )}
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🏆 Logros
        </Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              variant={achievement.unlockedAt ? 'elevated' : 'outlined'}
              style={{
                ...styles.achievementCard,
                opacity: achievement.unlockedAt ? 1 : 0.6,
              }}
            >
              <View style={[
                styles.achievementIcon,
                { backgroundColor: achievement.unlockedAt ? colors.primary + '20' : colors.border },
              ]}>
                <FontAwesome
                  name={achievement.icon as any}
                  size={20}
                  color={achievement.unlockedAt ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text style={[styles.achievementTitle, { color: colors.text }]} numberOfLines={1}>
                {achievement.title}
              </Text>
              {!achievement.unlockedAt && (
                <View style={styles.achievementProgress}>
                  <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: colors.primary,
                          width: `${(achievement.progress / achievement.target) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                    {achievement.progress}/{achievement.target}
                  </Text>
                </View>
              )}
            </Card>
          ))}
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
    paddingBottom: 32,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  weightInputCard: {
    marginBottom: 12,
  },
  weightInputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  weightInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  saveButton: {
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  weightStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  weightStat: {
    alignItems: 'center',
  },
  weightStatValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  weightStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementProgress: {
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  progressBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
});
