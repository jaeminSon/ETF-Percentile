import { Platform } from "react-native";
import AdBannerAndroid from "./Ads.android";
import AdBannerWeb from "./Ads.web";

export default function AdBanner() {
  if (Platform.OS === "web") {
    return <AdBannerWeb />;
  } else if (Platform.OS === "android") {
    return <AdBannerAndroid />;
  }
}
