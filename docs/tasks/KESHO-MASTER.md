# KESHO-MASTER.md — the complete Kesho app (version: Part 3 + organize)

**For Copilot.** This document is the single source of truth for the whole Kesho app.
It contains every file (40 files). You (Copilot) build ONE clean project folder from it.
Reuben only tests on his phone. Claude wrote this; do not change any code.

Project root: `C:\Users\reuben\Desktop\kesho`  — every path below is relative to it.

---

## STEP 1 — Stop everything
Stop all running Expo / Metro / node processes (ports 8081, 8082). Close any browser preview.

## STEP 2 — Inventory (change nothing yet)
List every folder on `C:\Users\reuben\Desktop` whose name contains `kesho` or `life-app`.
For each: does it contain a `package.json` (directly or in `app\`)? Show Reuben a short table.

## STEP 3 — Archive ALL old Kesho folders (move, never delete)
1. Create `C:\Users\reuben\Desktop\_kesho-archive` if missing.
2. Move EVERY folder from Step 2 into it with `Move-Item` — including any existing `kesho` folder.
   If a folder with the same name already exists in the archive, add `-old-2026-10-25` to the name.
3. After this, `C:\Users\reuben\Desktop\kesho` must NOT exist. Check it.

## STEP 4 — Create the project from this document
1. Create `C:\Users\reuben\Desktop\kesho`.
2. For EACH `### FILE NN: <path>` block below: create the file at that path (create folders as needed)
   and paste the block content EXACTLY (everything between the four-backtick fences, not the fences).
   - Use the editor / file-creation tool, UTF-8, no BOM. Never PowerShell Set-Content/Out-File.
   - Do not reformat, rename, reorder or "fix" anything.
3. Also save THIS document as `docs\KESHO-MASTER.md` (so the project keeps its own copy).
4. Check: the project has exactly these 40 files (plus docs\KESHO-MASTER.md, ignoring node_modules / .git):

```
01. .github/copilot-instructions.md
02. .gitignore
03. docs/STRUCTURE.md
04. docs/ROADMAP.md
05. app/package.json
06. app/app.json
07. app/App.js
08. app/src/App.js
09. app/src/core/theme.js
10. app/src/core/dates.js
11. app/src/core/format.js
12. app/src/core/bus.js
13. app/src/core/settings.js
14. app/src/core/db/schemaHelpers.js
15. app/src/core/db/migrations.js
16. app/src/core/db/database.js
17. app/src/features/registry.js
18. app/src/ui/Button.js
19. app/src/ui/Card.js
20. app/src/ui/ChoiceRow.js
21. app/src/ui/ProgressBar.js
22. app/src/features/money/EntrySheet.js
23. app/src/features/money/MoneyScreen.js
24. app/src/features/money/money.goal.js
25. app/src/features/money/money.service.js
26. app/src/features/reminders/RemindersScreen.js
27. app/src/features/reminders/reminders.messages.js
28. app/src/features/reminders/reminders.plan.js
29. app/src/features/reminders/reminders.service.js
30. app/src/features/today/TodayScreen.js
31. app/src/features/today/today.service.js
32. app/src/features/money/cards/GoalCard.js
33. app/src/features/money/cards/IncomeCard.js
34. app/src/features/money/cards/PotsCard.js
35. app/src/features/money/cards/RecentCard.js
36. app/src/features/money/cards/SpendCard.js
37. app/src/features/today/cards/MorningCard.js
38. app/src/features/today/cards/MoveCard.js
39. app/src/features/today/cards/NightCard.js
40. app/src/features/today/cards/TasksCard.js
```
If any is missing or extra, STOP and report.

## STEP 5 — Install packages (needs internet, ~3–10 min)
```
cd C:\Users\reuben\Desktop\kesho\app
npm install
```
Then run `npx expo install --check` and report its output. Do NOT run `npm audit fix`.
Warnings about "advisories/vulnerabilities" are normal — ignore them.

## STEP 6 — Compile check (catches errors before the phone)
```
cd C:\Users\reuben\Desktop\kesho\app
npx expo export --platform android
```
It must finish with no errors (it creates a `dist` folder; that is fine, git ignores it).
If it fails: STOP and report the full error text. Do not edit code.

## STEP 7 — Git restore point
```
cd C:\Users\reuben\Desktop\kesho
git init
git add .
git commit -m "KESHO-MASTER: one folder, Today + Reminders + Money"
```

## STEP 8 — Run for the phone
```
cd C:\Users\reuben\Desktop\kesho\app
npx expo start
```
LAN mode (default). NOT `--localhost`, NOT `--web`. Tell Reuben: "Scan the QR with Expo Go." Keep it running.

## STEP 9 — Only if the phone shows a problem
- **"Project is incompatible with this version of Expo Go"**: read the SDK number Expo Go supports
  from the message (e.g. 55). Run `npx expo install expo@^<N>.0.0`, then `npx expo install --fix`,
  then `npx expo start --clear`. Report versions before/after. (This is the ONE allowed package change.)
- **QR loads forever / can't connect**: PC and phone on the same Wi-Fi. If still stuck: `npx expo start --tunnel`
  (accept installing @expo/ngrok).
- **Red error screen on phone**: copy the full red-screen text + the Metro terminal output. Do NOT fix code.
- **`--clear` permission error on a temp folder**: run without `--clear`.

## STEP 10 — Report for Reuben to send to Claude
1. Inventory table (Step 2) and what was archived.
2. Results of Steps 5, 6 (pass/fail + exact errors).
3. Did the QR show? Any Step 9 action taken?

---

## FUTURE UPDATES (how we work from now on)
Claude will send `KESHO-UPDATE-NN.md` documents. Each one has numbered steps and `### FILE` blocks with
COMPLETE files. Apply them INSIDE `C:\Users\reuben\Desktop\kesho` — replace those files only, run Step 6
and Step 8, then commit after Reuben confirms. Never build a new folder again.

---

# FILES

### FILE 01: .github/copilot-instructions.md

````markdown
# Kesho — rules for Copilot

## Roles
- Claude = architect. Writes ALL code and the update documents (KESHO-MASTER.md, KESHO-UPDATE-NN.md).
- Copilot = does ALL file and terminal work, exactly as the document says.
- Reuben = tests on his Android phone and reports. Never ask Reuben to edit files or run commands.

## One project, forever
- Root: C:\Users\reuben\Desktop\kesho . Expo app in app\ . This is the ONLY Kesho folder.
- Never create kesho-partN, life-app, or any copy. Every update is applied INSIDE this folder.
- Old folders live in C:\Users\reuben\Desktop\_kesho-archive . Never use code from there.
- Target: ANDROID ONLY, real phone, Expo Go (later an APK built with EAS).
  Never run or fix for web (no --web, no react-native-web, no browser testing).

## Applying an update document from Claude
- Each file block in the document has a path header like `### FILE: app/src/core/theme.js`.
- Paths are relative to C:\Users\reuben\Desktop\kesho .
- Replace the WHOLE file with the block content (or create it if new). Never merge by hand,
  never keep old lines, never "improve" the code.
- "DELETE: <path>" lines mean: move that file to _kesho-archive\removed\ (never hard-delete).
- Follow the document's numbered steps in order. If a check fails, STOP and report the exact error.

## Never
- Never edit package.json / app.json or install packages unless the document says so.
  When it says install: `npx expo install <pkg>` only.
- Never run `npm audit fix` (breaks Expo versions).
- Never write files with PowerShell (Set-Content, Out-File, echo >). Use the editor, UTF-8.
- Never delete Reuben's folders or data. Archive with Move-Item.
- Never fix app code on your own initiative. Report errors to Claude through Reuben.

## Code rules (for reading, Claude writes the code)
- Every Text / TextInput / button: explicit color AND backgroundColor from app\src\core\theme.js.
- Screens never write SQL; they call *.service.js.
- Database changes = new numbered migration, add-only. Never edit an old migration.

## Run
- cd C:\Users\reuben\Desktop\kesho\app ; npx expo start   (LAN mode, shows QR for the phone)
- When Reuben confirms it works: cd C:\Users\reuben\Desktop\kesho ; git add . ; git commit -m "<update name>"
````

### FILE 02: .gitignore

````text
node_modules/
.expo/
dist/
web-build/
*.log
````

### FILE 03: docs/STRUCTURE.md

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
            │   └── money.goal.js       ← BRAIN: 100k path math, money ladder
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

## How changes arrive
- Claude writes ONE document per change: `KESHO-MASTER.md` (the whole app) or `KESHO-UPDATE-NN.md`
  (only the changed files, each one complete).
- Copilot replaces those files inside this folder, runs the app, and commits.
- Reuben tests on the phone and reports back. Nothing is ever rebuilt in a new folder.
````

### FILE 04: docs/ROADMAP.md

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
- [ ] Part 4 — M-Pesa SMS auto-read (needs real APK build via EAS)
- [ ] Part 5 — Sunday report: patterns between mood, sleep, movement, money
- [ ] Part 6 — Backup/restore to Google Drive (reminder every 7 days)

## Ideas parked (decide later)
- Food tracking
- Meditation timer
- Tapping a notification opens the exact card
- Starting balance of money already saved (before Kesho)
- Debts tracker (who I owe / who owes me)
````

### FILE 05: app/package.json

````json
{
  "name": "kesho",
  "version": "1.0.0",
  "private": true,
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android"
  },
  "dependencies": {
    "expo": "~54.0.0",
    "expo-notifications": "~0.32.0",
    "expo-sqlite": "~16.0.0",
    "expo-status-bar": "~3.0.0",
    "react": "19.1.0",
    "react-native": "0.81.5",
    "react-native-safe-area-context": "~5.6.0"
  }
}
````

