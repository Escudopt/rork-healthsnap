import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon, Smartphone, Palette } from 'lucide-react-native';
import { useTheme, ThemeMode, useThemedStyles } from '@/providers/ThemeProvider';
import { BlurCard } from './BlurCard';

export const ThemeSelector: React.FC = () => {
  const { themeMode, setThemeMode, isDark, colors } = useTheme();

  const themeOptions: {
    mode: ThemeMode;
    label: string;
    icon: React.ComponentType<{ color: string; size: number }>;
    description: string;
  }[] = [
    {
      mode: 'light',
      label: 'Claro',
      icon: Sun,
      description: 'Interface clara e limpa'
    },
    {
      mode: 'dark',
      label: 'Escuro',
      icon: Moon,
      description: 'Ideal para ambientes escuros'
    },
    {
      mode: 'system',
      label: 'Sistema',
      icon: Smartphone,
      description: 'Segue configuração do sistema'
    }
  ];

  const handleThemeChange = async (mode: ThemeMode) => {
    if (!mode || !['light', 'dark', 'system'].includes(mode)) {
      console.error('Invalid theme mode:', mode);
      return;
    }
    await setThemeMode(mode);
  };

  const styles = useThemedStyles((colors, isDark) => StyleSheet.create({
    container: {
      padding: 24,
      marginBottom: 20,
      borderRadius: 28,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      justifyContent: 'center',
    },
    headerIcon: {
      backgroundColor: isDark ? 'rgba(0, 212, 255, 0.15)' : 'rgba(0, 122, 255, 0.15)',
      padding: 12,
      borderRadius: 20,
      marginRight: 12,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(0, 212, 255, 0.25)' : 'rgba(0, 122, 255, 0.25)',
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.3,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    optionsContainer: {
      gap: 12,
    },
    optionCard: {
      padding: 18,
      borderRadius: 20,
      borderWidth: 1.5,
      backgroundColor: colors.surfaceSecondary,
      borderColor: colors.border,
    },
    activeOptionCard: {
      backgroundColor: isDark ? 'rgba(0, 212, 255, 0.15)' : 'rgba(0, 122, 255, 0.08)',
      borderColor: isDark ? 'rgba(0, 212, 255, 0.4)' : 'rgba(0, 122, 255, 0.3)',
      shadowColor: isDark ? '#00d4ff' : '#007AFF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.borderSecondary,
    },
    activeIconContainer: {
      backgroundColor: isDark ? 'rgba(0, 212, 255, 0.2)' : 'rgba(0, 122, 255, 0.1)',
      borderColor: isDark ? 'rgba(0, 212, 255, 0.4)' : 'rgba(0, 122, 255, 0.3)',
    },
    optionText: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    checkmark: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: isDark ? '#00d4ff' : '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkmarkHidden: {
      opacity: 0,
    },
    checkmarkText: {
      color: 'white',
      fontSize: 12,
      fontWeight: 'bold',
    },
  }));

  return (
    <BlurCard style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Palette color={isDark ? "#00d4ff" : "#007AFF"} size={20} />
        </View>
        <Text style={styles.title}>Aparência</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Escolha como você prefere ver o aplicativo
      </Text>
      
      <View style={styles.optionsContainer}>
        {themeOptions.map((option) => {
          const isActive = themeMode === option.mode;
          const IconComponent = option.icon;
          
          return (
            <TouchableOpacity
              key={option.mode}
              onPress={() => handleThemeChange(option.mode)}
              activeOpacity={0.8}
              style={[
                styles.optionCard,
                isActive && styles.activeOptionCard
              ]}
            >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.iconContainer,
                    isActive && styles.activeIconContainer
                  ]}>
                    <IconComponent 
                      color={isActive ? '#FFFFFF' : colors.textSecondary} 
                      size={22} 
                    />
                  </View>
                  
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  
                  <View style={[
                    styles.checkmark,
                    !isActive && styles.checkmarkHidden
                  ]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </BlurCard>
  );
};