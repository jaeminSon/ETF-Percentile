import React, { useEffect, useState } from "react";
import { View, Platform, Dimensions, StyleSheet } from "react-native";
import AdBanner from "../component/Ads";
import CustomBack from "../component/BackButton";
import Table from "../component/Table";

export default function TableScreen() {
  const getTickersByGroup = (group: string): string[] => {
    switch (group) {
      case "index":
        return ["SPY", "SPXL", "QQQ", "TQQQ", "DIA", "DDM", "IWM", "TNA"];
      case "tech":
        return [
          "SMH",
          "SOXL",
          "BITX",
          "AAPL",
          "AAPU",
          "AMZN",
          "AMZU",
          "COIN",
          "CONL",
          "META",
          "FBL",
          "GOOGL",
          "GGLL",
          "MSFT",
          "MSFU",
          "NVDA",
          "NVDL",
          "TSLA",
          "TSLL",
        ];
      case "others":
        return ["TLT", "TMF", "GLD", "SLV", "XLF", "FAS"];
      default:
        return [];
    }
  };

  const tickers_index = getTickersByGroup("index");
  const tickers_tech = getTickersByGroup("tech");
  const tickers_others = getTickersByGroup("others");

  const [showIndex, setShowIndex] = useState(false);
  const [showTech, setShowTech] = useState(false);
  const [showothers, setShowothers] = useState(false);

  useEffect(() => {
    setShowIndex(true);
    const techTimer = setTimeout(() => setShowTech(true), 1000);
    const othersTimer = setTimeout(() => setShowothers(true), 2000);

    return () => {
      clearTimeout(techTimer);
      clearTimeout(othersTimer);
    };
  }, []);

  return (
    <View style={styles.screen}>
      {showIndex && <Table tickers={tickers_index} title="Index ETF" />}
      {showTech && <Table tickers={tickers_tech} title="Technology" />}
      {showothers && <Table tickers={tickers_others} title="others" />}

      {Platform.OS === "android" && (
        <View style={styles.button}>
          <CustomBack />
        </View>
      )}
      <AdBanner />
    </View>
  );
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const paddingBottom = screenHeight / 10;
const paddingLeftButton = screenWidth / 20;
const paddingSide = screenWidth / 40;
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginLeft: paddingSide,
    marginRight: paddingSide,
    paddingBottom: paddingBottom,
  },
  button: {
    flex: 1,
    padding: paddingLeftButton,
    paddingBottom: paddingBottom,
  },
});
