const withGoogleMobileAds = require("./with-google-mobile-ads");

export default {
  expo: {
    name: "ETF Percentile",
    slug: "etf-percentile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    plugins: [withGoogleMobileAds],
    android: {
      package: "com.jaeminson.etfpercentile",
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
