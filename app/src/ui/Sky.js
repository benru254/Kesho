// The living sky at the top of Today.
// - The colors follow the real time of day (dawn, day, dusk, night).
// - The sun rises as you complete today's things (progress 0 → 1).
// - When the day is closed, night falls and one star shows for every day you have shown up.

import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, sky } from '../core/theme';
import { skyPhase, sunHeight, starField } from './sky.calc';

const HEIGHT = 230;
const SUN = 64;
const LOW = 34;   // sun bottom when progress = 0 (peeking over the hill)
const HIGH = 128; // sun bottom when progress = 1

export default function Sky({ hour, progress, closed, stars = 0, children }) {
  const phase = closed ? 'night' : skyPhase(hour);
  const isNight = phase === 'night';
  const rise = useRef(new Animated.Value(sunHeight(progress))).current;
  const glow = useRef(new Animated.Value(0)).current;

  // Sun glides to its new height whenever progress changes.
  useEffect(() => {
    Animated.timing(rise, {
      toValue: sunHeight(progress),
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, rise]);

  // Slow breathing glow — the app is alive even when you do nothing.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [0, -(HIGH - LOW)] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.95] });

  return (
    <View style={styles.wrap}>
      <LinearGradient colors={sky[phase]} style={StyleSheet.absoluteFill} />

      {isNight && starField(stars).map((st, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              left: `${Math.round(st.x * 96) + 2}%`,
              top: Math.round(st.y * HEIGHT),
              width: st.size,
              height: st.size,
              opacity: st.bright ? 1 : 0.6,
            },
          ]}
        />
      ))}

      <Animated.View style={[styles.orbWrap, { transform: [{ translateY }] }]}>
        <Animated.View
          style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
        />
        <View style={[styles.orb, { backgroundColor: isNight ? sky.moon : sky.sun }]} />
      </Animated.View>

      {/* The hill the sun rises from */}
      <View style={styles.hill} />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: HEIGHT, overflow: 'hidden', backgroundColor: colors.bg },
  star: { position: 'absolute', borderRadius: 2, backgroundColor: sky.star },
  orbWrap: {
    position: 'absolute',
    right: 36,
    bottom: LOW,
    width: SUN,
    height: SUN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: SUN * 1.9,
    height: SUN * 1.9,
    borderRadius: SUN,
    backgroundColor: sky.sunGlow,
  },
  orb: { width: SUN, height: SUN, borderRadius: SUN / 2 },
  hill: {
    position: 'absolute',
    left: -60,
    right: -60,
    bottom: -150,
    height: 200,
    borderRadius: 300,
    backgroundColor: colors.bg,
  },
  content: { ...StyleSheet.absoluteFillObject, padding: 20, paddingRight: 120 },
});
