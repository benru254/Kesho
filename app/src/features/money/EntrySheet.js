// The one form for all money actions.
// mode: 'in' (money in) | 'out' (money out) | 'aside' (put aside) | 'withdraw' (take from a pot)

import React, { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, ScrollView, Alert,
} from 'react-native';
import Button from '../../ui/Button';
import { colors, space, radius } from '../../core/theme';
import { kes, parseAmount } from '../../core/format';
import { dateKey, addDays } from '../../core/dates';
import {
  addTx, withdrawFromPot, addSource, archiveSource, PAY_YOURSELF_RATE,
} from './money.service';

const TITLES = {
  in: '+ Money in',
  out: '− Money out',
  aside: '⇢ Put aside',
  withdraw: '⇠ Take out of a pot',
};

const HINTS = {
  in: 'Only money that becomes YOURS. Shop sales stay in Gas Hub.',
  out: 'Needs = rent, food, transport, bills, family duties.\nWants = eating out, fun, gadgets — things you could skip.',
  aside: 'Money you move away so you don’t spend it.',
  withdraw: 'Life happens. Be honest about why — future you will read this.',
};

export default function EntrySheet({ mode, visible, onClose, onSaved, sources, buckets, summary, pots }) {
  const [amountText, setAmountText] = useState('');
  const [day, setDay] = useState('today');
  const [pickId, setPickId] = useState(null);
  const [note, setNote] = useState('');
  const [newSource, setNewSource] = useState(null); // null = hidden, string = typing
  const [payFirst, setPayFirst] = useState(null);   // after income: { amount, date }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmountText('');
      setDay('today');
      setPickId(null);
      setNote('');
      setNewSource(null);
      setPayFirst(null);
    }
  }, [visible, mode]);

  if (!mode) return null;

  const amount = parseAmount(amountText);
  const date = day === 'today' ? dateKey() : addDays(dateKey(), -1);
  const spendBuckets = buckets.filter((b) => b.kind === 'spend');
  const potList = pots.pots;
  const options =
    mode === 'in' ? sources.map((s) => ({ id: s.id, label: s.name }))
      : mode === 'out' ? spendBuckets.map((b) => ({ id: b.id, label: b.name }))
        : mode === 'aside' ? potList.map((p) => ({ id: p.id, label: p.name }))
          : potList.filter((p) => p.balance > 0).map((p) => ({ id: p.id, label: `${p.name} (${kes(p.balance)})` }));

  const picked = options.find((o) => o.id === pickId);
  const preview = buildPreview({ mode, amount, pickId, summary, pots, spendBuckets });
  const warning = buildWarning({ mode, pickId, pots });

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (mode === 'withdraw') {
        await withdrawFromPot({ date, bucketId: pickId, amount, note });
      } else {
        await addTx({
          date,
          type: mode,
          amount,
          sourceId: mode === 'in' ? pickId : null,
          bucketId: mode === 'in' ? null : pickId,
          note,
        });
      }
      onSaved();
      if (mode === 'in') {
        setPayFirst({ amount: Math.max(1, Math.round(amount * PAY_YOURSELF_RATE)), date });
      } else {
        onClose();
      }
    } catch (e) {
      Alert.alert('Not saved', String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  const doPayFirst = async () => {
    const payme = potList.find((p) => p.key === 'payme');
    if (payme) {
      await addTx({ date: payFirst.date, type: 'aside', amount: payFirst.amount, bucketId: payme.id, note: 'Paid myself first' });
      onSaved();
    }
    onClose();
  };

  const saveNewSource = async () => {
    if (!newSource || !newSource.trim()) return;
    const id = await addSource(newSource);
    setNewSource(null);
    await onSaved();
    setPickId(id);
  };

  const confirmArchive = (opt) => {
    if (mode !== 'in') return;
    Alert.alert('Hide this source?', `"${opt.label}" will be hidden. Its past money stays in your history.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Hide', onPress: async () => { await archiveSource(opt.id); if (pickId === opt.id) setPickId(null); onSaved(); } },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior="padding">
        <Pressable style={styles.flex} onPress={onClose} />
        <View style={styles.sheet}>
          {payFirst ? (
            <View>
              <Text style={styles.title}>Saved ✓</Text>
              <Text style={styles.big}>Pay yourself first?</Text>
              <Text style={styles.hint}>
                Put 10% aside now, before it disappears into spending. This is the habit that builds wealth.
              </Text>
              <Text style={styles.payAmount}>{kes(payFirst.amount)} → Pay myself</Text>
              <Button label="Yes, put it aside" onPress={doPayFirst} style={styles.mt} />
              <Button label="Not this time" variant="ghost" onPress={onClose} style={styles.mtSm} />
            </View>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.title}>{TITLES[mode]}</Text>
              <Text style={styles.hint}>{HINTS[mode]}</Text>

              <TextInput
                value={amountText}
                onChangeText={setAmountText}
                placeholder="Amount (KES)"
                placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
                autoFocus
                style={styles.amount}
              />

              <View style={styles.chips}>
                {[['today', 'Today'], ['yesterday', 'Yesterday']].map(([k, label]) => (
                  <Chip key={k} label={label} on={day === k} onPress={() => setDay(k)} />
                ))}
              </View>

              <Text style={styles.label}>
                {mode === 'in' ? 'From' : mode === 'out' ? 'Type' : mode === 'aside' ? 'Into' : 'From pot'}
              </Text>
              <View style={styles.chips}>
                {options.map((o) => (
                  <Chip
                    key={o.id}
                    label={o.label}
                    on={pickId === o.id}
                    onPress={() => setPickId(o.id)}
                    onLongPress={() => confirmArchive(o)}
                  />
                ))}
                {mode === 'in' && newSource === null && (
                  <Chip label="+ New source" on={false} onPress={() => setNewSource('')} />
                )}
              </View>
              {mode === 'withdraw' && options.length === 0 && (
                <Text style={styles.hint}>All pots are empty.</Text>
              )}
              {mode === 'in' && newSource !== null && (
                <View style={styles.row}>
                  <TextInput
                    value={newSource}
                    onChangeText={setNewSource}
                    placeholder="e.g. Website for a client"
                    placeholderTextColor={colors.placeholder}
                    style={[styles.input, styles.flex]}
                    autoFocus
                  />
                  <Button label="Add" onPress={saveNewSource} disabled={!newSource.trim()} />
                </View>
              )}
              {mode === 'in' && <Text style={styles.small}>Long-press a source to hide it.</Text>}

              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={mode === 'withdraw' ? 'What for? (be honest)' : 'Note (optional)'}
                placeholderTextColor={colors.placeholder}
                style={[styles.input, styles.mt]}
                maxLength={80}
              />

              {preview ? <Text style={styles.preview}>{preview}</Text> : null}
              {warning ? <Text style={styles.warn}>{warning}</Text> : null}

              <Button
                label={busy ? 'Saving…' : picked && amount > 0 ? `Save ${kes(amount)}` : 'Save'}
                onPress={save}
                disabled={busy || amount <= 0 || !pickId}
                style={styles.mt}
              />
              <Button label="Cancel" variant="ghost" onPress={onClose} style={styles.mtSm} />
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Chip({ label, on, onPress, onLongPress }) {
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={[styles.chip, on && styles.chipOn]}>
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

// Live preview: shows what this entry will change, before you save.
function buildPreview({ mode, amount, pickId, summary, pots, spendBuckets }) {
  if (!amount || !pickId) return null;
  if (mode === 'in') {
    return `Income this month: ${kes(summary.totalIn)} → ${kes(summary.totalIn + amount)}`;
  }
  if (mode === 'out') {
    const b = summary.spend.find((s) => s.id === pickId);
    const name = (spendBuckets.find((s) => s.id === pickId) || {}).name || '';
    const before = b ? b.total : 0;
    return `${name} this month: ${kes(before)} → ${kes(before + amount)}`;
  }
  const pot = pots.pots.find((p) => p.id === pickId);
  if (!pot) return null;
  const after = mode === 'aside' ? pot.balance + amount : pot.balance - amount;
  return `${pot.name}: ${kes(pot.balance)} → ${kes(after)}`;
}

// Honest warnings, shown before saving.
function buildWarning({ mode, pickId, pots }) {
  if (mode === 'aside') {
    const pot = pots.pots.find((p) => p.id === pickId);
    const em = pots.pots.find((p) => p.key === 'emergency');
    if (pot && pot.key === 'invest' && em && em.balance < pots.emergencyTarget) {
      return `Emergency fund first. It has ${kes(em.balance)} of ${kes(pots.emergencyTarget)}. Without it, one bad week forces you to sell investments at a loss.`;
    }
  }
  if (mode === 'withdraw') {
    const pot = pots.pots.find((p) => p.id === pickId);
    if (pot && pot.key === 'invest') return 'Taking from investments breaks compounding. Sure this can’t come from elsewhere?';
    if (pot && pot.key === 'payme') return 'This is future-you’s money. Emergency fund is for emergencies — use that first if it is one.';
  }
  return null;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  flex: { flex: 1 },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderColor: colors.border,
    borderWidth: 1,
    padding: space.lg,
    maxHeight: '88%',
  },
  title: { color: colors.text, backgroundColor: 'transparent', fontSize: 20, fontWeight: '800' },
  big: { color: colors.accent, backgroundColor: 'transparent', fontSize: 22, fontWeight: '800', marginTop: space.md },
  hint: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginTop: space.xs, lineHeight: 19 },
  small: { color: colors.placeholder, backgroundColor: 'transparent', fontSize: 11, marginTop: space.xs },
  label: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginTop: space.md, marginBottom: space.sm },
  amount: {
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    fontSize: 28,
    fontWeight: '800',
    marginTop: space.md,
    marginBottom: space.sm,
  },
  input: {
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: 15,
  },
  row: { flexDirection: 'row', gap: space.sm, alignItems: 'center', marginTop: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, backgroundColor: 'transparent', fontSize: 14 },
  chipTextOn: { color: colors.accentText, fontWeight: '700' },
  preview: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, marginTop: space.md },
  warn: { color: colors.warn, backgroundColor: 'transparent', fontSize: 13, marginTop: space.sm, lineHeight: 19 },
  payAmount: { color: colors.text, backgroundColor: 'transparent', fontSize: 20, fontWeight: '700', marginTop: space.lg },
  mt: { marginTop: space.md },
  mtSm: { marginTop: space.sm },
});
