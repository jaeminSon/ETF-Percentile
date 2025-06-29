import React, { useState, useCallback } from "react";
import {
  View,
  Platform,
  Dimensions,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import AdBanner from "../component/Ads";
import CustomBack from "../component/BackButton";
import Table from "../component/Table";

export default function TableScreen() {
  const tickers_defensive_asset = ["TLT", "TMF", "GLD", "SLV", "XLF", "FAS"];
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  }, []);

  return (
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
      <Table tickers={tickers_defensive_asset} title="Defensive Assets" />

      {Platform.OS === "android" && (
        <View style={styles.button}>
          <CustomBack />
        </View>
      )}
      <AdBanner />
    </ScrollView>
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
