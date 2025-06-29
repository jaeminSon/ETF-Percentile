import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Dimensions,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { fetchChartData } from "../api";
import CustomGauger from "../component/Gauger";
import LineGraph from "../component/LineChart";
import CustomBack from "../component/BackButton";
import AdBanner from "../component/Ads";

export default function GaugeScreen({ route }: any) {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const paddingBottom = screenHeight / 10;
  const paddingLeft = screenWidth / 20;

  const styles = StyleSheet.create({
    button: {
      flex: 1,
      padding: paddingLeft,
      paddingBottom: paddingBottom,
    },
    title: {
      fontSize: 32,
      fontWeight: "600",
      marginBottom: 8,
      paddingBottom: screenHeight / 30,
      marginRight: 10,
      textAlign: "center",
    },
  });

  const { ticker, window } = route.params;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchChartData(ticker, window).then(setData);
  }, [ticker, window]);

  if (!data) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView style={{ backgroundColor: "white" }}>
      {Platform.OS === "web" && (
        <View>
          <LineGraph
            x={data.date}
            y={data.price_ratio}
            title={`${data.ticker} (${data.date[data.date.length - 1]})`}
            ylabel={`Price / ${data.window}-MA`}
          />
        </View>
      )}
      {Platform.OS === "android" && (
        <Text
          style={styles.title}
        >{`${data.ticker} (${data.date[data.date.length - 1]})`}</Text>
      )}
      <View>
        <CustomGauger
          leftColor="#00ee00"
          leftText="Undervalued"
          rightColor="#ee0000"
          rightText="Overvalued"
          title="Closing Price"
          percentile={data.price_ratio_percentile}
        />
        <CustomGauger
          leftColor="#aaaaee"
          leftText="Low-volume"
          rightColor="#0000ee"
          rightText="High-volume"
          title="Volume"
          percentile={data.volume_percentile}
        />
      </View>
      <View style={styles.button}>
        <CustomBack />
      </View>
      <AdBanner />
    </ScrollView>
  );
}
