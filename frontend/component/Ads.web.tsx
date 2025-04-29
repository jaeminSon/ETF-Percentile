import React from "react";
import AdSense from "react-adsense";

const AdBannerWeb = () => {
  return (
    <AdSense.Google
      client="ca-pub-xxxxxxxxxxxxxxxx" // your AdSense client ID
      slot="yyyyyyyyyy" // your ad slot ID
      style={{ display: "block" }}
      format="auto"
      responsive="true"
    />
  );
};

export default AdBannerWeb;
