// Reads a file from tests/fixtures. (Tests run from a temporary folder, so the runner tells us where tests/ is.)
import fs from 'fs';
import path from 'path';

export function readFixture(name) {
  const dir = process.env.KESHO_TESTS_DIR;
  if (!dir) throw new Error('Run tests with: npm test');
  return fs.readFileSync(path.join(dir, 'fixtures', name), 'utf8');
}

export function fixtureLines(name) {
  return readFixture(name).split(/\r?\n/).filter((l) => l.trim());
}
