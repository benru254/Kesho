// Shared button. variant 'primary' = gold, 'ghost' = outline. Colors come from core/theme.js.
// Shrinks slightly and ticks when pressed (see Tappable).

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Tappable from './Tappable';
import { colors, space, radius } from '../core/theme';

export default function Button({ label, onPress, disabled, variant = 'primary', style }) {
  const isPrimary = variant === 'primary';
  return (
    <Tappable
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, isPrimary ? styles.primary : styles.ghost, disabled && styles.disabled, style]}
    >
      <Text style={[styles.label, isPrimary ? styles.primaryText : styles.ghostText]}>{label}</Text>
    </Tappable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primary: { backgroundColor: colors.accent },
  ghost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.4 },
  label: { fontSize: 15, fontWeight: '700' },
  primaryText: { color: colors.accentText, backgroundColor: 'transparent' },
  ghostText: { color: colors.text, backgroundColor: 'transparent' },
});
