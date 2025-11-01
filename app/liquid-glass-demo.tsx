import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassUltra } from '@/components/LiquidGlassUltra';
import { Sparkles, Settings } from 'lucide-react-native';
import { router, Stack } from 'expo-router';

export default function LiquidGlassDemoScreen() {
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);

  const handlePress = (buttonName: string) => {
    setButtonPressed(buttonName);
    Alert.alert('Liquid Glass', `Botão "${buttonName}" pressionado!`);
    setTimeout(() => setButtonPressed(null), 2000);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Liquid Glass Demo',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600' as const,
          },
        }} 
      />
      
      <LinearGradient
        colors={['#0A0A0A', '#1A1A2E', '#16213E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Liquid Glass Ultra</Text>
            <Text style={styles.subtitle}>
              Efeito de vidro líquido com blur translúcido, parallax e interações dinâmicas
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Botões Principais</Text>
            
            <View style={styles.buttonContainer}>
              <LiquidGlassUltra
                title="Começar"
                onPress={() => handlePress('Começar')}
                icon={<Sparkles color="rgba(255, 255, 255, 0.9)" size={20} strokeWidth={2} />}
              />
            </View>

            <View style={styles.buttonContainer}>
              <LiquidGlassUltra
                title="Definições"
                onPress={() => handlePress('Definições')}
                icon={<Settings color="rgba(255, 255, 255, 0.9)" size={20} strokeWidth={2} />}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Variações</Text>
            
            <View style={styles.buttonContainer}>
              <LiquidGlassUltra
                title="Alta Intensidade"
                onPress={() => handlePress('Alta Intensidade')}
                intensity={45}
              />
            </View>

            <View style={styles.buttonContainer}>
              <LiquidGlassUltra
                title="Baixa Intensidade"
                onPress={() => handlePress('Baixa Intensidade')}
                intensity={25}
              />
            </View>

            <View style={styles.buttonContainer}>
              <LiquidGlassUltra
                title="Raio Customizado"
                onPress={() => handlePress('Raio Customizado')}
                cornerRadius={28}
              />
            </View>

            <View style={styles.buttonContainer}>
              <LiquidGlassUltra
                title="Desabilitado"
                onPress={() => handlePress('Desabilitado')}
                disabled={true}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Funcionalidades:</Text>
            <Text style={styles.infoText}>• Blur translúcido com expo-blur</Text>
            <Text style={styles.infoText}>• Reflexo especular dinâmico</Text>
            <Text style={styles.infoText}>• Parallax com giroscópio (mobile)</Text>
            <Text style={styles.infoText}>• Brilho que segue o dedo</Text>
            <Text style={styles.infoText}>• Animação de pressão suave</Text>
            <Text style={styles.infoText}>• Feedback háptico (iOS/Android)</Text>
            <Text style={styles.infoText}>• Ruído subtil animado</Text>
          </View>

          {buttonPressed && (
            <View style={styles.feedbackBox}>
              <Text style={styles.feedbackText}>
                Último botão pressionado: {buttonPressed}
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <LiquidGlassUltra
              title="Voltar"
              onPress={() => router.back()}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center' as const,
    lineHeight: 21,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    lineHeight: 20,
  },
  feedbackBox: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
  },
});
