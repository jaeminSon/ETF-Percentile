import React, { useState, useCallback } from "react";
import {
  Dimensions,
  StyleSheet,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import AdBanner from "../component/Ads";
import Table from "../component/Table";

export default function IndexETFScreen() {
  const tickers_index = [
    "SPY",
    "SPXL",
    "QQQ",
    "TQQQ",
    "DIA",
    "DDM",
    "IWM",
    "TNA",
  ];
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.screen}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0000ff"]}
            tintColor="#0000ff"
          />
        }
      >
        <View style={styles.table}>
          <Table tickers={tickers_index} title="Index ETF" />
        </View>
      </ScrollView>

      <AdBanner />
    </View>
  );
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const paddingBottom = screenHeight / 5;
const paddingButton = screenWidth / 20;
const paddingSide = screenWidth / 40;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginLeft: paddingSide,
    marginRight: paddingSide,
    paddingBottom: 60, // Space for AdBanner only
  },
  table: {
    flex: 1,
    padding: paddingButton,
    paddingBottom: paddingBottom,
  },
});
