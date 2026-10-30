// Your pots + the money ladder from your notebook (10 → 1B).

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import ProgressBar from '../../../ui/ProgressBar';
import { colors, space, radius } from '../../../core/theme';
import { kes, kesShort } from '../../../core/format';
import { ladderLevel, MONEY_LADDER } from '../money.goal';

export default function PotsCard({ pots, onWithdraw }) {
  const { totalSaved, emergencyTarget } = pots;
  const level = ladderLevel(totalSaved);
  const em = pots.pots.find((p) => p.key === 'emergency');
  const emFull = em && em.balance >= emergencyTarget;

  return (
    <Card title="Saved" subtitle="Money you moved away from spending">
      <Text style={styles.total}>{kes(totalSaved)}</Text>

      <View style={styles.ladder}>
        {MONEY_LADDER.map((rung) => {
          const reached = totalSaved >= rung;
          const isNext = rung === level.next;
          return (
            <View key={rung} style={[styles.rung, reached && styles.rungOn, isNext && styles.rungNext]}>
              <Text style={[styles.rungText, reached && styles.rungTextOn]}>{kesShort(rung)}</Text>
            </View>
          );
        })}
      </View>
      {level.next && (
        <Text style={styles.small}>
          Next level: {kes(level.next)} — {kes(level.next - totalSaved)} to go
        </Text>
      )}

      {pots.pots.map((p) => {
        const isEm = p.key === 'emergency';
        const isInvest = p.key === 'invest';
        return (
          <View key={p.id} style={styles.pot}>
            <View style={styles.row}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.amount}>{kes(p.balance)}</Text>
            </View>
            {isEm && (
              <>
                <ProgressBar
                  percent={emergencyTarget > 0 ? (p.balance / emergencyTarget) * 100 : 0}
                  color={emFull ? colors.good : colors.accent}
                  height={6}
                />
                <Text style={styles.small}>
                  {emFull
                    ? 'Full: 1 month of needs covered. Now Invest unlocks.'
                    : `Target: 1 month of needs (${kes(emergencyTarget)})`}
                </Text>
              </>
            )}
            {isInvest && !emFull && (
              <Text style={styles.small}>Fill the emergency fund first.</Text>
            )}
          </View>
        );
      })}

      {totalSaved > 0 && (
        <Button label="Take money out of a pot" variant="ghost" onPress={onWithdraw} style={styles.mt} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  total: { color: colors.accent, backgroundColor: 'transparent', fontSize: 26, fontWeight: '800', marginBottom: space.sm },
  ladder: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: space.xs },
  rung: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rungOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  rungNext: { borderColor: colors.accent },
  rungText: { color: colors.muted, backgroundColor: 'transparent', fontSize: 11, fontWeight: '700' },
  rungTextOn: { color: colors.accentText },
  pot: { marginTop: space.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.xs },
  name: { color: colors.text, backgroundColor: 'transparent', fontSize: 15 },
  amount: { color: colors.text, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700' },
  small: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, marginTop: 2 },
  mt: { marginTop: space.md },
});
