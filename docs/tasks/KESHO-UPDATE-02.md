# KESHO-UPDATE-02 — Part 4: Read M-Pesa SMS automatically

**For Copilot.** Claude wrote this. Follow the steps in order. Do not change, reformat or "improve" any code.
Project root: `C:\Users\reuben\Desktop\kesho` — all paths are relative to it.

What this adds: Kesho reads M-Pesa SMS on the phone, keeps shop TILL money separate (business, not personal
income), and lets Reuben sort each personal payment with one tap (Need / Want / Not spending, or the income source).
M-Pesa fees go into their own bucket. The database upgrades itself (migration v3); existing data is kept.

It needs a small native Android module (`app/modules/kesho-sms`), so it ONLY works in the installed APK,
not in Expo Go (Expo Go shows a polite message instead — no crash).

Tested by Claude before sending: parser on 50 of Reuben's real M-Pesa messages (0 unread), import/sort/fees/
no-duplicates on a real SQLite database, plus all earlier test suites.

---

## STEP 0 — Prerequisites (check, report, stop if missing)
1. `C:\Users\reuben\Desktop\kesho\app\eas.json` exists and `eas whoami` prints Reuben's username
   (= KESHO-UPDATE-01 was done). If not: do KESHO-UPDATE-01 first, then come back.
2. `git status` in `C:\Users\reuben\Desktop\kesho` is clean (commit or report anything uncommitted).
3. Stop all Expo/Metro processes.

## STEP 1 — Create the native module skeleton with Expo's official tool
This creates the correct Android build files for this Expo version (Claude must not guess them).
```
cd C:\Users\reuben\Desktop\kesho\app
npx create-expo-module@latest --local
```
Answer the prompts EXACTLY (if you cannot type into the prompts, ask Reuben to type these answers):
- Name of the local module / folder: **kesho-sms**
- Native module name: **KeshoSms**
- Android package name: **expo.modules.keshosms**
(Other questions: accept defaults.)

Then check, and report if any is different:
- `app\modules\kesho-sms\android\build.gradle` exists → KEEP it exactly as generated (do not edit).
- The generated Kotlin files are in `app\modules\kesho-sms\android\src\main\java\expo\modules\keshosms\`.
  If the generator used a different folder, report the path and STOP.
- `package.json` was NOT changed (`git diff app/package.json` must be empty). If it changed, report and STOP.

## STEP 2 — Archive the generated pieces we don't use
Move (Move-Item, never delete) into `C:\Users\reuben\Desktop\_kesho-archive\update02-generated\`:
- `app\modules\kesho-sms\android\src\main\java\expo\modules\keshosms\KeshoSmsView.kt` (if it exists)
Leave everything else the generator made (ios, src, index.ts...) where it is — it is not used.

## STEP 3 — Put the files from this document in place
For EACH `### FILE` block below: replace the whole file (or create it), exactly. UTF-8, editor only.
01. app/src/core/db/migrations.js  — REPLACE
02. app/src/features/money/money.service.js  — REPLACE
03. app/src/features/money/MoneyScreen.js  — REPLACE
04. app/src/features/money/cards/MpesaCard.js  — NEW
05. app/src/features/money/mpesa/mpesa.parser.js  — NEW
06. app/src/features/money/mpesa/mpesa.native.js  — NEW
07. app/src/features/money/mpesa/mpesa.service.js  — NEW
08. app/modules/kesho-sms/expo-module.config.json  — REPLACE generated
09. app/modules/kesho-sms/android/src/main/AndroidManifest.xml  — NEW (or REPLACE)
10. app/modules/kesho-sms/android/src/main/java/expo/modules/keshosms/KeshoSmsModule.kt  — REPLACE generated
11. docs/STRUCTURE.md  — REPLACE
12. docs/ROADMAP.md  — REPLACE

Also save this document as `docs\tasks\KESHO-UPDATE-02.md`.

## STEP 4 — JS compile check
```
cd C:\Users\reuben\Desktop\kesho\app
npx expo export --platform android
```
Must finish without errors. If it fails: STOP, report the full error.

## STEP 5 — Build the new APK (~10–40 min)
```
cd C:\Users\reuben\Desktop\kesho\app
eas build -p android --profile preview
```
- Use the SAME keystore as before (EAS remembers it — just accept). Never generate a new one now,
  or the new APK cannot install over the old one and Reuben loses his data.
- If the build fails: open the build page, copy the error lines from the failed step
  (look for `kesho-sms`, `KeshoSmsModule.kt`, "e: " Kotlin errors, or "Execution failed for task").
  Report them to Reuben for Claude. Do NOT edit Kotlin or gradle files yourself.

## STEP 6 — Report for Reuben
1. Step 0/1 results (generator answers used, any differences).
2. Steps 4–5 pass/fail, the build link, exact errors if any.

## STEP 7 — Commit (only after Reuben confirms the app works)
```
cd C:\Users\reuben\Desktop\kesho
git add .
git commit -m "Update 02: M-Pesa SMS auto-read"
```

---

# FILES

### FILE 01: app/src/core/db/migrations.js
_REPLACE_

````javascript
// Every database change gets a NEW numbered entry at the bottom.
// Never edit or delete an old entry — the phone has already run it.
// Each migration runs once, in order, and only if it has not run before.

import { ensureColumn } from './schemaHelpers';

