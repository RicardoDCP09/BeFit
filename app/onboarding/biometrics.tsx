import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { activityLevelLabels, goalLabels } from '@/utils/calculations';

type Gender = 'male' | 'female' | 'other';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
type Goal = 'lose_fat' | 'gain_muscle' | 'maintain' | 'improve_health';

export default function BiometricsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const { updateHealthProfile, isLoading } = useUserStore();
  const { updateUser } = useAuthStore();

  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const handleNext = () => {
    if (step === 1) {
      if (!weight || !height || !age) {
        Alert.alert('Error', 'Por favor completa todos los campos');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!gender) {
        Alert.alert('Error', 'Por favor selecciona tu género');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!activityLevel) {
        Alert.alert('Error', 'Por favor selecciona tu nivel de actividad');
        return;
      }
      setStep(4);
    }
  };

  const handleSubmit = async () => {
    if (!goal) {
      Alert.alert('Error', 'Por favor selecciona tu objetivo');
      return;
    }

    try {
      await updateHealthProfile({
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        gender: gender!,
        activityLevel: activityLevel!,
        goal: goal,
      });
      
      updateUser({ onboardingCompleted: true });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Error al guardar perfil');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Tus medidas básicas
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Estos datos nos ayudan a calcular tus métricas de salud
      </Text>

      <View style={styles.inputGroup}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Peso (kg)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="70"
            placeholderTextColor={colors.textSecondary}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Altura (cm)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="170"
            placeholderTextColor={colors.textSecondary}
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Edad</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="25"
            placeholderTextColor={colors.textSecondary}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Tu género</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Necesario para cálculos metabólicos precisos
      </Text>

      <View style={styles.optionsGrid}>
        {[
          { value: 'male', label: 'Masculino', icon: 'mars' },
          { value: 'female', label: 'Femenino', icon: 'venus' },
          { value: 'other', label: 'Otro', icon: 'genderless' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              gender === option.value && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setGender(option.value as Gender)}
          >
            <FontAwesome
              name={option.icon as any}
              size={32}
              color={gender === option.value ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.optionLabel,
                { color: gender === option.value ? colors.primary : colors.text },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>
        Nivel de actividad
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        ¿Qué tan activo eres normalmente?
      </Text>

      <View style={styles.optionsList}>
        {(Object.entries(activityLevelLabels) as [ActivityLevel, string][]).map(
          ([value, label]) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.listOption,
                { backgroundColor: colors.card, borderColor: colors.border },
                activityLevel === value && { borderColor: colors.primary, borderWidth: 2 },
              ]}
              onPress={() => setActivityLevel(value)}
            >
              <View
                style={[
                  styles.radio,
                  { borderColor: activityLevel === value ? colors.primary : colors.border },
                ]}
              >
                {activityLevel === value && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
              <Text
                style={[
                  styles.listOptionText,
                  { color: activityLevel === value ? colors.primary : colors.text },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.text }]}>Tu objetivo</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        ¿Qué quieres lograr con Be Fit?
      </Text>

      <View style={styles.optionsList}>
        {(Object.entries(goalLabels) as [Goal, string][]).map(([value, label]) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.listOption,
              { backgroundColor: colors.card, borderColor: colors.border },
              goal === value && { borderColor: colors.primary, borderWidth: 2 },
            ]}
            onPress={() => setGoal(value)}
          >
            <View
              style={[
                styles.radio,
                { borderColor: goal === value ? colors.primary : colors.border },
              ]}
            >
              {goal === value && (
                <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
              )}
            </View>
            <Text
              style={[
                styles.listOptionText,
                { color: goal === value ? colors.primary : colors.text },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                {
                  backgroundColor: s <= step ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.stepIndicator, { color: colors.textSecondary }]}>
          Paso {step} de 4
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border }]}
            onPress={() => setStep(step - 1)}
          >
            <FontAwesome name="arrow-left" size={16} color={colors.text} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: colors.primary },
            step === 1 && { flex: 1 },
          ]}
          onPress={step === 4 ? handleSubmit : handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {step === 4 ? 'Finalizar' : 'Siguiente'}
              </Text>
              <FontAwesome name="arrow-right" size={16} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  stepIndicator: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  inputGroup: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  optionsList: {
    gap: 12,
  },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  listOptionText: {
    fontSize: 16,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
