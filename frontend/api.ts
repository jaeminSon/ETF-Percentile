export async function fetchChartData() {
    try {
      const BASE_URL = 'http://192.168.1.97:8000';
      const url = `${BASE_URL}/stocks?ticker=TQQQ&date=2025-04-04&window=100`;
      const response = await fetch(url);
      const json = await response.json();
      return json;
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  }
  