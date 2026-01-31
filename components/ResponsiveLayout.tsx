import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  maxWidth?: number;
  centered?: boolean;
  padding?: number;
}

export default function ResponsiveLayout({
  children,
  maxWidth = 1200,
  centered = true,
  padding = 16,
}: ResponsiveLayoutProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const isWeb = Platform.OS === 'web';
  const isWideScreen = width > 768;

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.background },
      isWeb && isWideScreen && centered && { alignItems: 'center' },
    ]}>
      <View style={[
        styles.content,
        { padding },
        isWeb && isWideScreen && { maxWidth, width: '100%' },
      ]}>
        {children}
      </View>
    </View>
  );
}

export function useResponsive() {
  const screenWidth = Dimensions.get('window').width;
  const isWeb = Platform.OS === 'web';
  
  return {
    isWeb,
    isMobile: screenWidth < 768,
    isTablet: screenWidth >= 768 && screenWidth < 1024,
    isDesktop: screenWidth >= 1024,
    screenWidth,
    columns: screenWidth < 768 ? 1 : screenWidth < 1024 ? 2 : 3,
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
