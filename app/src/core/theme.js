// Kesho theme — every color the app uses lives here.
// Change a color once here and the whole app follows.

export const colors = {
  bg: '#0B1220',        // app background
  card: '#131C2E',      // card background
  cardAlt: '#1A2540',   // chips, inner boxes
  border: '#26324D',
  text: '#E8EEF9',      // main text
  muted: '#8A97B2',     // secondary text
  accent: '#F5B841',    // Kesho gold (sunrise)
  accentText: '#1A1300',// text on gold buttons
  good: '#3DD68C',      // done / win
  warn: '#FF8A5B',      // honest warnings
  inputBg: '#0F1830',
  placeholder: '#5D6A85',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };

export const radius = { sm: 8, md: 12, lg: 16 };

// Type scale — use these instead of loose numbers in new screens.
export const font = { xs: 11, sm: 13, md: 15, lg: 17, xl: 22, xxl: 28, hero: 40 };

// The living sky on the Today screen. Each phase = gradient colors, top → bottom.
export const sky = {
  dawn: ['#16213F', '#8E4A6E', '#F29E4C'],
  day: ['#0F2F5F', '#1F5C9E', '#3F8FD0'],
  dusk: ['#1B1740', '#7A3B69', '#E8824A'],
  night: ['#050915', '#0B1430', '#16224A'],
  sun: '#FFD166',
  sunGlow: 'rgba(255, 209, 102, 0.25)',
  moon: '#DCE6FF',
  star: '#FFFFFF',
  text: '#FFFFFF',
  textSoft: 'rgba(255, 255, 255, 0.78)',
};

// Confetti colors.
export const confetti = ['#F5B841', '#3DD68C', '#6FB1E8', '#FF8A5B', '#E8EEF9', '#C58BF2'];

