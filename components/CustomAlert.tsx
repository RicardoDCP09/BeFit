import Colors from '@/constants/Colors';
import { useThemeStore } from '@/store/themeStore';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertConfig {
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface CustomAlertProps {
  visible: boolean;
  config: AlertConfig | null;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, config, onClose }) => {
  const { isDark } = useThemeStore();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!config) return null;

  const { title, message, buttons = [{ text: 'OK' }], type = 'info' } = config;

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'check-circle' as const, color: '#10B981' };
      case 'warning':
        return { name: 'exclamation-triangle' as const, color: '#F59E0B' };
      case 'error':
        return { name: 'times-circle' as const, color: '#EF4444' };
      default:
        return { name: 'info-circle' as const, color: colors.primary };
    }
  };

  const iconConfig = getIconConfig();

  const handleButtonPress = (button: AlertButton) => {
    onClose();
    if (button.onPress) {
      setTimeout(() => button.onPress?.(), 100);
    }
  };

  const getButtonStyle = (button: AlertButton, index: number) => {
    if (button.style === 'destructive') {
      return {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
      };
    }
    if (button.style === 'cancel') {
      return {
        backgroundColor: 'transparent',
        borderColor: colors.border,
        borderWidth: 1,
      };
    }
    return {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    };
  };

  const getButtonTextColor = (button: AlertButton) => {
    if (button.style === 'cancel') {
      return colors.text;
    }
    return '#FFFFFF';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.overlayInner}>
          <Pressable>
            <Animated.View
              style={[
                styles.alertContainer,
                {
                  backgroundColor: colors.card,
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}15` }]}>
                <FontAwesome name={iconConfig.name} size={32} color={iconConfig.color} />
              </View>

              <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      getButtonStyle(button, index),
                      buttons.length === 1 && styles.singleButton,
                    ]}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.buttonText, { color: getButtonTextColor(button) }]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  overlayInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleButton: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

// Alert Manager - Singleton para manejar alertas globalmente
let alertCallback: ((config: AlertConfig) => void) | null = null;

export const setAlertCallback = (callback: (config: AlertConfig) => void) => {
  alertCallback = callback;
};

export const showCustomAlert = (
  title: string,
  message: string,
  buttons?: AlertButton[],
  type?: 'info' | 'success' | 'warning' | 'error'
) => {
  if (alertCallback) {
    alertCallback({ title, message, buttons, type });
  }
};

export default CustomAlert;
