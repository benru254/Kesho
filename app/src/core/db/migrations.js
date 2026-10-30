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

