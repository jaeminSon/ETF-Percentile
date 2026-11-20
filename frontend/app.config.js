const withGoogleMobileAds = require("./with-google-mobile-ads");
const withReleaseSigning = require("./plugins/with-release-signing");

export default {
  expo: {
    name: "ETF Percentile",
    slug: "etf-percentile",
    // Bump both on every Play release: versionCode must be higher than the last upload.
    version: "1.1.3",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    // New Architecture (Expo SDK 54 default). react-native-google-mobile-ads 17 requires it.
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    plugins: [
      withGoogleMobileAds,
      [withReleaseSigning, { prefix: "ETF_UPLOAD" }],
      [
        "expo-build-properties",
        {
          android: {
            // Google Play: new apps and updates must target Android 16 (API 36) since 2026-08-31.
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            // Google Mobile Ads SDK 25.x is compiled with Kotlin 2.3; Kotlin 2.2 can read it, RN 0.81's 2.1 can't.
            kotlinVersion: "2.2.20",
          },
        },
      ],
    ],
    android: {
      package: "com.jaeminson.etfpercentile",
      versionCode: 9,
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    ios: {
      bundleIdentifier: "com.jaeminson.etfpercentile",
      supportsTablet: true,
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "b2394747-9c5e-4c86-9bc1-87e9cb30d2f5",
      },
    },
  },
};
