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
