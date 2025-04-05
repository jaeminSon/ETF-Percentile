import React, { useEffect, useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { fetchChartData } from '../api';
import CustomGaugeChart from '../component/Gauger';

export default function ChartScreen() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetchChartData();
      if (res) setData(res);
    }

    load();
  }, []);

  if (!data) {
    return <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading...</Text>;
  }

  return (
    <ScrollView>
      <CustomGaugeChart
        leftColor='#82E0AA'
        leftText='저평가'
        rightColor='#922B21'
        rightText='고평가'
        title='Closing Price'
      />
      <CustomGaugeChart
        leftColor='#D6EAF8'
        leftText='거래량 적음'
        rightColor='#1B4F72'
        rightText='거래량 많음'
        title="Volume"
      />
    </ScrollView>
  );
}
