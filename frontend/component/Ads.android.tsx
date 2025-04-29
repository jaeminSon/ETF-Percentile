import { useRef } from "react";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

const AdBannerAndroid = () => {
  const adUnitId = TestIds.ADAPTIVE_BANNER;
  const bannerRef = useRef<BannerAd>(null);

  return (
    <BannerAd
      ref={bannerRef}
      unitId={adUnitId}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
    />
  );
};

export default AdBannerAndroid;