export const migrations = [
  {
    version: 1,
    name: 'core tables',
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        );

        CREATE TABLE IF NOT EXISTS daily_log (
          date TEXT PRIMARY KEY,
          mood INTEGER,
          sleep_hours INTEGER,
          sleep_quality INTEGER,
          moved INTEGER DEFAULT 0,
          stress INTEGER,
          win_note TEXT,
          morning_done_at TEXT,
          night_done_at TEXT,
          updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          title TEXT NOT NULL,
          done INTEGER DEFAULT 0,
          done_at TEXT,
          carried_to TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);

        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          payload TEXT,
          created_at TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
      `);
    },
  },
  {
    version: 2,
    name: 'money',
    up: async (db) => {
      await db.execAsync(`
        -- Where money comes FROM (income sources)
        CREATE TABLE IF NOT EXISTS money_sources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          archived INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        );

        -- Where money GOES: spend buckets (needs/wants) and save pots
        CREATE TABLE IF NOT EXISTS money_buckets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          kind TEXT NOT NULL,
          sort INTEGER DEFAULT 0,
          archived INTEGER DEFAULT 0
        );

        -- The ledger. Every shilling is one row. Totals are always CALCULATED, never stored.
        -- type: 'in' (income), 'out' (spending), 'aside' (into a pot; negative = taken out)
        CREATE TABLE IF NOT EXISTS money_tx (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          amount INTEGER NOT NULL,
          source_id INTEGER,
          bucket_id INTEGER,
          note TEXT,
          origin TEXT DEFAULT 'manual',
          ext_ref TEXT,
          created_at TEXT NOT NULL,
          deleted_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_money_tx_date ON money_tx(date);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_money_tx_ref ON money_tx(ext_ref) WHERE ext_ref IS NOT NULL;
      `);

      const now = new Date().toISOString();
      const buckets = [
        ['needs', 'Needs', 'spend', 1],
        ['wants', 'Wants', 'spend', 2],
        ['emergency', 'Emergency fund', 'pot', 3],
        ['payme', 'Pay myself', 'pot', 4],
        ['invest', 'Invest', 'pot', 5],
      ];
      for (const [key, name, kind, sort] of buckets) {
        await db.runAsync(
          'INSERT OR IGNORE INTO money_buckets (key, name, kind, sort) VALUES (?, ?, ?, ?)',
          [key, name, kind, sort]
        );
      }
      for (const name of ['Gas business (my pay)', 'Software / tech', 'Other']) {
        await db.runAsync('INSERT OR IGNORE INTO money_sources (name, created_at) VALUES (?, ?)', [name, now]);
      }
    },
  },
  {
    version: 3,
    name: 'mpesa inbox',
    up: async (db) => {
      await db.execAsync(`
        -- Every M-Pesa SMS Kesho has read. Nothing reaches the money ledger until you sort it.
        -- status: pending (waiting for you) | done (in the ledger) | skipped | business (shop till) | info | unknown
        CREATE TABLE IF NOT EXISTS mpesa_inbox (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          kind TEXT NOT NULL,
          direction TEXT,
          amount INTEGER,
          fee INTEGER DEFAULT 0,
          counterparty TEXT,
          party_key TEXT,
          account TEXT,
          balance INTEGER,
          date TEXT,
          time TEXT,
          raw TEXT,
          status TEXT NOT NULL,
          bucket_id INTEGER,
          source_id INTEGER,
          sms_ms REAL,
          created_at TEXT NOT NULL,
          decided_at TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_mpesa_status ON mpesa_inbox(status);
        CREATE INDEX IF NOT EXISTS idx_mpesa_party ON mpesa_inbox(party_key);
      `);
      // M-Pesa charges get their own bucket, so you can see what fees cost you.
      await db.runAsync(
        "INSERT OR IGNORE INTO money_buckets (key, name, kind, sort) VALUES ('fees', 'M-Pesa fees', 'spend', 3)"
      );
    },
  },
  // Next change goes here as version 4. Pattern for adding a column:
  // { version: 4, name: '...', up: async (db) => { await ensureColumn(db, 'money_tx', 'tag', 'TEXT'); } },
];

export const _ensureColumn = ensureColumn;
````

### FILE 02: app/src/features/money/money.service.js
_REPLACE_

````javascript
// All money data logic. Screens call these, never SQL.
// Rule: the ledger (money_tx) is the truth. Every total is calculated from it.

import { run, get, all, nowIso, logEvent } from '../../core/db/database';
import { getSetting, setSetting } from '../../core/settings';
import { DEFAULT_GOAL, addMonths } from './money.goal';

export const PAY_YOURSELF_RATE = 0.1; // 10% of every income, offered right after you log it
const DEFAULT_EMERGENCY_TARGET = 8000; // used until you have a full month of "Needs" data

// ---------- Sources & buckets ----------

export async function getSources() {
  return all('SELECT * FROM money_sources WHERE archived = 0 ORDER BY id');
}

// Finds an existing source by name first (no duplicates), otherwise creates it.
export async function addSource(name) {
  const clean = name.trim();
  if (!clean) return null;
  const existing = await get('SELECT * FROM money_sources WHERE lower(name) = lower(?)', [clean]);
  if (existing) {
    if (existing.archived) await run('UPDATE money_sources SET archived = 0 WHERE id = ?', [existing.id]);
    return existing.id;
  }
  const res = await run('INSERT INTO money_sources (name, created_at) VALUES (?, ?)', [clean, nowIso()]);
  return res.lastInsertRowId;
}

export async function archiveSource(id) {
  await run('UPDATE money_sources SET archived = 1 WHERE id = ?', [id]);
}

export async function getBuckets() {
  return all('SELECT * FROM money_buckets WHERE archived = 0 ORDER BY sort');
}

// ---------- Recording money ----------

// type: 'in' | 'out' | 'aside'. Amount is always a positive whole number here.
// origin: 'manual' | 'mpesa'. extRef: M-Pesa code — the database refuses the same code twice.
export async function addTx({
  date, type, amount, sourceId = null, bucketId = null, note = null, origin = 'manual', extRef = null,
}) {
  const n = Math.round(Number(amount));
  if (!n || n <= 0) throw new Error('Amount must be more than 0');
  if (type === 'in' && !sourceId) throw new Error('Pick where the money came from');
  if ((type === 'out' || type === 'aside') && !bucketId) throw new Error('Pick a bucket');
  const res = await run(
    `INSERT INTO money_tx (date, type, amount, source_id, bucket_id, note, origin, ext_ref, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [date, type, n, sourceId, bucketId, note && note.trim() ? note.trim() : null, origin, extRef, nowIso()]
  );
  await logEvent(`money_${type}`, { amount: n });
  return res.lastInsertRowId;
}

// Taking money OUT of a pot (life happens). Stored as a negative 'aside' row.
export async function withdrawFromPot({ date, bucketId, amount, note }) {
  const n = Math.round(Number(amount));
  if (!n || n <= 0) throw new Error('Amount must be more than 0');
  const bal = await potBalance(bucketId);
  if (n > bal) throw new Error(`Only KES ${bal} in this pot`);
  await run(
    `INSERT INTO money_tx (date, type, amount, bucket_id, note, created_at)
     VALUES (?, 'aside', ?, ?, ?, ?)`,
    [date, -n, bucketId, note && note.trim() ? note.trim() : null, nowIso()]
  );
  await logEvent('money_withdraw', { amount: n, bucketId });
}

// Soft delete: the row stays in the database (history), it just stops counting.
export async function deleteTx(id) {
  await run('UPDATE money_tx SET deleted_at = ? WHERE id = ?', [nowIso(), id]);
  await logEvent('money_deleted', { id });
}

// ---------- Reading totals ----------

const LIVE = 'deleted_at IS NULL';

async function potBalance(bucketId) {
  const row = await get(
    `SELECT COALESCE(SUM(amount), 0) AS n FROM money_tx WHERE ${LIVE} AND type = 'aside' AND bucket_id = ?`,
    [bucketId]
  );
  return row.n;
}

async function sumBySource(month) {
  return all(
    `SELECT source_id, COALESCE(SUM(amount), 0) AS total FROM money_tx
     WHERE ${LIVE} AND type = 'in' AND substr(date, 1, 7) = ? GROUP BY source_id`,
    [month]
  );
}

export async function getMonthSummary(month) {
  const lastMonth = addMonths(month, -1);
  const [sources, buckets, thisBySource, lastBySource, outRows, asideRow] = await Promise.all([
    all('SELECT * FROM money_sources ORDER BY id'),
    getBuckets(),
    sumBySource(month),
    sumBySource(lastMonth),
    all(
      `SELECT bucket_id, COALESCE(SUM(amount), 0) AS total FROM money_tx
       WHERE ${LIVE} AND type = 'out' AND substr(date, 1, 7) = ? GROUP BY bucket_id`,
      [month]
    ),
    get(
      `SELECT COALESCE(SUM(amount), 0) AS n FROM money_tx
       WHERE ${LIVE} AND type = 'aside' AND substr(date, 1, 7) = ?`,
      [month]
    ),
  ]);

  const thisMap = Object.fromEntries(thisBySource.map((r) => [r.source_id, r.total]));
  const lastMap = Object.fromEntries(lastBySource.map((r) => [r.source_id, r.total]));
  const income = sources
    .map((s) => ({ id: s.id, name: s.name, total: thisMap[s.id] || 0, last: lastMap[s.id] || 0 }))
    .filter((s) => s.total > 0 || s.last > 0)
    .sort((a, b) => b.total - a.total);

  const outMap = Object.fromEntries(outRows.map((r) => [r.bucket_id, r.total]));
  const spend = buckets
    .filter((b) => b.kind === 'spend')
    .map((b) => ({ id: b.id, key: b.key, name: b.name, total: outMap[b.id] || 0 }));

  const totalIn = income.reduce((a, s) => a + s.total, 0);
  const totalInLast = income.reduce((a, s) => a + s.last, 0);
  const totalOut = spend.reduce((a, s) => a + s.total, 0);
  const totalAside = asideRow.n;

  return {
    month,
    income,
    spend,
    totalIn,
    totalInLast,
    totalOut,
    totalAside,
    left: totalIn - totalOut - totalAside,
  };
}

export async function getPots() {
  const buckets = (await getBuckets()).filter((b) => b.kind === 'pot');
  const rows = await all(
    `SELECT bucket_id, COALESCE(SUM(amount), 0) AS bal FROM money_tx
     WHERE ${LIVE} AND type = 'aside' GROUP BY bucket_id`
  );
  const map = Object.fromEntries(rows.map((r) => [r.bucket_id, r.bal]));
  const pots = buckets.map((b) => ({ id: b.id, key: b.key, name: b.name, balance: map[b.id] || 0 }));
  const emergencyTarget = await getEmergencyTarget();
  return { pots, emergencyTarget, totalSaved: pots.reduce((a, p) => a + p.balance, 0) };
}

// 1 month of your real "Needs" spending (last full month). Until then: 8,000.
export async function getEmergencyTarget(month = null) {
  const now = new Date();
  const thisMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const last = addMonths(thisMonth, -1);
  const row = await get(
    `SELECT COALESCE(SUM(t.amount), 0) AS n FROM money_tx t JOIN money_buckets b ON b.id = t.bucket_id
     WHERE t.${LIVE} AND t.type = 'out' AND b.key = 'needs' AND substr(t.date, 1, 7) = ?`,
    [last]
  );
  return row.n > 0 ? row.n : DEFAULT_EMERGENCY_TARGET;
}

export async function getRecent(month, limit = 15) {
  return all(
    `SELECT t.*, s.name AS source_name, b.name AS bucket_name, b.key AS bucket_key
     FROM money_tx t
     LEFT JOIN money_sources s ON s.id = t.source_id
     LEFT JOIN money_buckets b ON b.id = t.bucket_id
     WHERE t.${LIVE} AND substr(t.date, 1, 7) = ?
     ORDER BY t.date DESC, t.id DESC LIMIT ?`,
    [month, limit]
  );
}

// ---------- Goal ----------

export async function getGoal() {
  const saved = await getSetting('money_goal', null);
  return { ...DEFAULT_GOAL, ...(saved || {}) };
}

export async function saveGoal(goal) {
  await setSetting('money_goal', goal);
}
````

### FILE 03: app/src/features/money/MoneyScreen.js
_REPLACE_

````javascript
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet, AppState } from 'react-native';
import { colors, space, radius } from '../../core/theme';
import { monthKey, monthName, monthStatus } from './money.goal';
import {
  getSources, getBuckets, getMonthSummary, getPots, getRecent, getGoal,
} from './money.service';
import EntrySheet from './EntrySheet';
import GoalCard from './cards/GoalCard';
import IncomeCard from './cards/IncomeCard';
import SpendCard from './cards/SpendCard';
import PotsCard from './cards/PotsCard';
import RecentCard from './cards/RecentCard';
import MpesaCard from './cards/MpesaCard';
import { syncFromPhone, getMpesaState } from './mpesa/mpesa.service';

