// The 24-hour wait list. Park a want instead of buying it now; decide tomorrow with a clear head.

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import { colors, space, radius, font } from '../../../core/theme';
import { kes, parseAmount } from '../../../core/format';
import { celebrate } from '../../../core/celebrate';
import { waitState } from '../wish/wish.calc';
import { addWish, dropWish, buyWish } from '../wish/wish.service';

export default function WishCard({ wishes, kept, onChanged }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const park = async () => {
    try {
      await addWish(title, parseAmount(amount));
      setTitle('');
      setAmount('');
      celebrate({ emoji: '⏳', title: 'Parked for 24 hours.', text: 'If you still want it tomorrow, buy it on purpose.' });
      onChanged();
    } catch (e) {
      Alert.alert('Not saved', String(e.message || e));
    }
  };

  const drop = async (w) => {
    await dropWish(w.id);
    celebrate({
      emoji: '🧘',
      title: w.amount > 0 ? `${kes(w.amount)} stays yours.` : 'Let go.',
      text: 'The want passed. The money didn’t.',
    });
    onChanged();
  };

  const buy = (w) => {
    Alert.alert('Buy it on purpose?', w.amount > 0 ? `${w.title} · ${kes(w.amount)} will be recorded under Wants.` : w.title, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, I still want it', onPress: async () => { await buyWish(w.id); onChanged(); } },
    ]);
  };

  return (
    <Card
      title="⏳ Wait list"
      subtitle={kept.count > 0
        ? `Kept by waiting: ${kes(kept.total)} (${kept.count} want${kept.count === 1 ? '' : 's'} let go)`
        : 'Want something? Park it for 24 hours before buying.'}
    >
      {wishes.map((w) => {
        const st = waitState(w.unlock_at);
        return (
          <View key={w.id} style={styles.item}>
            <View style={styles.row}>
              <Text style={styles.title} numberOfLines={1}>{w.title}</Text>
              {w.amount > 0 && <Text style={styles.amount}>{kes(w.amount)}</Text>}
            </View>
            {st.ready ? (
              <>
                <Text style={styles.ready}>24 hours passed. Do you still want it?</Text>
                <View style={styles.btnRow}>
                  <Button label="Let it go" onPress={() => drop(w)} style={styles.flex} />
                  <Button label="Buy it" variant="ghost" onPress={() => buy(w)} style={styles.flex} />
                </View>
              </>
            ) : (
              <View style={styles.row}>
                <Text style={styles.waiting}>Decide in {st.hoursLeft} h</Text>
                <Button label="Let it go now" variant="ghost" onPress={() => drop(w)} style={styles.small} />
              </View>
            )}
          </View>
        );
      })}

      <View style={styles.addRow}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="What do you want to buy?"
          placeholderTextColor={colors.placeholder}
          style={[styles.input, styles.flex2]}
          maxLength={60}
        />
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="KES"
          placeholderTextColor={colors.placeholder}
          keyboardType="number-pad"
          style={[styles.input, styles.flex]}
        />
      </View>
      <Button label="Park it for 24 hours" variant="ghost" onPress={park} disabled={!title.trim()} style={styles.mt} />
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex2: { flex: 2 },
  item: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: space.md, marginBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  title: { flex: 1, color: colors.text, backgroundColor: 'transparent', fontSize: font.md, fontWeight: '700' },
  amount: { color: colors.text, backgroundColor: 'transparent', fontSize: font.md, fontWeight: '700' },
  ready: { color: colors.accent, backgroundColor: 'transparent', fontSize: font.sm, fontWeight: '700', marginTop: space.sm },
  waiting: { color: colors.muted, backgroundColor: 'transparent', fontSize: font.sm },
  btnRow: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  small: { paddingVertical: 6, paddingHorizontal: space.md },
  addRow: { flexDirection: 'row', gap: space.sm },
  input: {
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: font.md,
  },
  mt: { marginTop: space.sm },
});
