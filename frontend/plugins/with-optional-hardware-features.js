// Declares hardware features as optional (<uses-feature android:required="false">).
//
// `orientation: "portrait"` locks the activity to portrait, which makes Android
// add an implied, *required* android.hardware.screen.portrait feature. Google
// Play then hides the app from devices without that feature (some tablets,
// desktops, Android XR). Declaring it optional keeps the portrait lock on
// phones while letting every device install the app.
//
// Usage in app.config.js:
//   [withOptionalHardwareFeatures, ["android.hardware.screen.portrait"]]
const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withOptionalHardwareFeatures(config, features = []) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;
    const declared = (manifest["uses-feature"] || []).filter(
      (item) => !features.includes(item.$["android:name"]),
    );
    for (const name of features) {
      declared.push({ $: { "android:name": name, "android:required": "false" } });
    }
    manifest["uses-feature"] = declared;
    return modConfig;
  });
};
