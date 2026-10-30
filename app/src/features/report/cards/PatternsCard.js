// What tends to happen together in your last 28 days. Honest: patterns, not proof.

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import { colors, space } from '../../../core/theme';

const TONE = { good: colors.good, warn: colors.warn, info: colors.text };

export default function PatternsCard({ patterns }) {
  return (
    <Card title="🔍 Your patterns" subtitle="Last 28 days · things that tend to go together (not proof)">
      {patterns.needMore ? (
        <Text style={styles.muted}>
          No clear pattern yet. Patterns appear after about 3 weeks of check-ins
          ({patterns.loggedDays} day{patterns.loggedDays === 1 ? '' : 's'} logged so far). Keep going.
        </Text>
      ) : (
        patterns.found.map((p) => (
          <Text key={p.key} style={[styles.item, { color: TONE[p.tone] || colors.text }]}>• {p.text}</Text>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, lineHeight: 20 },
  item: { backgroundColor: 'transparent', fontSize: 14, lineHeight: 21, marginBottom: space.sm },
});
