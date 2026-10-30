// Shared button. variant 'primary' = gold, 'ghost' = outline. Colors come from core/theme.js.

import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, space, radius } from '../core/theme';

// variant: 'primary' (gold) | 'ghost' (outline)
export default function Button({ label, onPress, disabled, variant = 'primary', style }) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, isPrimary ? styles.primaryText : styles.ghostText]}>{label}</Text>
    </Pressable>
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
  pressed: { opacity: 0.75 },
  label: { fontSize: 15, fontWeight: '700' },
  primaryText: { color: colors.accentText, backgroundColor: 'transparent' },
  ghostText: { color: colors.text, backgroundColor: 'transparent' },
});
