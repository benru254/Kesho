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
//   Section  a block shown inside the 🧭 Me tab (in the order listed here)
//   Banner   a small strip shown above EVERY tab (must render nothing when not needed)
//   Overlay  something drawn over the whole app (modal, celebration). Renders nothing when idle.
//   action   a round button in the middle of the tab bar: { icon, label, event } — pressing it
//            sends `event` on the bus (core/bus.js)
//   init     async function run once when the app starts (background work, notifications)
//
// Tab order = order of entries with a Screen. The Me tab is added automatically (last).

import TodayScreen from './today/TodayScreen';
import MoneyScreen from './money/MoneyScreen';
import ReportScreen from './report/ReportScreen';
import { initReport } from './report/report.notify';
import MeSection from './me/MeSection';
import Onboarding from './me/Onboarding';
import JourneySection from './journey/JourneySection';
import { initJourney } from './journey/journey.service';
import PauseOverlay from './pause/PauseOverlay';
import FocusOverlay from './focus/FocusOverlay';
import CelebrationLayer from './celebrate/CelebrationLayer';
import RemindersSection from './reminders/RemindersSection';
import { initReminders } from './reminders/reminders.service';
import BackupSection from './backup/BackupSection';
import BackupBanner from './backup/BackupBanner';
import { initBackup } from './backup/backup.reminder';
import UpdateSection from './update/UpdateSection';
import UpdateBanner from './update/UpdateBanner';
import { initUpdate } from './update/update.service';

export const features = [
  { key: 'today', title: 'Today', icon: '☀️', Screen: TodayScreen },
  { key: 'money', title: 'Money', icon: '💰', Screen: MoneyScreen },
  { key: 'report', title: 'Report', icon: '📊', Screen: ReportScreen, init: initReport },
  { key: 'me', Section: MeSection, Overlay: Onboarding },
  { key: 'journey', Section: JourneySection, init: initJourney },
  { key: 'pause', Overlay: PauseOverlay, action: { icon: '⏸', label: 'Pause', event: 'pause-open' } },
  { key: 'focus', Overlay: FocusOverlay },
  { key: 'reminders', Section: RemindersSection, init: initReminders },
  { key: 'backup', Section: BackupSection, Banner: BackupBanner, init: initBackup },
  { key: 'update', Section: UpdateSection, Banner: UpdateBanner, init: initUpdate },
  // Last, so celebrations are drawn above every other overlay:
  { key: 'celebrate', Overlay: CelebrationLayer },
];
