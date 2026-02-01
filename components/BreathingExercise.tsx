import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface BreathingExerciseProps {
  visible: boolean;
  onClose: () => void;
  colors: {
    primary: string;
    background: string;
    text: string;
    textSecondary: string;
    card: string;
  };
}

type Phase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASES: { phase: Phase; duration: number; label: string }[] = [
  { phase: 'inhale', duration: 4000, label: 'Inhala' },
  { phase: 'hold', duration: 4000, label: 'Mantén' },
  { phase: 'exhale', duration: 4000, label: 'Exhala' },
  { phase: 'rest', duration: 2000, label: 'Descansa' },
];

const TOTAL_CYCLES = 3;

export function BreathingExercise({ visible, onClose, colors }: BreathingExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [countdown, setCountdown] = useState(4);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  const currentPhase = PHASES[currentPhaseIndex];

  useEffect(() => {
    if (!isActive || !visible) return;

    // Animate the circle based on phase
    if (currentPhase.phase === 'inhale') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.4,
          duration: currentPhase.duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: currentPhase.duration,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (currentPhase.phase === 'exhale') {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: currentPhase.duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: currentPhase.duration,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return Math.ceil(currentPhase.duration / 1000);
        return prev - 1;
      });
    }, 1000);

    // Phase timer
    const phaseTimer = setTimeout(() => {
      const nextIndex = (currentPhaseIndex + 1) % PHASES.length;
      
      if (nextIndex === 0) {
        // Completed a full cycle
        if (cycle >= TOTAL_CYCLES) {
          // Exercise complete
          setIsActive(false);
          setCycle(1);
          setCurrentPhaseIndex(0);
          return;
        }
        setCycle((prev) => prev + 1);
      }
      
      setCurrentPhaseIndex(nextIndex);
      setCountdown(Math.ceil(PHASES[nextIndex].duration / 1000));
    }, currentPhase.duration);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(phaseTimer);
    };
  }, [isActive, currentPhaseIndex, cycle, visible]);

  const handleStart = () => {
    setIsActive(true);
    setCurrentPhaseIndex(0);
    setCycle(1);
    setCountdown(4);
    scaleAnim.setValue(1);
    opacityAnim.setValue(0.6);
  };

  const handleStop = () => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setCycle(1);
    scaleAnim.setValue(1);
    opacityAnim.setValue(0.6);
  };

  const handleClose = () => {
    handleStop();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <FontAwesome name="times" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Respiración 4-4-4</Text>
          <Text style={styles.subtitle}>
            {isActive ? `Ciclo ${cycle} de ${TOTAL_CYCLES}` : 'Relaja tu mente y cuerpo'}
          </Text>

          <View style={styles.circleContainer}>
            <Animated.View
              style={[
                styles.breathCircle,
                {
                  backgroundColor: colors.primary,
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            />
            <View style={styles.circleContent}>
              {isActive ? (
                <>
                  <Text style={styles.phaseLabel}>{currentPhase.label}</Text>
                  <Text style={styles.countdown}>{countdown}</Text>
                </>
              ) : (
                <Text style={styles.readyText}>Listo</Text>
              )}
            </View>
          </View>

          {!isActive ? (
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.primary }]}
              onPress={handleStart}
            >
              <Text style={styles.startButtonText}>Comenzar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.stopButton, { borderColor: colors.primary }]}
              onPress={handleStop}
            >
              <Text style={[styles.stopButtonText, { color: colors.primary }]}>
                Detener
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.instructions}>
            {isActive
              ? 'Sigue el ritmo del círculo'
              : 'Este ejercicio te ayudará a reducir el estrés y la ansiedad'}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    padding: 8,
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 48,
  },
  circleContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
  },
  breathCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  circleContent: {
    alignItems: 'center',
  },
  phaseLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  countdown: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  readyText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
  },
  startButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 24,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  stopButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    marginBottom: 24,
  },
  stopButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    maxWidth: 280,
  },
});
