// Shared card container with optional title/subtitle. done = green border + ✓.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, space, radius } from '../core/theme';

export default function Card({ title, subtitle, done, children }) {
  return (
    <View style={[styles.card, done && styles.cardDone]}>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>
            {done ? '✓ ' : ''}
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  cardDone: { borderColor: colors.good },
  header: { marginBottom: space.md },
  title: { color: colors.text, backgroundColor: 'transparent', fontSize: 17, fontWeight: '700' },
  subtitle: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginTop: 2 },
});
