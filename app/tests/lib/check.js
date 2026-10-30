// Tiny test helper: check(condition, message) … done(). Sets a failing exit code if anything failed.

let passed = 0;
let failed = 0;

export function check(condition, message) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.log(`    FAIL: ${message}`);
  }
}

export function done() {
  console.log(`    ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}
