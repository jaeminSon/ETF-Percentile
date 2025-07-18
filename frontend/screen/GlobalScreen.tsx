import React, { useState, useCallback } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import AdBanner from "../component/Ads";
import CustomBack from "../component/BackButton";
import Table from "../component/Table";

export default function GlobalScreen() {
  const tickers_global = [
    "EWA",
    "EWZ",
    "EWC",
    "FXI",
    "IEMG",
    "FEZ",
    "EWG",
    "EWH",
    "EPI",
    "EWI",
    "EWJ",
    "EWM",
    "EWW",
    "IDX",
    "EWS",
    "EZA",
    "EWY",
    "EWP",
    "EWL",
    "EWT",
    "EWU",
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
          <Table tickers={tickers_global} title="Global" />
        </View>

        <View style={styles.button}>
          <CustomBack />
        </View>
      </ScrollView>

      <AdBanner />
    </View>
  );
}

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const paddingBottom = screenHeight / 10;
const paddingButton = screenWidth / 20;
const paddingSide = screenWidth / 40;
const padding = screenWidth / 20;

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
  button: {
    width: "100%",
    flex: 1,
    padding: padding,
    paddingBottom: paddingBottom,
  },
});
