// A burst of falling confetti, drawn with plain animated squares (no extra packages).

import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { confetti } from '../../core/theme';

export default function Confetti({ count = 24, duration = 2200 }) {
  const { width, height } = useWindowDimensions();
  const fall = useRef(new Animated.Value(0)).current;

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        drift: (Math.random() - 0.5) * 160,
        size: 6 + Math.random() * 6,
        delay: Math.random() * 0.25,
        spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
        color: confetti[i % confetti.length],
      })),
    [count, width]
  );

  useEffect(() => {
    fall.setValue(0);
    Animated.timing(fall, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }).start();
  }, [fall, duration]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const start = p.delay;
        const translateY = fall.interpolate({ inputRange: [0, start, 1], outputRange: [-30, -30, height + 30] });
        const translateX = fall.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] });
        const rotate = fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin}deg`] });
        const opacity = fall.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: 0,
              width: p.size,
              height: p.size * 1.6,
              borderRadius: 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