### FILE 06: app/app.json

````json
{
  "expo": {
    "name": "Kesho",
    "slug": "kesho",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "backgroundColor": "#0B1220",
    "android": {
      "package": "com.kesho.app"
    },
    "plugins": [
      "expo-sqlite",
      [
        "expo-notifications",
        {
          "color": "#F5B841"
        }
      ]
    ]
  }
}
````

### FILE 07: app/App.js

````javascript
// Expo starts here. All real code lives in the src folder.
export { default } from './src/App';
````

### FILE 08: app/src/App.js

````javascript
// The app shell: opens the database, starts features, shows the tabs.
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { getDb } from './core/db/database';
import { features } from './features/registry';
import { colors, space } from './core/theme';

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(features[0].key);

  useEffect(() => {
    getDb()
      .then(() => {
        setReady(true);
        // Start each feature's background work (e.g. reminders). Never blocks the screen.
        features.forEach((f) => {
          if (f.init) f.init().catch((e) => console.warn(`[${f.key}] init failed`, e));
        });
      })
      .catch((e) => setError(String(e?.message || e)));
  }, []);

  const current = features.find((f) => f.key === active) || features[0];
  const Screen = current.Screen;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="light" />
        {error ? (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>Kesho could not open its database</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !ready ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : (
          <>
            <View style={styles.body}>
              <Screen />
            </View>
            {features.length > 1 && (
              <View style={styles.tabBar}>
                {features.map((f) => {
                  const on = f.key === active;
                  return (
                    <Pressable key={f.key} onPress={() => setActive(f.key)} style={styles.tab}>
                      <Text style={styles.tabIcon}>{f.icon}</Text>
                      <Text style={[styles.tabLabel, on && styles.tabLabelOn]}>{f.title}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, backgroundColor: colors.bg },
  errorTitle: { color: colors.warn, backgroundColor: 'transparent', fontSize: 17, fontWeight: '700', marginBottom: space.sm },
  errorText: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, textAlign: 'center' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: space.sm },
  tabIcon: { fontSize: 20, color: colors.text, backgroundColor: 'transparent' },
  tabLabel: { fontSize: 12, color: colors.muted, backgroundColor: 'transparent', marginTop: 2 },
  tabLabelOn: { color: colors.accent, fontWeight: '700' },
});
````

### FILE 09: app/src/core/theme.js

````javascript
// Kesho theme — every color the app uses lives here.
// Change a color once here and the whole app follows.

export const colors = {
  bg: '#0B1220',        // app background
  card: '#131C2E',      // card background
  cardAlt: '#1A2540',   // chips, inner boxes
  border: '#26324D',
  text: '#E8EEF9',      // main text
  muted: '#8A97B2',     // secondary text
  accent: '#F5B841',    // Kesho gold (sunrise)
  accentText: '#1A1300',// text on gold buttons
  good: '#3DD68C',      // done / win
  warn: '#FF8A5B',      // honest warnings
  inputBg: '#0F1830',
  placeholder: '#5D6A85',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const radius = { sm: 8, md: 12, lg: 16 };
````

### FILE 10: app/src/core/dates.js

````javascript
// Dates are stored as local "YYYY-MM-DD" keys (Nairobi time on your phone).

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const dt = keyToDate(key);
  dt.setDate(dt.getDate() + n);
  return dateKey(dt);
}

export function daysBetween(fromKey, toKey) {
  const ms = keyToDate(toKey) - keyToDate(fromKey);
  return Math.round(ms / 86400000);
}

export function prettyDate(key) {
  const d = keyToDate(key);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function isMonday(key) {
  return keyToDate(key).getDay() === 1;
}

export function isFirstOfMonth(key) {
  return keyToDate(key).getDate() === 1;
}

export function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
````

### FILE 11: app/src/core/format.js

````javascript
// Money formatting. Written by hand because some Android phones format numbers badly.

export function withCommas(n) {
  const neg = n < 0;
  const s = String(Math.round(Math.abs(n)));
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 === 0) out += ',';
    out += s[i];
  }
  return (neg ? '-' : '') + out;
}

export function kes(n) {
  return `KES ${withCommas(n || 0)}`;
}

// 12500 -> "12.5k", 1200000 -> "1.2M"
export function kesShort(n) {
  const a = Math.abs(n || 0);
  if (a >= 1e9) return `${trim(n / 1e9)}B`;
  if (a >= 1e6) return `${trim(n / 1e6)}M`;
  if (a >= 1e3) return `${trim(n / 1e3)}k`;
  return String(Math.round(n || 0));
}

function trim(x) {
  return (Math.round(x * 10) / 10).toString();
}

// Reads what you typed ("1,500" or "1500") into a whole number. Returns 0 if not a number.
export function parseAmount(text) {
  const n = parseInt(String(text).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}
````

### FILE 12: app/src/core/bus.js

````javascript
// A tiny message board between features.
// One feature shouts emit('event', data); any feature listening with on('event', fn) hears it.
// This keeps features separate: Today doesn't need to know Reminders exists.

const listeners = {};

export function on(name, fn) {
  if (!listeners[name]) listeners[name] = new Set();
  listeners[name].add(fn);
  return () => listeners[name].delete(fn);
}

export function emit(name, data) {
  const set = listeners[name];
  if (!set) return;
  set.forEach((fn) => {
    try {
      fn(data);
    } catch (e) {
      console.warn(`[bus] listener for "${name}" failed:`, e);
    }
  });
}
````

### FILE 13: app/src/core/settings.js

````javascript
// Simple saved settings (stored in the "settings" table as JSON).
// Any feature can use this: getSetting('key', default) / setSetting('key', value)

import { get, run } from './db/database';

export async function getSetting(key, fallback = null) {
  const row = await get('SELECT value FROM settings WHERE key = ?', [key]);
  if (!row || row.value == null) return fallback;
  try {
    return JSON.parse(row.value);
  } catch {
    return fallback;
  }
}

export async function setSetting(key, value) {
  await run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, JSON.stringify(value)]
  );
}
````

### FILE 14: app/src/core/db/schemaHelpers.js

````javascript
// Helpers used by migrations. Changes are ADDITIVE only:
// we add tables and columns, we never drop or reset your data.

export async function ensureColumn(db, table, column, definition) {
  const cols = await db.getAllAsync(`PRAGMA table_info(${table})`);
  const exists = cols.some((c) => c.name === column);
  if (!exists) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}
````

### FILE 15: app/src/core/db/migrations.js

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
  // Next change goes here as version 3. Pattern for adding a column:
  // { version: 3, name: '...', up: async (db) => { await ensureColumn(db, 'money_tx', 'tag', 'TEXT'); } },
];

export const _ensureColumn = ensureColumn;
````

### FILE 16: app/src/core/db/database.js

````javascript
// One database file on the phone: kesho.db
// Everything works offline. Nothing leaves the phone unless you back it up.

import * as SQLite from 'expo-sqlite';
import { migrations } from './migrations';
import { emit } from '../bus';

let dbPromise = null;

export function getDb() {
  if (!dbPromise) dbPromise = openAndMigrate();
  return dbPromise;
}

async function openAndMigrate() {
  const db = await SQLite.openDatabaseAsync('kesho.db');
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  await db.execAsync('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL);');

  const row = await db.getFirstAsync('SELECT version FROM schema_version LIMIT 1');
  let current = row ? row.version : 0;
  if (!row) await db.runAsync('INSERT INTO schema_version (version) VALUES (0)');

  for (const m of migrations) {
    if (m.version > current) {
      await db.withTransactionAsync(async () => {
        await m.up(db);
        await db.runAsync('UPDATE schema_version SET version = ?', [m.version]);
      });
      current = m.version;
    }
  }
  return db;
}

// Small helpers so features never touch SQLite directly.
export async function run(sql, params = []) {
  const db = await getDb();
  return db.runAsync(sql, params);
}

export async function get(sql, params = []) {
  const db = await getDb();
  return db.getFirstAsync(sql, params);
}

export async function all(sql, params = []) {
  const db = await getDb();
  return db.getAllAsync(sql, params);
}

export function nowIso() {
  return new Date().toISOString();
}

// Append-only activity log. Future reports read from here.
export async function logEvent(type, payload = null) {
  await run('INSERT INTO events (type, payload, created_at) VALUES (?, ?, ?)', [
    type,
    payload ? JSON.stringify(payload) : null,
    nowIso(),
  ]);
  // Tell any listening feature (e.g. reminders) that something happened.
  emit('event', { type, payload });
}
````

### FILE 17: app/src/features/registry.js

````javascript
// THE FEATURE SWITCHBOARD.
// To add a feature: build it in src/features/<name>/ and add one line here.
// To remove a feature: delete its line. Its data stays safe in the database.
// The bottom tab bar appears automatically once there are 2+ features.
//
// Each entry:
//   key     unique name
//   title   tab label
//   icon    tab emoji
//   Screen  what the tab shows
//   init    (optional) runs once when the app starts

import TodayScreen from './today/TodayScreen';
import MoneyScreen from './money/MoneyScreen';
import RemindersScreen from './reminders/RemindersScreen';
import { initReminders } from './reminders/reminders.service';

export const features = [
  { key: 'today', title: 'Today', icon: '☀️', Screen: TodayScreen },
  { key: 'money', title: 'Money', icon: '💰', Screen: MoneyScreen },
  // { key: 'report', title: 'Report', icon: '📊', Screen: ReportScreen },  // Part 5
  { key: 'reminders', title: 'Reminders', icon: '🔔', Screen: RemindersScreen, init: initReminders },
];
````

### FILE 18: app/src/ui/Button.js

````javascript
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
````

### FILE 19: app/src/ui/Card.js

````javascript
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
````

### FILE 20: app/src/ui/ChoiceRow.js

````javascript
import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors, space, radius } from '../core/theme';

// One-tap choice row.
// options: [{ value: 1, label: '😞' }, ...]
export default function ChoiceRow({ label, options, value, onChange }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => onChange(o.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: space.md },
  label: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginBottom: space.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    minWidth: 48,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.sm,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, backgroundColor: 'transparent', fontSize: 18 },
  chipTextSelected: { color: colors.accentText },
});
````

