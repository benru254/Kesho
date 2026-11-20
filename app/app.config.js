// Extra app settings added on top of app.json (Expo reads app.json first, then this file).
// - Version: on GitHub, every build gets the next number (BUILD_NUMBER = the workflow run number),
//   so each new APK installs over the old one. Locally it is 1.
// - Icon, Android adaptive icon, splash screen. Images come from tools/make_icons.py.

const buildNumber = Number(process.env.BUILD_NUMBER || 1);

module.exports = ({ config }) => {
  const name = (p) => (Array.isArray(p) ? p[0] : p);
  const plugins = (config.plugins || []).filter((p) => name(p) !== 'expo-splash-screen');

  return {
    ...config,
    version: `1.0.${buildNumber}`,
    icon: './assets/icon.png',
    android: {
      ...config.android,
      versionCode: buildNumber,
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
