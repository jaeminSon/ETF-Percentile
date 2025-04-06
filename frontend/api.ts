export const fetchChartData = async (ticker: string, window: number) => {
  const BASE_URL = 'http://192.168.1.97:8000';
  const url = `${BASE_URL}/stocks?ticker=${ticker}&window=${window}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
};
