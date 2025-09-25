import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { BlurCard } from '@/components/BlurCard';
import {
  Home,
  MapPin,
  Building,
  Dumbbell,
  Clock,
  Target,
  TrendingUp,
  User,
  Activity,
  Zap,
  Heart,
  Flame,
  Navigation,
  Star,
  Phone,
  ExternalLink,
} from 'lucide-react-native';



interface WorkoutRecommendation {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Iniciante' | 'Intermédio' | 'Avançado';
  location: 'Casa' | 'Rua' | 'Ginásio';
  calories: string;
  exercises: string[];
  equipment?: string[];
  benefits: string[];
  tips: string[];
}

interface WorkoutCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  workouts: WorkoutRecommendation[];
}

interface NearbyGym {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  priceLevel?: number;
  isOpen?: boolean;
  phoneNumber?: string;
  website?: string;
  latitude: number;
  longitude: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

export default function WorkoutsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { userProfile, healthMetrics, todayCalories, dailyGoal } = useCalorieTracker();
  const [selectedCategory, setSelectedCategory] = useState<string>('casa');
  const [workoutRecommendations, setWorkoutRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [nearbyGyms, setNearbyGyms] = useState<NearbyGym[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingGyms, setIsLoadingGyms] = useState<boolean>(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState<boolean>(false);

  // Default workout recommendations as fallback
  const getDefaultWorkouts = useCallback((): WorkoutRecommendation[] => {
    const baseWorkouts: WorkoutRecommendation[] = [
      {
        id: 'casa_1',
        title: 'HIIT em Casa',
        description: 'Treino intenso de alta intensidade para queimar calorias rapidamente.',
        duration: '20 min',
        difficulty: 'Intermédio',
        location: 'Casa',
        calories: '200-250 kcal',
        exercises: ['Burpees', 'Mountain Climbers', 'Jumping Jacks', 'Agachamentos', 'Flexões'],
        equipment: [],
        benefits: ['Queima muitas calorias', 'Melhora resistência cardiovascular', 'Fortalece músculos'],
        tips: ['Mantenha boa forma', 'Descanse 30s entre exercícios', 'Hidrate-se bem']
      },
      {
        id: 'casa_2',
        title: 'Yoga Matinal',
        description: 'Sequência suave de yoga para começar o dia com energia e flexibilidade.',
        duration: '30 min',
        difficulty: 'Iniciante',
        location: 'Casa',
        calories: '100-150 kcal',
        exercises: ['Saudação ao Sol', 'Postura do Guerreiro', 'Postura da Árvore', 'Prancha', 'Relaxamento'],
        equipment: ['Tapete de yoga'],
        benefits: ['Melhora flexibilidade', 'Reduz stress', 'Fortalece core'],
        tips: ['Respire profundamente', 'Não force as posturas', 'Pratique regularmente']
      },
      {
        id: 'rua_1',
        title: 'Corrida Intervalada',
        description: 'Alternância entre corrida e caminhada para melhorar resistência.',
        duration: '30 min',
        difficulty: 'Intermédio',
        location: 'Rua',
        calories: '300-400 kcal',
        exercises: ['Aquecimento caminhada', 'Corrida 2 min', 'Caminhada 1 min', 'Repetir ciclo', 'Arrefecimento'],
        equipment: ['Ténis de corrida'],
        benefits: ['Melhora capacidade cardíaca', 'Queima gordura', 'Fortalece pernas'],
        tips: ['Use ténis adequados', 'Mantenha postura ereta', 'Hidrate-se durante']
      },
      {
        id: 'rua_2',
        title: 'Caminhada Ativa',
        description: 'Caminhada energética com exercícios funcionais em parques.',
        duration: '45 min',
        difficulty: 'Iniciante',
        location: 'Rua',
        calories: '200-300 kcal',
        exercises: ['Caminhada rápida', 'Agachamentos no banco', 'Flexões na parede', 'Alongamentos', 'Respiração'],
        equipment: [],
        benefits: ['Baixo impacto', 'Melhora humor', 'Fortalece músculos'],
        tips: ['Mantenha ritmo constante', 'Use roupa confortável', 'Escolha percursos seguros']
      },
      {
        id: 'ginasio_1',
        title: 'Treino de Força',
        description: 'Circuito completo de musculação para ganho de massa muscular.',
        duration: '60 min',
        difficulty: 'Avançado',
        location: 'Ginásio',
        calories: '400-500 kcal',
        exercises: ['Agachamento com barra', 'Supino', 'Remada', 'Desenvolvimento', 'Deadlift', 'Abdominais'],
        equipment: ['Barras', 'Halteres', 'Máquinas'],
        benefits: ['Aumenta massa muscular', 'Melhora metabolismo', 'Fortalece ossos'],
        tips: ['Aqueça bem antes', 'Use técnica correta', 'Aumente peso gradualmente']
      },
      {
        id: 'ginasio_2',
        title: 'Cardio + Funcional',
        description: 'Combinação de exercícios cardiovasculares e funcionais.',
        duration: '45 min',
        difficulty: 'Intermédio',
        location: 'Ginásio',
        calories: '350-450 kcal',
        exercises: ['Passadeira 10 min', 'Kettlebell swings', 'Box jumps', 'Battle ropes', 'Bicicleta 10 min'],
        equipment: ['Passadeira', 'Kettlebells', 'Box', 'Cordas'],
        benefits: ['Melhora resistência', 'Queima calorias', 'Trabalha corpo todo'],
        tips: ['Varie intensidade', 'Mantenha hidratação', 'Escute seu corpo']
      }
    ];

    // Adjust recommendations based on user profile
    if (userProfile) {
      return baseWorkouts.map(workout => {
        let adjustedWorkout = { ...workout };
        
        // Adjust difficulty based on activity level
        if (userProfile.activityLevel === 'sedentary') {
          adjustedWorkout.difficulty = 'Iniciante';
        } else if (userProfile.activityLevel === 'very_active') {
          adjustedWorkout.difficulty = 'Avançado';
        }
        
        // Adjust focus based on goal
        if (userProfile.goal === 'lose') {
          // Increase calorie burn estimates for weight loss
          const calorieRange = adjustedWorkout.calories.match(/\d+/g);
          if (calorieRange) {
            const min = parseInt(calorieRange[0]) + 50;
            const max = parseInt(calorieRange[1] || calorieRange[0]) + 100;
            adjustedWorkout.calories = `${min}-${max} kcal`;
          }
        }
        
        return adjustedWorkout;
      });
    }
    
    return baseWorkouts;
  }, [userProfile]);

  // Generate AI-powered workout recommendations based on user profile
  const generateWorkoutRecommendations = useCallback(async () => {
    if (!userProfile || !healthMetrics) {
      return [];
    }

    setIsLoading(true);
    try {
      const calorieDeficit = dailyGoal - todayCalories;
      const activityLevel = userProfile.activityLevel;
      const goal = userProfile.goal;
      const age = userProfile.age;
      const bmi = healthMetrics.bmi;
      
      const prompt = `
Crie 6 recomendações de treino personalizadas em português baseadas no perfil:

Perfil do Usuário:
- Idade: ${age} anos
- IMC: ${bmi}
- Nível de atividade: ${activityLevel}
- Objetivo: ${goal === 'lose' ? 'Perder peso' : goal === 'gain' ? 'Ganhar peso' : 'Manter peso'}
- Déficit calórico hoje: ${calorieDeficit} kcal
- TMB: ${healthMetrics.bmr} kcal/dia
- TDEE: ${healthMetrics.tdee} kcal/dia

Crie 2 treinos para cada local (Casa, Rua, Ginásio) com:
1. Título atrativo
2. Descrição breve (1-2 frases)
3. Duração (15-60 min)
4. Dificuldade (Iniciante/Intermédio/Avançado)
5. Calorias queimadas estimadas
6. Lista de 4-6 exercícios específicos
7. Equipamentos necessários (se aplicável)
8. 2-3 benefícios principais
9. 2-3 dicas importantes

Formato JSON:
{
  "workouts": [
    {
      "title": "Nome do Treino",
      "description": "Descrição",
      "duration": "30 min",
      "difficulty": "Intermédio",
      "location": "Casa",
      "calories": "250-300 kcal",
      "exercises": ["Exercício 1", "Exercício 2", ...],
      "equipment": ["Equipamento 1", ...] ou null,
      "benefits": ["Benefício 1", "Benefício 2", ...],
      "tips": ["Dica 1", "Dica 2", ...]
    }
  ]
}

Personalize baseado no objetivo e condição física. Para perda de peso, foque em cardio e HIIT. Para ganho, foque em força. Para manutenção, combine ambos.`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        try {
          // Try to parse JSON from the AI response
          const jsonMatch = data.completion.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const workoutData = JSON.parse(jsonMatch[0]);
            const workouts = workoutData.workouts.map((workout: any, index: number) => ({
              id: `workout_${index}`,
              title: workout.title,
              description: workout.description,
              duration: workout.duration,
              difficulty: workout.difficulty,
              location: workout.location,
              calories: workout.calories,
              exercises: workout.exercises || [],
              equipment: workout.equipment || [],
              benefits: workout.benefits || [],
              tips: workout.tips || []
            }));
            return workouts;
          }
        } catch (parseError) {
          console.error('Error parsing AI workout response:', parseError);
        }
      }
    } catch (error) {
      console.error('Error generating workout recommendations:', error);
    } finally {
      setIsLoading(false);
    }

    // Fallback recommendations
    return getDefaultWorkouts();
  }, [userProfile, healthMetrics, todayCalories, dailyGoal, getDefaultWorkouts]);

