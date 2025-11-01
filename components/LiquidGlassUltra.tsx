import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Animated,
  PanResponder,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Accelerometer,
  AccelerometerMeasurement,
} from 'expo-sensors';



interface LiquidGlassUltraProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  cornerRadius?: number;
  intensity?: number;
}

export const LiquidGlassUltra: React.FC<LiquidGlassUltraProps> = ({
  title,
  onPress,
  icon,
  disabled = false,
  style,
  cornerRadius = 18,
  intensity = 35,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const parallaxX = useRef(new Animated.Value(0)).current;
  const parallaxY = useRef(new Animated.Value(0)).current;
  const spotX = useRef(new Animated.Value(0)).current;
  const spotY = useRef(new Animated.Value(0)).current;
  const spotOpacity = useRef(new Animated.Value(0)).current;
  const grainAnim = useRef(new Animated.Value(0)).current;
  
  const [isPressed, setIsPressed] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      
      onPanResponderGrant: (evt) => {
        setIsPressed(true);
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 0.97,
            friction: 7,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(spotOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();

        const touchX = evt.nativeEvent.locationX;
        const touchY = evt.nativeEvent.locationY;
        spotX.setValue(touchX);
        spotY.setValue(touchY);
      },

      onPanResponderMove: (evt) => {
        const touchX = evt.nativeEvent.locationX;
        const touchY = evt.nativeEvent.locationY;
        
        Animated.parallel([
          Animated.spring(spotX, {
            toValue: touchX,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.spring(spotY, {
            toValue: touchY,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }),
        ]).start();
      },

      onPanResponderRelease: () => {
        setIsPressed(false);
        
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(spotOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();

        if (!disabled) {
          onPress();
        }
      },

      onPanResponderTerminate: () => {
        setIsPressed(false);
        
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 7,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.timing(spotOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    if (Platform.OS !== 'web') {
      Accelerometer.setUpdateInterval(60);
      
      subscription = Accelerometer.addListener((data: AccelerometerMeasurement) => {
        const { x, y } = data;
        const tiltX = Math.max(-1, Math.min(1, x));
        const tiltY = Math.max(-1, Math.min(1, y));

        Animated.parallel([
          Animated.spring(parallaxX, {
            toValue: tiltX * 12,
            friction: 10,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(parallaxY, {
            toValue: -tiltY * 12,
            friction: 10,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }

    const grainAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(grainAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(grainAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    grainAnimation.start();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      grainAnimation.stop();
    };
  }, [parallaxX, parallaxY, grainAnim]);



  const grainOpacity = grainAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.02, 0.04, 0.02],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { translateX: parallaxX },
            { translateY: parallaxY },
          ],
          borderRadius: cornerRadius,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.buttonWrapper, { borderRadius: cornerRadius }]}>
        <BlurView
          intensity={intensity}
          tint="dark"
          style={[styles.blurContainer, { borderRadius: cornerRadius }]}
        >
          <View
            style={[
              styles.border,
              {
                borderRadius: cornerRadius,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.14)',
              },
            ]}
          />

          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.08)',
              'rgba(255, 255, 255, 0)',
              'rgba(255, 255, 255, 0.04)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.reflectionGradient, { borderRadius: cornerRadius }]}
          />

          <Animated.View
            style={[
              styles.specularSpot,
              {
                opacity: spotOpacity,
                transform: [
                  { translateX: Animated.subtract(spotX, new Animated.Value(150)) },
                  { translateY: Animated.subtract(spotY, new Animated.Value(150)) },
                ],
              },
            ]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.25)',
                'rgba(255, 255, 255, 0.1)',
                'rgba(255, 255, 255, 0)',
              ]}
              style={styles.specularGradient}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.grain,
              {
                opacity: grainOpacity,
                borderRadius: cornerRadius,
              },
            ]}
            pointerEvents="none"
          />

          <View style={styles.contentContainer}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={styles.title}
              numberOfLines={1}
              accessible={true}
              accessibilityLabel={title}
            >
              {title}
            </Text>
          </View>
        </BlurView>
      </View>

      <View
        style={[
          styles.shadow,
          {
            borderRadius: cornerRadius,
          },
        ]}
        pointerEvents="none"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    minHeight: 50,
    minWidth: 44,
  },
  buttonWrapper: {
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  reflectionGradient: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  specularSpot: {
    position: 'absolute',
    width: 300,
    height: 300,
    top: 0,
    left: 0,
  },
  specularGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    minHeight: 50,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.3,
    textAlign: 'center' as const,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  shadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
});
