import React from "react";
import AdSense from "react-adsense";

const AdBannerWeb = () => {
  return (
    <AdSense.Google
      client="ca-pub-6810850129615089"
      slot="6872321644"
      style={{ display: "block" }}
      format="auto"
      responsive="true"
    />
  );
};

export default AdBannerWeb;
