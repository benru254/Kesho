// needs: sqlite
// Updates from GitHub: reading the release, comparing versions, checking at most every 12 hours,
// banner "Later", offline = no crash.
import { check, done } from './lib/check.js';
import { buildFromTag, parseRelease, isNewer, shouldCheck } from '../src/features/update/update.check.js';
import * as U from '../src/features/update/update.service.js';
import { Linking } from 'react-native';

const rel = (tag, apk = true) => ({
  tag_name: tag,
  html_url: `https://github.com/benru254/kesho/releases/tag/${tag}`,
  published_at: '2026-11-20T06:00:00Z',
  assets: apk ? [{ name: `kesho-${tag.slice(1)}.apk`, browser_download_url: `https://example.test/${tag}.apk` }] : [],
});

check(buildFromTag('v1.0.37') === 37 && buildFromTag('1.0.4') === 4 && buildFromTag('beta') === null, 'build number from tag');
const r = parseRelease(rel('v1.0.7'));
check(r.build === 7 && r.version === '1.0.7' && r.apkUrl === 'https://example.test/v1.0.7.apk', 'release parsed');
check(parseRelease(rel('v1.0.8', false)).apkUrl === null && parseRelease({ tag_name: 'oops' }) === null, 'odd releases handled');
check(isNewer(r, 5) && !isNewer(r, 7) && !isNewer(r, 9) && !isNewer(r, null) && !isNewer(null, 5), 'newer only when the build number is higher');
const now = Date.parse('2026-11-20T12:00:00Z');
check(shouldCheck(null, now) && shouldCheck('2026-11-19T23:00:00Z', now) && !shouldCheck('2026-11-20T06:00:00Z', now), 'asks GitHub at most every 12 hours');

// --- service with a fake GitHub
let answer = { status: 200, body: rel('v1.0.7') };
let calls = 0;
globalThis.fetch = async () => {
  calls++;
  if (answer === 'offline') throw new TypeError('Network request failed');
  return { status: answer.status, ok: answer.status < 300, json: async () => answer.body };
};

let s = await U.getUpdateState();
check(!s.available && s.installed.build === 5 && s.installed.isKesho, 'nothing known yet');
s = await U.checkForUpdate(true);
check(s.ok && s.available && s.showBanner && s.release.version === '1.0.7', 'newer version found → banner');
await U.checkForUpdate(false);
check(calls === 1, 'second automatic check within 12 h does not use the internet');
await U.dismiss(7);
check(!(await U.getUpdateState()).showBanner && (await U.getUpdateState()).available, '"Later" hides the banner, Me → Updates still offers it');
answer = { status: 200, body: rel('v1.0.9') };
check((await U.checkForUpdate(true)).showBanner, 'an even newer version shows the banner again');
await U.download((await U.getUpdateState()).release);
check(Linking.opened[0] === 'https://example.test/v1.0.9.apk', 'Download opens the APK link');

answer = 'offline';
s = await U.checkForUpdate(true);
check(!s.ok && /internet/.test(s.error) && s.release.build === 9, 'offline: clear message, last known answer kept');
answer = { status: 404, body: { message: 'Not Found' } };
s = await U.checkForUpdate(true);
check(s.ok && s.release === null && !s.available, 'no release published yet → no crash');
answer = { status: 200, body: rel('v1.0.5') };
check(!(await U.checkForUpdate(true)).available, 'same version → up to date');
done();
