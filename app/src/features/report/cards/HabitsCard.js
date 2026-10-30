// Showing up + body: check-ins, "never miss twice", sleep, movement.

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import StatLine from './StatLine';
import { colors, space } from '../../../core/theme';

export default function HabitsCard({ cur, diff }) {
  const n = cur.daysCounted;
  return (
    <Card title="Showing up & body">
      <StatLine label="Days you showed up" value={`${cur.showedUp} of ${n}`} delta={diff.showedUp} />
      <StatLine label="Morning / night check-ins" value={`${cur.morning} / ${cur.night}`} />
      <StatLine label="Average sleep" value={cur.sleepAvg != null ? `${cur.sleepAvg} h` : '–'} delta={diff.sleepAvg} unit="h" />
      <StatLine label="Nights under 6 hours" value={`${cur.sleepShort}`} better="down" />
      <StatLine label="Days you moved" value={`${cur.moved} of ${n}`} delta={diff.moved} />
      {cur.missedTwice > 0 ? (
        <Text style={styles.warn}>Missed 2+ days in a row {cur.missedTwice}×. The rule is: never miss twice.</Text>
      ) : n >= 2 ? (
        <Text style={styles.good}>Never missed twice this week. ✓</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  warn: { color: colors.warn, backgroundColor: 'transparent', fontSize: 13, marginTop: space.sm },
  good: { color: colors.good, backgroundColor: 'transparent', fontSize: 13, marginTop: space.sm },
});
