import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface QuoteCardProps {
  quote: string;
  author?: string;
  category?: 'motivation' | 'health' | 'mindfulness' | 'nutrition';
  animated?: boolean;
}

const categoryIcons: Record<string, string> = {
  motivation: 'rocket',
  health: 'heartbeat',
  mindfulness: 'leaf',
  nutrition: 'apple',
};

const categoryColors: Record<string, string> = {
  motivation: '#FF9800',
  health: '#4CAF50',
  mindfulness: '#2196F3',
  nutrition: '#E91E63',
};

export default function QuoteCard({
  quote,
  author,
  category = 'motivation',
  animated = true,
}: QuoteCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const categoryColor = categoryColors[category] || colors.primary;
  const icon = categoryIcons[category] || 'quote-left';

  const opacity = useSharedValue(animated ? 0 : 1);
  const translateY = useSharedValue(animated ? 20 : 0);
  const scale = useSharedValue(animated ? 0.95 : 1);

  useEffect(() => {
    if (animated) {
      opacity.value = withDelay(200, withTiming(1, { duration: 500 }));
      translateY.value = withDelay(200, withTiming(0, { duration: 500, easing: Easing.out(Easing.back(1)) }));
      scale.value = withDelay(200, withTiming(1, { duration: 500 }));
    }
  }, [quote]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: colors.card },
        cardStyle
      ]}
    >
      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: categoryColor }]} />
      
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: categoryColor + '15' }]}>
          <FontAwesome name={icon as any} size={20} color={categoryColor} />
        </View>

        {/* Quote */}
        <View style={styles.quoteContainer}>
          <FontAwesome 
            name="quote-left" 
            size={14} 
            color={colors.textSecondary} 
            style={styles.quoteIcon}
          />
          <Text style={[styles.quoteText, { color: colors.text }]}>
            {quote}
          </Text>
        </View>

        {/* Author */}
        {author && (
          <Text style={[styles.author, { color: colors.textSecondary }]}>
            — {author}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  accentBar: {
    height: 4,
  },
  content: {
    padding: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  quoteContainer: {
    flexDirection: 'row',
  },
  quoteIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  author: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'right',
  },
});
