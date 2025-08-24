import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
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
  if (["SPXL", "TQQQ", "SOXL", "TNA", "DDM", "TMF", "FAS"].includes(ticker)) {
    return `${ticker} (×3)`;
  } else if (
    [
      "AAPU",
      "AMZU",
      "FBL",
      "GGLL",
      "MSFU",
      "TSLL",
      "NVDL",
      "CONL",
      "BITX",
    ].includes(ticker)
  ) {
    return `${ticker} (×2)`;
  } else if (
    [
      "^SP500-25",
      "^SP500-30",
      "^SP500-55",
      "^SP500-35",
      "^GSPE",
      "^SP500-40",
      "^SP500-20",
      "^SP500-15",
      "^SP500-60",
      "^SP500-45"
    ].includes(ticker)
  ) {
    const sectorAbbrMap: { [key: string]: string } = {
      "^SP500-25": "Cons. Disc.",
      "^SP500-30": "Cons. Staples",
      "^SP500-55": "Utilities",
      "^SP500-35": "Health Care",
      "^GSPE": "Energy",
      "^SP500-40": "Financials",
      "^SP500-20": "Industrials",
      "^SP500-15": "Materials",
      "^SP500-60": "Real Estate",
      "^SP500-45": "Comm. Serv."
    };
    return sectorAbbrMap[ticker] || ticker;
  } else if (
    [
      "FEZ", "FXI", "IEMG", "EWA", "EWZ", "EWC", "EWG", "EWH", "EPI", "EWI", "EWJ", "EWM", "EWW", "IDX", "EWS", "EZA", "EWY", "EWP", "EWL", "EWT", "EWU"
    ].includes(ticker)
  ) {
    const countryAbbrMap: { [key: string]: string } = {
      "FEZ": "Euro",
      "FXI": "China",
      "IEMG": "Emerging",
      "EWA": "Australia",
      "EWZ": "Brazil",
      "EWC": "Canada",
      "EWG": "Germany",
      "EWH": "Hong Kong",
      "EPI": "India",
      "EWI": "Italy",
      "EWJ": "Japan",
      "EWM": "Malaysia",
      "EWW": "Mexico",
      "IDX": "Indonesia",
      "EWS": "Singapore",
      "EZA": "South Africa",
      "EWY": "Korea",
      "EWP": "Spain",
      "EWL": "Switzerland",
      "EWT": "Taiwan",
      "EWU": "United Kingdom",
    };
    return countryAbbrMap[ticker] || ticker;
  } else if (ticker === "BTC-USD") {
    return "BTC";
  } else if (ticker === "ETH-USD") {
    return "Ethereum";
  } else {
    return ticker;
  }
};

const formatDate = (dateString: string) => {
  const parts = dateString.split("-");
  if (parts.length === 3) {
    return `${parts[1]}-${parts[2]}`;
  }
  return dateString;
};

interface TableProps {
  tickers: string[];
  title: string;
  windows?: number[];
}

export default function Table({
  tickers,
  title,
  windows = [20, 50, 100, 200],
}: TableProps) {
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
  }, [tickers, windows]);

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
    <View style={styles.table}>
      <Text style={styles.tableTitle}>{title}</Text>
      {/* Header */}
      <View style={styles.row}>
        <Text style={[styles.cell_ticker, styles.header]}>Ticker</Text>
        <Text style={[styles.cell_date, styles.header]}>Date</Text>
        <Text style={[styles.cell_percentile, styles.header]}>20</Text>
        <Text style={[styles.cell_percentile, styles.header]}>50</Text>
        <Text style={[styles.cell_percentile, styles.header]}>100</Text>
        <Text style={[styles.cell_percentile, styles.header]}>200</Text>
      </View>

      {/* Rows */}
      {pivotedData.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.cell_ticker}>{tickerOnTable(item.ticker)}</Text>
          <Text style={styles.cell_date}>{formatDate(item.date)}</Text>
          <Text style={[styles.cell_percentile, getPriceTextStyle(item.p20)]}>
            {item.p20}%
          </Text>
          <Text style={[styles.cell_percentile, getPriceTextStyle(item.p50)]}>
            {item.p50}%
          </Text>
          <Text style={[styles.cell_percentile, getPriceTextStyle(item.p100)]}>
            {item.p100}%
          </Text>
          <Text style={[styles.cell_percentile, getPriceTextStyle(item.p200)]}>
            {item.p200}%
          </Text>
        </View>
      ))}
    </View>
  );
}

const screenHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
  table: {
    marginTop: 10,
    marginLeft: 0,
    marginRight: 0,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  cell_ticker: {
    flex: 1,
    padding: 8,
    textAlign: "center",
    minWidth: 90,
  },
  cell_date: {
    flex: 1,
    padding: 8,
    textAlign: "center",
    minWidth: 60,
  },
  cell_percentile: {
    flex: 1,
    padding: 8,
    textAlign: "center",
    minWidth: 45,
  },
  header: {
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    textAlign: "center",
  },
  tableTitle: {
    fontSize: 32,
    fontWeight: "600",
    marginBottom: 8,
    paddingTop: screenHeight / 40,
    paddingBottom: screenHeight / 40,
    marginRight: 10,
    textAlign: "center",
  },
});
