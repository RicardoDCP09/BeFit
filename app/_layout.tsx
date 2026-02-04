import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useState } from 'react';
import 'react-native-reanimated';

import CustomAlert, { setAlertCallback } from '@/components/CustomAlert';
import LoadingScreen from '@/components/LoadingScreen';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const { loadToken } = useAuthStore();
  const { loadTheme } = useThemeStore();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      Promise.all([loadToken(), loadTheme()]).finally(() => {
        SplashScreen.hideAsync();
      });
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

interface AlertConfig {
  title: string;
  message: string;
  buttons?: { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }[];
  type?: 'info' | 'success' | 'warning' | 'error';
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const router = useRouter();
  const segments = useSegments();

  const { isAuthenticated, isLoading, user } = useAuthStore();

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);

  useEffect(() => {
    setAlertCallback((config: AlertConfig) => {
      setAlertConfig(config);
      setAlertVisible(true);
    });
  }, []);

  // Custom themes with orange primary color
  const customTheme: Theme = useMemo(() => ({
    dark: colorScheme === 'dark',
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
    fonts: DefaultTheme.fonts,
  }), [colorScheme, colors]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (user?.onboardingCompleted) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } else if (isAuthenticated && !user?.onboardingCompleted && !inOnboarding) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, isLoading, user, segments]);

  const [showLoading, setShowLoading] = useState(true);

  if (isLoading || showLoading) {
    return (
      <LoadingScreen
        onFinish={() => setShowLoading(false)}
        minDuration={2500}
      />
    );
  }

  return (
    <ThemeProvider value={customTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <CustomAlert
        visible={alertVisible}
        config={alertConfig}
        onClose={() => setAlertVisible(false)}
      />
    </ThemeProvider>
  );
}
