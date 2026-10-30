# Kesho — decisions (and why)

Short records of choices that shape the app. If you want to change one, read the "why" first.

| # | Decision | Why |
|---|---|---|
| 1 | **Android only, installed APK** (not Play Store, not web) | Reuben's phone is Android. M-Pesa SMS reading needs native Android. A web version only added confusion. |
| 2 | **Offline first, no server** | Reuben can go a month without internet. No server = nothing to pay for, nothing to hack, nothing to break. |
| 3 | **Backup = JSON file to Google Drive via the share menu** | Works without a server or Google sign-in code. Reuben chooses when (reminded every 7 days). |
| 4 | **~2 minutes a day, one-tap inputs** | Personal tracking apps die from too much input. Built for lazy/emotional days. |
| 5 | **No guilt: no streaks, "never miss twice", welcome back** | Missing one day is normal. Shame makes people quit; a gentle nudge brings them back. |
| 6 | **Max 3 reminders a day, fewer when away** | More than that teaches the brain to mute everything. |
| 7 | **1–3 important tasks, not a to-do list** | Finishing few beats planning many. |
| 8 | **Income goal as a compound path (+16.6%/month)** | 10k→100k in 15 months only works with steady % growth. Checking against THIS month's target keeps it real. |
| 9 | **Shop till money = business, never personal income** | In real samples, 32 of 50 M-Pesa SMS were till sales. Counting them would fake the income goal. |
| 10 | **M-Pesa SMS never enter the ledger until sorted** | No silent guesses with money. Suggestions + "sort like last time" keep it to one tap. |
| 11 | **Fees are their own bucket** | Small fees add up (e.g. 33 KES in one evening) and should be visible. |
| 12 | **Money is a ledger, totals calculated, soft delete** | Totals can never drift; history stays honest. |
| 13 | **Weekly report gives ONE focus** | Ten suggestions = zero action. |
| 14 | **Patterns shown only with 3+ days per group, labelled "not proof"** | Honest numbers, no fake insights. |
| 15 | **Features plug into `registry.js`; features don't import each other** | Add/remove features without breaking others. |
| 16 | **Add-only database migrations** | Phones keep months of data; an update must never wipe it. |
| 17 | **Claude writes, Copilot applies, Reuben tests** | Reuben's time goes to testing and deciding, not typing code. Update docs keep a full history. |
| 18 | **Public repo, fake test data only** | Code is fine to share; personal data (SMS, backups, money) never goes to GitHub. |
| 19 | **Expo SDK 54** | The version Copilot's working setup used; matches Expo Go on the Play Store at the time. Upgrade only on purpose. |
