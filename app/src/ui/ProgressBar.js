// Shared progress bar. percent 0–100, any theme color.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../core/theme';

// percent: 0–100. color: any theme color.
export default function ProgressBar({ percent, color = colors.accent, height = 10 }) {
  const p = Math.max(0, Math.min(100, percent || 0));
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${p}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.cardAlt, borderRadius: radius.sm, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.sm },
});
