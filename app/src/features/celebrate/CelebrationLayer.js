// Draws celebrations for the whole app (see core/celebrate.js).
// small → a toast that slides in from the top + light confetti. Never blocks touches.
// big   → a full-screen moment for milestones, with a button to continue.
// Celebrations queue up, so two wins in a row are both seen.

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import Button from '../../ui/Button';
import Confetti from './Confetti';
import { on } from '../../core/bus';
import { colors, space, radius, font } from '../../core/theme';

const TOAST_MS = 2600;

export default function CelebrationLayer() {
  const [queue, setQueue] = useState([]);
  const slide = useRef(new Animated.Value(0)).current;
  const current = queue[0] || null;

  useEffect(() => on('celebrate', (c) => setQueue((q) => [...q, { ...c, id: Date.now() + Math.random() }])), []);

  const next = () => setQueue((q) => q.slice(1));

  // Small toasts leave on their own.
  useEffect(() => {
    if (!current || current.level === 'big') return undefined;
    slide.setValue(0);
    Animated.spring(slide, { toValue: 1, useNativeDriver: true, bounciness: 10 }).start();
    const t = setTimeout(() => {
      Animated.timing(slide, { toValue: 0, duration: 250, useNativeDriver: true }).start(next);
    }, TOAST_MS);
    return () => clearTimeout(t);
  }, [current, slide]);

  if (!current) return null;

  if (current.level === 'big') {
    return (
      <Modal transparent animationType="fade" visible onRequestClose={next}>
        <View style={styles.backdrop}>
          <Confetti key={current.id} count={48} duration={3200} />
          <View style={styles.bigCard}>
            <Text style={styles.bigEmoji}>{current.emoji}</Text>
            <Text style={styles.bigTitle}>{current.title}</Text>
            {current.text ? <Text style={styles.bigText}>{current.text}</Text> : null}
            <Button label="Keep going" onPress={next} style={styles.bigBtn} />
          </View>
        </View>
      </Modal>
    );
  }

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [-120, 0] });
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Confetti key={current.id} count={16} duration={2000} />
      <Animated.View style={[styles.toast, { opacity: slide, transform: [{ translateY }] }]}>
        <Text style={styles.toastEmoji}>{current.emoji}</Text>
        <View style={styles.flex}>
          <Text style={styles.toastTitle}>{current.title}</Text>
          {current.text ? <Text style={styles.toastText}>{current.text}</Text> : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  toast: {
    position: 'absolute',
    top: 54,
    left: space.lg,
    right: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.card,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    elevation: 8,
  },
  toastEmoji: { fontSize: 26, color: colors.text, backgroundColor: 'transparent' },
  toastTitle: { color: colors.text, backgroundColor: 'transparent', fontSize: font.md, fontWeight: '800' },
  toastText: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.sm, marginTop: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(5, 9, 21, 0.92)', alignItems: 'center', justifyContent: 'center', padding: space.xl },
  bigCard: { alignItems: 'center', width: '100%' },
  bigEmoji: { fontSize: 72, color: colors.text, backgroundColor: 'transparent', marginBottom: space.lg },
  bigTitle: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.xxl, fontWeight: '900', textAlign: 'center' },
  bigText: { color: colors.text, backgroundColor: 'transparent', fontSize: font.lg, textAlign: 'center', marginTop: space.md, lineHeight: 25 },
  bigBtn: { marginTop: space.xl, alignSelf: 'stretch' },
});