### FILE 21: app/src/ui/ProgressBar.js

````javascript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../core/theme';

// percent: 0–100. color: any theme color.
export default function ProgressBar({ percent, color = colors.accent, height = 10 }) {
  const p = Math.max(0, Math.min(100, percent || 0));
  return (
    <View style={[styles.track, { height }]}>
      <View style={[styles.fill, { width: `${p}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: colors.cardAlt, borderRadius: radius.sm, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.sm },
});
````

### FILE 22: app/src/features/money/EntrySheet.js

````javascript
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
````

### FILE 23: app/src/features/money/MoneyScreen.js

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

const ACTIONS = [
  { mode: 'in', label: '+ In', color: colors.good },
  { mode: 'out', label: '− Out', color: colors.text },
  { mode: 'aside', label: '⇢ Aside', color: colors.accent },
];

export default function MoneyScreen() {
  const [data, setData] = useState(null);
  const [mode, setMode] = useState(null);

  const load = useCallback(async () => {
    const month = monthKey();
    const [sources, buckets, summary, pots, recent, goal] = await Promise.all([
      getSources(), getBuckets(), getMonthSummary(month), getPots(), getRecent(month), getGoal(),
    ]);
    const status = monthStatus(goal, month, summary.totalIn, new Date().getDate());
    setData({ month, sources, buckets, summary, pots, recent, goal, status });
  }, []);

  useEffect(() => {
    load();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') load(); });
    return () => sub.remove();
  }, [load]);

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

### FILE 24: app/src/features/money/money.goal.js

````javascript
// THE GOAL MATH (pure logic — tested on its own).
//
// Your goal: grow monthly income from a starting point to a target by a date.
// The honest path is not a straight line: to 10x in ~15 months you must grow by the
// SAME PERCENT every month (compound growth). This file draws that path and tells you
// where you stand against it — no flattery.

export const DEFAULT_GOAL = {
  startMonth: '2026-10',
  startAmount: 10000,
  goalMonth: '2028-01',
  goalAmount: 100000,
};

export const MONEY_LADDER = [10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000];

export function monthKey(d = new Date()) {
  const m = d.getMonth() + 1;
  return `${d.getFullYear()}-${m < 10 ? '0' : ''}${m}`;
}

export function addMonths(key, n) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return monthKey(d);
}

export function monthsBetween(fromKey, toKey) {
  const [y1, m1] = fromKey.split('-').map(Number);
  const [y2, m2] = toKey.split('-').map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}

export function daysInMonth(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function monthName(key) {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m] = key.split('-').map(Number);
  return `${names[m - 1]} ${y}`;
}

// Monthly growth needed, e.g. 0.166 = 16.6% every month.
export function monthlyGrowthNeeded(goal) {
  const months = monthsBetween(goal.startMonth, goal.goalMonth);
  if (months <= 0 || goal.startAmount <= 0) return 0;
  return Math.pow(goal.goalAmount / goal.startAmount, 1 / months) - 1;
}

// What you should be earning in a given month to stay on the path.
export function targetFor(goal, key) {
  const total = monthsBetween(goal.startMonth, goal.goalMonth);
  const k = monthsBetween(goal.startMonth, key);
  if (k <= 0) return goal.startAmount;
  if (k >= total) return goal.goalAmount;
  return Math.round(goal.startAmount * Math.pow(1 + monthlyGrowthNeeded(goal), k));
}

// Where you stand this month. dayOfMonth = today's date number.
export function monthStatus(goal, key, earnedSoFar, dayOfMonth) {
  const target = targetFor(goal, key);
  const days = daysInMonth(key);
  const pace = dayOfMonth > 0 ? Math.round((earnedSoFar / dayOfMonth) * days) : 0;
  const gap = target - earnedSoFar;
  let verdict;
  if (earnedSoFar >= target) verdict = 'hit';
  else if (pace >= target) verdict = 'on_track';
  else verdict = 'behind';
  return {
    target,
    earned: earnedSoFar,
    pace,
    gap: Math.max(0, gap),
    daysLeft: days - dayOfMonth,
    percent: target > 0 ? Math.min(100, Math.round((earnedSoFar / target) * 100)) : 0,
    verdict,
  };
}

// Your current rung on the 1 → 1B ladder from your notebook.
export function ladderLevel(amount) {
  let reached = null;
  let next = MONEY_LADDER[0];
  for (const rung of MONEY_LADDER) {
    if (amount >= rung) reached = rung;
    else { next = rung; break; }
    next = null;
  }
  return { reached, next };
}
````

### FILE 25: app/src/features/money/money.service.js

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
export async function addTx({ date, type, amount, sourceId = null, bucketId = null, note = null }) {
  const n = Math.round(Number(amount));
  if (!n || n <= 0) throw new Error('Amount must be more than 0');
  if (type === 'in' && !sourceId) throw new Error('Pick where the money came from');
  if ((type === 'out' || type === 'aside') && !bucketId) throw new Error('Pick a bucket');
  const res = await run(
    `INSERT INTO money_tx (date, type, amount, source_id, bucket_id, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [date, type, n, sourceId, bucketId, note && note.trim() ? note.trim() : null, nowIso()]
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

### FILE 26: app/src/features/reminders/RemindersScreen.js

````javascript
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, Switch, Pressable, StyleSheet, AppState } from 'react-native';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { colors, space, radius } from '../../core/theme';
import { dateKey, addDays, prettyDate } from '../../core/dates';
import { SLOTS, fmtTime, shiftTime } from './reminders.plan';
import {
  getPermission, requestPermission, getTimes, saveTimes, syncReminders, sendTest,
} from './reminders.service';

export default function RemindersScreen() {
  const [perm, setPerm] = useState(null);
  const [times, setTimes] = useState(null);
  const [sync, setSync] = useState(null);
  const [testSent, setTestSent] = useState(false);

  const load = useCallback(async () => {
    const [p, t] = await Promise.all([getPermission(), getTimes()]);
    setPerm(p);
    setTimes(t);
    setSync(await syncReminders());
  }, []);

  useEffect(() => {
    load();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') load(); });
    return () => sub.remove();
  }, [load]);

  const update = async (slot, change) => {
    const next = { ...times, [slot]: { ...times[slot], ...change } };
    setTimes(next);
    setSync(await saveTimes(next));
  };

  const allow = async () => {
    await requestPermission();
    await load();
  };

  const test = async () => {
    await sendTest();
    setTestSent(true);
    setTimeout(() => setTestSent(false), 8000);
  };

  if (!perm || !times) return <View style={styles.screen} />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Reminders</Text>
      <Text style={styles.sub}>Max 3 a day. Fewer if you’re away — Kesho never spams you.</Text>

      {!perm.granted && (
        <Card title="⚠️ Notifications are off">
          <Text style={styles.body}>
            Without them, Kesho only works on days you remember it. Those are not the days you need it.
          </Text>
          <Button label="Allow notifications" onPress={allow} style={styles.mt} />
        </Card>
      )}

      {perm.granted && sync && (
        <View style={styles.nextBox}>
          <Text style={styles.nextLabel}>Next reminder</Text>
          <Text style={styles.nextText}>
            {sync.next ? `${whenLabel(sync.next.at)} · ${sync.next.body}` : 'Nothing left to remind you of. 👌'}
          </Text>
          <Text style={styles.nextCount}>{sync.count} planned over the next 30 days</Text>
        </View>
      )}

      {SLOTS.map((s) => {
        const t = times[s.key];
        return (
          <Card key={s.key}>
            <View style={styles.rowTop}>
              <View style={styles.flex}>
                <Text style={styles.slotTitle}>{s.label}</Text>
                <Text style={styles.slotHint}>{s.hint}</Text>
              </View>
              <Switch
                value={t.on}
                onValueChange={(v) => update(s.key, { on: v })}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={t.on ? colors.text : colors.muted}
              />
            </View>
            {t.on && (
              <View style={styles.timeRow}>
                <StepBtn label="−15" onPress={() => update(s.key, shiftTime(t, -15))} />
                <Text style={styles.time}>{fmtTime(t.h, t.m)}</Text>
                <StepBtn label="+15" onPress={() => update(s.key, shiftTime(t, 15))} />
              </View>
            )}
          </Card>
        );
      })}

      {perm.granted && (
        <Button
          label={testSent ? 'Sent — lock your phone and wait 5s' : 'Send a test reminder'}
          variant="ghost"
          onPress={test}
          disabled={testSent}
        />
      )}

      <Card title="If reminders don’t arrive" subtitle="Common on Tecno, Infinix, Itel, Xiaomi, Samsung">
        <Text style={styles.body}>
          Battery saver kills apps in the background. Fix it once:{'\n'}
          Settings → Apps → Expo Go (later: Kesho) → Battery → “No restrictions” / “Allow background activity”.{'\n'}
          On Tecno/Infinix also: Phone Master → Auto-start → turn it ON.
        </Text>
      </Card>
    </ScrollView>
  );
}

function StepBtn({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.step, pressed && styles.stepPressed]}>
      <Text style={styles.stepText}>{label}</Text>
    </Pressable>
  );
}

function whenLabel(at) {
  const key = dateKey(at);
  const today = dateKey();
  const time = fmtTime(at.getHours(), at.getMinutes());
  if (key === today) return `Today ${time}`;
  if (key === addDays(today, 1)) return `Tomorrow ${time}`;
  return `${prettyDate(key)} ${time}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 80 },
  h1: { color: colors.text, backgroundColor: 'transparent', fontSize: 24, fontWeight: '800' },
  sub: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, marginTop: 2, marginBottom: space.lg },
  body: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, lineHeight: 21 },
  mt: { marginTop: space.md },
  flex: { flex: 1 },
  nextBox: {
    backgroundColor: colors.cardAlt,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.lg,
  },
  nextLabel: { color: colors.accent, backgroundColor: 'transparent', fontSize: 12, fontWeight: '700' },
  nextText: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, marginTop: 2 },
  nextCount: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, marginTop: space.xs },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  slotTitle: { color: colors.text, backgroundColor: 'transparent', fontSize: 16, fontWeight: '700' },
  slotHint: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginTop: 2 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.md, gap: space.md },
  time: { color: colors.text, backgroundColor: 'transparent', fontSize: 26, fontWeight: '800', minWidth: 90, textAlign: 'center' },
  step: {
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  stepPressed: { opacity: 0.6 },
  stepText: { color: colors.text, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700' },
});
````

### FILE 27: app/src/features/reminders/reminders.messages.js

````javascript
// Every reminder text lives here. Edit freely — no other file needs to change.
// Several versions per reminder so your brain doesn't learn to ignore them.
// Rule: never guilt. Short. One clear action.

export const TITLES = {
  morning: '☀️ Kesho',
  move: '🚶 Move',
  night: '🌙 Close the day',
  back: '👋 Kesho',
};

export const MESSAGES = {
  morning: [
    'Morning, Reuben. 30-second check-in, then pick today’s 1–3 things.',
    'New day. How do you feel? Tap in and choose what matters.',
    'Before the noise starts: check in and pick your 3.',
    'Your day, your rules. 30 seconds to set it up.',
  ],
  morningFreshWeek: [
    'New week. Clean slate. Last week doesn’t count against you — check in and pick your 3.',
  ],
  morningFreshMonth: [
    'New month. Clean slate. Check in and set the tone for the next 30 days.',
  ],
  dontMissTwice: [
    'Yesterday slipped. That’s normal. Just don’t miss twice — one tap today keeps you on track.',
    'Missing one day is human. Missing two becomes a habit. 30 seconds today.',
  ],
  welcomeBack: [
    'No guilt, no catching up. Open Kesho — 30 seconds and you’re back.',
    'Kesho is still here. Today can be day one again.',
    'Whatever happened, the next 30 seconds are yours. Check in?',
    'You don’t need a perfect week. You need today. Tap in.',
  ],
  move: [
    '10-minute walk. Just 10. Shoes on.',
    'You’ve been sitting. 10 minutes outside — go.',
    'Move now, think clearer tonight. 10 minutes.',
    'A short walk beats a perfect workout you never do.',
  ],
  moveLow: [
    'Rough day? A 5-minute walk outside clears the head. That still counts.',
    'Low day. Step outside for 5 minutes. Fresh air, nothing more.',
  ],
  night: [
    'Close the day in 30 seconds, then phone down. Sleep at 23:00 protects tomorrow.',
    'Rate today, note one win, rest. Tomorrow is built tonight.',
    'Day’s done. Close it in Kesho and let your mind rest.',
  ],
  nightLow: [
    'Hard day. Just close it — rate it and rest. Tomorrow is new.',
    'Not every day is a good day. Close it, sleep early, try again tomorrow.',
  ],
};

// Picks a version based on the date, so it changes daily but stays stable if rescheduled.
export function pick(list, seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}
````

### FILE 28: app/src/features/reminders/reminders.plan.js

````javascript
// THE BRAIN OF REMINDERS (pure logic, no phone APIs — easy to test).
// Decides every reminder for the next 30 days, based on what you did today.
// The plan is rebuilt every time you open Kesho or tick something, so it always fits reality.
//
// Rules:
// - Today: only remind you of what you HAVEN'T done yet.
// - Low mood today: gentler move/night messages.
// - Normal days: up to 3 reminders (morning, move, night). Never more.
// - After 1 missed day: "don't miss twice" morning message.
// - After 2+ missed days: only ONE gentle "welcome back" a day (spam = you mute it).
// - After a week away: one every 3 days, then silence after 30 days.

import { addDays, keyToDate, isMonday, isFirstOfMonth } from '../../core/dates';
import { MESSAGES, TITLES, pick } from './reminders.messages';

export const DEFAULT_TIMES = {
  morning: { on: true, h: 6, m: 0 },
  move: { on: true, h: 17, m: 0 },
  night: { on: true, h: 22, m: 30 },
};

export const SLOTS = [
  { key: 'morning', label: 'Morning check-in', hint: 'Mood, sleep, pick your 1–3 things' },
  { key: 'move', label: 'Move', hint: '10-minute walk reminder' },
  { key: 'night', label: 'Close the day', hint: 'Stress + one win, then sleep' },
];

const HORIZON_DAYS = 30;
const DAILY_WELCOME_UNTIL = 7; // missed days 2–6: one a day
const TAPER_EVERY = 3;         // missed days 7+: one every 3 days

export function buildPlan({ now, todayKey, times, today }) {
  const items = [];
  const low = today.mood != null && today.mood <= 2;

  for (let d = 0; d <= HORIZON_DAYS; d++) {
    const key = addDays(todayKey, d);

    const add = (slot, kind, list) => {
      const t = times[slot];
      if (!t || !t.on) return;
      const at = keyToDate(key);
      at.setHours(t.h, t.m, 0, 0);
      if (at.getTime() <= now.getTime() + 30 * 1000) return; // already passed
      items.push({ at, slot, kind, title: TITLES[kind], body: pick(list, key + slot) });
    };

    if (d === 0) {
      if (!today.morningDone) add('morning', 'morning', MESSAGES.morning);
      if (!today.moved) add('move', 'move', low ? MESSAGES.moveLow : MESSAGES.move);
      if (!today.nightDone) add('night', 'night', low ? MESSAGES.nightLow : MESSAGES.night);
      continue;
    }

    // How many full days in a row you'd have missed before this day, if you stop now.
    const missed = today.active ? d - 1 : d;

    if (missed === 0) {
      const morningList = isFirstOfMonth(key)
        ? MESSAGES.morningFreshMonth
        : isMonday(key) ? MESSAGES.morningFreshWeek : MESSAGES.morning;
      add('morning', 'morning', morningList);
      add('move', 'move', MESSAGES.move);
      add('night', 'night', MESSAGES.night);
    } else if (missed === 1) {
      add('morning', 'back', MESSAGES.dontMissTwice);
      add('move', 'move', MESSAGES.move);
      add('night', 'night', MESSAGES.night);
    } else if (missed < DAILY_WELCOME_UNTIL || (missed - DAILY_WELCOME_UNTIL) % TAPER_EVERY === 0) {
      const slot = firstOnSlot(times);
      if (slot) add(slot, 'back', MESSAGES.welcomeBack);
    }
  }

  return items.sort((a, b) => a.at - b.at);
}

function firstOnSlot(times) {
  const s = SLOTS.find((x) => times[x.key] && times[x.key].on);
  return s ? s.key : null;
}

export function fmtTime(h, m) {
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
}

// Move a time by N minutes, wrapping around midnight.
export function shiftTime(t, minutes) {
  let total = (t.h * 60 + t.m + minutes) % 1440;
  if (total < 0) total += 1440;
  return { ...t, h: Math.floor(total / 60), m: total % 60 };
}
````

### FILE 29: app/src/features/reminders/reminders.service.js

````javascript
// Talks to the phone's notification system.
// The decisions live in reminders.plan.js — this file just carries them out.

import * as Notifications from 'expo-notifications';
import { AppState, Linking, Platform } from 'react-native';
import { get } from '../../core/db/database';
import { getSetting, setSetting } from '../../core/settings';
import { on } from '../../core/bus';
import { dateKey } from '../../core/dates';
import { buildPlan, DEFAULT_TIMES } from './reminders.plan';

const CHANNEL_ID = 'reminders';
const PLAN_PREFIX = 'kesho-plan-';
const TEST_ID = 'kesho-test';

let started = false;
let lastSignature = null;
let syncTimer = null;

// Runs once when the app starts (called from the feature registry).
export async function initReminders() {
  if (started) return;
  started = true;

  // Show reminders even while Kesho is open.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    // Android needs a channel BEFORE asking permission.
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Kesho reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
    });
  }

  await requestPermission();

  // Re-plan whenever you do something, or come back to the app.
  on('event', () => queueSync());
  AppState.addEventListener('change', (s) => {
    if (s === 'active') queueSync();
  });

  await syncReminders(true);
}

// ---------- Permission ----------

export async function getPermission() {
  const res = await Notifications.getPermissionsAsync();
  return { granted: res.status === 'granted', canAskAgain: res.canAskAgain !== false };
}

// Asks Android for permission. If Android won't ask again, opens the phone settings.
export async function requestPermission() {
  const current = await getPermission();
  if (current.granted) return current;
  if (!current.canAskAgain) {
    // Only Android can open its settings page. (Kesho is Android-only, this just avoids a crash elsewhere.)
    if (Platform.OS === 'android') await Linking.openSettings();
    return current;
  }
  const res = await Notifications.requestPermissionsAsync();
  return { granted: res.status === 'granted', canAskAgain: res.canAskAgain !== false };
}

// ---------- Times ----------

export async function getTimes() {
  const saved = await getSetting('reminder_times', null);
  return { ...DEFAULT_TIMES, ...(saved || {}) };
}

export async function saveTimes(times) {
  await setSetting('reminder_times', times);
  return syncReminders(true);
}

// ---------- Scheduling ----------

function queueSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncReminders().catch((e) => console.warn('[reminders] sync failed', e));
  }, 800);
}

// Reads today's progress (read-only look at the Today feature's table + the shared events log).
async function readToday(todayKey) {
  const day = await get('SELECT * FROM daily_log WHERE date = ?', [todayKey]);
  // Anything you logged today (check-in, task, money...) counts as showing up.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const actions = await get('SELECT COUNT(*) AS n FROM events WHERE created_at >= ?', [startOfToday.toISOString()]);
  const morningDone = !!(day && day.morning_done_at);
  const nightDone = !!(day && day.night_done_at);
  const moved = !!(day && day.moved);
  return {
    morningDone,
    nightDone,
    moved,
    mood: day ? day.mood : null,
    active: morningDone || nightDone || moved || actions.n > 0,
  };
}

export async function getPlan() {
  const now = new Date();
  const todayKey = dateKey(now);
  const [times, today] = await Promise.all([getTimes(), readToday(todayKey)]);
  return buildPlan({ now, todayKey, times, today });
}

// Cancels Kesho's old reminders and schedules the fresh plan.
// Returns { granted, count, next }.
export async function syncReminders(force = false) {
  const perm = await getPermission();
  if (!perm.granted) return { granted: false, count: 0, next: null };

  const plan = await getPlan();
  const signature = JSON.stringify(plan.map((p) => [p.at.getTime(), p.body]));
  if (!force && signature === lastSignature) {
    return { granted: true, count: plan.length, next: plan[0] || null };
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier && n.identifier.startsWith(PLAN_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );

  for (let i = 0; i < plan.length; i++) {
    const p = plan[i];
    await Notifications.scheduleNotificationAsync({
      identifier: `${PLAN_PREFIX}${i}`,
      content: { title: p.title, body: p.body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: p.at,
        channelId: CHANNEL_ID,
      },
    });
  }

  lastSignature = signature;
  await setSetting('reminders_last_sync', new Date().toISOString());
  return { granted: true, count: plan.length, next: plan[0] || null };
}

export async function sendTest() {
  await Notifications.scheduleNotificationAsync({
    identifier: TEST_ID,
    content: {
      title: '✅ Kesho test',
      body: 'Reminders work. Lock your phone and wait — this is how they will reach you.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: CHANNEL_ID,
    },
  });
}
````

### FILE 30: app/src/features/today/TodayScreen.js

````javascript
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, KeyboardAvoidingView, AppState } from 'react-native';
import { colors, space, radius } from '../../core/theme';
import { dateKey, prettyDate, greeting, isMonday, isFirstOfMonth } from '../../core/dates';
import {
  getDay, getTasks, getCarryOverCandidates, getWelcome, movedDaysThisWeek, energyNote,
} from './today.service';
import MorningCard from './cards/MorningCard';
import TasksCard from './cards/TasksCard';
import MoveCard from './cards/MoveCard';
import NightCard from './cards/NightCard';

export default function TodayScreen() {
  const [date, setDate] = useState(dateKey());
  const [state, setState] = useState(null);

  const load = useCallback(async () => {
    const today = dateKey();
    setDate(today);
    const [day, tasks, carry, welcome, weekCount] = await Promise.all([
      getDay(today),
      getTasks(today),
      getCarryOverCandidates(today),
      getWelcome(today),
      movedDaysThisWeek(today),
    ]);
    setState({ day, tasks, carry, welcome, weekCount });
  }, []);

  useEffect(() => {
    load();
    // Reload when you come back to the app (new day = fresh screen).
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') load(); });
    return () => sub.remove();
  }, [load]);

  if (!state) return <View style={styles.screen} />;

  const freshStart = isFirstOfMonth(date)
    ? 'New month. Clean slate.'
    : isMonday(date) ? 'New week. Clean slate.' : null;

  const energy = energyNote(state.day ? state.day.mood : null);

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.greet}>{greeting()}, Reuben</Text>
        <Text style={styles.date}>{prettyDate(date)}</Text>

        <View style={[styles.banner, state.welcome.kind === 'nudge' && styles.bannerNudge]}>
          <Text style={styles.bannerText}>{freshStart ? `${freshStart} ` : ''}{state.welcome.text}</Text>
        </View>

        {energy && (
          <View style={[styles.banner, energy.kind === 'low' ? styles.bannerLow : styles.bannerHigh]}>
            <Text style={styles.bannerText}>{energy.text}</Text>
          </View>
        )}

        {/* key={date} resets each card when the day changes */}
        <MorningCard key={`m-${date}-${state.day?.morning_done_at}`} date={date} day={state.day} onSaved={load} />
        <TasksCard date={date} tasks={state.tasks} carry={state.carry} onChanged={load} />
        <MoveCard key={`mv-${date}`} date={date} day={state.day} weekCount={state.weekCount} onChanged={load} />
        <NightCard key={`n-${date}-${state.day?.night_done_at}`} date={date} day={state.day} onSaved={load} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: 80 },
  greet: { color: colors.text, backgroundColor: 'transparent', fontSize: 24, fontWeight: '800' },
  date: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, marginTop: 2, marginBottom: space.lg },
  banner: {
    backgroundColor: colors.cardAlt,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.lg,
  },
  bannerNudge: { borderLeftColor: colors.warn },
  bannerLow: { borderLeftColor: colors.muted },
  bannerHigh: { borderLeftColor: colors.good },
  bannerText: { color: colors.text, backgroundColor: 'transparent', fontSize: 14 },
});
````

### FILE 31: app/src/features/today/today.service.js

````javascript
// All database logic for the Today screen. Screens call these, never SQL.

import { run, get, all, nowIso, logEvent } from '../../core/db/database';
import { addDays, daysBetween } from '../../core/dates';

const DAY_FIELDS = [
  'mood', 'sleep_hours', 'sleep_quality', 'moved', 'stress',
  'win_note', 'morning_done_at', 'night_done_at',
];

export const MAX_TASKS = 3;

export async function getDay(date) {
  return get('SELECT * FROM daily_log WHERE date = ?', [date]);
}

export async function saveDay(date, fields) {
  const keys = Object.keys(fields).filter((k) => DAY_FIELDS.includes(k));
  if (keys.length === 0) return;
  await run(
    'INSERT INTO daily_log (date, updated_at) VALUES (?, ?) ON CONFLICT(date) DO NOTHING',
    [date, nowIso()]
  );
  const setSql = keys.map((k) => `${k} = ?`).join(', ');
  await run(`UPDATE daily_log SET ${setSql}, updated_at = ? WHERE date = ?`, [
    ...keys.map((k) => fields[k]),
    nowIso(),
    date,
  ]);
}

// ---------- Check-ins ----------

export async function finishMorning(date, { mood, sleep_hours, sleep_quality }) {
  await saveDay(date, { mood, sleep_hours, sleep_quality, morning_done_at: nowIso() });
  await logEvent('morning_checkin', { date, mood, sleep_hours, sleep_quality });
}

export async function finishNight(date, { stress, win_note }) {
  await saveDay(date, { stress, win_note: win_note || null, night_done_at: nowIso() });
  await logEvent('night_checkin', { date, stress });
}

// Returns { firstEver: bool } so the screen can celebrate.
export async function setMoved(date, moved) {
  const before = await get('SELECT COUNT(*) AS n FROM daily_log WHERE moved = 1');
  await saveDay(date, { moved: moved ? 1 : 0 });
  await logEvent(moved ? 'moved' : 'moved_undo', { date });
  return { firstEver: moved && before.n === 0 };
}

export async function movedDaysThisWeek(today) {
  const from = addDays(today, -6);
  const row = await get(
    'SELECT COUNT(*) AS n FROM daily_log WHERE moved = 1 AND date BETWEEN ? AND ?',
    [from, today]
  );
  return row.n;
}

// ---------- Tasks ----------

export async function getTasks(date) {
  return all('SELECT * FROM tasks WHERE date = ? ORDER BY id', [date]);
}

export async function addTask(date, title) {
  const clean = title.trim();
  if (!clean) return;
  const count = await get('SELECT COUNT(*) AS n FROM tasks WHERE date = ?', [date]);
  if (count.n >= MAX_TASKS) return;
  await run('INSERT INTO tasks (date, title, created_at) VALUES (?, ?, ?)', [date, clean, nowIso()]);
}

export async function toggleTask(id, done) {
  await run('UPDATE tasks SET done = ?, done_at = ? WHERE id = ?', [
    done ? 1 : 0,
    done ? nowIso() : null,
    id,
  ]);
  await logEvent(done ? 'task_done' : 'task_undone', { id });
}

export async function deleteTask(id) {
  await run('DELETE FROM tasks WHERE id = ?', [id]);
}

// Unfinished tasks from the most recent earlier day that were not carried yet.
export async function getCarryOverCandidates(today) {
  const last = await get('SELECT MAX(date) AS d FROM tasks WHERE date < ?', [today]);
  if (!last || !last.d) return { fromDate: null, tasks: [] };
  const tasks = await all(
    'SELECT * FROM tasks WHERE date = ? AND done = 0 AND carried_to IS NULL ORDER BY id',
    [last.d]
  );
  return { fromDate: last.d, tasks };
}

export async function carryOver(today, tasks) {
  const existing = await get('SELECT COUNT(*) AS n FROM tasks WHERE date = ?', [today]);
  const room = Math.max(0, MAX_TASKS - existing.n);
  for (const t of tasks.slice(0, room)) {
    await run('INSERT INTO tasks (date, title, created_at) VALUES (?, ?, ?)', [today, t.title, nowIso()]);
  }
  for (const t of tasks) {
    await run('UPDATE tasks SET carried_to = ? WHERE id = ?', [today, t.id]);
  }
}

export async function dismissCarryOver(tasks) {
  for (const t of tasks) {
    await run("UPDATE tasks SET carried_to = 'dropped' WHERE id = ?", [t.id]);
  }
}

// ---------- Welcome message (no guilt, ever) ----------

export async function getWelcome(today) {
  const total = await get('SELECT COUNT(*) AS n FROM daily_log WHERE morning_done_at IS NOT NULL OR night_done_at IS NOT NULL');
  const last = await get(
    'SELECT MAX(date) AS d FROM daily_log WHERE date < ? AND (morning_done_at IS NOT NULL OR night_done_at IS NOT NULL)',
    [today]
  );
  const daysLogged = total.n;

  if (daysLogged === 0 && (!last || !last.d)) {
    return { kind: 'first', text: 'Day one. Start small: one check-in is a win.', daysLogged };
  }
  if (last && last.d) {
    const gap = daysBetween(last.d, today);
    if (gap === 2) {
      return { kind: 'nudge', text: 'You missed yesterday. That is normal. Just don’t miss twice — today counts.', daysLogged };
    }
    if (gap > 2) {
      return { kind: 'back', text: `Welcome back. ${gap - 1} days away — no problem. Fresh start today.`, daysLogged };
    }
  }
  return { kind: 'normal', text: `Day ${daysLogged + (await isTodayLogged(today) ? 0 : 1)} of showing up for yourself.`, daysLogged };
}

async function isTodayLogged(today) {
  const row = await getDay(today);
  return !!(row && (row.morning_done_at || row.night_done_at));
}

// ---------- Energy note (you are unpredictable — the plan bends, it doesn't break) ----------

export function energyNote(mood) {
  if (mood == null) return null;
  if (mood <= 2) {
    return { kind: 'low', text: 'Low-energy day. The minimum: one task + close the day tonight. That counts as a full win.' };
  }
  if (mood === 5) {
    return { kind: 'high', text: 'High energy today. Spend it on the hardest, most important thing first.' };
  }
  return null;
}
````

### FILE 32: app/src/features/money/cards/GoalCard.js

````javascript
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import ProgressBar from '../../../ui/ProgressBar';
import { colors, space, radius } from '../../../core/theme';
import { kes, parseAmount } from '../../../core/format';
import { monthName, monthlyGrowthNeeded, monthsBetween, monthKey } from '../money.goal';
import { saveGoal } from '../money.service';

const VERDICT = {
  hit: { color: colors.good, text: 'Target hit this month. 🔥' },
  on_track: { color: colors.good, text: 'On track — if money keeps coming at this speed.' },
  behind: { color: colors.warn, text: 'Behind.' },
};

export default function GoalCard({ goal, status, totalInLast, onChanged }) {
  const [editing, setEditing] = useState(false);
  const growth = Math.round(monthlyGrowthNeeded(goal) * 1000) / 10;
  const v = VERDICT[status.verdict];
  const monthsLeft = monthsBetween(monthKey(), goal.goalMonth);

  if (editing) {
    return <GoalEdit goal={goal} onDone={() => { setEditing(false); onChanged(); }} />;
  }

  return (
    <Card
      title={`Goal: ${kes(goal.goalAmount)}/month by ${monthName(goal.goalMonth)}`}
      subtitle={`${monthsLeft} months left · needs +${growth}% income every month`}
    >
      <View style={styles.row}>
        <Text style={styles.earned}>{kes(status.earned)}</Text>
        <Text style={styles.of}>of {kes(status.target)} this month</Text>
      </View>
      <ProgressBar percent={status.percent} color={v.color} />
      <Text style={[styles.verdict, { color: v.color }]}>
        {v.text}
        {status.verdict === 'behind' ? ` Need ${kes(status.gap)} more in ${status.daysLeft} days.` : ''}
      </Text>
      <Text style={styles.small}>
        At this speed: ~{kes(status.pace)} this month · Last month: {kes(totalInLast)}
      </Text>
      <Button label="Edit goal" variant="ghost" onPress={() => setEditing(true)} style={styles.edit} />
    </Card>
  );
}

function GoalEdit({ goal, onDone }) {
  const [start, setStart] = useState(String(goal.startAmount));
  const [target, setTarget] = useState(String(goal.goalAmount));
  const [month, setMonth] = useState(goal.goalMonth);

  const save = async () => {
    const s = parseAmount(start);
    const t = parseAmount(target);
    if (!/^\d{4}-\d{2}$/.test(month) || monthsBetween(goal.startMonth, month) < 1) {
      Alert.alert('Check the date', 'Use the format YYYY-MM, after the start month.');
      return;
    }
    if (s <= 0 || t <= s) {
      Alert.alert('Check the amounts', 'The goal must be bigger than where you start.');
      return;
    }
    await saveGoal({ ...goal, startAmount: s, goalAmount: t, goalMonth: month });
    onDone();
  };

  return (
    <Card title="Edit goal" subtitle={`Path starts ${monthName(goal.startMonth)}`}>
      <Field label="Monthly income at start (KES)" value={start} onChange={setStart} numeric />
      <Field label="Monthly income goal (KES)" value={target} onChange={setTarget} numeric />
      <Field label="Reach it by (YYYY-MM)" value={month} onChange={setMonth} />
      <Button label="Save goal" onPress={save} style={styles.mt} />
      <Button label="Cancel" variant="ghost" onPress={onDone} style={styles.mtSm} />
    </Card>
  );
}

function Field({ label, value, onChange, numeric }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={numeric ? 'number-pad' : 'default'}
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: space.sm, marginBottom: space.sm },
  earned: { color: colors.text, backgroundColor: 'transparent', fontSize: 26, fontWeight: '800' },
  of: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14 },
  verdict: { backgroundColor: 'transparent', fontSize: 14, fontWeight: '700', marginTop: space.sm },
  small: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, marginTop: space.xs },
  edit: { marginTop: space.md, alignSelf: 'flex-start', paddingVertical: space.sm },
  field: { marginBottom: space.md },
  label: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginBottom: space.xs },
  input: {
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: 16,
  },
  mt: { marginTop: space.sm },
  mtSm: { marginTop: space.sm },
});
````

### FILE 33: app/src/features/money/cards/IncomeCard.js

````javascript
// Where your money comes from — and which source is growing.
// This card is the real 10x tool: put more time into the source that grows fastest.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import ProgressBar from '../../../ui/ProgressBar';
import { colors, space } from '../../../core/theme';
import { kes } from '../../../core/format';

export default function IncomeCard({ summary }) {
  const { income, totalIn } = summary;

  if (income.length === 0) {
    return (
      <Card title="Income sources">
        <Text style={styles.empty}>No income logged yet. Tap “+ Money in” when money becomes yours.</Text>
      </Card>
    );
  }

  const fastest = findFastest(income);
  const top = income[0];
  const topShare = totalIn > 0 ? Math.round((top.total / totalIn) * 100) : 0;

  return (
    <Card title="Income sources" subtitle="This month vs last month">
      {income.map((s) => {
        const share = totalIn > 0 ? Math.round((s.total / totalIn) * 100) : 0;
        return (
          <View key={s.id} style={styles.item}>
            <View style={styles.row}>
              <Text style={styles.name}>{s.name}</Text>
              <Text style={styles.amount}>{kes(s.total)}</Text>
            </View>
            <ProgressBar percent={share} color={colors.good} height={6} />
            <Text style={styles.change}>{changeText(s)}</Text>
          </View>
        );
      })}

      {fastest && (
        <Text style={styles.insight}>
          📈 Fastest growing: {fastest.name} ({fastest.label}). Feed it more of your time.
        </Text>
      )}
      {income.length >= 1 && topShare >= 80 && totalIn > 0 && (
        <Text style={styles.warn}>
          ⚠️ {topShare}% of your income comes from one source. If it has a bad month, so do you. Build a second one.
        </Text>
      )}
    </Card>
  );
}

function changeText(s) {
  if (s.last === 0 && s.total > 0) return 'New this month';
  if (s.last === 0) return '';
  const pct = Math.round(((s.total - s.last) / s.last) * 100);
  if (pct === 0) return `Same as last month (${kes(s.last)})`;
  return `${pct > 0 ? '+' : ''}${pct}% vs last month (${kes(s.last)})`;
}

function findFastest(income) {
  let best = null;
  for (const s of income) {
    if (s.last <= 0 || s.total <= s.last) continue;
    const growth = (s.total - s.last) / s.last;
    if (!best || growth > best.growth) {
      best = { name: s.name, growth, label: `+${Math.round(growth * 100)}%` };
    }
  }
  return best;
}

const styles = StyleSheet.create({
  empty: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14 },
  item: { marginBottom: space.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.xs },
  name: { color: colors.text, backgroundColor: 'transparent', fontSize: 15, flex: 1 },
  amount: { color: colors.text, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700' },
  change: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, marginTop: 2 },
  insight: { color: colors.good, backgroundColor: 'transparent', fontSize: 13, marginTop: space.xs, lineHeight: 19 },
  warn: { color: colors.warn, backgroundColor: 'transparent', fontSize: 13, marginTop: space.sm, lineHeight: 19 },
});
````

### FILE 34: app/src/features/money/cards/PotsCard.js

````javascript
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
````

### FILE 35: app/src/features/money/cards/RecentCard.js

````javascript
import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import Card from '../../../ui/Card';
import { colors, space } from '../../../core/theme';
import { kes } from '../../../core/format';
import { keyToDate } from '../../../core/dates';
import { deleteTx } from '../money.service';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RecentCard({ rows, onChanged }) {
  if (rows.length === 0) return null;

  const remove = (r) => {
    Alert.alert('Delete this entry?', `${label(r)} · ${kes(Math.abs(r.amount))}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTx(r.id); onChanged(); } },
    ]);
  };

  return (
    <Card title="Recent" subtitle="This month">
      {rows.map((r) => {
        const look = style(r);
        const d = keyToDate(r.date);
        return (
          <View key={r.id} style={styles.row}>
            <Text style={styles.date}>{DAYS[d.getDay()]} {d.getDate()}</Text>
            <View style={styles.mid}>
              <Text style={styles.label} numberOfLines={1}>{label(r)}</Text>
              {r.note ? <Text style={styles.note} numberOfLines={1}>{r.note}</Text> : null}
            </View>
            <Text style={[styles.amount, { color: look.color }]}>{look.sign}{kes(Math.abs(r.amount))}</Text>
            <Pressable onPress={() => remove(r)} hitSlop={10}>
              <Text style={styles.x}>✕</Text>
            </Pressable>
          </View>
        );
      })}
    </Card>
  );
}

