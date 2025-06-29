import { Platform, View, StyleSheet } from "react-native";
import AdBannerAndroid from "./Ads.android";
import AdBannerWeb from "./Ads.web";

export default function AdBanner() {
  if (Platform.OS === "web") {
    return (
      <View style={styles.bottomContainer}>
        <AdBannerWeb />
      </View>
    );
  } else if (Platform.OS === "android") {
    return (
      <View style={styles.bottomContainer}>
        <AdBannerAndroid />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    zIndex: 1000,
  },
});
