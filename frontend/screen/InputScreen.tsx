import React, { useState } from "react";
import { SafeAreaView, View, Text, Dimensions, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import AdBanner from "../component/Ads";

export default function InputScreen({ navigation }: any) {
  // Ticker
  const [openTicker, setOpenTicker] = useState(false);
  const [ticker, setTicker] = useState("SPY");
  const [itemsTicker, setItemsTicker] = useState([
    { label: "SPY", value: "SPY" },
    { label: "QQQ", value: "QQQ" },
    { label: "TQQQ", value: "TQQQ" },
    { label: "SOXL", value: "SOXL" },
    { label: "SPXL", value: "SPXL" },
  ]);

  // Mving Average Window Size
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

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const paddingHorizontal = screenWidth / 10;
  const paddingTop = screenHeight / 10;
  const paddingBottom = screenHeight / 5;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "white",
    },
    inner: {
      flex: 1,
      paddingHorizontal: paddingHorizontal,
      paddingTop: paddingTop,
      paddingBottom: paddingBottom,
      backgroundColor: "white",
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.label}>Ticker</Text>
        <DropDownPicker
          open={openTicker}
          value={ticker}
          items={itemsTicker}
          setOpen={setOpenTicker}
          setValue={setTicker}
          setItems={setItemsTicker}
          onOpen={handleOpenTicker}
          zIndex={2000}
          zIndexInverse={2000}
          containerStyle={{ marginBottom: 20 }}
        />
        <Text style={styles.label}>Moving Average Window (Days)</Text>
        <DropDownPicker
          open={openWindow}
          value={window}
          items={itemsWindow}
          setOpen={setOpenWindow}
          setValue={setWindow}
          setItems={setItemsWindow}
          onOpen={handleOpenWindowMA}
          zIndex={1000}
          zIndexInverse={1000}
          containerStyle={{ marginBottom: 20 }}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={{ marginTop: 30 }}
        >
          Compute Percentile
        </Button>
      </View>
      <AdBanner />
    </SafeAreaView>
  );
}
