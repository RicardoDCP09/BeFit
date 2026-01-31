import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import AnimatedLogo from './AnimatedLogo';

const { width, height } = Dimensions.get('window');
const isMobile = Platform.OS !== 'web';

interface LoadingScreenProps {
  onFinish?: () => void;
  minDuration?: number;
}

const loadingMessages = [
  '💪 Preparando tu experiencia...',
  '🥗 Cargando recetas saludables...',
  '🧘 Conectando con tu bienestar...',
  '🏋️ Activando modo fitness...',
  '🧠 Sincronizando mente y cuerpo...',
  '✨ Casi listo para brillar...',
];

export default function LoadingScreen({
  onFinish,
  minDuration = 2500
}: LoadingScreenProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [messageIndex, setMessageIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const titleScale = useSharedValue(0.8);
  const subtitleOpacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const dotsOpacity = useSharedValue(0);
  const icon1Scale = useSharedValue(0);
  const icon2Scale = useSharedValue(0);
  const icon3Scale = useSharedValue(0);
  const floatAnim = useSharedValue(0);

  useEffect(() => {
    // Animate title with spring
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(300, withSpring(0, { damping: 12, stiffness: 100 }));
    titleScale.value = withDelay(300, withSpring(1, { damping: 10, stiffness: 80 }));

    // Animate subtitle
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));

    // Animate progress bar
    progressWidth.value = withTiming(100, {
      duration: minDuration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });

    // Animate loading dots
    dotsOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));

    // Staggered icon animations with bounce
    icon1Scale.value = withDelay(1000, withSpring(1, { damping: 8, stiffness: 120 }));
    icon2Scale.value = withDelay(1150, withSpring(1, { damping: 8, stiffness: 120 }));
    icon3Scale.value = withDelay(1300, withSpring(1, { damping: 8, stiffness: 120 }));

    // Floating animation for mobile
    if (isMobile) {
      floatAnim.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 600);

    // Finish loading
    const timer = setTimeout(() => {
      setIsReady(true);
      if (onFinish) {
        onFinish();
      }
    }, minDuration);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(timer);
    };
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      { translateY: titleTranslateY.value },
      { scale: titleScale.value },
    ],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  const icon1Style = useAnimatedStyle(() => ({
    transform: [
      { scale: icon1Scale.value },
      { translateY: interpolate(floatAnim.value, [0, 1], [0, -5]) },
    ],
  }));

  const icon2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: icon2Scale.value },
      { translateY: interpolate(floatAnim.value, [0, 1], [0, -8]) },
    ],
  }));

  const icon3Style = useAnimatedStyle(() => ({
    transform: [
      { scale: icon3Scale.value },
      { translateY: interpolate(floatAnim.value, [0, 1], [0, -5]) },
    ],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Decorative circles */}
      <View style={[styles.decorCircle1, { backgroundColor: colors.primary + '10' }]} />
      <View style={[styles.decorCircle2, { backgroundColor: colors.secondary + '08' }]} />

      <View style={styles.content}>
        {/* Animated Logo */}
        <AnimatedLogo size={100} color={colors.primary} showPulse={true} />

        {/* Title */}
        <Animated.View style={titleStyle}>
          <Text style={[styles.title, { color: colors.primary }]}>Be Fit</Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={subtitleStyle}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Tu ecosistema de bienestar
          </Text>
        </Animated.View>
      </View>

      {/* Loading section */}
      <View style={styles.loadingSection}>
        {/* Progress bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressBar,
              { backgroundColor: colors.primary },
              progressStyle
            ]}
          />
        </View>

        {/* Loading message */}
        <Animated.View style={dotsStyle}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {loadingMessages[messageIndex]}
          </Text>
        </Animated.View>

        {/* Feature icons with staggered animation */}
        <View style={styles.features}>
          <Animated.View style={[styles.featureItem, icon1Style]}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
              <FontAwesome name="heartbeat" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.featureLabel, { color: colors.textSecondary }]}>Gym</Text>
          </Animated.View>
          <Animated.View style={[styles.featureItem, icon2Style]}>
            <View style={[styles.featureIcon, { backgroundColor: colors.accent + '20' }]}>
              <FontAwesome name="cutlery" size={18} color={colors.accent} />
            </View>
            <Text style={[styles.featureLabel, { color: colors.textSecondary }]}>Cocina</Text>
          </Animated.View>
          <Animated.View style={[styles.featureItem, icon3Style]}>
            <View style={[styles.featureIcon, { backgroundColor: colors.secondary + '20' }]}>
              <FontAwesome name="leaf" size={18} color={colors.secondary} />
            </View>
            <Text style={[styles.featureLabel, { color: colors.textSecondary }]}>Mente</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    top: -width * 0.3,
    right: -width * 0.2,
  },
  decorCircle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    bottom: -width * 0.2,
    left: -width * 0.2,
  },
  content: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    marginTop: 24,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  loadingSection: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    marginBottom: 24,
  },
  features: {
    flexDirection: 'row',
    gap: 16,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
