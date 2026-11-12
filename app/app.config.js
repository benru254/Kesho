// Extra app settings added on top of app.json (Expo reads app.json first, then this file).
// Kept separate so app.json — which EAS edits on Reuben's PC (project id) — never conflicts.
// Adds: app icon, Android adaptive icon, splash screen. Images come from tools/make_icons.py.

module.exports = ({ config }) => {
  const name = (p) => (Array.isArray(p) ? p[0] : p);
  const plugins = (config.plugins || []).filter((p) => name(p) !== 'expo-splash-screen');

  return {
    ...config,
    icon: './assets/icon.png',
    android: {
      ...config.android,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundImage: './assets/adaptive-background.png',
      },
    },
    plugins: [
      ...plugins,
      [
        'expo-splash-screen',
        {
          image: './assets/splash-icon.png',
          imageWidth: 220,
          resizeMode: 'contain',
          backgroundColor: '#0B1220',
        },
      ],
    ],
  };
};
