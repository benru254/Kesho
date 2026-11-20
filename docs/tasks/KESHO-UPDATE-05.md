# KESHO-UPDATE-05 — Download and update Kesho from GitHub

From now on **GitHub builds the APK by itself**, like Njia. No PC, no Copilot and no EAS are needed to get a new version.

## For Reuben (phone only)
1. Open **https://github.com/benru254/Kesho/releases/latest** on the phone.
2. Tap `kesho-1.0.N.apk` → open the download → **Install** (allow "install from this source" once;
   Play Protect: More details → Install anyway).
3. Future updates: a green strip **✨ Kesho 1.0.N is ready → Get it** appears in the app (or Me → Updates).
   Install over the old one — data is kept.

**Only if you installed a Kesho built with EAS before** (Android says "App not installed" / "conflicts with an
existing package"): open the old Kesho → Me → Backup → Back up to Google Drive → uninstall it → install the
GitHub APK → Me → Backup → Restore from a backup file. One time only.

## For Copilot (only when working on Reuben's PC)
```
cd C:\Users\reuben\Desktop\kesho
git status          # commit anything of Reuben's first: git add . ; git commit -m "PC state"
git pull --rebase origin main
cd app
npm install
npm test            # 11 passed, 0 failed
```
- Never run `eas build` again (different signing key → can't update the installed app).
- Never edit `.github/workflows/build-apk.yml` or `app/app.config.js`.
- If `git pull` reports a conflict in `app/app.json` (EAS project id): keep GitHub's version — EAS is no longer used.
