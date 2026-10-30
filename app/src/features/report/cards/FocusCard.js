// ONE thing to work on next week. Not ten.

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import { colors } from '../../../core/theme';

export default function FocusCard({ focus }) {
  return (
    <Card title="🎯 Next week, focus on one thing">
      <Text style={styles.focus}>{focus}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  focus: { color: colors.accent, backgroundColor: 'transparent', fontSize: 16, fontWeight: '700', lineHeight: 23 },
});