const ACTIONS = [
  { mode: 'in', label: '+ In', color: colors.good },
  { mode: 'out', label: '− Out', color: colors.text },
  { mode: 'aside', label: '⇢ Aside', color: colors.accent },
];

export default function MoneyScreen() {
  const [data, setData] = useState(null);
  const [mode, setMode] = useState(null);

  const [sync, setSync] = useState(null);

  const load = useCallback(async () => {
    const month = monthKey();
    const [sources, buckets, summary, pots, recent, goal, mpesa] = await Promise.all([
      getSources(), getBuckets(), getMonthSummary(month), getPots(), getRecent(month), getGoal(),
      getMpesaState(month),
    ]);
    const status = monthStatus(goal, month, summary.totalIn, new Date().getDate());
    setData({ month, sources, buckets, summary, pots, recent, goal, status, mpesa });
  }, []);

  // Read new M-Pesa SMS (installed app only), then refresh the screen.
  const syncAndLoad = useCallback(async () => {
    try {
      setSync(await syncFromPhone());
    } catch (e) {
      console.warn('[mpesa] sync failed', e);
    }
    await load();
  }, [load]);

  useEffect(() => {
    load();
    syncAndLoad();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') syncAndLoad(); });
    return () => sub.remove();
  }, [load, syncAndLoad]);

  if (!data) return <View style={styles.screen} />;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.h1}>Money</Text>
        <Text style={styles.sub}>{monthName(data.month)} · personal only</Text>

        <View style={styles.actions}>
          {ACTIONS.map((a) => (
            <Pressable
              key={a.mode}
              onPress={() => setMode(a.mode)}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            >
              <Text style={[styles.actionText, { color: a.color }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <MpesaCard
          sync={sync}
          state={data.mpesa}
          buckets={data.buckets}
          sources={data.sources}
          onChanged={syncAndLoad}
        />
        <GoalCard goal={data.goal} status={data.status} totalInLast={data.summary.totalInLast} onChanged={load} />
        <IncomeCard summary={data.summary} />
        <SpendCard summary={data.summary} />
        <PotsCard pots={data.pots} onWithdraw={() => setMode('withdraw')} />
        <RecentCard rows={data.recent} onChanged={load} />
      </ScrollView>

      <EntrySheet
        mode={mode}
        visible={!!mode}
        onClose={() => setMode(null)}
        onSaved={load}
        sources={data.sources}
        buckets={data.buckets}
        summary={data.summary}
        pots={data.pots}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 80 },
  h1: { color: colors.text, backgroundColor: 'transparent', fontSize: 24, fontWeight: '800' },
  sub: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, marginTop: 2, marginBottom: space.lg },
  actions: { flexDirection: 'row', gap: space.sm, marginBottom: space.lg },
  action: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
  actionText: { backgroundColor: 'transparent', fontSize: 17, fontWeight: '800' },
});
````

### FILE 04: app/src/features/money/cards/MpesaCard.js
_NEW_

````javascript
// M-Pesa auto-read: shows payments waiting to be sorted. One tap each.

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import { colors, space, radius } from '../../../core/theme';
import { kes } from '../../../core/format';
import { keyToDate } from '../../../core/dates';
import { requestPermission } from '../mpesa/mpesa.native';
import { sortItem, skipItem, sortAllSuggested } from '../mpesa/mpesa.service';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHOW_MAX = 8;

export default function MpesaCard({ sync, state, buckets, sources, onChanged }) {
  const [busy, setBusy] = useState(false);

  if (!sync) return null;

  if (!sync.available) {
    return (
      <Card title="📩 M-Pesa auto-read">
        <Text style={styles.muted}>Works in the installed Kesho app (APK), not in Expo Go.</Text>
      </Card>
    );
  }

  if (!sync.permission) {
    return (
      <Card title="📩 Read M-Pesa automatically?" subtitle="No more typing every payment">
        <Text style={styles.body}>
          Kesho reads only messages from MPESA, on this phone. Nothing is uploaded.{'\n'}
          Shop till payments are kept separate — they are business, not your income.
        </Text>
        <Button
          label="Allow reading M-Pesa SMS"
          onPress={async () => { await requestPermission(); onChanged(); }}
          style={styles.mt}
        />
      </Card>
    );
  }

  if (!state) return null;

  const need = buckets.find((b) => b.key === 'needs');
  const want = buckets.find((b) => b.key === 'wants');
  const suggested = state.pending.filter((p) => p.suggestion).length;
  const shown = state.pending.slice(0, SHOW_MAX);

  const act = async (fn) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      await onChanged();
    } catch (e) {
      Alert.alert('Not saved', String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title="📩 M-Pesa"
      subtitle={state.balance ? `Balance ${kes(state.balance.amount)} · from SMS ${state.balance.date} ${state.balance.time}` : 'Reading your M-Pesa messages'}
      done={state.pending.length === 0}
    >
      {state.pending.length === 0 ? (
        <Text style={styles.good}>All M-Pesa payments sorted ✓</Text>
      ) : (
        <Text style={styles.body}>{state.pending.length} to sort. Tap what each one was.</Text>
      )}

      {suggested > 0 && (
        <Button
          label={`Sort ${suggested} like last time`}
          onPress={() => act(sortAllSuggested)}
          disabled={busy}
          style={styles.mt}
        />
      )}

      {shown.map((item) => {
        const d = item.date ? keyToDate(item.date) : null;
        const s = item.suggestion || {};
        const isOut = item.direction === 'out';
        return (
          <View key={item.id} style={styles.item}>
            <View style={styles.row}>
              <Text style={[styles.amount, { color: isOut ? colors.text : colors.good }]}>
                {isOut ? '−' : '+'}{kes(item.amount)}
              </Text>
              <Text style={styles.when}>{d ? `${DAYS[d.getDay()]} ${d.getDate()}` : ''} {item.time || ''}</Text>
            </View>
            <Text style={styles.party} numberOfLines={1}>
              {item.counterparty || item.kind}{item.fee > 0 ? `  ·  fee ${kes(item.fee)}` : ''}
            </Text>
            <View style={styles.chips}>
              {isOut ? (
                <>
                  {need && <Chip label="Need" hint={s.bucketId === need.id} onPress={() => act(() => sortItem(item.id, { bucketId: need.id }))} />}
                  {want && <Chip label="Want" hint={s.bucketId === want.id} onPress={() => act(() => sortItem(item.id, { bucketId: want.id }))} />}
                  <Chip label="Not spending" hint={!!s.skip} onPress={() => act(() => skipItem(item.id))} />
                </>
              ) : (
                <>
                  {sources.map((src) => (
                    <Chip
                      key={src.id}
                      label={src.name}
                      hint={s.sourceId === src.id}
                      onPress={() => act(() => sortItem(item.id, { sourceId: src.id }))}
                    />
                  ))}
                  <Chip label="Not income" hint={!!s.skip} onPress={() => act(() => skipItem(item.id))} />
                </>
              )}
            </View>
          </View>
        );
      })}
      {state.pending.length > SHOW_MAX && (
        <Text style={styles.muted}>+{state.pending.length - SHOW_MAX} more below these</Text>
      )}

      <View style={styles.footer}>
        {state.business.count > 0 && (
          <Text style={styles.muted}>
            🏪 Shop till this month: {kes(state.business.total)} ({state.business.count} payments) — business, not counted as your income.
          </Text>
        )}
        {state.feesThisMonth > 0 && (
          <Text style={styles.muted}>M-Pesa fees this month: {kes(state.feesThisMonth)}</Text>
        )}
        {state.unknown.count > 0 && (
          <Text style={styles.warn}>
            {state.unknown.count} M-Pesa message(s) Kesho couldn’t read yet. Send one to Claude: “{(state.unknown.samples[0] || '').slice(0, 90)}…”
          </Text>
        )}
      </View>
    </Card>
  );
}

function Chip({ label, hint, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, hint && styles.chipHint, pressed && styles.pressed]}>
      <Text style={[styles.chipText, hint && styles.chipTextHint]}>{hint ? `★ ${label}` : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, lineHeight: 20 },
  muted: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, marginTop: space.xs, lineHeight: 18 },
  good: { color: colors.good, backgroundColor: 'transparent', fontSize: 14, fontWeight: '700' },
  warn: { color: colors.warn, backgroundColor: 'transparent', fontSize: 12, marginTop: space.xs, lineHeight: 18 },
  mt: { marginTop: space.md },
  item: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: space.md, paddingTop: space.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  amount: { backgroundColor: 'transparent', fontSize: 17, fontWeight: '800' },
  when: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12 },
  party: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  chip: {
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipHint: { borderColor: colors.accent },
  chipText: { color: colors.text, backgroundColor: 'transparent', fontSize: 13 },
  chipTextHint: { color: colors.accent, fontWeight: '700' },
  pressed: { opacity: 0.6 },
  footer: { marginTop: space.md },
});
````

