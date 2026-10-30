# Kesho — database

One SQLite file on the phone: `kesho.db` (opened in `app/src/core/db/database.js`).
Current schema version: **3** (see `app/src/core/db/migrations.js`).

## Rules
- Changes are **add-only**: new tables, new columns. Never drop, rename or reset.
- Each change = a new numbered migration. Old migrations are never edited (phones already ran them).
- Money totals are **calculated** from rows, never stored as one number.
- Deleting money = soft delete (`deleted_at`), so history stays honest.

## Tables

### `schema_version`
| column | meaning |
|---|---|
| version | highest migration that has run |

### `settings` — small saved values (JSON)
| key | value |
|---|---|
| `reminder_times` | `{ morning: {on,h,m}, move: {...}, night: {...} }` |
| `money_goal` | `{ startMonth, startAmount, goalMonth, goalAmount }` |
| `mpesa_since_ms` | time of the newest M-Pesa SMS already read |
| `mpesa_balance` | `{ amount, date, time, ms }` from the newest personal M-Pesa SMS |
| `last_backup_at` | ISO time of the last backup |
| `backup_banner_snooze` | ISO time until the backup banner stays hidden |
| `reminders_last_sync` | ISO time reminders were last planned |

### `daily_log` — one row per day (Today tab)
| column | meaning |
|---|---|
| date | `YYYY-MM-DD` (primary key) |
| mood | 1–5 (morning) |
| sleep_hours | 4–9 (9 = 9+) |
| sleep_quality | 1 bad · 2 okay · 3 good |
| moved | 0/1 |
| stress | 1–5 (night) |
| win_note | one thing that mattered |
| morning_done_at / night_done_at | ISO time the check-in was saved |
| updated_at | ISO time |

### `tasks` — the day's 1–3 important things
| column | meaning |
|---|---|
| id, date, title | |
| done, done_at | 0/1 and when |
| carried_to | date it was brought to, or `dropped` |
| created_at | |

### `events` — append-only activity log
| column | meaning |
|---|---|
| type | e.g. `morning_checkin`, `task_done`, `money_in`, `mpesa_import`, `backup_made` |
| payload | JSON details |
| created_at | ISO time (UTC) |

Used to know "did Reuben show up today?" (reminders, weekly report).

### `money_sources` — where income comes from
`id, name (unique), archived, created_at`. Seeded: *Gas business (my pay)*, *Software / tech*, *Other*.

### `money_buckets` — where money goes
| key | name | kind |
|---|---|---|
| needs | Needs | spend |
| wants | Wants | spend |
| fees | M-Pesa fees | spend |
| emergency | Emergency fund | pot |
| payme | Pay myself | pot |
| invest | Invest | pot |

### `money_tx` — THE LEDGER (one row per money movement)
| column | meaning |
|---|---|
| date | `YYYY-MM-DD` |
| type | `in` income · `out` spending · `aside` into a pot (negative = taken out) |
| amount | whole KES (positive, except pot withdrawals) |
| source_id | for `in` |
| bucket_id | for `out` / `aside` |
| note | |
| origin | `manual` or `mpesa` |
| ext_ref | M-Pesa code (unique) — fees use `CODE-FEE` |
| created_at, deleted_at | soft delete |

### `mpesa_inbox` — every M-Pesa SMS read (waiting room)
| column | meaning |
|---|---|
| code | M-Pesa transaction code (unique — never imported twice) |
| kind | till · paybill · sent · received · withdraw · airtime · business · balance · unknown |
| direction | in · out · none |
| amount, fee, balance | whole KES |
| counterparty, party_key | name (cleaned) and lowercase key used for suggestions |
| account | paybill account number |
| date, time | from the SMS |
| raw | original SMS text (stays on the phone) |
| status | `pending` (waiting) · `done` (in ledger) · `skipped` · `business` (shop till) · `info` · `unknown` |
| bucket_id, source_id | what Reuben chose (used as next suggestion) |
| sms_ms, created_at, decided_at | times |

## Migrations so far
| version | name | what it added |
|---|---|---|
| 1 | core tables | settings, daily_log, tasks, events |
| 2 | money | money_sources, money_buckets, money_tx (+ seeds) |
| 3 | mpesa inbox | mpesa_inbox, "M-Pesa fees" bucket |

## Backups
A backup (Settings → Backup) is a JSON file containing every table above — see
`app/src/features/backup/backup.format.js` for the layout. Restore only touches tables present in the backup,
ignores unknown columns, and refuses backups from a newer database version.
