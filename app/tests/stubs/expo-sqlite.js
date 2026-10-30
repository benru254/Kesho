// Test stand-in for expo-sqlite, using Node's built-in SQLite (in-memory). Same method names as the phone.
import { DatabaseSync } from 'node:sqlite';

export async function openDatabaseAsync() {
  const d = new DatabaseSync(':memory:');
  const clean = (p) => (p || []).map((v) => (v === undefined ? null : v));
  return {
    execAsync: async (sql) => d.exec(sql),
    runAsync: async (sql, p) => {
      const r = d.prepare(sql).run(...clean(p));
      return { lastInsertRowId: Number(r.lastInsertRowid), changes: r.changes };
    },
    getFirstAsync: async (sql, p) => d.prepare(sql).get(...clean(p)) ?? null,
    getAllAsync: async (sql, p) => d.prepare(sql).all(...clean(p)),
    withTransactionAsync: async (fn) => {
      d.exec('BEGIN');
      try {
        await fn();
        d.exec('COMMIT');
      } catch (e) {
        d.exec('ROLLBACK');
        throw e;
      }
    },
  };
}
