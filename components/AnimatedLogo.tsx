import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedLogoProps {
  size?: number;
  color?: string;
  showPulse?: boolean;
  variant?: 'icon' | 'full';
}

export default function AnimatedLogo({
  size = 80,
  color,
  showPulse = true,
  variant = 'icon'
}: AnimatedLogoProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const logoColor = color || colors.primary;

  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200 })
    );

    opacity.value = withTiming(1, { duration: 300 });

    rotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    if (showPulse) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(pulseScale.value, [1, 1.1], [0.3, 0]),
  }));

  // Select logo based on variant and color scheme
  const logoSource = variant === 'full'
    ? colorScheme === 'dark'
      ? require('@/assets/images/Befit_Fondo_Negro.png')
      : require('@/assets/images/Befit_Fondo_Blanco.png')
    : require('@/assets/images/Befit_Sin_Fondo.png');

  return (
    <View style={styles.container}>
      {showPulse && (
        <Animated.View
          style={[
            styles.pulse,
            {
              width: size * 1.5,
              height: size * 1.5,
              borderRadius: size * 0.75,
              backgroundColor: logoColor,
            },
            pulseStyle
          ]}
        />
      )}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Image
          source={logoSource}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
