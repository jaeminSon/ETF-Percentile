export const fetchChartData = async (ticker: string, window: number) => {
  const BASE_URL = "https://jaemin-lab.ddns.net/api/";
  const url = `${BASE_URL}/stocks?ticker=${ticker}&window=${window}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
};
