// Kesho test runner:  npm test   (from the app folder)
// Bundles each tests/*.test.js with esbuild (phone packages swapped for tests/stubs) and runs it with Node.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildSync } = require('esbuild');

const DIR = __dirname;
const STUBS = path.join(DIR, 'stubs');
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'kesho-tests-'));

// Database tests need Node's built-in SQLite (Node 22+). Some Node 22 versions need a flag.
function sqliteFlags() {
  const tryRun = (flags) =>
    spawnSync(process.execPath, [...flags, '-e', "require('node:sqlite')"], { encoding: 'utf8' }).status === 0;
  if (tryRun([])) return [];
  if (tryRun(['--experimental-sqlite'])) return ['--experimental-sqlite'];
  return null;
}
const SQLITE = sqliteFlags();

const tests = fs.readdirSync(DIR).filter((f) => f.endsWith('.test.js')).sort();
let failed = 0;
let skipped = 0;

console.log(`Kesho tests (${tests.length} files, Node ${process.versions.node})\n`);

for (const file of tests) {
  const src = path.join(DIR, file);
  const needsDb = fs.readFileSync(src, 'utf8').includes('// needs: sqlite');
  if (needsDb && SQLITE === null) {
    console.log(`SKIP  ${file}  (needs Node 22+ for SQLite)`);
    skipped++;
    continue;
  }
  const outfile = path.join(OUT, file.replace(/\.js$/, '.mjs'));
  try {
    buildSync({
      entryPoints: [src],
      bundle: true,
      platform: 'node',
      format: 'esm',
      outfile,
      logLevel: 'error',
      alias: {
        'expo-sqlite': path.join(STUBS, 'expo-sqlite.js'),
        'react-native': path.join(STUBS, 'react-native.js'),
        expo: path.join(STUBS, 'expo.js'),
      },
    });
  } catch (e) {
    console.log(`FAIL  ${file}  (could not build: ${e.message})`);
    failed++;
    continue;
  }
  console.log(`RUN   ${file}`);
  const res = spawnSync(process.execPath, ['--no-warnings', ...(SQLITE || []), outfile], {
    encoding: 'utf8',
    env: { ...process.env, TZ: 'Africa/Nairobi', KESHO_TESTS_DIR: DIR },
  });
  process.stdout.write(res.stdout || '');
  if (res.stderr) process.stdout.write(res.stderr);
  if (res.status !== 0) {
    console.log(`FAIL  ${file}`);
    failed++;
  }
}

console.log(`\n${tests.length - failed - skipped} passed, ${failed} failed, ${skipped} skipped`);
process.exit(failed > 0 ? 1 : 0);
