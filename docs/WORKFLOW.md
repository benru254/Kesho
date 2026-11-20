# Kesho — how changes are made

## Roles
| Who | Does |
|---|---|
| **Claude** | Designs features, writes ALL code, runs the tests + Android compile, and **pushes the code to GitHub** (`main`). Writes a short `docs/tasks/KESHO-UPDATE-NN.md` with what changed and how to test. |
| **GitHub Actions** | On every push to `main`: installs packages, runs `npm test`, builds the APK, publishes it under **Releases** as `v1.0.N` (`.github/workflows/build-apk.yml`). |
| **Copilot** | Only for work on Reuben's PC: `git pull`, running the app in Expo Go. Never builds APKs. |
| **Reuben** | Installs the APK, tests on the phone, reports what works / breaks, decides what's next |

GitHub (`github.com/benru254/Kesho`, branch `main`) is the **single source of truth** for code.

## The loop
1. Reuben asks Claude for a feature or fix (with screenshots / error text if something broke).
2. Claude writes the code, runs the tests and the Android compile, pushes to GitHub `main`.
3. GitHub Actions builds the APK (~15 min) and publishes **Kesho 1.0.N** under Releases.
   If the build fails, the run shows a red ✗ under Actions and no release appears — Claude fixes it.
4. Kesho on the phone shows **✨ Kesho 1.0.N is ready → Get it** (or Me → Updates). Reuben installs it over the old one.
5. Reuben tests (checklist in `docs/TESTING.md`) and reports.

## Versions
- Version = `1.0.N`, where N is the GitHub Actions run number. Android `versionCode` = N, so every new APK is "newer".
- Every APK is signed with the same key (Expo's standard template key), so it installs over the previous one and data stays.
  That key is public — fine for a personal app installed by hand; a Play Store app would need its own secret key.

## Quick testing without building
`cd app` → `npx expo start --lan` → scan with Expo Go (same Wi-Fi). Screens work; M-Pesa reading does not.

## Rules that keep this safe
- One project folder forever: `C:\Users\reuben\Desktop\kesho` = `github.com/benru254/Kesho`.
- Never create `kesho-partN` / copy folders. Old stuff goes to `Desktop\_kesho-archive` (move, never delete).
- Never `npm audit fix`. Install packages only when an update says so (`npx expo install <pkg>`).
- Don't build Kesho with EAS any more: an EAS APK has a different signing key and cannot update the GitHub one.
- Never commit personal data. The repo is public.


Each update is listed in `docs/CHANGELOG.md`. Update documents live in `docs/tasks/`.
