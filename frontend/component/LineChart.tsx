import React from "react";
import { Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

const ScreenWidth = Dimensions.get("window").width;
const chartWidth = (ScreenWidth * 95) / 100;
const chartHeight = chartWidth / 4;

type Props = {
  x: number[];
  y: number[];
  title: string;
  ylabel: string;
};

export default function LineGraph({ x, y, title, ylabel }: Props) {
  const data = {
    labels: x.map((v, i) =>
      i % Math.floor(x.length / 5) === Math.floor(x.length / 10)
        ? v.toString()
        : "",
    ),
    datasets: [{ data: y }],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: () => "#000",
    decimalPlaces: 1,
  };

  return (
    <div style={{ width: chartWidth, margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>{title}</h1>
      <Text style={{ transform: [{ rotate: "-90deg" }], marginRight: 10 }}>
        {ylabel}
      </Text>
      <LineChart
        data={data}
        width={chartWidth}
        height={chartHeight}
        chartConfig={chartConfig}
        fromZero={true}
        withInnerLines={false}
        withOuterLines={false}
        withDots={false}
      />
    </div>
  );
}
