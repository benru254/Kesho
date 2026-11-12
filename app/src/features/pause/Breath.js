// A slow breathing circle: 4 seconds in, 6 seconds out. Long out-breaths calm the body.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, font } from '../../core/theme';

const IN_MS = 4000;
const OUT_MS = 6000;

export default function Breath({ seconds, onDone }) {
  const size = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState('in');
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(size, { toValue: 1, duration: IN_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(size, { toValue: 0, duration: OUT_MS, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();

    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      setPhase(elapsed % (IN_MS + OUT_MS) < IN_MS ? 'in' : 'out');
      const remaining = Math.max(0, seconds - Math.floor(elapsed / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        onDone();
      }
    }, 250);

    return () => {
      loop.stop();
      clearInterval(timer);
    };
  }, [size, seconds, onDone]);

  const scale = size.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
      <Text style={styles.phase}>{phase === 'in' ? 'Breathe in…' : 'Breathe out… slowly'}</Text>
      <Text style={styles.left}>{left}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', height: 290 },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(245, 184, 65, 0.18)',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  phase: { color: colors.text, backgroundColor: 'transparent', fontSize: font.lg, fontWeight: '700', marginTop: 24 },
  left: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.sm, marginTop: 4 },
});
