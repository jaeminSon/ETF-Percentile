const { withAndroidManifest } = require("@expo/config-plugins");

const withGoogleMobileAds = (config) => {
  return withAndroidManifest(config, (modConfig) => {
    const appId = "ca-app-pub-6810850129615089~8788701259";

    const manifest = modConfig.modResults.manifest;
    const application = manifest.application[0];

    if (!application["meta-data"]) {
      application["meta-data"] = [];
    }

    // Remove existing meta-data if it already exists to avoid duplicates
    application["meta-data"] = application["meta-data"].filter(
      (item) =>
        item.$["android:name"] !== "com.google.android.gms.ads.APPLICATION_ID",
    );

    application["meta-data"].push({
      $: {
        "android:name": "com.google.android.gms.ads.APPLICATION_ID",
        "android:value": appId,
        "tools:replace": "android:value",
      },
    });

    // Add xmlns:tools if not already present
    if (!manifest.$["xmlns:tools"]) {
      manifest.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }

    return modConfig;
  });
};

module.exports = withGoogleMobileAds;
