import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Button } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";

export default function InputScreen({ navigation }: any) {
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
    navigation.navigate("GaugeScreen", {
      ticker: ticker,
      window: window,
    });
  };

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: screenWidth / 10,
      paddingTop: screenHeight / 5,
      paddingBottom: screenHeight / 3,
      backgroundColor: "white",
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
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
        listMode="SCROLLVIEW"
        dropDownContainerStyle={{
          maxHeight: 400, // Change this value as needed
        }}
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

      <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 30 }}>
        Compute Percentile
      </Button>
    </View>
  );
}
