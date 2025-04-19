const withGoogleMobileAds = require("./with-google-mobile-ads");

export default {
  expo: {
    name: "Stock Gauge",
    slug: "stock-gauge",
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
      package: "com.anonymous.stockgauge",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    ios: { bundleIdentifier: "com.anonymous.stockgauge", supportsTablet: true },
    web: {
      favicon: "./assets/favicon.png",
    },
  },
};
