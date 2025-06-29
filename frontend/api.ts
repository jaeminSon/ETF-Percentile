import { Platform } from "react-native";

export const fetchChartData = async (ticker: string, window: number) => {
  const BASE_URL = "https://jaemin-lab.ddns.net/api";

  try {
    if (Platform.OS === "web") {
      const url = `${BASE_URL}/stocks?ticker=${ticker}&window=${window}`;

      const res = await fetch(url);
      const data = await res.json();
      return data;
    } else if (Platform.OS === "android") {
      return fetchPercentileData(ticker, window);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};

export const fetchPercentileData = async (ticker: string, window: number) => {
  const BASE_URL = "https://jaemin-lab.ddns.net/api";
  const url = `${BASE_URL}/percentile?ticker=${ticker}&window=${window}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching percentile data:", error);
    return null;
  }
};
