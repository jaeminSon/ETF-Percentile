import React from "react";
import {
  ScrollView,
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";

import AdBanner from "../component/Ads";

export default function ExplainScreen() {
  const ScreenWidth = Dimensions.get("window").width;
  const ImageWidth =
    ScreenWidth > 600 ? ScreenWidth / 2 : (ScreenWidth * 9) / 10;
  const LeverageImageHeight = (9 * ImageWidth) / 10;
  const SeriesImageHeight = ImageWidth / 2;
  const PdfImageHeight = (8 * ImageWidth) / 10;

  const styles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    container: {
      padding: 16,
      alignItems: "center",
      backgroundColor: "#FFFFFF",
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
  });

  const hour = new Date().toISOString().slice(0, 13);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>How to Compute Percentile</Text>
        <Text style={styles.paragraph}>
          The following chart shows the returns and trading volumes of SPXL,
          TQQQ, and SOXL since 2010, along with their respective 100-day moving
          averages based on closing prices.
        </Text>
        <Image
          source={{
            uri: `https://jaemin-lab.ddns.net/api/image/return_leverage.png?ts=${hour}`,
          }}
          style={styles.leverageImage}
          resizeMode="contain"
        />

        <Text style={styles.paragraph}>
          By dividing the closing price by its 100-day moving average, we can
          generate a normalized time series. For example, the resulting series
          for SOXL appears as follows.
        </Text>
        <Image
          source={{
            uri: `https://jaemin-lab.ddns.net/api/image/div_by_ma_SOXL.png?ts=${hour}`,
          }}
          style={styles.seriesImage}
          resizeMode="contain"
        />

        <Text style={styles.paragraph}>
          From this data, we can construct a distribution to assess the current
          position relative to historical values.
        </Text>
        <Image
          source={{ uri: `https://jaemin-lab.ddns.net/api/image/pdf_SOXL.png?ts=${hour}` }}
          style={styles.pdfImage}
          resizeMode="contain"
        />
        <Text style={styles.paragraph}>
          For trading volume, we simply compute the percentile to evaluate
          current levels in context.
        </Text>
      </ScrollView>
      <AdBanner />
    </View>
  );
}