  // Get user location
  const getUserLocation = useCallback(async () => {
    if (Platform.OS === 'web') {
      // Use web geolocation API
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000, // 5 minutes
            });
          });
          
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          setUserLocation(location);
          setLocationPermissionGranted(true);
          return location;
        } catch (error) {
          console.error('Error getting web location:', error);
          setLocationPermissionGranted(false);
          return null;
        }
      } else {
        console.log('Geolocation not supported');
        setLocationPermissionGranted(false);
        return null;
      }
    } else {
      // For mobile, we'll use a mock location for now since expo-location isn't available
      // In a real app, you would use expo-location here
      const mockLocation = {
        latitude: 38.7223, // Lisbon coordinates as default
        longitude: -9.1393,
      };
      
      setUserLocation(mockLocation);
      setLocationPermissionGranted(true);
      return mockLocation;
    }
  }, []);

  // Find nearby gyms using mock data (in a real app, you'd use Google Places API)
  const findNearbyGyms = useCallback(async (location: UserLocation) => {
    setIsLoadingGyms(true);
    
    try {
      // Mock gym data - in a real app, you'd call Google Places API
      const mockGyms: NearbyGym[] = [
        {
          id: 'gym_1',
          name: 'FitnesHut',
          address: 'Av. da República, 1050-185 Lisboa',
          distance: '0.8 km',
          rating: 4.2,
          priceLevel: 2,
          isOpen: true,
          phoneNumber: '+351 21 123 4567',
          website: 'https://www.fitnesshut.pt',
          latitude: location.latitude + 0.005,
          longitude: location.longitude + 0.003,
        },
        {
          id: 'gym_2',
          name: 'Holmes Place',
          address: 'Rua Castilho, 1250-066 Lisboa',
          distance: '1.2 km',
          rating: 4.5,
          priceLevel: 3,
          isOpen: true,
          phoneNumber: '+351 21 987 6543',
          website: 'https://www.holmesplace.com',
          latitude: location.latitude - 0.008,
          longitude: location.longitude + 0.007,
        },
        {
          id: 'gym_3',
          name: 'Solinca',
          address: 'Centro Colombo, 1500-392 Lisboa',
          distance: '2.1 km',
          rating: 4.0,
          priceLevel: 2,
          isOpen: false,
          phoneNumber: '+351 21 456 7890',
          website: 'https://www.solinca.pt',
          latitude: location.latitude + 0.012,
          longitude: location.longitude - 0.005,
        },
        {
          id: 'gym_4',
          name: 'Virgin Active',
          address: 'Av. de Roma, 1700-344 Lisboa',
          distance: '1.7 km',
          rating: 4.3,
          priceLevel: 3,
          isOpen: true,
          phoneNumber: '+351 21 234 5678',
          website: 'https://www.virginactive.pt',
          latitude: location.latitude - 0.003,
          longitude: location.longitude - 0.009,
        },
        {
          id: 'gym_5',
          name: 'Basic-Fit',
          address: 'Rua Braamcamp, 1250-050 Lisboa',
          distance: '0.5 km',
          rating: 3.8,
          priceLevel: 1,
          isOpen: true,
          phoneNumber: '+351 21 345 6789',
          website: 'https://www.basic-fit.com',
          latitude: location.latitude + 0.002,
          longitude: location.longitude + 0.001,
        },
      ];
      
      // Sort by distance (in a real app, this would be calculated properly)
      const sortedGyms = mockGyms.sort((a, b) => {
        const distanceA = parseFloat(a.distance.replace(' km', ''));
        const distanceB = parseFloat(b.distance.replace(' km', ''));
        return distanceA - distanceB;
      });
      
      setNearbyGyms(sortedGyms);
    } catch (error) {
      console.error('Error finding nearby gyms:', error);
    } finally {
      setIsLoadingGyms(false);
    }
  }, []);

  // Load workout recommendations on component mount
  useEffect(() => {
    const loadRecommendations = async () => {
      const recommendations = await generateWorkoutRecommendations();
      setWorkoutRecommendations(recommendations);
    };
    
    loadRecommendations();
  }, [generateWorkoutRecommendations]);

  // Load user location and nearby gyms when component mounts
  useEffect(() => {
    const loadLocationAndGyms = async () => {
      const location = await getUserLocation();
      if (location) {
        await findNearbyGyms(location);
      }
    };
    
    loadLocationAndGyms();
  }, [getUserLocation, findNearbyGyms]);

  // Filter workouts by selected category
  const filteredWorkouts = useMemo(() => {
    return workoutRecommendations.filter(workout => 
      workout.location.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [workoutRecommendations, selectedCategory]);

  // Workout categories
  const categories: WorkoutCategory[] = [
    {
      id: 'casa',
      name: 'Casa',
      icon: <Home size={24} color={colors.primary} />,
      color: colors.primary,
      workouts: filteredWorkouts.filter(w => w.location === 'Casa')
    },
    {
      id: 'rua',
      name: 'Rua',
      icon: <MapPin size={24} color={colors.warning} />,
      color: colors.warning,
      workouts: filteredWorkouts.filter(w => w.location === 'Rua')
    },
    {
      id: 'ginasio',
      name: 'Ginásio',
      icon: <Building size={24} color={colors.success} />,
      color: colors.success,
      workouts: filteredWorkouts.filter(w => w.location === 'Ginásio')
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return '#4CAF50';
      case 'Intermédio': return '#FF9800';
      case 'Avançado': return '#F44336';
      default: return colors.text;
    }
  };

  const openGymInMaps = (gym: NearbyGym) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${gym.latitude},${gym.longitude}`,
      android: `geo:0,0?q=${gym.latitude},${gym.longitude}(${encodeURIComponent(gym.name)})`,
      web: `https://www.google.com/maps/search/?api=1&query=${gym.latitude},${gym.longitude}`,
    });
    
    if (url) {
      Linking.openURL(url).catch(() => {
        // Fallback to Google Maps web
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${gym.latitude},${gym.longitude}`);
      });
    }
  };

  const callGym = (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível fazer a chamada');
    });
  };

  const openGymWebsite = (website: string) => {
    Linking.openURL(website).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o website');
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`star-${i}`} size={12} color="#FFD700" fill="#FFD700" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Star key="half-star" size={12} color="#FFD700" fill="none" />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={12} color="#E0E0E0" fill="none" />
      );
    }
    
    return stars;
  };

  const getPriceLevelText = (priceLevel?: number) => {
    switch (priceLevel) {
      case 1: return '€';
      case 2: return '€€';
      case 3: return '€€€';
      case 4: return '€€€€';
      default: return '';
    }
  };

  const renderGymCard = (gym: NearbyGym) => {
    return (
      <BlurCard key={gym.id} style={styles.gymCard}>
        <View style={styles.gymHeader}>
          <View style={styles.gymTitleRow}>
            <Building size={20} color={colors.success} />
            <View style={styles.gymInfo}>
              <Text style={[styles.gymName, { color: colors.text }]}>
                {gym.name}
              </Text>
              <View style={styles.gymMeta}>
                <View style={styles.ratingContainer}>
                  {renderStars(gym.rating)}
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                    {gym.rating}
                  </Text>
                </View>
                {gym.priceLevel && (
                  <Text style={[styles.priceLevel, { color: colors.success }]}>
                    {getPriceLevelText(gym.priceLevel)}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: gym.isOpen ? '#4CAF50' : '#F44336' }
          ]}>
            <Text style={styles.statusText}>
              {gym.isOpen ? 'Aberto' : 'Fechado'}
            </Text>
          </View>
        </View>
        
        <View style={styles.gymDetails}>
          <View style={styles.gymDetailRow}>
            <MapPin size={16} color={colors.textSecondary} />
            <Text style={[styles.gymAddress, { color: colors.textSecondary }]}>
              {gym.address}
            </Text>
          </View>
          <View style={styles.gymDetailRow}>
            <Navigation size={16} color={colors.textSecondary} />
            <Text style={[styles.gymDistance, { color: colors.textSecondary }]}>
              {gym.distance}
            </Text>
          </View>
        </View>
        
        <View style={styles.gymActions}>
          <TouchableOpacity
            style={[styles.gymActionButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => openGymInMaps(gym)}
            activeOpacity={0.7}
          >
            <Navigation size={16} color={colors.primary} />
            <Text style={[styles.gymActionText, { color: colors.primary }]}>Direções</Text>
          </TouchableOpacity>
          
          {gym.phoneNumber && (
            <TouchableOpacity
              style={[styles.gymActionButton, { backgroundColor: colors.success + '20' }]}
              onPress={() => callGym(gym.phoneNumber!)}
              activeOpacity={0.7}
            >
              <Phone size={16} color={colors.success} />
              <Text style={[styles.gymActionText, { color: colors.success }]}>Ligar</Text>
            </TouchableOpacity>
          )}
          
          {gym.website && (
            <TouchableOpacity
              style={[styles.gymActionButton, { backgroundColor: colors.warning + '20' }]}
              onPress={() => openGymWebsite(gym.website!)}
              activeOpacity={0.7}
            >
              <ExternalLink size={16} color={colors.warning} />
              <Text style={[styles.gymActionText, { color: colors.warning }]}>Website</Text>
            </TouchableOpacity>
          )}
        </View>
      </BlurCard>
    );
  };

  const renderWorkoutCard = (workout: WorkoutRecommendation) => {
    const isExpanded = expandedWorkout === workout.id;
    
    return (
      <BlurCard key={workout.id} style={styles.workoutCard}>
        <TouchableOpacity
          onPress={() => setExpandedWorkout(isExpanded ? null : workout.id)}
          activeOpacity={0.7}
        >
          <View style={styles.workoutHeader}>
            <View style={styles.workoutTitleRow}>
              <Dumbbell size={20} color={colors.primary} />
              <Text style={[styles.workoutTitle, { color: colors.text }]}>
                {workout.title}
              </Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(workout.difficulty) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(workout.difficulty) }]}>
                {workout.difficulty}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.workoutDescription, { color: colors.textSecondary }]}>
            {workout.description}
          </Text>
          
          <View style={styles.workoutMeta}>
            <View style={styles.metaItem}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {workout.duration}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Flame size={16} color={colors.textSecondary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {workout.calories}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.separator} />
            
            {/* Exercises */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Exercícios</Text>
              </View>
              {workout.exercises.map((exercise, index) => (
                <Text key={`exercise-${workout.id}-${index}`} style={[styles.listItem, { color: colors.textSecondary }]}>
                  • {exercise}
                </Text>
              ))}
            </View>
            
            {/* Equipment */}
            {workout.equipment && workout.equipment.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Activity size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Equipamentos</Text>
                </View>
                {workout.equipment.map((equipment, index) => (
                  <Text key={`equipment-${workout.id}-${index}`} style={[styles.listItem, { color: colors.textSecondary }]}>
                    • {equipment}
                  </Text>
                ))}
              </View>
            )}
            
            {/* Benefits */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <TrendingUp size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Benefícios</Text>
              </View>
              {workout.benefits.map((benefit, index) => (
                <Text key={`benefit-${workout.id}-${index}`} style={[styles.listItem, { color: colors.textSecondary }]}>
                  • {benefit}
                </Text>
              ))}
            </View>
            
            {/* Tips */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Zap size={18} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Dicas</Text>
              </View>
              {workout.tips.map((tip, index) => (
                <Text key={`tip-${workout.id}-${index}`} style={[styles.listItem, { color: colors.textSecondary }]}>
                  • {tip}
                </Text>
              ))}
            </View>
          </View>
        )}
      </BlurCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Treinos Personalizados</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Baseado no seu perfil e alimentação</Text>
        </View>

        {/* User Profile Summary */}
        {userProfile && healthMetrics && (
          <BlurCard style={styles.profileSummary}>
            <View style={styles.profileHeader}>
              <User size={20} color={colors.primary} />
              <Text style={[styles.profileTitle, { color: colors.text }]}>Seu Perfil</Text>
            </View>
            <View style={styles.profileStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{healthMetrics.bmi}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>IMC</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{userProfile.activityLevel}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Atividade</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {userProfile.goal === 'lose' ? 'Perder' : userProfile.goal === 'gain' ? 'Ganhar' : 'Manter'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Objetivo</Text>
              </View>
            </View>
          </BlurCard>
        )}

        {/* Category Selector */}
        <View style={styles.categorySelector}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === category.id 
                    ? category.color + '20' 
                    : 'transparent',
                  borderColor: selectedCategory === category.id 
                    ? category.color 
                    : colors.border,
                }
              ]}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}
            >
              {category.icon}
              <Text style={[
                styles.categoryText,
                {
                  color: selectedCategory === category.id 
                    ? category.color 
                    : colors.textSecondary
                }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Gerando recomendações personalizadas...
            </Text>
          </View>
        )}

        {/* Nearby Gyms (only show when Ginásio category is selected) */}
        {selectedCategory === 'ginasio' && locationPermissionGranted && (
          <View style={styles.gymsContainer}>
            <View style={styles.gymsSectionHeader}>
              <Building size={24} color={colors.success} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Ginásios Próximos
              </Text>
            </View>
            
            {isLoadingGyms ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.success} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Procurando ginásios próximos...
                </Text>
              </View>
            ) : nearbyGyms.length > 0 ? (
              <View style={styles.gymsGrid}>
                {nearbyGyms.map(renderGymCard)}
              </View>
            ) : (
              <BlurCard style={styles.emptyState}>
                <Building size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum ginásio encontrado</Text>
                <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                  Não foi possível encontrar ginásios próximos da sua localização.
                </Text>
              </BlurCard>
            )}
          </View>
        )}

        {/* Location Permission Request */}
        {selectedCategory === 'ginasio' && !locationPermissionGranted && (
          <BlurCard style={styles.locationPermissionCard}>
            <MapPin size={48} color={colors.warning} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Localização Necessária</Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Para mostrar ginásios próximos, precisamos aceder à sua localização.
            </Text>
            <TouchableOpacity
              style={[styles.permissionButton, { backgroundColor: colors.primary }]}
              onPress={getUserLocation}
              activeOpacity={0.7}
            >
              <Text style={[styles.permissionButtonText, { color: 'white' }]}>
                Permitir Localização
              </Text>
            </TouchableOpacity>
          </BlurCard>
        )}

        {/* Workout Recommendations */}
        {!isLoading && filteredWorkouts.length > 0 && (
          <View style={styles.workoutsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recomendações para {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            </Text>
            {filteredWorkouts.map(renderWorkoutCard)}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && filteredWorkouts.length === 0 && (
          <BlurCard style={styles.emptyState}>
            <Heart size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum treino encontrado</Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              {!userProfile ? 
                'Complete seu perfil para receber recomendações personalizadas' :
                !userProfile.name ? 'Adicione seu nome no perfil' :
                !userProfile.age || userProfile.age === 0 ? 'Adicione sua idade no perfil' :
                !userProfile.weight || userProfile.weight === 0 ? 'Adicione seu peso no perfil' :
                !userProfile.height || userProfile.height === 0 ? 'Adicione sua altura no perfil' :
                !userProfile.gender ? 'Selecione seu sexo no perfil' :
                !userProfile.activityLevel ? 'Selecione seu nível de atividade no perfil' :
                !userProfile.goal ? 'Defina seu objetivo no perfil' :
                'Gerando recomendações personalizadas...'}
            </Text>
          </BlurCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  profileSummary: {
    marginBottom: 24,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  categorySelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  workoutsContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  workoutCard: {
    padding: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  workoutDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
  },
  expandedContent: {
    marginTop: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  gymsContainer: {
    marginBottom: 24,
  },
  gymsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  gymsGrid: {
    gap: 16,
  },
  gymCard: {
    padding: 16,
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gymTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 8,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gymMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceLevel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  gymDetails: {
    marginBottom: 16,
    gap: 8,
  },
  gymDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gymAddress: {
    fontSize: 14,
    flex: 1,
  },
  gymDistance: {
    fontSize: 14,
    fontWeight: '600',
  },
  gymActions: {
    flexDirection: 'row',
    gap: 8,
  },
  gymActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  gymActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationPermissionCard: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});