// UPDATE CHECK LOGIC (pure — tested on its own).
// New versions of Kesho are published on GitHub Releases as tag "v1.0.N" with a file "kesho-1.0.N.apk".
// N is the build number. The installed app knows its own N (Android versionCode).

export const REPO = 'benru254/kesho';
export const LATEST_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
export const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;
export const CHECK_EVERY_HOURS = 12;

// "v1.0.37" → 37 ; anything else → null
export function buildFromTag(tag) {
  const m = /^v?\d+\.\d+\.(\d+)$/.exec(String(tag || '').trim());
  return m ? Number(m[1]) : null;
}

// GitHub's "latest release" answer → { build, version, apkUrl, pageUrl, publishedAt } or null.
export function parseRelease(json) {
  if (!json || typeof json !== 'object') return null;
  const build = buildFromTag(json.tag_name);
  if (build === null) return null;
  const apk = (json.assets || []).find((a) => /\.apk$/i.test(a.name || ''));
  return {
    build,
    version: String(json.tag_name).replace(/^v/, ''),
    apkUrl: apk ? apk.browser_download_url : null,
    pageUrl: json.html_url || RELEASES_PAGE,
    publishedAt: json.published_at || null,
  };
}

// Is the release newer than what is installed? installedBuild = Android versionCode (number or null).
export function isNewer(release, installedBuild) {
  if (!release || !Number.isFinite(installedBuild)) return false;
  return release.build > installedBuild;
}

// Time to ask GitHub again? (Not more than every 12 hours — Kesho works offline.)
export function shouldCheck(lastCheckIso, nowMs = Date.now()) {
  if (!lastCheckIso) return true;
  return nowMs - new Date(lastCheckIso).getTime() >= CHECK_EVERY_HOURS * 3600000;
}
