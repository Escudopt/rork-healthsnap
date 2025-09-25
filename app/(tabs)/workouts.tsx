import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { BlurCard } from '@/components/BlurCard';
import {
  Home,
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
} from 'lucide-react-native';



interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  duration?: string;
  rest?: string;
  instructions: string[];
  targetMuscles?: string[];
  modifications?: string[];
}

interface WorkoutRecommendation {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Iniciante' | 'Intermédio' | 'Avançado';
  location: 'Casa' | 'Rua' | 'Ginásio';
  calories: string;
  exercises: Exercise[];
  equipment?: string[];
  benefits: string[];
  tips: string[];
  warmup?: string[];
  cooldown?: string[];
  progression?: string[];
  safety?: string[];
  totalSets?: number;
  restBetweenSets?: string;
}

interface WorkoutCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  workouts: WorkoutRecommendation[];
}



export default function WorkoutsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { userProfile, healthMetrics, todayCalories, dailyGoal } = useCalorieTracker();
  const [selectedCategory, setSelectedCategory] = useState<string>('casa');
  const [workoutRecommendations, setWorkoutRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);


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
        exercises: [
          {
            name: 'Burpees',
            sets: '3',
            reps: '8-12',
            rest: '30s',
            instructions: [
              'Comece em pé, pés afastados na largura dos ombros',
              'Agache e coloque as mãos no chão',
              'Salte os pés para trás numa posição de prancha',
              'Faça uma flexão (opcional)',
              'Salte os pés de volta para a posição de agachamento',
              'Salte para cima com os braços estendidos'
            ],
            targetMuscles: ['Corpo inteiro', 'Cardio'],
            modifications: ['Sem flexão para iniciantes', 'Sem salto final']
          },
          {
            name: 'Mountain Climbers',
            sets: '3',
            duration: '30s',
            rest: '15s',
            instructions: [
              'Comece numa posição de prancha',
              'Mantenha o core contraído',
              'Alterne trazendo os joelhos ao peito rapidamente',
              'Mantenha os quadris estáveis'
            ],
            targetMuscles: ['Core', 'Ombros', 'Cardio'],
            modifications: ['Ritmo mais lento', 'Mãos elevadas']
          },
          {
            name: 'Jumping Jacks',
            sets: '3',
            duration: '45s',
            rest: '15s',
            instructions: [
              'Comece em pé com pés juntos e braços ao lado',
              'Salte abrindo as pernas e levantando os braços',
              'Salte de volta à posição inicial',
              'Mantenha um ritmo constante'
            ],
            targetMuscles: ['Cardio', 'Pernas', 'Ombros'],
            modifications: ['Step touch sem salto', 'Braços apenas']
          },
          {
            name: 'Agachamentos',
            sets: '3',
            reps: '12-15',
            rest: '30s',
            instructions: [
              'Pés afastados na largura dos ombros',
              'Desça como se fosse sentar numa cadeira',
              'Mantenha o peito erguido e joelhos alinhados',
              'Desça até as coxas ficarem paralelas ao chão',
              'Suba contraindo os glúteos'
            ],
            targetMuscles: ['Glúteos', 'Quadríceps', 'Core'],
            modifications: ['Agachamento parcial', 'Com apoio na parede']
          },
          {
            name: 'Flexões',
            sets: '3',
            reps: '8-12',
            rest: '30s',
            instructions: [
              'Posição de prancha com mãos ligeiramente mais largas que os ombros',
              'Desça o corpo mantendo-o reto',
              'Toque o peito no chão',
              'Empurre de volta à posição inicial',
              'Mantenha o core contraído'
            ],
            targetMuscles: ['Peitorais', 'Tríceps', 'Ombros', 'Core'],
            modifications: ['Flexões de joelhos', 'Flexões inclinadas']
          }
        ],
        equipment: [],
        benefits: ['Queima muitas calorias', 'Melhora resistência cardiovascular', 'Fortalece músculos'],
        tips: ['Mantenha boa forma', 'Descanse 30s entre exercícios', 'Hidrate-se bem'],
        warmup: ['5 min de marcha no local', 'Rotações de braços e pernas', 'Alongamentos dinâmicos'],
        cooldown: ['5 min de caminhada lenta', 'Alongamentos estáticos', 'Respiração profunda'],
        progression: ['Aumente 1 repetição por semana', 'Reduza o tempo de descanso', 'Adicione mais séries'],
        safety: ['Pare se sentir dor', 'Mantenha boa postura', 'Aqueça sempre antes'],
        totalSets: 3,
        restBetweenSets: '60s'
      },
      {
        id: 'casa_2',
        title: 'Yoga Matinal',
        description: 'Sequência suave de yoga para começar o dia com energia e flexibilidade.',
        duration: '30 min',
        difficulty: 'Iniciante',
        location: 'Casa',
        calories: '100-150 kcal',
        exercises: [
          {
            name: 'Saudação ao Sol',
            sets: '3',
            duration: '5 min',
            instructions: [
              'Comece em pé com palmas juntas no peito',
              'Inspire e estenda os braços para cima',
              'Expire e dobre para a frente',
              'Inspire e estenda uma perna para trás',
              'Continue a sequência fluida'
            ],
            targetMuscles: ['Corpo inteiro', 'Flexibilidade'],
            modifications: ['Versão mais lenta', 'Sem dobrar completamente']
          },
          {
            name: 'Postura do Guerreiro',
            sets: '2',
            duration: '1 min cada lado',
            instructions: [
              'Passo largo com uma perna à frente',
              'Dobre o joelho da frente a 90 graus',
              'Estenda os braços para cima',
              'Mantenha o olhar para a frente',
              'Respire profundamente'
            ],
            targetMuscles: ['Pernas', 'Core', 'Equilíbrio'],
            modifications: ['Mãos na cintura', 'Apoio na parede']
          },
          {
            name: 'Postura da Árvore',
            sets: '2',
            duration: '30s cada lado',
            instructions: [
              'Equilibre-se numa perna',
              'Coloque o pé da outra perna na coxa ou panturrilha',
              'Junte as palmas no peito ou estenda para cima',
              'Fixe o olhar num ponto',
              'Respire calmamente'
            ],
            targetMuscles: ['Equilíbrio', 'Core', 'Pernas'],
            modifications: ['Pé no tornozelo', 'Apoio na parede']
          },
          {
            name: 'Prancha',
            sets: '3',
            duration: '30-60s',
            rest: '30s',
            instructions: [
              'Posição de flexão com antebraços no chão',
              'Corpo reto da cabeça aos pés',
              'Contraia o core e glúteos',
              'Respire normalmente',
              'Mantenha a posição'
            ],
            targetMuscles: ['Core', 'Ombros', 'Glúteos'],
            modifications: ['Prancha de joelhos', 'Prancha inclinada']
          },
          {
            name: 'Relaxamento',
            sets: '1',
            duration: '5 min',
            instructions: [
              'Deite-se de costas confortavelmente',
              'Feche os olhos e relaxe todos os músculos',
              'Respire profunda e lentamente',
              'Concentre-se na respiração',
              'Permita que o corpo descanse completamente'
            ],
            targetMuscles: ['Relaxamento', 'Mente'],
            modifications: ['Posição sentada', 'Com música relaxante']
          }
        ],
        equipment: ['Tapete de yoga'],
        benefits: ['Melhora flexibilidade', 'Reduz stress', 'Fortalece core'],
        tips: ['Respire profundamente', 'Não force as posturas', 'Pratique regularmente'],
        warmup: ['Respiração consciente', 'Movimentos suaves do pescoço', 'Rotações dos ombros'],
        cooldown: ['Postura da criança', 'Torção suave da coluna', 'Meditação de 2 min'],
        progression: ['Mantenha posturas por mais tempo', 'Tente variações mais avançadas', 'Adicione novas posturas'],
        safety: ['Nunca force uma postura', 'Escute seu corpo', 'Use props se necessário'],
        totalSets: 1,
        restBetweenSets: 'Transição suave'
      },
      {
        id: 'rua_1',
        title: 'Corrida Intervalada',
        description: 'Alternância entre corrida e caminhada para melhorar resistência.',
        duration: '30 min',
        difficulty: 'Intermédio',
        location: 'Rua',
        calories: '300-400 kcal',
        exercises: [
          {
            name: 'Aquecimento',
            duration: '5 min',
            instructions: [
              'Comece com caminhada lenta',
              'Aumente gradualmente o ritmo',
              'Faça rotações de braços e pernas',
              'Prepare o corpo para o exercício'
            ],
            targetMuscles: ['Aquecimento geral']
          },
          {
            name: 'Corrida Intervalada',
            sets: '8',
            duration: '2 min corrida + 1 min caminhada',
            instructions: [
              'Corra em ritmo moderado por 2 minutos',
              'Caminhe em ritmo lento por 1 minuto',
              'Repita o ciclo 8 vezes',
              'Mantenha postura ereta',
              'Respire de forma controlada'
            ],
            targetMuscles: ['Cardio', 'Pernas', 'Resistência'],
            modifications: ['Reduza para 1 min corrida', 'Aumente tempo de caminhada']
          },
          {
            name: 'Arrefecimento',
            duration: '5 min',
            instructions: [
              'Reduza gradualmente o ritmo',
              'Caminhe lentamente',
              'Faça alongamentos das pernas',
              'Respire profundamente'
            ],
            targetMuscles: ['Recuperação']
          }
        ],
        equipment: ['Ténis de corrida'],
        benefits: ['Melhora capacidade cardíaca', 'Queima gordura', 'Fortalece pernas'],
        tips: ['Use ténis adequados', 'Mantenha postura ereta', 'Hidrate-se durante'],
        warmup: ['Caminhada lenta 5 min', 'Rotações de tornozelos', 'Alongamento dinâmico das pernas'],
        cooldown: ['Caminhada lenta', 'Alongamentos estáticos', 'Hidratação'],
        progression: ['Aumente tempo de corrida', 'Reduza tempo de caminhada', 'Adicione mais intervalos'],
        safety: ['Use calçado adequado', 'Evite superfícies irregulares', 'Pare se sentir dor'],
        totalSets: 8,
        restBetweenSets: '1 min caminhada'
      },
      {
        id: 'rua_2',
        title: 'Caminhada Ativa',
        description: 'Caminhada energética com exercícios funcionais em parques.',
        duration: '45 min',
        difficulty: 'Iniciante',
        location: 'Rua',
        calories: '200-300 kcal',
        exercises: [
          {
            name: 'Caminhada Rápida',
            duration: '20 min',
            instructions: [
              'Mantenha ritmo acelerado mas confortável',
              'Balance os braços naturalmente',
              'Mantenha postura ereta',
              'Respire de forma ritmada'
            ],
            targetMuscles: ['Cardio', 'Pernas'],
            modifications: ['Reduza ritmo se necessário', 'Faça pausas curtas']
          },
          {
            name: 'Agachamentos no Banco',
            sets: '3',
            reps: '10-15',
            rest: '30s',
            instructions: [
              'Sente e levante do banco sem usar as mãos',
              'Desça controladamente',
              'Suba contraindo glúteos e pernas',
              'Mantenha peito erguido'
            ],
            targetMuscles: ['Glúteos', 'Quadríceps'],
            modifications: ['Use apoio das mãos', 'Banco mais alto']
          },
          {
            name: 'Flexões na Parede',
            sets: '3',
            reps: '10-15',
            rest: '30s',
            instructions: [
              'Fique a um braço de distância da parede',
              'Coloque palmas na parede na altura dos ombros',
              'Empurre e puxe o corpo da parede',
              'Mantenha corpo reto'
            ],
            targetMuscles: ['Peitorais', 'Tríceps', 'Ombros'],
            modifications: ['Mais próximo da parede', 'Mãos mais baixas']
          },
          {
            name: 'Alongamentos',
            duration: '10 min',
            instructions: [
              'Alongue panturrilhas, quadríceps e isquiotibiais',
              'Mantenha cada posição por 30 segundos',
              'Respire profundamente',
              'Não force o alongamento'
            ],
            targetMuscles: ['Flexibilidade'],
            modifications: ['Alongamentos mais suaves', 'Menos tempo']
          }
        ],
        equipment: [],
        benefits: ['Baixo impacto', 'Melhora humor', 'Fortalece músculos'],
        tips: ['Mantenha ritmo constante', 'Use roupa confortável', 'Escolha percursos seguros'],
        warmup: ['Caminhada lenta', 'Rotações de articulações', 'Movimentos suaves'],
        cooldown: ['Caminhada lenta', 'Alongamentos completos', 'Respiração relaxante'],
        progression: ['Aumente duração da caminhada', 'Adicione mais exercícios', 'Aumente repetições'],
        safety: ['Mantenha-se hidratado', 'Use protetor solar', 'Evite horários de pico'],
        totalSets: 1,
        restBetweenSets: 'Transição suave'
      },
      {
        id: 'ginasio_1',
        title: 'Treino de Força',
        description: 'Circuito completo de musculação para ganho de massa muscular.',
        duration: '60 min',
        difficulty: 'Avançado',
        location: 'Ginásio',
        calories: '400-500 kcal',
        exercises: [
          {
            name: 'Agachamento com Barra',
            sets: '4',
            reps: '8-12',
            rest: '90s',
            instructions: [
              'Posicione a barra nos trapézios',
              'Pés afastados na largura dos ombros',
              'Desça até coxas paralelas ao chão',
              'Suba empurrando pelos calcanhares',
              'Mantenha core contraído'
            ],
            targetMuscles: ['Quadríceps', 'Glúteos', 'Core'],
            modifications: ['Agachamento livre', 'Smith machine', 'Peso reduzido']
          },
          {
            name: 'Supino',
            sets: '4',
            reps: '8-12',
            rest: '90s',
            instructions: [
              'Deite no banco com pés firmes no chão',
              'Pegada ligeiramente mais larga que ombros',
              'Desça a barra controladamente ao peito',
              'Empurre explosivamente para cima',
              'Mantenha escápulas retraídas'
            ],
            targetMuscles: ['Peitorais', 'Tríceps', 'Ombros'],
            modifications: ['Halteres', 'Máquina', 'Inclinado']
          },
          {
            name: 'Remada Curvada',
            sets: '4',
            reps: '8-12',
            rest: '90s',
            instructions: [
              'Curve o tronco mantendo costas retas',
              'Puxe a barra em direção ao abdômen',
              'Contraia as escápulas',
              'Desça controladamente',
              'Mantenha core estável'
            ],
            targetMuscles: ['Dorsais', 'Romboides', 'Bíceps'],
            modifications: ['Halteres', 'Máquina', 'Cabo']
          },
          {
            name: 'Desenvolvimento',
            sets: '3',
            reps: '10-15',
            rest: '60s',
            instructions: [
              'Sente com costas apoiadas',
              'Empurre halteres para cima',
              'Desça controladamente',
              'Não trave completamente os cotovelos',
              'Mantenha core contraído'
            ],
            targetMuscles: ['Ombros', 'Tríceps'],
            modifications: ['Máquina', 'Barra', 'Unilateral']
          },
          {
            name: 'Deadlift',
            sets: '3',
            reps: '6-10',
            rest: '2 min',
            instructions: [
              'Pés afastados na largura dos quadris',
              'Pegada mista ou dupla',
              'Levante mantendo barra próxima ao corpo',
              'Estenda quadris e joelhos simultaneamente',
              'Mantenha costas neutras'
            ],
            targetMuscles: ['Posterior', 'Glúteos', 'Trapézio'],
            modifications: ['Trap bar', 'Sumo', 'Peso reduzido']
          },
          {
            name: 'Abdominais',
            sets: '3',
            reps: '15-20',
            rest: '45s',
            instructions: [
              'Varie entre crunch, prancha e bicicleta',
              'Contraia o core em todos os movimentos',
              'Respire corretamente',
              'Foque na qualidade, não quantidade'
            ],
            targetMuscles: ['Core', 'Abdominais'],
            modifications: ['Joelhos elevados', 'Apoio', 'Isométrico']
          }
        ],
        equipment: ['Barras', 'Halteres', 'Máquinas'],
        benefits: ['Aumenta massa muscular', 'Melhora metabolismo', 'Fortalece ossos'],
        tips: ['Aqueça bem antes', 'Use técnica correta', 'Aumente peso gradualmente'],
        warmup: ['10 min cardio leve', 'Aquecimento articular', 'Séries de aquecimento'],
        cooldown: ['5 min cardio leve', 'Alongamentos estáticos', 'Relaxamento'],
        progression: ['Aumente peso 2.5-5kg por semana', 'Adicione repetições', 'Melhore técnica'],
        safety: ['Sempre use spotter', 'Técnica antes de peso', 'Descanse adequadamente'],
        totalSets: 4,
        restBetweenSets: '90-120s'
      },
      {
        id: 'ginasio_2',
        title: 'Cardio + Funcional',
        description: 'Combinação de exercícios cardiovasculares e funcionais.',
        duration: '45 min',
        difficulty: 'Intermédio',
        location: 'Ginásio',
        calories: '350-450 kcal',
        exercises: [
          {
            name: 'Passadeira',
            duration: '10 min',
            instructions: [
              'Comece com ritmo moderado',
              'Varie a velocidade a cada 2 minutos',
              'Mantenha postura ereta',
              'Use os braços naturalmente'
            ],
            targetMuscles: ['Cardio', 'Pernas'],
            modifications: ['Inclinação variável', 'Intervalos']
          },
          {
            name: 'Kettlebell Swings',
            sets: '4',
            reps: '15-20',
            rest: '45s',
            instructions: [
              'Pés afastados, kettlebell entre as pernas',
              'Movimento explosivo dos quadris',
              'Kettlebell sobe até altura dos ombros',
              'Controle a descida',
              'Core sempre contraído'
            ],
            targetMuscles: ['Glúteos', 'Core', 'Ombros'],
            modifications: ['Peso menor', 'Halteres', 'Amplitude reduzida']
          },
          {
            name: 'Box Jumps',
            sets: '3',
            reps: '10-15',
            rest: '60s',
            instructions: [
              'Salte explosivamente para cima da caixa',
              'Aterrisse suavemente com ambos os pés',
              'Estenda completamente quadris e joelhos',
              'Desça controladamente',
              'Reset entre repetições'
            ],
            targetMuscles: ['Pernas', 'Potência', 'Cardio'],
            modifications: ['Caixa mais baixa', 'Step ups', 'Saltos no lugar']
          },
          {
            name: 'Battle Ropes',
            sets: '4',
            duration: '30s',
            rest: '30s',
            instructions: [
              'Segure uma corda em cada mão',
              'Alterne movimentos ondulatórios',
              'Mantenha core estável',
              'Varie padrões de movimento',
              'Intensidade alta'
            ],
            targetMuscles: ['Cardio', 'Core', 'Braços'],
            modifications: ['Tempo reduzido', 'Movimentos mais lentos']
          },
          {
            name: 'Bicicleta Estática',
            duration: '10 min',
            instructions: [
              'Ajuste altura do selim',
              'Varie resistência a cada 2 minutos',
              'Mantenha ritmo constante',
              'Postura ereta'
            ],
            targetMuscles: ['Cardio', 'Pernas'],
            modifications: ['Resistência menor', 'Intervalos']
          }
        ],
        equipment: ['Passadeira', 'Kettlebells', 'Box', 'Cordas'],
        benefits: ['Melhora resistência', 'Queima calorias', 'Trabalha corpo todo'],
        tips: ['Varie intensidade', 'Mantenha hidratação', 'Escute seu corpo'],
        warmup: ['5 min cardio leve', 'Mobilidade articular', 'Ativação muscular'],
        cooldown: ['5 min cardio leve', 'Alongamentos dinâmicos', 'Respiração'],
        progression: ['Aumente intensidade', 'Reduza descanso', 'Adicione exercícios'],
        safety: ['Hidrate-se regularmente', 'Técnica correta', 'Não exagere na intensidade'],
        totalSets: 1,
        restBetweenSets: 'Transição rápida'
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
    console.log('Generating workout recommendations...');
    console.log('User profile:', userProfile);
    console.log('Health metrics:', healthMetrics);
    
    // Always return default workouts as fallback, even without profile
    const defaultWorkouts = getDefaultWorkouts();
    
    if (!userProfile || !healthMetrics) {
      console.log('No user profile or health metrics, returning default workouts');
      return defaultWorkouts;
    }

    setIsLoading(true);
    try {
      const calorieDeficit = dailyGoal - todayCalories;
      const activityLevel = userProfile.activityLevel;
      const goal = userProfile.goal;
      const age = userProfile.age;
      const bmi = healthMetrics.bmi;
      
      const prompt = `
Crie 6 recomendações de treino personalizadas DETALHADAS em português baseadas no perfil:

Perfil do Usuário:
- Idade: ${age} anos
- IMC: ${bmi}
- Nível de atividade: ${activityLevel}
- Objetivo: ${goal === 'lose' ? 'Perder peso' : goal === 'gain' ? 'Ganhar peso' : 'Manter peso'}
- Déficit calórico hoje: ${calorieDeficit} kcal
- TMB: ${healthMetrics.bmr} kcal/dia
- TDEE: ${healthMetrics.tdee} kcal/dia

Crie 2 treinos para cada local (Casa, Rua, Ginásio) com informações DETALHADAS:

1. Título atrativo
2. Descrição breve (1-2 frases)
3. Duração (15-60 min)
4. Dificuldade (Iniciante/Intermédio/Avançado)
5. Calorias queimadas estimadas
6. Lista de 4-6 exercícios DETALHADOS com:
   - Nome do exercício
   - Séries (se aplicável)
   - Repetições ou duração
   - Tempo de descanso
   - Instruções passo-a-passo (4-6 passos)
   - Músculos trabalhados
   - Modificações para iniciantes/avançados
7. Equipamentos necessários
8. Benefícios principais
9. Dicas importantes
10. Aquecimento sugerido
11. Arrefecimento sugerido
12. Dicas de progressão
13. Avisos de segurança

Formato JSON (IMPORTANTE - siga exatamente esta estrutura):
{
  "workouts": [
    {
      "title": "Nome do Treino",
      "description": "Descrição",
      "duration": "30 min",
      "difficulty": "Intermédio",
      "location": "Casa",
      "calories": "250-300 kcal",
      "exercises": [
        {
          "name": "Nome do Exercício",
          "sets": "3",
          "reps": "12-15",
          "duration": "30s",
          "rest": "30s",
          "instructions": [
            "Passo 1 detalhado",
            "Passo 2 detalhado",
            "Passo 3 detalhado",
            "Passo 4 detalhado"
          ],
          "targetMuscles": ["Músculo 1", "Músculo 2"],
          "modifications": ["Modificação 1", "Modificação 2"]
        }
      ],
      "equipment": ["Equipamento 1", ...] ou [],
      "benefits": ["Benefício 1", "Benefício 2", ...],
      "tips": ["Dica 1", "Dica 2", ...],
      "warmup": ["Aquecimento 1", "Aquecimento 2", ...],
      "cooldown": ["Arrefecimento 1", "Arrefecimento 2", ...],
      "progression": ["Progressão 1", "Progressão 2", ...],
      "safety": ["Segurança 1", "Segurança 2", ...],
      "totalSets": 3,
      "restBetweenSets": "60s"
    }
  ]
}

Personalize baseado no objetivo e condição física:
- Para perda de peso: foque em cardio, HIIT, exercícios compostos
- Para ganho: foque em força, hipertrofia, exercícios com resistência
- Para manutenção: combine cardio e força

Seja muito detalhado nas instruções e certifique-se de que cada exercício tem informações completas.`;

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
    console.log('AI generation failed, returning default workouts');
    return defaultWorkouts;
  }, [userProfile, healthMetrics, todayCalories, dailyGoal, getDefaultWorkouts]);



  // Load workout recommendations on component mount
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        console.log('Loading workout recommendations...');
        const recommendations = await generateWorkoutRecommendations();
        console.log('Loaded recommendations:', recommendations.length);
        setWorkoutRecommendations(recommendations);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        // Fallback to default workouts
        const defaultWorkouts = getDefaultWorkouts();
        console.log('Using default workouts:', defaultWorkouts.length);
        setWorkoutRecommendations(defaultWorkouts);
      }
    };
    
    loadRecommendations();
  }, [generateWorkoutRecommendations, getDefaultWorkouts]);



  // Filter workouts by selected category
  const filteredWorkouts = useMemo(() => {
    console.log('Filtering workouts:', {
      total: workoutRecommendations.length,
      selectedCategory,
      workouts: workoutRecommendations.map(w => ({ id: w.id, location: w.location }))
    });
    
    const filtered = workoutRecommendations.filter(workout => 
      workout.location.toLowerCase() === selectedCategory.toLowerCase()
    );
    
    console.log('Filtered workouts:', filtered.length);
    return filtered;
  }, [workoutRecommendations, selectedCategory]);

  // Workout categories
  const categories: WorkoutCategory[] = [
    {
      id: 'casa',
      name: 'Casa',
      icon: <Home size={24} color={colors.primary} />,
      color: colors.primary,
      workouts: workoutRecommendations.filter(w => w.location === 'Casa')
    },
    {
      id: 'rua',
      name: 'Rua',
      icon: <Activity size={24} color={colors.warning} />,
      color: colors.warning,
      workouts: workoutRecommendations.filter(w => w.location === 'Rua')
    },
    {
      id: 'ginasio',
      name: 'Ginásio',
      icon: <Building size={24} color={colors.success} />,
      color: colors.success,
      workouts: workoutRecommendations.filter(w => w.location === 'Ginásio')
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
                <View key={`exercise-${workout.id}-${index}`} style={styles.exerciseItem}>
                  <View style={styles.exerciseHeader}>
                    <Text style={[styles.exerciseName, { color: colors.text }]}>
                      {exercise.name}
                    </Text>
                    <View style={styles.exerciseMeta}>
                      {exercise.sets && (
                        <Text style={[styles.exerciseMetaText, { color: colors.textSecondary }]}>
                          {exercise.sets} séries
                        </Text>
                      )}
                      {exercise.reps && (
                        <Text style={[styles.exerciseMetaText, { color: colors.textSecondary }]}>
                          {exercise.reps} reps
                        </Text>
                      )}
                      {exercise.duration && (
                        <Text style={[styles.exerciseMetaText, { color: colors.textSecondary }]}>
                          {exercise.duration}
                        </Text>
                      )}
                      {exercise.rest && (
                        <Text style={[styles.exerciseMetaText, { color: colors.textSecondary }]}>
                          {exercise.rest} descanso
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {/* Instructions */}
                  <View style={styles.instructionsContainer}>
                    <Text style={[styles.instructionsTitle, { color: colors.text }]}>Instruções:</Text>
                    {exercise.instructions.map((instruction, instrIndex) => (
                      <Text key={`instruction-${index}-${instrIndex}`} style={[styles.instructionText, { color: colors.textSecondary }]}>
                        {instrIndex + 1}. {instruction}
                      </Text>
                    ))}
                  </View>
                  
                  {/* Target Muscles */}
                  {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                    <View style={styles.targetMusclesContainer}>
                      <Text style={[styles.targetMusclesTitle, { color: colors.text }]}>Músculos:</Text>
                      <View style={styles.muscleTagsContainer}>
                        {exercise.targetMuscles.map((muscle, muscleIndex) => (
                          <View key={`muscle-${index}-${muscleIndex}`} style={[styles.muscleTag, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[styles.muscleTagText, { color: colors.primary }]}>{muscle}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  
                  {/* Modifications */}
                  {exercise.modifications && exercise.modifications.length > 0 && (
                    <View style={styles.modificationsContainer}>
                      <Text style={[styles.modificationsTitle, { color: colors.text }]}>Modificações:</Text>
                      {exercise.modifications.map((modification, modIndex) => (
                        <Text key={`modification-${index}-${modIndex}`} style={[styles.modificationText, { color: colors.textSecondary }]}>
                          • {modification}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
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
            
            {/* Warmup */}
            {workout.warmup && workout.warmup.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Activity size={18} color={colors.warning} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Aquecimento</Text>
                </View>
                {workout.warmup.map((warmupItem, index) => (
                  <Text key={`warmup-${workout.id}-${index}`} style={[styles.listItem, { color: colors.textSecondary }]}>
                    • {warmupItem}
                  </Text>
                ))}
              </View>
            )}
            
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
            
            {/* Cooldown */}
            {workout.cooldown && workout.cooldown.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Heart size={18} color={colors.success} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Arrefecimento</Text>
                </View>
                {workout.cooldown.map((cooldownItem, index) => (
                  <Text key={`cooldown-${workout.id}-${index}`} style={[styles.listItem, { color: colors.textSecondary }]}>
                    • {cooldownItem}
                  </Text>
                ))}
              </View>
            )}
            
            {/* Progression */}
            {workout.progression && workout.progression.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <TrendingUp size={18} color={colors.success} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Progressão</Text>
                </View>
                {workout.progression.map((progressionItem, index) => (
                  <Text key={`progression-${workout.id}-${index}`} style={[styles.listItem, { color: colors.textSecondary }]}>
                    • {progressionItem}
                  </Text>
                ))}
              </View>
            )}
            
            {/* Safety */}
            {workout.safety && workout.safety.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Heart size={18} color={colors.error || '#F44336'} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Segurança</Text>
                </View>
                {workout.safety.map((safetyItem, index) => (
                  <Text key={`safety-${workout.id}-${index}`} style={[styles.listItem, { color: colors.textSecondary }]}>
                    • {safetyItem}
                  </Text>
                ))}
              </View>
            )}
            
            {/* Workout Summary */}
            {(workout.totalSets || workout.restBetweenSets) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Clock size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumo do Treino</Text>
                </View>
                {workout.totalSets && (
                  <Text style={[styles.listItem, { color: colors.textSecondary }]}>
                    • Total de séries: {workout.totalSets}
                  </Text>
                )}
                {workout.restBetweenSets && (
                  <Text style={[styles.listItem, { color: colors.textSecondary }]}>
                    • Descanso entre séries: {workout.restBetweenSets}
                  </Text>
                )}
              </View>
            )}
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



        {/* Workout Recommendations */}
        {!isLoading && (
          <View style={styles.workoutsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Treinos para {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
            </Text>
            {filteredWorkouts.length > 0 ? (
              filteredWorkouts.map(renderWorkoutCard)
            ) : (
              <BlurCard style={styles.emptyState}>
                <Dumbbell size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Carregando treinos...</Text>
                <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                  Preparando treinos personalizados para {selectedCategory}
                </Text>
              </BlurCard>
            )}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && workoutRecommendations.length === 0 && (
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
  
  // Exercise detail styles
  exerciseItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  exerciseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  exerciseMetaText: {
    fontSize: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  instructionsContainer: {
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
    paddingLeft: 8,
  },
  targetMusclesContainer: {
    marginBottom: 12,
  },
  targetMusclesTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  muscleTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  muscleTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modificationsContainer: {
    marginTop: 8,
  },
  modificationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  modificationText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
    paddingLeft: 8,
  },

});