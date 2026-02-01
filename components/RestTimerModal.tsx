import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { RestTimeOption } from '@/types';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface RestTimerModalProps {
  visible: boolean;
  currentRestTime: number;
  onSelect: (seconds: number) => void;
  onClose: () => void;
}

const REST_TIME_OPTIONS: RestTimeOption[] = [
  { label: '30s', seconds: 30 },
  { label: '45s', seconds: 45 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '120s', seconds: 120 },
];

export default function RestTimerModal({
  visible,
  currentRestTime,
  onSelect,
  onClose,
}: RestTimerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  
  const [customTime, setCustomTime] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleOptionSelect = (seconds: number) => {
    onSelect(seconds);
    onClose();
  };

  const handleCustomSubmit = () => {
    const seconds = parseInt(customTime, 10);
    if (seconds > 0 && seconds <= 300) {
      onSelect(seconds);
      onClose();
      setCustomTime('');
      setShowCustomInput(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              ⏱️ Tiempo de Descanso
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Selecciona el tiempo de descanso entre series
          </Text>

          <View style={styles.optionsGrid}>
            {REST_TIME_OPTIONS.map((option) => {
              const isSelected = currentRestTime === option.seconds;
              return (
                <TouchableOpacity
                  key={option.seconds}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleOptionSelect(option.seconds)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: isSelected ? '#fff' : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Custom option */}
            <TouchableOpacity
              style={[
                styles.optionButton,
                {
                  backgroundColor: showCustomInput ? colors.primary + '20' : colors.background,
                  borderColor: showCustomInput ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setShowCustomInput(!showCustomInput)}
            >
              <FontAwesome
                name="sliders"
                size={16}
                color={showCustomInput ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: showCustomInput ? colors.primary : colors.textSecondary, marginLeft: 6 },
                ]}
              >
                Otro
              </Text>
            </TouchableOpacity>
          </View>

          {showCustomInput && (
            <View style={styles.customInputContainer}>
              <TextInput
                style={[
                  styles.customInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={customTime}
                onChangeText={setCustomTime}
                keyboardType="number-pad"
                placeholder="Segundos (1-300)"
                placeholderTextColor={colors.textSecondary}
                maxLength={3}
              />
              <TouchableOpacity
                style={[styles.customButton, { backgroundColor: colors.primary }]}
                onPress={handleCustomSubmit}
              >
                <FontAwesome name="check" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoContainer}>
            <FontAwesome name="info-circle" size={14} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Tiempo recomendado: 60-90s para hipertrofia, 30-60s para resistencia
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 70,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  customInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  customInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  customButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
