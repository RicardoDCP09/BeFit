import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface MoodOption {
  id: string;
  emoji: string;
  label: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { id: 'happy', emoji: '😊', label: 'Bien' },
  { id: 'neutral', emoji: '😐', label: 'Normal' },
  { id: 'sad', emoji: '😔', label: 'Triste' },
  { id: 'anxious', emoji: '😰', label: 'Ansioso' },
  { id: 'stressed', emoji: '😤', label: 'Estresado' },
];

interface MoodSelectorProps {
  onSelect: (mood: string) => void;
  colors: {
    text: string;
    textSecondary: string;
    card: string;
    primary: string;
  };
}

export function MoodSelector({ onSelect, colors }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.avatarLarge, { backgroundColor: '#FFE0B2' }]}>
        <Text style={styles.avatarEmoji}>🌿</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        Hola, soy Mente
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Tu compañero de bienestar emocional.{'\n'}¿Cómo te sientes hoy?
      </Text>
      
      <View style={styles.moodGrid}>
        {MOOD_OPTIONS.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[styles.moodButton, { backgroundColor: colors.card }]}
            onPress={() => onSelect(mood.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[styles.moodLabel, { color: colors.text }]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => onSelect('neutral')}
      >
        <Text style={[styles.skipText, { color: colors.textSecondary }]}>
          Solo quiero hablar
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarEmoji: {
    fontSize: 42,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  moodButton: {
    width: 80,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 14,
  },
});
