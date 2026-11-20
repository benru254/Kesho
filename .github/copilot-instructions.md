# Kesho — rules for Copilot

Read `docs/WORKFLOW.md` and `docs/STRUCTURE.md` before any work in this repository.

## Roles
- Claude = architect. Writes ALL code, tests it, and pushes it to GitHub `main`.
  Each update also has a short `docs/tasks/KESHO-UPDATE-NN.md` (what changed, extra steps, phone checklist).
- Copilot = pulls from GitHub, runs tests, builds the APK, pushes back only PC-made changes.
- Reuben = tests on his Android phone and reports. Never ask Reuben to edit files or run commands
  (exceptions: typing his own passwords / logins).

## One project, forever
- Local: `C:\Users\reuben\Desktop\kesho` · GitHub: `https://github.com/benru254/Kesho` (branch `main`).
- Never create kesho-partN, life-app or any copy. Every update is applied INSIDE this folder.
- Old folders live in `C:\Users\reuben\Desktop\_kesho-archive`. Never use code from there.
- Target: ANDROID ONLY — installed APK (built by GitHub Actions) and Expo Go for quick tests. Never run or fix for web.

## Getting an update
- Start every session with `git pull` in `C:\Users\reuben\Desktop\kesho`. GitHub is the source of truth.
- Then follow `docs/tasks/KESHO-UPDATE-NN.md` for that update (extra steps + phone checklist).
- Never edit app code yourself. If something fails: STOP and report the exact error text.
- If an update document contains `### FILE` blocks (older style): replace the WHOLE file with the block.
- `MOVE TO ARCHIVE: <path>` = Move-Item it to `_kesho-archive\removed\` (never hard-delete).

## Builds
- APKs are built by GitHub Actions (`.github/workflows/build-apk.yml`) on every push to `main`, and published
  under Releases. Never run `eas build` — an EAS APK has a different signing key and can't update the installed app.
- Before pushing code: `cd app` → `npm test` (must end with `0 failed`) → `npx expo export --platform android`.

## Git
- Always `git pull` before work. Push only changes made on this PC (e.g. `package-lock.json`):
  `git add .` → `git commit -m "PC: <what>"` → `git push`. If the push is rejected: `git pull --rebase`, then push.
- Before every push run `git status` and check that NO private file is staged:
  backups (`kesho-backup-*.json`), `*.db`, real SMS text, screenshots, keystores (`*.jks`, `*.keystore`),
  `credentials.json`, `.env`. If one is staged: unstage it, add it to `.gitignore`, tell Reuben.
- The repository is PUBLIC.

## Never
- Never edit `package.json` / `app.json` or install packages unless the document says so
  (then: `npx expo install <pkg>` for app packages).
- Never run `npm audit fix` (breaks Expo versions).
- Never write files with PowerShell (Set-Content, Out-File, echo >). Use the editor, UTF-8.
- Never delete Reuben's folders or data. Archive with Move-Item.
- Never fix app code on your own initiative. Report errors to Claude through Reuben.
- Never edit `app/modules/kesho-sms/android/build.gradle` or `.github/workflows/build-apk.yml`.
- Never edit `app/app.config.js` or `app/assets/` — icons are made by `tools/make_icons.py`.

## Code rules (for reading — Claude writes the code)
- Every Text / TextInput / button: explicit `color` AND `backgroundColor` from `app/src/core/theme.js`.
- Screens never write SQL; they call `*.service.js`. Features never import other features.
- Database changes = new numbered migration, add-only. Never edit an old migration.

## Run for quick testing
- `cd C:\Users\reuben\Desktop\kesho\app ; npx expo start --lan` (QR for Expo Go, same Wi-Fi). Never `--localhost`.
