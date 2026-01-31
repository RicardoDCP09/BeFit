import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useMindStore } from '@/store/mindStore';
import { WellnessCard } from '@/types';

type TabType = 'chat' | 'wellness';

export default function MindScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const {
    messages,
    wellnessCards,
    isSending,
    isLoadingTips,
    loadTodayChat,
    sendMessage,
    loadWellnessTips,
  } = useMindStore();

  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadTodayChat();
    loadWellnessTips();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const message = inputText.trim();
    setInputText('');
    await sendMessage(message);
  };

  const renderChat = () => (
    <View style={styles.chatContainer}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.welcomeMessage}>
            <View style={[styles.avatarLarge, { backgroundColor: colors.secondary + '20' }]}>
              <FontAwesome name="leaf" size={32} color={colors.secondary} />
            </View>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
              Hola, soy Mente
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Tu compañero de bienestar mental. Estoy aquí para escucharte y ayudarte
              a reflexionar. ¿Cómo te sientes hoy?
            </Text>
            <View style={styles.suggestedPrompts}>
              {[
                'Me siento estresado últimamente',
                'Quiero mejorar mi productividad',
                'Necesito motivación',
              ].map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.promptChip, { backgroundColor: colors.card }]}
                  onPress={() => setInputText(prompt)}
                >
                  <Text style={[styles.promptText, { color: colors.text }]}>
                    {prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? [styles.userBubble, { backgroundColor: colors.primary }]
                  : [styles.assistantBubble, { backgroundColor: colors.card }],
              ]}
            >
              {message.role === 'assistant' && (
                <View style={[styles.avatarSmall, { backgroundColor: colors.secondary + '20' }]}>
                  <FontAwesome name="leaf" size={14} color={colors.secondary} />
                </View>
              )}
              <Text
                style={[
                  styles.messageText,
                  { color: message.role === 'user' ? '#fff' : colors.text },
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))
        )}
        {isSending && (
          <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: colors.card }]}>
            <View style={[styles.avatarSmall, { backgroundColor: colors.secondary + '20' }]}>
              <FontAwesome name="leaf" size={14} color={colors.secondary} />
            </View>
            <ActivityIndicator size="small" color={colors.secondary} />
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: inputText.trim() ? colors.primary : colors.border },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
        >
          <FontAwesome
            name="send"
            size={16}
            color={inputText.trim() ? '#fff' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWellness = () => (
    <ScrollView
      style={styles.wellnessContainer}
      contentContainerStyle={styles.wellnessContent}
    >
      <Text style={[styles.wellnessTitle, { color: colors.text }]}>
        Feed de Bienestar
      </Text>
      <Text style={[styles.wellnessSubtitle, { color: colors.textSecondary }]}>
        Consejos personalizados para tu día
      </Text>

      {isLoadingTips ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : wellnessCards.length === 0 ? (
        <View style={[styles.emptyWellness, { backgroundColor: colors.card }]}>
          <FontAwesome name="lightbulb-o" size={48} color={colors.accent} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Los consejos se cargarán pronto
          </Text>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={() => loadWellnessTips()}
          >
            <Text style={styles.refreshButtonText}>Cargar consejos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        wellnessCards.map((card, index) => (
          <WellnessCardComponent key={index} card={card} colors={colors} />
        ))
      )}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Tab Selector */}
      <View style={[styles.tabSelector, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'chat' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('chat')}
        >
          <FontAwesome
            name="comment"
            size={16}
            color={activeTab === 'chat' ? '#fff' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'chat' ? '#fff' : colors.textSecondary },
            ]}
          >
            Diario
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'wellness' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('wellness')}
        >
          <FontAwesome
            name="lightbulb-o"
            size={16}
            color={activeTab === 'wellness' ? '#fff' : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'wellness' ? '#fff' : colors.textSecondary },
            ]}
          >
            Bienestar
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' ? renderChat() : renderWellness()}
    </KeyboardAvoidingView>
  );
}

function WellnessCardComponent({
  card,
  colors,
}: {
  card: WellnessCard;
  colors: typeof Colors.light;
}) {
  const categoryColors: Record<string, string> = {
    Productividad: '#4CAF50',
    Mindfulness: '#2196F3',
    Hábitos: '#FF9800',
    Filosofía: '#9C27B0',
  };

  const categoryColor = categoryColors[card.category] || colors.primary;

  return (
    <View style={[styles.wellnessCard, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {card.category}
          </Text>
        </View>
      </View>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
      <Text style={[styles.cardContent, { color: colors.textSecondary }]}>
        {card.content}
      </Text>
      <View style={[styles.actionTip, { backgroundColor: colors.primary + '10' }]}>
        <FontAwesome name="hand-o-right" size={14} color={colors.primary} />
        <Text style={[styles.actionTipText, { color: colors.primary }]}>
          {card.actionTip}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabSelector: {
    flexDirection: 'row',
    margin: 16,
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  welcomeMessage: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  suggestedPrompts: {
    width: '100%',
    gap: 8,
  },
  promptChip: {
    padding: 12,
    borderRadius: 12,
  },
  promptText: {
    fontSize: 14,
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 24,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wellnessContainer: {
    flex: 1,
  },
  wellnessContent: {
    padding: 16,
    paddingBottom: 32,
  },
  wellnessTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  wellnessSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyWellness: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 16,
  },
  refreshButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  wellnessCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  cardHeader: {
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionTip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  actionTipText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
