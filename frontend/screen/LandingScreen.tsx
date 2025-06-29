import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Dimensions,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { Button } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";
import AdBanner from "../component/Ads";
import ExplainScreen from "./ExplainScreen";
import KoFiWidget from "../component/kofi";
import TableScreen from "./TableScreen";
import InputScreen from "./InputScreen";

export default function LandingScreen({ navigation }: any) {
  // Ticker
  const [openTicker, setOpenTicker] = useState(false);
  const [ticker, setTicker] = useState("SPY");
  const [itemsTicker, setItemsTicker] = useState([
    { label: "SPY", value: "SPY" },
    { label: "SPXL (×3)", value: "SPXL" },
    { label: "QQQ", value: "QQQ" },
    { label: "TQQQ (×3)", value: "TQQQ" },
    { label: "SOXX", value: "SOXX" },
    { label: "SOXL (×3)", value: "SOXL" },
    { label: "TSLA", value: "TSLA" },
    { label: "TSLL (×2)", value: "TSLL" },
    { label: "NVDA", value: "NVDA" },
    { label: "NVDL (×2)", value: "NVDL" },
    { label: "GLD", value: "GLD" },
    { label: "TLT", value: "TLT" },
    { label: "CONL (×2)", value: "CONL" },
  ]);

  // Moving Average Window Size
  const [openWindow, setOpenWindow] = useState(false);
  const [window, setWindow] = useState(100);
  const [itemsWindow, setItemsWindow] = useState([
    { label: "20", value: 20 },
    { label: "50", value: 50 },
    { label: "100", value: 100 },
    { label: "200", value: 200 },
  ]);

  const handleOpenTicker = () => {
    setOpenTicker(true);
    setOpenWindow(false);
  };

  const handleOpenWindowMA = () => {
    setOpenTicker(false);
    setOpenWindow(true);
  };

  const handleSubmit = () => {
    navigation.navigate("MainScreen", {
      ticker: ticker,
      window: window,
    });
  };

  const handleTableScreen = () => {
    navigation.navigate("TableScreen", {});
  };

  const handleExplainScreen = () => {
    navigation.navigate("ExplainScreen", {});
  };

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const paddingTop = screenHeight / 5;
  const paddingBottom = screenHeight / 3;
  const paddinglinkTop = screenHeight / 20;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "white",
    },
    iconContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: paddinglinkTop,
    },
    iconWrapper: {
      marginHorizontal: 16,
    },
    webContainer: {
      paddingVertical: 20,
    },
    cofiSection: {
      marginTop: paddingTop,
    },
  });

  return (
    <ScrollView style={styles.container}>
      {Platform.OS === "android" && (
        <View style={styles.iconContainer}>
          <Pressable onPress={handleExplainScreen} style={styles.iconWrapper}>
            <Ionicons name="information-circle-outline" size={32} />
          </Pressable>

          <Pressable onPress={handleTableScreen} style={styles.iconWrapper}>
            <Ionicons name="grid-outline" size={32} />
          </Pressable>
        </View>
      )}

      <TableScreen />

      {Platform.OS === "web" && (
        <View style={styles.webContainer}>
          <View>
            <InputScreen />
          </View>
          <View>
            <ExplainScreen />
          </View>
          <View style={styles.cofiSection}>
            <KoFiWidget />
          </View>
        </View>
      )}

      {Platform.OS === "android" && <AdBanner />}
    </ScrollView>
  );
}
