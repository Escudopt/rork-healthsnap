import React, { useEffect, useRef } from 'react';
import { Animated, TextStyle } from 'react-native';

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle;
  duration?: number;
}

export function AnimatedNumber({ value, style, duration = 800 }: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const previousValue = useRef(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
    
    previousValue.current = value;
  }, [value]);

  return (
    <Animated.Text style={style}>
      {animatedValue.interpolate({
        inputRange: [0, value || 1],
        outputRange: [previousValue.current.toString(), value.toString()],
      }).interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }).addListener((v) => {
        // Force re-render with integer value
      }) as any}
      {Math.round(value)}
    </Animated.Text>
  );
}