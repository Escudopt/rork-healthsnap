import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, X, User, Heart, Activity } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';

import * as Haptics from 'expo-haptics';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  category?: 'greeting' | 'nutrition' | 'exercise' | 'general';
}

interface FloatingAIChatProps {
  style?: any;
  isHeaderButton?: boolean;
  autoOpen?: boolean;
}

export function FloatingAIChat({ style, isHeaderButton = false, autoOpen = false }: FloatingAIChatProps) {
  const { colors } = useTheme();
  const [isVisible, setIsVisible] = useState(autoOpen);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou seu assistente de saúde e nutrição. Como posso ajudá-lo hoje? Posso responder perguntas sobre calorias, nutrição, exercícios e bem-estar.',
      category: 'greeting',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (autoOpen) {
      setIsVisible(true);
    }
  }, [autoOpen]);

  useEffect(() => {
    // Pulse animation for the floating button
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Sparkle animation
    const startSparkle = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startPulse();
    startSparkle();
  }, [pulseAnim, sparkleAnim]);

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsVisible(true);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente de saúde e nutrição especializado em ajudar usuários com questões sobre alimentação, calorias, exercícios, bem-estar e hábitos saudáveis. Responda sempre em português de forma amigável, informativa e motivadora, similar ao app Saúde da Apple. Mantenha as respostas concisas mas úteis.',
            },
            {
              role: 'assistant',
              content: 'Olá! Sou seu assistente de saúde e nutrição. Como posso ajudá-lo hoje?',
            },
            {
              role: 'user',
              content: userMessage.text,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.completion || 'Desculpe, não consegui processar sua pergunta. Tente novamente.',
        isUser: false,
        timestamp: new Date(),
        category: 'general',
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro ao processar sua pergunta. Verifique sua conexão e tente novamente.',
        isUser: false,
        timestamp: new Date(),
        category: 'general',
      };

      setMessages(prev => [...prev, errorMessage]);
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const getHealthIcon = (category?: string) => {
    switch (category) {
      case 'nutrition':
        return <Heart color="#FF6B6B" size={16} strokeWidth={2} />;
      case 'exercise':
        return <Activity color="#4ECDC4" size={16} strokeWidth={2} />;
      default:
        return <Heart color="#FF6B6B" size={16} strokeWidth={2} />;
    }
  };

  const renderMessage = (message: Message) => {
    return (
      <View key={message.id} style={[styles.messageContainer, message.isUser ? styles.userMessageContainer : styles.aiMessageContainer]}>
        {!message.isUser && (
          <View style={[styles.messageAvatar, styles.healthAvatar]}>
            {getHealthIcon(message.category)}
          </View>
        )}
        <View style={[
          styles.messageBubble, 
          message.isUser 
            ? [styles.userBubble, styles.healthUserBubble] 
            : [styles.aiBubble, styles.healthAiBubble]
        ]}>
          <Text style={[styles.messageText, message.isUser ? styles.userMessageText : styles.aiMessageText]}>
            {message.text}
          </Text>
          <Text style={[styles.messageTime, message.isUser ? styles.userMessageTime : styles.aiMessageTime]}>
            {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {message.isUser && (
          <View style={[styles.messageAvatar, styles.userAvatar]}>
            <User color="white" size={16} strokeWidth={2} />
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {/* Chat Button */}
      {isHeaderButton ? (
        <TouchableOpacity
          onPress={handlePress}
          style={[styles.headerButton, { backgroundColor: colors.surfaceElevated }, style]}
          activeOpacity={0.6}
        >
          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>AI</Text>
        </TouchableOpacity>
      ) : (
        <Animated.View 
          style={[
            styles.floatingButton,
            style,
            {
              transform: [
                { scale: scaleAnim },
                { scale: pulseAnim }
              ]
            }
          ]}
        >
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.8}
            style={styles.floatingButtonTouchable}
          >
            <LinearGradient
              colors={[
                colors.primary,
                colors.primaryDark || colors.primary,
                '#6366F1'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.floatingButtonGradient}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>AI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Chat Modal */}
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.chatContainer, { backgroundColor: colors.surface }]}>
              {/* Header */}
              <View style={[styles.chatHeader, { backgroundColor: '#FFFFFF' }]}>
                <View style={styles.chatHeaderContent}>
                  <View style={styles.chatHeaderLeft}>
                    <View style={styles.healthHeaderIcon}>
                      <LinearGradient
                        colors={['#FF6B6B', '#FF8E8E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.healthIconGradient}
                      >
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>AI</Text>
                      </LinearGradient>
                    </View>
                    <View>
                      <Text style={styles.healthHeaderTitle}>Assistente de Saúde</Text>
                      <Text style={styles.healthHeaderSubtitle}>Nutrição e Bem-estar</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.healthCloseButton}
                    activeOpacity={0.7}
                  >
                    <X color="#8E8E93" size={24} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Messages */}
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.map(renderMessage)}
                {isLoading && (
                  <View style={[styles.messageContainer, styles.aiMessageContainer]}>
                    <View style={[styles.messageAvatar, styles.healthAvatar]}>
                      <Text style={{ color: '#FF6B6B', fontSize: 10, fontWeight: '700' }}>AI</Text>
                    </View>
                    <View style={[styles.messageBubble, styles.aiBubble, styles.healthAiBubble]}>
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FF6B6B" />
                        <Text style={[styles.loadingText, styles.aiMessageText]}>Analisando...</Text>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Input */}
              <View style={styles.healthInputContainer}>
                <View style={styles.healthInputWrapper}>
                  <TextInput
                    style={styles.healthTextInput}
                    placeholder="Pergunte sobre saúde e nutrição..."
                    placeholderTextColor="#8E8E93"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                    onSubmitEditing={handleSendMessage}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    onPress={handleSendMessage}
                    style={[
                      styles.healthSendButton,
                      {
                        opacity: inputText.trim() && !isLoading ? 1 : 0.3
                      }
                    ]}
                    activeOpacity={0.7}
                    disabled={!inputText.trim() || isLoading}
                  >
                    <LinearGradient
                      colors={['#007AFF', '#0051D5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.healthSendGradient}
                    >
                      <Send color="white" size={16} strokeWidth={2} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  floatingButtonTouchable: {
    borderRadius: 28,
  },
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkleContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  chatContainer: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 25,
  },
  chatHeader: {
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  chatHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  healthHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  healthIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthHeaderTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    letterSpacing: -0.4,
  },
  healthHeaderSubtitle: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: '#8E8E93',
    marginTop: 2,
  },
  healthCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  healthAvatar: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  userAvatar: {
    backgroundColor: '#007AFF',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  healthUserBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  healthAiBubble: {
    backgroundColor: '#F2F2F7',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  aiMessageText: {
    color: '#1C1C1E',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    fontWeight: '400' as const,
    marginTop: 6,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '400' as const,
    marginTop: 6,
  },
  aiMessageTime: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '400' as const,
    marginTop: 6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  healthInputContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
  },
  healthInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  healthTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400' as const,
    color: '#1C1C1E',
    maxHeight: 100,
    minHeight: 36,
    textAlignVertical: 'center',
    paddingVertical: 8,
  },
  healthSendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  healthSendGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});