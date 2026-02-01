import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
  colors: {
    primary: string;
    card: string;
    text: string;
  };
}

export function QuickReplies({ replies, onSelect, colors }: QuickRepliesProps) {
  if (!replies || replies.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {replies.map((reply, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.primary + '40' }]}
            onPress={() => onSelect(reply)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, { color: colors.primary }]}>
              {reply}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    maxHeight: 50,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
