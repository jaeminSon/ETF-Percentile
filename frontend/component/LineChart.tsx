import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
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

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const paddingHorizontal = screenWidth / 10;
  const paddingTop = screenHeight / 10;

  const styles = StyleSheet.create({
    inner: {
      flex: 1,
      paddingHorizontal: paddingHorizontal,
      paddingTop: paddingTop,
      backgroundColor: "white",
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      marginRight: 10,
    },
  });

  return (
    <View style={styles.inner}>
      <Text style={styles.label}>{ylabel}</Text>
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
    </View>
  );
}
