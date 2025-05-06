import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { fetchPercentileData } from "../api";

const getPriceTextStyle = (priceRatio: number) => {
  if (priceRatio > 80) return { color: "red" };
  if (priceRatio > 60) return { color: "orange" };
  if (priceRatio > 40) return { color: "#B27800" };
  if (priceRatio > 20) return { color: "green" };
  return { color: "limegreen" };
};

const tickerOnTable = (ticker: string) => {
  const adjustedTicker = ["SPXL", "TQQQ", "SOXL"].includes(ticker)
    ? `${ticker} (×3)`
    : ticker;
  return adjustedTicker;
};

export default function TableScreen() {
  const tickers = ["SPY", "SPXL", "QQQ", "TQQQ", "SOXX", "SOXL"];
  const windows = [20, 50, 100, 200];

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      const allPromises = [];

      for (const ticker of tickers) {
        for (const window of windows) {
          allPromises.push(
            fetchPercentileData(ticker, window).then((result) => ({
              ticker,
              window,
              date: result.date[result.date.length - 1],
              percentile: result.price_ratio_percentile,
            })),
          );
        }
      }

      const allResults = await Promise.all(allPromises);
      const flattened = allResults.flat().filter(Boolean);
      setData(flattened);
      setLoading(false);
    };
    loadAllData();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

  const pivotedData = data.reduce((acc: any[], curr) => {
    const { ticker, date, window, percentile } = curr;

    let entry = acc.find(
      (item) => item.ticker === ticker && item.date === date,
    );

    if (!entry) {
      entry = { ticker, date };
      acc.push(entry);
    }

    entry[`p${window}`] = Math.round(percentile);

    return acc;
  }, []);

  console.info(pivotedData);

  return (
    <ScrollView>
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.row}>
          <Text style={[styles.cell, styles.header]}>Ticker</Text>
          <Text style={[styles.cell, styles.header]}>Closing Date</Text>
          <Text style={[styles.cell, styles.header]}>20</Text>
          <Text style={[styles.cell, styles.header]}>50</Text>
          <Text style={[styles.cell, styles.header]}>100</Text>
          <Text style={[styles.cell, styles.header]}>200</Text>
        </View>

        {/* Rows */}
        {pivotedData.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cell}>{tickerOnTable(item.ticker)}</Text>
            <Text style={styles.cell}>{item.date}</Text>
            <Text style={[styles.cell, getPriceTextStyle(item.p20)]}>
              {item.p20} %
            </Text>
            <Text style={[styles.cell, getPriceTextStyle(item.p50)]}>
              {item.p50} %
            </Text>
            <Text style={[styles.cell, getPriceTextStyle(item.p100)]}>
              {item.p100} %
            </Text>
            <Text style={[styles.cell, getPriceTextStyle(item.p200)]}>
              {item.p200} %
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const screenHeight = Dimensions.get("window").height;
const topMargin = screenHeight / 20;

const styles = StyleSheet.create({
  table: {
    margin: topMargin,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  cell: {
    flex: 1,
    padding: 10,
    textAlign: "center",
  },
  header: {
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    textAlign: "center",
  },
  date: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
  },
});
