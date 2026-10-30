// THE FEATURE SWITCHBOARD — the only file that knows which features exist.
//
// To ADD a feature:    build it in src/features/<name>/ and add one entry here.
// To REMOVE a feature: delete its entry. Its data stays safe in the database.
//
// Each entry can have any of these (all optional except key):
//   key      unique name
//   title    tab label           ┐ only if the feature has its own tab
//   icon     tab emoji           │
//   Screen   the tab's screen    ┘
//   Section  a block shown inside the ⚙️ Settings tab
//   Banner   a small strip shown above EVERY tab (must render nothing when not needed)
//   init     async function run once when the app starts (background work, notifications)
//
// Tab order = order of entries with a Screen. The Settings tab is added automatically
// (last) when at least one entry has a Section.

import TodayScreen from './today/TodayScreen';
import MoneyScreen from './money/MoneyScreen';
import ReportScreen from './report/ReportScreen';
import { initReport } from './report/report.notify';
import RemindersSection from './reminders/RemindersSection';
import { initReminders } from './reminders/reminders.service';
import BackupSection from './backup/BackupSection';
import BackupBanner from './backup/BackupBanner';
import { initBackup } from './backup/backup.reminder';

export const features = [
  { key: 'today', title: 'Today', icon: '☀️', Screen: TodayScreen },
  { key: 'money', title: 'Money', icon: '💰', Screen: MoneyScreen },
  { key: 'report', title: 'Report', icon: '📊', Screen: ReportScreen, init: initReport },
  { key: 'reminders', Section: RemindersSection, init: initReminders },
  { key: 'backup', Section: BackupSection, Banner: BackupBanner, init: initBackup },
];
