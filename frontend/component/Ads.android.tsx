import { useRef } from "react";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";

import { useAdsReady } from "./ageSignals";

const AdBannerAndroid = () => {
  const adUnitId = "ca-app-pub-6810850129615089/2498028607";
  const bannerRef = useRef<BannerAd>(null);
  // Wait for the Play Age Signals check so minors never get an unrestricted ad.
  const ready = useAdsReady();

  if (!ready) {
    return null;
  }

  return (
    <BannerAd
      ref={bannerRef}
      unitId={adUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
    />
  );
};

export default AdBannerAndroid;
