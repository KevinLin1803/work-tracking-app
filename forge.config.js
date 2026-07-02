// electron-forge configuration.
// `npm start` runs the app in dev; `npm run make` builds an unsigned .app + .dmg into out/.
module.exports = {
  packagerConfig: {
    name: 'Work Tracker',
    // Hide the Dock icon so the app is menu-bar only.
    extendInfo: {
      LSUIElement: true,
    },
    // icon: 'assets/icon', // add an .icns here later if you want a custom icon
  },
  makers: [
    { name: '@electron-forge/maker-zip', platforms: ['darwin'] },
    { name: '@electron-forge/maker-dmg', config: { format: 'ULFO' } },
  ],
};