function label(r) {
  if (r.type === 'in') return r.source_name || 'Income';
  if (r.type === 'out') return r.bucket_name || 'Spending';
  return r.amount < 0 ? `Out of ${r.bucket_name}` : `Into ${r.bucket_name}`;
}

function style(r) {
  if (r.type === 'in') return { sign: '+', color: colors.good };
  if (r.type === 'out') return { sign: '−', color: colors.text };
  return r.amount < 0 ? { sign: '⇠', color: colors.warn } : { sign: '⇢', color: colors.accent };
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm, gap: space.sm },
  date: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12, width: 48 },
  mid: { flex: 1 },
  label: { color: colors.text, backgroundColor: 'transparent', fontSize: 14 },
  note: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12 },
  amount: { backgroundColor: 'transparent', fontSize: 14, fontWeight: '700' },
  x: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, paddingHorizontal: space.xs },
});
````

### FILE 36: app/src/features/money/cards/SpendCard.js

````javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import { colors, space, radius } from '../../../core/theme';
import { kes } from '../../../core/format';

export default function SpendCard({ summary }) {
  const { spend, totalIn, totalOut, totalAside, left } = summary;
  const wants = spend.find((s) => s.key === 'wants');
  const wantsShare = totalOut > 0 && wants ? Math.round((wants.total / totalOut) * 100) : 0;

  return (
    <Card title="This month's flow">
      <View style={styles.grid}>
        <Box label="In" value={kes(totalIn)} color={colors.good} />
        <Box label="Out" value={kes(totalOut)} color={colors.text} />
        <Box label="Put aside" value={kes(totalAside)} color={colors.accent} />
      </View>

      {spend.map((s) => (
        <View key={s.id} style={styles.row}>
          <Text style={styles.name}>{s.name}</Text>
          <Text style={styles.amount}>{kes(s.total)}</Text>
        </View>
      ))}

      <View style={[styles.row, styles.leftRow]}>
        <Text style={styles.leftLabel}>Left (In − Out − Aside)</Text>
        <Text style={[styles.leftValue, left < 0 && styles.neg]}>{kes(left)}</Text>
      </View>
      <Text style={styles.small}>This is this month’s flow, not your M-Pesa balance.</Text>

      {left < 0 && totalIn > 0 && (
        <Text style={styles.warn}>
          ⚠️ You used {kes(-left)} more than you earned this month. It came from old money or debt.
        </Text>
      )}
      {wantsShare >= 30 && (
        <Text style={styles.warn}>
          ⚠️ Wants are {wantsShare}% of your spending. Under 20% is where savings start to grow.
        </Text>
      )}
    </Card>
  );
}

