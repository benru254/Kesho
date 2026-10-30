// The week's money: in, out (needs / wants / fees), put aside.

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import StatLine from './StatLine';
import { colors, space } from '../../../core/theme';
import { kes } from '../../../core/format';

export default function MoneyWeekCard({ cur, diff }) {
  const share = cur.out > 0 ? Math.round((cur.wants / cur.out) * 100) : null;
  return (
    <Card title="Money this week" subtitle="Personal only — shop till money is not here">
      <StatLine label="Money in" value={kes(cur.moneyIn)} delta={diff.moneyIn} />
      <StatLine label="Needs" value={kes(cur.needs)} />
      <StatLine label="Wants" value={kes(cur.wants)} delta={diff.wants} better="down" />
      <StatLine label="M-Pesa fees" value={kes(cur.fees)} better="down" />
      <StatLine label="Put aside" value={kes(cur.aside)} />
      {share != null && share >= 30 && (
        <Text style={styles.warn}>Wants were {share}% of spending. Under 20% is where savings start.</Text>
      )}
      {cur.moneyIn > 0 && cur.aside <= 0 && (
        <Text style={styles.warn}>Money came in but nothing was put aside. Pay yourself first.</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  warn: { color: colors.warn, backgroundColor: 'transparent', fontSize: 13, marginTop: space.sm, lineHeight: 19 },
});
