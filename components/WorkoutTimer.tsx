import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface WorkoutTimerProps {
  elapsedTime: number;
  estimatedTime: number;
  isRunning: boolean;
  onTimeUpdate: (elapsed: number) => void;
  onEstimatedTimeChange?: (newTime: number) => void;
  size?: 'small' | 'medium' | 'large';
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function WorkoutTimer({
  elapsedTime,
  estimatedTime,
  isRunning,
  onTimeUpdate,
  onEstimatedTimeChange,
  size = 'large',
}: WorkoutTimerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now() - elapsedTime * 1000);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMinutes, setEditMinutes] = useState('');
  const [editSeconds, setEditSeconds] = useState('');

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onTimeUpdate(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const handleEditPress = () => {
    const mins = Math.floor(estimatedTime / 60);
    const secs = estimatedTime % 60;
    setEditMinutes(mins.toString());
    setEditSeconds(secs.toString());
    setShowEditModal(true);
  };

  const handleSaveEstimatedTime = () => {
    const mins = parseInt(editMinutes, 10) || 0;
    const secs = parseInt(editSeconds, 10) || 0;
    const newTime = mins * 60 + secs;
    if (onEstimatedTimeChange && newTime > 0) {
      onEstimatedTimeChange(newTime);
    }
    setShowEditModal(false);
  };

  const isOverTime = elapsedTime > estimatedTime;
  const progress = estimatedTime > 0 ? Math.min(elapsedTime / estimatedTime, 1) : 0;

  const sizeStyles = {
    small: { container: 100, elapsed: 24, estimated: 14 },
    medium: { container: 150, elapsed: 32, estimated: 16 },
    large: { container: 200, elapsed: 48, estimated: 20 },
  };

  const currentSize = sizeStyles[size];

  return (
    <>
      <View
        style={[
          styles.container,
          {
            width: currentSize.container,
            height: currentSize.container,
            borderColor: isOverTime ? colors.error : colors.primary,
          },
        ]}
      >
        {/* Progress ring background */}
        <View
          style={[
            styles.progressRing,
            {
              width: currentSize.container - 8,
              height: currentSize.container - 8,
              borderColor: colors.border,
            },
          ]}
        />
        
        {/* Progress indicator */}
        <View
          style={[
            styles.progressIndicator,
            {
              width: currentSize.container - 8,
              height: currentSize.container - 8,
              borderColor: isOverTime ? colors.error : colors.primary,
              borderTopColor: 'transparent',
              borderRightColor: progress > 0.25 ? (isOverTime ? colors.error : colors.primary) : 'transparent',
              borderBottomColor: progress > 0.5 ? (isOverTime ? colors.error : colors.primary) : 'transparent',
              borderLeftColor: progress > 0.75 ? (isOverTime ? colors.error : colors.primary) : 'transparent',
              transform: [{ rotate: `${progress * 360}deg` }],
            },
          ]}
        />

        <View style={styles.timeContainer}>
          {/* Elapsed time (main) */}
          <Text
            style={[
              styles.elapsedTime,
              {
                fontSize: currentSize.elapsed,
                color: isOverTime ? colors.error : colors.text,
              },
            ]}
          >
            {formatTime(elapsedTime)}
          </Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Estimated time (editable) */}
          <TouchableOpacity onPress={handleEditPress} style={styles.estimatedContainer}>
            <Text
              style={[
                styles.estimatedTime,
                { fontSize: currentSize.estimated, color: colors.textSecondary },
              ]}
            >
              ~{formatTime(estimatedTime)}
            </Text>
            {onEstimatedTimeChange && (
              <FontAwesome name="pencil" size={12} color={colors.textSecondary} style={styles.editIcon} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Editar tiempo estimado
            </Text>
            
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInputGroup}>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editMinutes}
                  onChangeText={setEditMinutes}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="00"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>min</Text>
              </View>
              
              <Text style={[styles.timeSeparator, { color: colors.text }]}>:</Text>
              
              <View style={styles.timeInputGroup}>
                <TextInput
                  style={[styles.timeInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={editSeconds}
                  onChangeText={setEditSeconds}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="00"
                  placeholderTextColor={colors.textSecondary}
                />
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>seg</Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.border }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.textSecondary }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={handleSaveEstimatedTime}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Guardar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 4,
  },
  progressIndicator: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 4,
  },
  timeContainer: {
    alignItems: 'center',
  },
  elapsedTime: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    width: 40,
    height: 1,
    marginVertical: 4,
  },
  estimatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimatedTime: {
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  editIcon: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeInput: {
    width: 60,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  timeLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