function Box({ label, value, color }) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxLabel}>{label}</Text>
      <Text style={[styles.boxValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: space.sm, marginBottom: space.md },
  box: { flex: 1, backgroundColor: colors.cardAlt, borderRadius: radius.md, padding: space.sm },
  boxLabel: { color: colors.muted, backgroundColor: 'transparent', fontSize: 12 },
  boxValue: { backgroundColor: 'transparent', fontSize: 15, fontWeight: '800', marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.xs },
  name: { color: colors.text, backgroundColor: 'transparent', fontSize: 15 },
  amount: { color: colors.text, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700' },
  leftRow: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: space.sm, paddingTop: space.sm },
  leftLabel: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14 },
  leftValue: { color: colors.good, backgroundColor: 'transparent', fontSize: 15, fontWeight: '800' },
  neg: { color: colors.warn },
  small: { color: colors.placeholder, backgroundColor: 'transparent', fontSize: 11, marginTop: 2 },
  warn: { color: colors.warn, backgroundColor: 'transparent', fontSize: 13, marginTop: space.sm, lineHeight: 19 },
});
````

### FILE 37: app/src/features/today/cards/MorningCard.js

````javascript
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import ChoiceRow from '../../../ui/ChoiceRow';
import Button from '../../../ui/Button';
import { colors, space } from '../../../core/theme';
import { finishMorning } from '../today.service';

