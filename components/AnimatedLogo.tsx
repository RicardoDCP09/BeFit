import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface AnimatedLogoProps {
  size?: number;
  color?: string;
  showPulse?: boolean;
}

export default function AnimatedLogo({ 
  size = 80, 
  color = Colors.light.primary,
  showPulse = true 
}: AnimatedLogoProps) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Initial animation
    scale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200 })
    );
    
    opacity.value = withTiming(1, { duration: 300 });

    // Subtle rotation
    rotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Pulse effect
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
              backgroundColor: color,
            },
            pulseStyle
          ]} 
        />
      )}
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={[styles.iconWrapper, { width: size, height: size, borderRadius: size / 2 }]}>
          <FontAwesome name="heartbeat" size={size * 0.5} color={color} />
        </View>
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
  iconWrapper: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
