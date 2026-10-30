# Kesho — how changes are made

## Roles
| Who | Does |
|---|---|
| **Claude** | Designs features, writes ALL code, runs the tests + Android compile, and **pushes the code to GitHub** (`main`). Writes a short `docs/tasks/KESHO-UPDATE-NN.md` with what changed and how to test. |
| **Copilot** | Pulls from GitHub into this folder, installs packages if needed, runs `npm test`, builds the APK, and pushes back only changes made on Reuben's PC (e.g. `app.json` from EAS, `package-lock.json`). |
| **Reuben** | Installs the APK, tests on the phone, reports what works / breaks, decides what's next |

GitHub (`github.com/benru254/Kesho`, branch `main`) is the **single source of truth** for code.

## The loop
1. Reuben asks Claude for a feature or fix (with screenshots / error text if something broke).
2. Claude writes the code, tests it, pushes to GitHub, and tells Reuben the update number.
3. Copilot, in `C:\Users\reuben\Desktop\kesho`:
   ```
   git pull
   cd app
   npm install                              # only needed if package.json changed (harmless otherwise)
   npm test                                 # must end with 0 failed
   npx expo export --platform android       # must compile
   eas build -p android --profile preview   # APK link for Reuben
   ```
   Then reads `docs/tasks/KESHO-UPDATE-NN.md` for any extra steps and the phone checklist.
4. Reuben installs the APK and tests (checklist in the update + `docs/TESTING.md`).
5. If the build changed files on the PC (`git status` shows changes), Copilot pushes them:
   `git add .` → `git commit -m "PC: <what>"` → `git push`.
6. If something fails at any step: STOP, copy the exact error, send it to Claude. Nobody guesses fixes.

## Quick testing without building
`cd app` → `npx expo start --lan` → scan with Expo Go (same Wi-Fi). Screens work; M-Pesa reading does not.

## Rules that keep this safe
- One project folder forever: `C:\Users\reuben\Desktop\kesho` = `github.com/benru254/Kesho`.
- Never create `kesho-partN` / copy folders. Old stuff goes to `Desktop\_kesho-archive` (move, never delete).
- Never `npm audit fix`. Install packages only when an update says so (`npx expo install <pkg>`).
- Never a new EAS keystore — the new APK could not install over the old one, and data would be lost.
- Never commit personal data. The repo is public.

## Versions
Each update is listed in `docs/CHANGELOG.md`. Update documents live in `docs/tasks/`.