const MOODS = [
  { value: 1, label: '😞' },
  { value: 2, label: '😕' },
  { value: 3, label: '😐' },
  { value: 4, label: '🙂' },
  { value: 5, label: '😄' },
];
const SLEEP_HOURS = [4, 5, 6, 7, 8, 9].map((h) => ({ value: h, label: h === 9 ? '9+' : `${h}` }));
const SLEEP_QUALITY = [
  { value: 1, label: 'Bad' },
  { value: 2, label: 'Okay' },
  { value: 3, label: 'Good' },
];

export default function MorningCard({ date, day, onSaved }) {
  const done = !!(day && day.morning_done_at);
  const [editing, setEditing] = useState(false);
  const [mood, setMood] = useState(day?.mood ?? null);
  const [hours, setHours] = useState(day?.sleep_hours ?? null);
  const [quality, setQuality] = useState(day?.sleep_quality ?? null);

  if (done && !editing) {
    const moodLabel = MOODS.find((m) => m.value === day.mood)?.label ?? '–';
    const q = SLEEP_QUALITY.find((s) => s.value === day.sleep_quality)?.label ?? '–';
    return (
      <Card title="Morning check-in" done>
        <Text style={styles.summary}>
          Mood {moodLabel}   ·   Slept {day.sleep_hours ?? '–'}h ({q})
        </Text>
        <Button label="Edit" variant="ghost" onPress={() => setEditing(true)} style={styles.editBtn} />
      </Card>
    );
  }

  const save = async () => {
    await finishMorning(date, { mood, sleep_hours: hours, sleep_quality: quality });
    setEditing(false);
    onSaved();
  };

  return (
    <Card title="Morning check-in" subtitle="30 seconds. Be honest — nobody sees this but you.">
      <ChoiceRow label="How do you feel?" options={MOODS} value={mood} onChange={setMood} />
      <ChoiceRow label="Hours slept" options={SLEEP_HOURS} value={hours} onChange={setHours} />
      <ChoiceRow label="Sleep quality" options={SLEEP_QUALITY} value={quality} onChange={setQuality} />
      <View>
        <Button label="Done" onPress={save} disabled={mood === null} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: { color: colors.text, backgroundColor: 'transparent', fontSize: 15 },
  editBtn: { marginTop: space.md, alignSelf: 'flex-start', paddingVertical: space.sm },
});
````