### FILE 05: app/src/features/money/mpesa/mpesa.parser.js
_NEW_

````javascript
// Reads one M-Pesa SMS and turns it into structured data. Pure logic — tested on Reuben's real messages.
//
// Returns null for messages that are not money movements (e.g. "Failed, wrong PIN").
// Otherwise returns:
//   { code, kind, direction, amount, fee, counterparty, partyKey, account, balance, date, time }
//
// kind:
//   'till'      paid to a Till (Buy Goods)                 → out
//   'paybill'   sent to a Paybill (KPLC, banks, Airtel...) → out
//   'sent'      sent to a person                           → out
//   'withdraw'  cash withdrawal at an agent                → out   (format not yet seen in Reuben's samples)
//   'airtime'   bought airtime                             → out   (format not yet seen in Reuben's samples)
//   'received'  money into your PERSONAL M-Pesa            → in
//   'business'  money into a Lipa na M-Pesa TILL / merchant account (shop sales) → in, but NOT personal
//   'balance'   balance enquiry                            → none
//   'unknown'   has a code but Kesho can't read it yet     → none

const AMT = '([\\d,]+(?:\\.\\d{1,2})?)';
const WHEN_RE = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s*at\s*(\d{1,2}):(\d{2})\s*([AP]M)/i;

function num(s) {
  if (s == null) return null;
  const n = parseFloat(String(s).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function whole(s) {
  const n = num(s);
  return n == null ? null : Math.round(n);
}

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function parseWhen(body) {
  const m = WHEN_RE.exec(body);
  if (!m) return { date: null, time: null };
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  let y = parseInt(m[3], 10);
  if (y < 100) y += 2000;
  let h = parseInt(m[4], 10) % 12;
  if (m[6].toUpperCase() === 'PM') h += 12;
  return { date: `${y}-${pad(mo)}-${pad(d)}`, time: `${pad(h)}:${m[5]}` };
}

// "jane  doe 0700000000" -> "jane doe" ; "254700000000 JOHN TEST" -> "JOHN TEST"   (examples are invented)
export function cleanName(s) {
  if (!s) return '';
  return s
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '')
    .replace(/^(?:\+?254|0)\d{9}\s+/, '')
    .replace(/\s+(?:\+?254|0)\d{9}$/, '')
    .trim();
}

export function partyKey(name) {
  return cleanName(name).toLowerCase();
}

function find(re, body, group = 1) {
  const m = re.exec(body);
  return m ? m[group] : null;
}

export function parseMpesa(body) {
  if (!body) return null;
  const text = String(body);
  const codeMatch = /^\s*([A-Z0-9]{10})\s+confirmed/i.exec(text);
  if (!codeMatch) return null; // "Failed..." and promos have no code

  const base = {
    code: codeMatch[1].toUpperCase(),
    ...parseWhen(text),
    fee: whole(find(/Transaction cost,?\s*Ksh\s*([\d,]+(?:\.\d{1,2})?)/i, text)) || 0,
    balance: whole(find(new RegExp(`New M-PESA balance is Ksh\\s*${AMT}`, 'i'), text)),
    account: null,
    counterparty: '',
  };

  const result = (fields) => {
    const r = { ...base, ...fields };
    r.counterparty = cleanName(r.counterparty);
    r.partyKey = r.counterparty.toLowerCase();
    return r;
  };

  // Balance enquiry
  if (/account balance was/i.test(text)) {
    return result({
      kind: 'balance',
      direction: 'none',
      amount: null,
      fee: 0,
      balance: whole(find(new RegExp(`M-PESA Account\\s*:\\s*Ksh\\s*${AMT}`, 'i'), text)),
    });
  }

  // Shop / merchant till receipts ("New Account balance", "New Merchant Account Balance")
  if (/New (?:Merchant )?Account Balance is/i.test(text) && !/New M-PESA balance/i.test(text)) {
    return result({
      kind: 'business',
      direction: 'in',
      amount: whole(find(new RegExp(`Ksh\\s*${AMT}\\s*received from`, 'i'), text)),
      counterparty: find(/received from\s+(.+?)\.?\s*New (?:Merchant )?Account/i, text) || '',
      balance: null,
    });
  }

  let m;
  if ((m = new RegExp(`Ksh\\s*${AMT} sent to (.+?) for account (\\S+) on\\s`, 'i').exec(text))) {
    return result({ kind: 'paybill', direction: 'out', amount: whole(m[1]), counterparty: m[2], account: m[3] });
  }
  if ((m = new RegExp(`Ksh\\s*${AMT} paid to (.+?)\\.? on\\s`, 'i').exec(text))) {
    return result({ kind: 'till', direction: 'out', amount: whole(m[1]), counterparty: m[2] });
  }
  if ((m = new RegExp(`Ksh\\s*${AMT} sent to (.+?) on\\s`, 'i').exec(text))) {
    return result({ kind: 'sent', direction: 'out', amount: whole(m[1]), counterparty: m[2] });
  }
  if ((m = new RegExp(`received Ksh\\s*${AMT} from (.+?)\\.? on\\s`, 'i').exec(text))
    || (m = new RegExp(`Ksh\\s*${AMT} received from (.+?)\\.? on\\s`, 'i').exec(text))) {
    return result({ kind: 'received', direction: 'in', amount: whole(m[1]), counterparty: m[2] });
  }
  if ((m = new RegExp(`Withdraw\\s*Ksh\\s*${AMT} from (.+?)\\s*New M-PESA`, 'i').exec(text))) {
    return result({ kind: 'withdraw', direction: 'out', amount: whole(m[1]), counterparty: `Cash withdrawal (${cleanName(m[2])})` });
  }
  if ((m = new RegExp(`bought Ksh\\s*${AMT} of airtime`, 'i').exec(text))) {
    return result({ kind: 'airtime', direction: 'out', amount: whole(m[1]), counterparty: 'Airtime' });
  }

  return result({ kind: 'unknown', direction: 'none', amount: null });
}
````

### FILE 06: app/src/features/money/mpesa/mpesa.native.js
_NEW_

````javascript
// Bridge to the phone's SMS inbox (Android only, installed Kesho app only).
// In Expo Go the native part does not exist — isAvailable() returns false and nothing crashes.

import { Platform, PermissionsAndroid, Linking } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

const Native = Platform.OS === 'android' ? requireOptionalNativeModule('KeshoSms') : null;

export function isAvailable() {
  return !!Native;
}

export async function hasPermission() {
  if (Platform.OS !== 'android') return false;
  return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
}

// Returns true if allowed. If Android says "never ask again", opens the app settings page.
export async function requestPermission() {
  if (Platform.OS !== 'android') return false;
  const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_SMS, {
    title: 'Let Kesho read M-Pesa messages',
    message: 'Kesho reads only messages from MPESA, to record your money automatically. Nothing leaves your phone.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  if (res === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    await Linking.openSettings();
    return false;
  }
  return res === PermissionsAndroid.RESULTS.GRANTED;
}

// [{ id, address, body, date(ms) }], oldest first
export async function readMpesaInbox(sinceMs, limit = 3000) {
  if (!Native) return [];
  return Native.readMpesaInbox(sinceMs, limit);
}
````

### FILE 07: app/src/features/money/mpesa/mpesa.service.js
_NEW_

````javascript
// M-Pesa import: SMS → mpesa_inbox (waiting room) → you sort → money ledger.
// Rules:
// - Shop till money ("New Account balance") is BUSINESS. It is never counted as personal income.
// - Nothing enters your ledger until you sort it (or confirm a suggestion). No silent guesses.
// - The same M-Pesa code is never imported twice.
// - Fees become their own spending row in "M-Pesa fees".

import { run, get, all, nowIso, logEvent } from '../../../core/db/database';
import { getSetting, setSetting } from '../../../core/settings';
import { addTx, getBuckets } from '../money.service';
import { parseMpesa } from './mpesa.parser';
import { isAvailable, hasPermission, readMpesaInbox } from './mpesa.native';

const STATUS_FOR_KIND = {
  business: 'business',
  balance: 'info',
  unknown: 'unknown',
};

// ---------- Import ----------

// messages: [{ body, date(ms) }]. Returns { added, pending }.
export async function importMessages(messages) {
  let added = 0;
  let newest = null;
  for (const msg of messages) {
    const p = parseMpesa(msg.body);
    if (!p) continue;
    const status = STATUS_FOR_KIND[p.kind] || 'pending';
    const res = await run(
      `INSERT OR IGNORE INTO mpesa_inbox
        (code, kind, direction, amount, fee, counterparty, party_key, account, balance, date, time, raw, status, sms_ms, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.code, p.kind, p.direction, p.amount, p.fee, p.counterparty, p.partyKey, p.account, p.balance,
        p.date, p.time, msg.body, status, msg.date || null, nowIso()]
    );
    if (res.changes > 0) added++;
    if (p.balance != null && p.kind !== 'business') {
      const ms = msg.date || 0;
      if (!newest || ms >= newest.ms) newest = { ms, amount: p.balance, date: p.date, time: p.time };
    }
  }
  if (newest) {
    const saved = await getSetting('mpesa_balance', null);
    if (!saved || newest.ms >= (saved.ms || 0)) await setSetting('mpesa_balance', newest);
  }
  if (added > 0) await logEvent('mpesa_import', { added });
  const pending = await get("SELECT COUNT(*) AS n FROM mpesa_inbox WHERE status = 'pending'");
  return { added, pending: pending.n };
}

function startOfMonthMs() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

// Reads new M-Pesa SMS from the phone. Safe to call often.
// Returns { available, permission, added, pending }
export async function syncFromPhone() {
  if (!isAvailable()) return { available: false, permission: false, added: 0, pending: 0 };
  if (!(await hasPermission())) return { available: true, permission: false, added: 0, pending: 0 };

  // First time: start from the 1st of this month, so this month's numbers are complete.
  const since = await getSetting('mpesa_since_ms', startOfMonthMs());
  const messages = await readMpesaInbox(since, 3000);
  const res = await importMessages(messages);
  const newestMs = messages.reduce((m, x) => Math.max(m, x.date || 0), since);
  await setSetting('mpesa_since_ms', newestMs);
  return { available: true, permission: true, ...res };
}

// ---------- Reading for the screen ----------

// What did you choose last time for this person/business? Used as a suggestion.
async function suggestionFor(item) {
  if (!item.party_key) return null;
  const last = await get(
    `SELECT bucket_id, source_id, status FROM mpesa_inbox
     WHERE party_key = ? AND direction = ? AND status IN ('done', 'skipped') AND id != ?
     ORDER BY decided_at DESC LIMIT 1`,
    [item.party_key, item.direction, item.id]
  );
  if (!last) return null;
  if (last.status === 'skipped') return { skip: true };
  return { bucketId: last.bucket_id || null, sourceId: last.source_id || null };
}

export async function getMpesaState(month) {
  const pendingRows = await all(
    "SELECT * FROM mpesa_inbox WHERE status = 'pending' ORDER BY sms_ms DESC, id DESC"
  );
  const pending = [];
  for (const r of pendingRows) pending.push({ ...r, suggestion: await suggestionFor(r) });

  const business = await get(
    `SELECT COUNT(*) AS n, COALESCE(SUM(amount), 0) AS total FROM mpesa_inbox
     WHERE status = 'business' AND substr(date, 1, 7) = ?`,
    [month]
  );
  const unknown = await all(
    "SELECT raw FROM mpesa_inbox WHERE status = 'unknown' ORDER BY id DESC LIMIT 3"
  );
  const unknownCount = await get("SELECT COUNT(*) AS n FROM mpesa_inbox WHERE status = 'unknown'");
  const fees = await get(
    `SELECT COALESCE(SUM(t.amount), 0) AS n FROM money_tx t JOIN money_buckets b ON b.id = t.bucket_id
     WHERE t.deleted_at IS NULL AND b.key = 'fees' AND substr(t.date, 1, 7) = ?`,
    [month]
  );
  return {
    pending,
    business: { count: business.n, total: business.total },
    unknown: { count: unknownCount.n, samples: unknown.map((u) => u.raw) },
    feesThisMonth: fees.n,
    balance: await getSetting('mpesa_balance', null),
  };
}

// ---------- Sorting ----------

async function feeBucketId() {
  const b = (await getBuckets()).find((x) => x.key === 'fees');
  return b ? b.id : null;
}

// choice: { bucketId } for money out, { sourceId } for money in.
export async function sortItem(id, choice) {
  const item = await get('SELECT * FROM mpesa_inbox WHERE id = ?', [id]);
  if (!item || item.status !== 'pending') return;
  const already = await get('SELECT id FROM money_tx WHERE ext_ref = ?', [item.code]);

  if (!already) {
    if (item.direction === 'out') {
      if (!choice.bucketId) throw new Error('Pick Need or Want');
      await addTx({
        date: item.date, type: 'out', amount: item.amount, bucketId: choice.bucketId,
        note: item.counterparty, origin: 'mpesa', extRef: item.code,
      });
    } else {
      if (!choice.sourceId) throw new Error('Pick where the money came from');
      await addTx({
        date: item.date, type: 'in', amount: item.amount, sourceId: choice.sourceId,
        note: item.counterparty, origin: 'mpesa', extRef: item.code,
      });
    }
    if (item.fee > 0) {
      const fb = await feeBucketId();
      const feeRef = `${item.code}-FEE`;
      const feeDone = await get('SELECT id FROM money_tx WHERE ext_ref = ?', [feeRef]);
      if (fb && !feeDone) {
        await addTx({
          date: item.date, type: 'out', amount: item.fee, bucketId: fb,
          note: `Fee: ${item.counterparty}`, origin: 'mpesa', extRef: feeRef,
        });
      }
    }
  }

  await run(
    "UPDATE mpesa_inbox SET status = 'done', bucket_id = ?, source_id = ?, decided_at = ? WHERE id = ?",
    [choice.bucketId || null, choice.sourceId || null, nowIso(), id]
  );
}

// Not personal spending/income (e.g. moving your own money, a loan to a friend).
export async function skipItem(id) {
  await run("UPDATE mpesa_inbox SET status = 'skipped', decided_at = ? WHERE id = ? AND status = 'pending'", [
    nowIso(),
    id,
  ]);
  await logEvent('mpesa_skip', { id });
}

// One tap: apply your previous choice to everything that has one. Returns how many were sorted.
export async function sortAllSuggested() {
  const { pending } = await getMpesaState('0000-00');
  let n = 0;
  for (const item of pending) {
    const s = item.suggestion;
    if (!s) continue;
    if (s.skip) await skipItem(item.id);
    else if (item.direction === 'out' && s.bucketId) await sortItem(item.id, { bucketId: s.bucketId });
    else if (item.direction === 'in' && s.sourceId) await sortItem(item.id, { sourceId: s.sourceId });
    else continue;
    n++;
  }
  return n;
}
````

### FILE 08: app/modules/kesho-sms/expo-module.config.json
_REPLACE generated_

````json
{
  "platforms": ["android"],
  "android": {
    "modules": ["expo.modules.keshosms.KeshoSmsModule"]
  }
}
````

### FILE 09: app/modules/kesho-sms/android/src/main/AndroidManifest.xml
_NEW (or REPLACE)_

````xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <!-- Lets Kesho read M-Pesa messages. Asked for at runtime; Reuben can refuse. -->
  <uses-permission android:name="android.permission.READ_SMS" />
</manifest>
````

### FILE 10: app/modules/kesho-sms/android/src/main/java/expo/modules/keshosms/KeshoSmsModule.kt
_REPLACE generated_

````kotlin
package expo.modules.keshosms

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// Kesho's tiny native helper: reads M-Pesa messages from the phone's SMS inbox.
// Read-only. Only messages whose sender contains "MPESA" / "M-PESA". Nothing leaves the phone.
class KeshoSmsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("KeshoSms")

    // sinceMs: only messages newer than this time (milliseconds). limit: max messages returned.
    AsyncFunction("readMpesaInbox") { sinceMs: Double, limit: Int ->
      val context = appContext.reactContext
        ?: throw Exception("Android context not available")

      if (context.checkSelfPermission(Manifest.permission.READ_SMS) != PackageManager.PERMISSION_GRANTED) {
        throw Exception("READ_SMS permission not granted")
      }

      val results = ArrayList<Map<String, Any?>>()
      val cursor = context.contentResolver.query(
        Uri.parse("content://sms/inbox"),
        arrayOf("_id", "address", "body", "date"),
        "date > ? AND (address LIKE ? OR address LIKE ?)",
        arrayOf(sinceMs.toLong().toString(), "%MPESA%", "%M-PESA%"),
        "date ASC"
      )

      cursor?.use { c ->
        val idCol = c.getColumnIndexOrThrow("_id")
        val addressCol = c.getColumnIndexOrThrow("address")
        val bodyCol = c.getColumnIndexOrThrow("body")
        val dateCol = c.getColumnIndexOrThrow("date")
        while (c.moveToNext() && results.size < limit) {
          results.add(
            mapOf(
              "id" to c.getLong(idCol).toString(),
              "address" to (c.getString(addressCol) ?: ""),
              "body" to (c.getString(bodyCol) ?: ""),
              "date" to c.getLong(dateCol).toDouble()
            )
          )
        }
      }

      results
    }
  }
}
````

### FILE 11: docs/STRUCTURE.md
_REPLACE_

````markdown
# Kesho — folder map

```
kesho/                          ← THE project. Everything lives here. Forever.
├── .github/copilot-instructions.md ← rules Copilot follows
├── .gitignore
├── docs/                       ← Read me first: map, roadmap, decisions
│   ├── STRUCTURE.md
│   └── ROADMAP.md
└── app/                        ← The Android app (Expo)
    ├── App.js                  ← 1 line: hands over to src/App.js. Don't touch.
    ├── package.json            ← packages (Expo SDK 54)
    ├── app.json                ← app name "Kesho", Android package com.kesho.app
    ├── eas.json                ← how the APK is built (EAS cloud)
    ├── modules/kesho-sms/      ← tiny native Android part: reads M-Pesa SMS (Kotlin)
    └── src/                    ← ALL our code
        ├── App.js              ← App shell: opens database, starts features, tab bar
        ├── core/               ← Shared foundation (used by every feature)
        │   ├── db/
        │   │   ├── database.js     ← open DB, run/get/all helpers, logEvent
        │   │   ├── migrations.js   ← numbered DB changes (add-only!)
        │   │   └── schemaHelpers.js← ensureColumn
        │   ├── bus.js          ← features talk without knowing each other
        │   ├── settings.js     ← saved settings (getSetting / setSetting)
        │   ├── dates.js        ← date helpers
        │   ├── format.js       ← KES formatting (12,500 / 12.5k)
        │   └── theme.js        ← ALL colors and spacing
        ├── ui/                 ← Reusable building blocks (Button, Card, ChoiceRow, ProgressBar)
        └── features/           ← One folder per feature
            ├── registry.js     ← THE SWITCHBOARD: add/remove features here
            ├── today/
            │   ├── TodayScreen.js      ← FRONTEND: what you see
            │   ├── cards/              ← FRONTEND: pieces of the screen
            │   └── today.service.js    ← BACKEND: data + logic
            ├── money/
            │   ├── MoneyScreen.js      ← FRONTEND
            │   ├── EntrySheet.js       ← FRONTEND: the in/out/aside/take-out form
            │   ├── cards/              ← FRONTEND: Goal, Income, Spend, Pots, Recent
            │   ├── money.service.js    ← BACKEND: ledger + totals
            │   ├── money.goal.js       ← BRAIN: 100k path math, money ladder
            │   └── mpesa/
            │       ├── mpesa.parser.js ← BRAIN: reads one M-Pesa SMS (tested on real messages)
            │       ├── mpesa.service.js← BACKEND: SMS → waiting room → sorted → ledger
            │       └── mpesa.native.js ← bridge to modules/kesho-sms
            └── reminders/
                ├── RemindersScreen.js  ← FRONTEND
                ├── reminders.service.js← BACKEND: talks to Android notifications
                ├── reminders.plan.js   ← BRAIN: decides what to remind, when
                └── reminders.messages.js← all reminder texts (edit freely)
```

## Where is the backend?
Kesho has no server. The "backend" is inside each feature (`*.service.js`) and the
database is a file on your phone. This is on purpose: it works for a month with no internet.
If we ever add a server (e.g. cloud sync), it goes in `kesho/server/`.

## Rules
1. Screens never write SQL. Screens call `*.service.js`.
2. A feature never imports another feature. Share through `core/` or `core/bus.js`.
3. Database changes = a NEW numbered entry in `migrations.js`. Never edit old ones.
4. Every text/background color is set explicitly from `theme.js`.
5. New feature = new folder in `features/` + one line in `registry.js`.
6. Money is a ledger: one row per movement, totals always calculated. Deleting = soft delete.
7. M-Pesa: shop TILL money ("New Account balance") is business — never personal income.
   SMS never enter the ledger until Reuben sorts them. Same M-Pesa code never imported twice.

## How changes arrive
- Claude writes ONE document per change: `KESHO-MASTER.md` (the whole app) or `KESHO-UPDATE-NN.md`
  (only the changed files, each one complete).
- Copilot replaces those files inside this folder, runs the app, and commits.
- Reuben tests on the phone and reports back. Nothing is ever rebuilt in a new folder.
````

### FILE 12: docs/ROADMAP.md
_REPLACE_

````markdown
# Kesho — roadmap

Goal: income 10k → 100k KES/month by January 2028. Sleep, movement, peace of mind.
Design rule: built for the lazy, emotional Reuben — the productive Reuben doesn't need help.

## Done
- [x] Part 1 — Today screen: morning check-in, 1–3 tasks (carry-over), move, night check-in, no-guilt welcome
- [x] Part 2 — Reminders: smart plan (skips what's done, max 3/day, tapers when away), editable times, test button
- [x] Part 2 — Energy note: low-mood "minimum day", high-mood "hardest thing first"
- [x] Part 2 — Folder restructure (kesho/app/src/core|ui|features)
- [x] Part 3 — Money: income by source (+ fastest-growing, one-source risk), 100k goal path (16.6%/month), needs/wants, pots (emergency / pay myself / invest), pay-yourself-first 10% prompt, money ladder, recent list
- [x] Master — one folder `Desktop\kesho`, whole app in KESHO-MASTER.md, old folders archived

## Next
- [ ] Update 01 — Real Kesho APK (EAS build): works without the PC, full notifications
- [ ] Update 02 — Part 4: M-Pesa SMS auto-read (till = business, sort Need/Want, suggestions, fees, real balance)
- [ ] Part 5 — Sunday report: patterns between mood, sleep, movement, money
- [ ] Part 6 — Backup/restore to Google Drive (reminder every 7 days)

## Ideas parked (decide later)
- Food tracking
- Meditation timer
- Tapping a notification opens the exact card
- Starting balance of money already saved (before Kesho)
- Debts tracker (who I owe / who owes me)
- M-Pesa formats not yet seen in samples: agent withdrawal, airtime, Fuliza, reversal (send real samples)
- Shop till totals → link with Gas Hub (business side)
````
