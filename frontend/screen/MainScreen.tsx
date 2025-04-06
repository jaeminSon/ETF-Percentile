import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { fetchChartData } from '../api';
import CustomGaugeChart from '../component/Gauger';
import LineGraph from '../component/LineChart';

export default function MainScreen({ route }: any) {
  const { ticker, window } = route.params;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchChartData(ticker, window).then(setData);
  }, [ticker, window]);

  if (!data) {
    return <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading...</Text>;
  }

  return (
    <ScrollView style={{ backgroundColor: "white" }}>
      <LineGraph
        x={data.date}
        y={data.price_ratio}
        title={`${data.ticker} (${data.date[data.date.length - 1]})`}
        ylabel={`(Closing Price) / (${data.window} days MA)`}
      />
      <CustomGaugeChart
        leftColor='#00ee00'
        leftText='Undervalued'
        rightColor='#ee0000'
        rightText='Overvalued'
        title='Closing Price'
        percentile={data.price_ratio_percentile}
      />
      <CustomGaugeChart
        leftColor='#aaaaee'
        leftText='Low-volume'
        rightColor='#0000ee'
        rightText='High-volume'
        title="Volume"
        percentile={data.volume_percentile}
      />
    </ScrollView>
  );
}
