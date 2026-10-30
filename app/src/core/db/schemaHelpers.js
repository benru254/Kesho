// Helpers used by migrations. Changes are ADDITIVE only:
// we add tables and columns, we never drop or reset your data.

export async function ensureColumn(db, table, column, definition) {
  const cols = await db.getAllAsync(`PRAGMA table_info(${table})`);
  const exists = cols.some((c) => c.name === column);
  if (!exists) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
  }
}
