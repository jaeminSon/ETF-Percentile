import { Platform } from "react-native";

export const fetchChartData = async (ticker: string, window: number) => {
  const BASE_URL = "https://jaemin-lab.ddns.net/api/";
  let url = "";

  if (Platform.OS === "web") {
    url = `${BASE_URL}/stocks?ticker=${ticker}&window=${window}`;
  } else if (Platform.OS === "android") {
    url = `${BASE_URL}/percentile?ticker=${ticker}&window=${window}`;
  }

  const res = await fetch(url);
  const data = await res.json();
  return data;
};
