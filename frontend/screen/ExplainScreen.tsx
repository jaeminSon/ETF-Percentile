import React, { useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  RefreshControl,
} from "react-native";

import AdBanner from "../component/Ads";
import CustomBack from "../component/BackButton";

export default function ExplainScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [timestamp, setTimestamp] = useState(
    new Date().toISOString().slice(0, 13),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Update timestamp to current hour (granular hourly update like original)
    setTimestamp(new Date().toISOString().slice(0, 13));
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const paddingBottom = screenHeight / 10;
  const paddingLeft = screenWidth / 20;
  const ImageWidth =
    screenWidth > 600 ? screenWidth / 2 : (screenWidth * 9) / 10;
  const LeverageImageHeight = (9 * ImageWidth) / 10;
  const SeriesImageHeight = ImageWidth / 2;
  const PdfImageHeight = (8 * ImageWidth) / 10;

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    contentContainer: {
      flex: 1,
      padding: 16,
      alignItems: "center",
    },
    leverageImage: {
      width: ImageWidth,
      height: LeverageImageHeight,
      marginVertical: 12,
    },
    pdfImage: {
      width: ImageWidth,
      height: PdfImageHeight,
      marginVertical: 12,
    },
    seriesImage: {
      width: ImageWidth,
      height: SeriesImageHeight,
      marginVertical: 12,
    },
    title: {
      fontSize: 32,
      textAlign: "center",
      marginVertical: 30,
      fontWeight: "600",
    },
    paragraph: {
      fontSize: 16,
      textAlign: "center",
      marginVertical: 8,
      width: "80%",
    },
    button: {
      width: "90%",
      flex: 1,
      padding: paddingLeft,
      paddingBottom: paddingBottom,
    },
  });

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#0000ff"]} // Android
          tintColor="#0000ff" // iOS
        />
      }
    >
      <Text style={styles.title}>How to Compute Percentile</Text>
      <Text style={styles.paragraph}>
        The following chart shows the returns and trading volumes of SPXL, TQQQ,
        and SOXL since 2010, along with their respective 100-day moving averages
        based on closing prices.
      </Text>
      <Image
        source={{
          uri: `https://jaemin-lab.ddns.net/api/image/return_leverage.png?ts=${timestamp}`,
        }}
        style={styles.leverageImage}
        resizeMode="contain"
      />

      <Text style={styles.paragraph}>
        By dividing the closing price by its 100-day moving average, we can
        generate a normalized time series. For example, the resulting series for
        SOXL appears as follows.
      </Text>
      <Image
        source={{
          uri: `https://jaemin-lab.ddns.net/api/image/div_by_ma_SOXL.png?ts=${timestamp}`,
        }}
        style={styles.seriesImage}
        resizeMode="contain"
      />

      <Text style={styles.paragraph}>
        From this data, we can construct a distribution to assess the current
        position relative to historical values.
      </Text>
      <Image
        source={{
          uri: `https://jaemin-lab.ddns.net/api/image/pdf_SOXL.png?ts=${timestamp}`,
        }}
        style={styles.pdfImage}
        resizeMode="contain"
      />
      <Text style={styles.paragraph}>
        For trading volume, we simply compute the percentile to evaluate current
        levels in context.
      </Text>
      {Platform.OS === "android" && (
        <View style={styles.button}>
          <CustomBack />
        </View>
      )}
      <AdBanner />
    </ScrollView>
  );
}
