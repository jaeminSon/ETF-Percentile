import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { fetchPageData } from "../api";

const tickers_index = [
  "SPY",
  "SPXL",
  "QQQ",
  "TQQQ",
  "DIA",
  "DDM",
  "IWM",
  "TNA",
];
const tickers_asset = [
  "DX-Y.NYB",
  "EURUSD=X",
  "JPYUSD=X",
  "TLT",
  "TMF",
  "GLD",
  "SLV",
  "BTC-USD",
  "BITX",
  "ETH-USD",
  "XLF",
  "FAS",
];
const tickers_global = [
  "EWA",
  "EWZ",
  "EWC",
  "FXI",
  "IEMG",
  "FEZ",
  "EWG",
  "EWH",
  "EPI",
  "EWI",
  "EWJ",
  "EWM",
  "EWW",
  "IDX",
  "EWS",
  "EZA",
  "EWY",
  "EWP",
  "EWL",
  "EWT",
  "EWU",
];
const tickers_sector = [
  "^SP500-45",
  "^SP500-25",
  "^SP500-30",
  "^GSPE",
  "^SP500-40",
  "^SP500-35",
  "^SP500-20",
  "^SP500-15",
  "^SP500-60",
  "^SP500-55",
];
const tickers_tech = [
  "SMH",
  "SOXL",
  "AAPL",
  "AAPU",
  "AMZN",
  "AMZU",
  "COIN",
  "CONL",
  "META",
  "FBL",
  "GOOGL",
  "GGLL",
  "MSFT",
  "MSFU",
  "NVDA",
  "NVDL",
  "TSLA",
  "TSLL",
];

const getTickersByCategory = (category: string): string[] => {
  switch (category) {
    case "index":
      return tickers_index;
    case "asset":
      return tickers_asset;
    case "global":
      return tickers_global;
    case "sector":
      return tickers_sector;
    case "tech":
      return tickers_tech;
    default:
      return [];
  }
};

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
      "^SP500-45",
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
      "^SP500-45": "Comm. Serv.",
    };
    return sectorAbbrMap[ticker] || ticker;
  } else if (
    [
      "FEZ",
      "FXI",
      "IEMG",
      "EWA",
      "EWZ",
      "EWC",
      "EWG",
      "EWH",
      "EPI",
      "EWI",
      "EWJ",
      "EWM",
      "EWW",
      "IDX",
      "EWS",
      "EZA",
      "EWY",
      "EWP",
      "EWL",
      "EWT",
      "EWU",
    ].includes(ticker)
  ) {
    const countryAbbrMap: { [key: string]: string } = {
      FEZ: "Euro",
      FXI: "China",
      IEMG: "Emerging",
      EWA: "Australia",
      EWZ: "Brazil",
      EWC: "Canada",
      EWG: "Germany",
      EWH: "Hong Kong",
      EPI: "India",
      EWI: "Italy",
      EWJ: "Japan",
      EWM: "Malaysia",
      EWW: "Mexico",
      IDX: "Indonesia",
      EWS: "Singapore",
      EZA: "South Africa",
      EWY: "Korea",
      EWP: "Spain",
      EWL: "Switzerland",
      EWT: "Taiwan",
      EWU: "United Kingdom",
    };
    return countryAbbrMap[ticker] || ticker;
  } else if (ticker === "BTC-USD") {
    return "BTC";
  } else if (ticker === "ETH-USD") {
    return "Ethereum";
  } else if (ticker === "DX-Y.NYB") {
    return "Dollar Index";
  } else if (ticker === "EURUSD=X") {
    return "EUR/USD";
  } else if (ticker === "JPYUSD=X") {
    return "JPY/USD";
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
  category: string;
  title: string;
}

export default function Table({ category, title }: TableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryTickers, setCategoryTickers] = useState<string[]>([]);

  useEffect(() => {
    const loadAllData = async () => {
      const rawData = await fetchPageData(category);
      const processedData = rawData.map((result: any) => ({
        ticker: result.ticker,
        window: result.window,
        date: result.date[result.date.length - 1],
        percentile: result.price_ratio_percentile,
      }));
      setData(processedData);
      setLoading(false);
    };
    loadAllData();
  }, [category]);

  useEffect(() => {
    const predefinedTickers = getTickersByCategory(category);
    setCategoryTickers(predefinedTickers);
  }, [category]);

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

  const sortedData = pivotedData.sort((a, b) => {
    const aIndex = categoryTickers.indexOf(a.ticker);
    const bIndex = categoryTickers.indexOf(b.ticker);
    return aIndex - bIndex;
  });

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
      {sortedData.map((item, index) => (
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
