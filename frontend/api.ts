export const fetchChartData = async (ticker: string, window: number) => {
  const BASE_URL = "http://jaemin-lab.ddns.net:8000";
  // const BASE_URL = "http://10.0.2.2:8000";
  const url = `${BASE_URL}/stocks?ticker=${ticker}&window=${window}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
};
