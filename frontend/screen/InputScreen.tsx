import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { Button } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import AdBanner from "../component/Ads";
import HomeButton from "../component/HomeButton";

export default function InputScreen({ navigation }: any) {
  // Ticker
  const [openTicker, setOpenTicker] = useState(false);
  const [ticker, setTicker] = useState("SPY");
  const [itemsTicker, setItemsTicker] = useState([
    { label: "SPY", value: "SPY" },
    { label: "SPXL (×3)", value: "SPXL" },
    { label: "QQQ", value: "QQQ" },
    { label: "TQQQ (×3)", value: "TQQQ" },
    { label: "IWM", value: "IWM" },
    { label: "TNA (×3)", value: "TNA" },
    { label: "DIA", value: "DIA" },
    { label: "DDM (×3)", value: "DDM" },
    { label: "SMH", value: "SMH" },
    { label: "SOXL (×3)", value: "SOXL" },
    { label: "BITX (×2)", value: "BITX" },
    { label: "AAPL", value: "AAPL" },
    { label: "AAPU (×2)", value: "AAPU" },
    { label: "AMZN", value: "AMZN" },
    { label: "AMZU (×2)", value: "AMZU" },
    { label: "COIN", value: "COIN" },
    { label: "CONL (×2)", value: "CONL" },
    { label: "META", value: "META" },
    { label: "FBL (×2)", value: "FBL" },
    { label: "GOOGL", value: "GOOGL" },
    { label: "GGLL (×2)", value: "GGLL" },
    { label: "MSFT", value: "MSFT" },
    { label: "MSFU (×2)", value: "MSFU" },
    { label: "NVDA", value: "NVDA" },
    { label: "NVDL (×2)", value: "NVDL" },
    { label: "TSLA", value: "TSLA" },
    { label: "TSLL (×2)", value: "TSLL" },
    { label: "TLT", value: "TLT" },
    { label: "TMF (×3)", value: "TMF" },
    { label: "IEF", value: "IEF" },
    { label: "GLD", value: "GLD" },
    { label: "SLV", value: "SLV" },
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
  const paddingComputeButton = screenWidth / 20;
  const paddingBottom = screenHeight / 3;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "white",
    },
    content: {
      flex: 1,
      paddingHorizontal: screenWidth / 10,
      paddingTop: screenHeight / 10,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
    },
    compute_button: {
      flex: 1,
      padding: paddingComputeButton,
      paddingBottom: paddingBottom,
    },
    homeButtonContainer: {
      marginTop: 30,
      paddingHorizontal: screenWidth / 10,
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
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

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.homeButtonContainer}
        >
          Compute Percentile
        </Button>

        {Platform.OS === "android" && (
          <View style={styles.homeButtonContainer}>
            <HomeButton />
          </View>
        )}
      </View>

      <AdBanner />
    </View>
  );
}