### FILE 38: app/src/features/today/cards/MoveCard.js

````javascript
import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import { colors, space } from '../../../core/theme';
import { setMoved } from '../today.service';

export default function MoveCard({ date, day, weekCount, onChanged }) {
  const moved = !!(day && day.moved);
  const [firstEver, setFirstEver] = useState(false);

  const toggle = async () => {
    const res = await setMoved(date, !moved);
    setFirstEver(res.firstEver);
    onChanged();
  };

  return (
    <Card
      title="Move 10 minutes"
      subtitle="A walk counts. Starting tiny is the whole trick."
      done={moved}
    >
      {moved ? (
        <>
          <Text style={styles.win}>
            {firstEver ? 'First time ever. This is how it starts. 🏆' : 'Done. Your body thanks you.'}
          </Text>
          <Text style={styles.week}>This week: {weekCount} of 7 days</Text>
          <Button label="Undo" variant="ghost" onPress={toggle} style={styles.undo} />
        </>
      ) : (
        <>
          <Text style={styles.week}>This week: {weekCount} of 7 days</Text>
          <Button label="I moved today ✓" onPress={toggle} style={styles.mainBtn} />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  win: { color: colors.good, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700' },
  week: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginTop: space.xs },
  undo: { marginTop: space.md, alignSelf: 'flex-start', paddingVertical: space.sm },
  mainBtn: { marginTop: space.md },
});
````

### FILE 39: app/src/features/today/cards/NightCard.js

````javascript
import React, { useState } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import ChoiceRow from '../../../ui/ChoiceRow';
import Button from '../../../ui/Button';
import { colors, space, radius } from '../../../core/theme';
import { finishNight } from '../today.service';

const STRESS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
];

export default function NightCard({ date, day, onSaved }) {
  const done = !!(day && day.night_done_at);
  const [editing, setEditing] = useState(false);
  const [stress, setStress] = useState(day?.stress ?? null);
  const [note, setNote] = useState(day?.win_note ?? '');

  if (done && !editing) {
    return (
      <Card title="Night check-in" done>
        <Text style={styles.summary}>Stress {day.stress}/5</Text>
        {day.win_note ? <Text style={styles.note}>“{day.win_note}”</Text> : null}
        <Button label="Edit" variant="ghost" onPress={() => setEditing(true)} style={styles.editBtn} />
      </Card>
    );
  }

  const save = async () => {
    await finishNight(date, { stress, win_note: note.trim() });
    setEditing(false);
    onSaved();
  };

  return (
    <Card title="Night check-in" subtitle="Before sleep. Close the day, then rest.">
      <ChoiceRow label="Stress today (1 = calm, 5 = heavy)" options={STRESS} value={stress} onChange={setStress} />
      <Text style={styles.label}>One thing that mattered today (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Finished the Gas Hub fix"
        placeholderTextColor={colors.placeholder}
        style={styles.input}
        maxLength={140}
      />
      <Button label="Close the day" onPress={save} disabled={stress === null} />
    </Card>
  );
}

const styles = StyleSheet.create({
  summary: { color: colors.text, backgroundColor: 'transparent', fontSize: 15 },
  note: { color: colors.muted, backgroundColor: 'transparent', fontSize: 14, marginTop: space.xs, fontStyle: 'italic' },
  editBtn: { marginTop: space.md, alignSelf: 'flex-start', paddingVertical: space.sm },
  label: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginBottom: space.sm },
  input: {
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: 15,
    marginBottom: space.md,
  },
});
````

### FILE 40: app/src/features/today/cards/TasksCard.js

````javascript
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import { colors, space, radius } from '../../../core/theme';
import {
  MAX_TASKS, addTask, toggleTask, deleteTask, carryOver, dismissCarryOver,
} from '../today.service';

export default function TasksCard({ date, tasks, carry, onChanged }) {
  const [text, setText] = useState('');
  const doneCount = tasks.filter((t) => t.done).length;
  const full = tasks.length >= MAX_TASKS;
  const allDone = tasks.length > 0 && doneCount === tasks.length;

  const add = async () => {
    if (!text.trim()) return;
    await addTask(date, text);
    setText('');
    onChanged();
  };

  return (
    <Card
      title="Today's important things"
      subtitle={tasks.length ? `${doneCount} of ${tasks.length} done` : 'Pick 1–3. Not 10. Three is enough to change a life.'}
      done={allDone}
    >
      {carry.tasks.length > 0 && (
        <View style={styles.carryBox}>
          <Text style={styles.carryText}>
            {carry.tasks.length} unfinished from last time: {carry.tasks.map((t) => t.title).join(', ')}
          </Text>
          <View style={styles.carryRow}>
            <Button
              label="Bring to today"
              onPress={async () => { await carryOver(date, carry.tasks); onChanged(); }}
              style={styles.flex}
            />
            <Button
              label="Let go"
              variant="ghost"
              onPress={async () => { await dismissCarryOver(carry.tasks); onChanged(); }}
              style={styles.flex}
            />
          </View>
        </View>
      )}

      {tasks.map((t) => (
        <View key={t.id} style={styles.taskRow}>
          <Pressable
            onPress={async () => { await toggleTask(t.id, !t.done); onChanged(); }}
            style={[styles.check, t.done && styles.checkOn]}
          >
            <Text style={styles.checkMark}>{t.done ? '✓' : ''}</Text>
          </Pressable>
          <Text style={[styles.taskText, t.done && styles.taskDone]}>{t.title}</Text>
          <Pressable onPress={async () => { await deleteTask(t.id); onChanged(); }} hitSlop={10}>
            <Text style={styles.remove}>✕</Text>
          </Pressable>
        </View>
      ))}

      {!full ? (
        <View style={styles.addRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What matters most today?"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
            onSubmitEditing={add}
            returnKeyType="done"
          />
          <Button label="Add" onPress={add} disabled={!text.trim()} />
        </View>
      ) : (
        !allDone && <Text style={styles.hint}>3 is the limit. Finish these before adding more.</Text>
      )}

      {allDone && <Text style={styles.win}>All done. That is a real win today. 🔥</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  carryBox: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    padding: space.md,
    marginBottom: space.md,
  },
  carryText: { color: colors.text, backgroundColor: 'transparent', fontSize: 14, marginBottom: space.sm },
  carryRow: { flexDirection: 'row', gap: space.sm },
  flex: { flex: 1 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.sm, gap: space.md },
  check: {
    width: 28, height: 28, borderRadius: 6,
    borderWidth: 2, borderColor: colors.muted,
    backgroundColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.good, borderColor: colors.good },
  checkMark: { color: colors.bg, backgroundColor: 'transparent', fontWeight: '900', fontSize: 16 },
  taskText: { flex: 1, color: colors.text, backgroundColor: 'transparent', fontSize: 16 },
  taskDone: { color: colors.muted, textDecorationLine: 'line-through' },
  remove: { color: colors.muted, backgroundColor: 'transparent', fontSize: 16, paddingHorizontal: space.xs },
  addRow: { flexDirection: 'row', gap: space.sm, marginTop: space.sm, alignItems: 'center' },
  input: {
    flex: 1,
    color: colors.text,
    backgroundColor: colors.inputBg,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: 15,
  },
  hint: { color: colors.muted, backgroundColor: 'transparent', fontSize: 13, marginTop: space.sm },
  win: { color: colors.good, backgroundColor: 'transparent', fontSize: 15, fontWeight: '700', marginTop: space.md },
});
````
