import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";

const ScreenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const chartWidth = (ScreenWidth * 9) / 10;
const chartHeight = (chartWidth * 11) / 21;

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
        ? v.toString().slice(0, 7)
        : "",
    ),
    datasets: [{ data: y, strokeWidth: 1 }],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    decimalPlaces: 2,
    propsForLabels: {
      fill: "black",
      fontSize: 12,
    },
  };

  const styles = StyleSheet.create({
    inner: {
      flex: 1,
      paddingHorizontal: 0,
      paddingTop: screenHeight / 30,
      paddingBottom: screenHeight / 30,
      backgroundColor: "white",
    },
    title: {
      fontSize: 28,
      fontWeight: "600",
      marginBottom: 8,
      paddingBottom: screenHeight / 30,
      marginRight: 10,
      textAlign: "center",
    },
    label: {
      fontSize: 10,
      fontWeight: "600",
      marginBottom: 8,
      marginLeft: 10,
      textAlign: "left",
    },
  });

  return (
    <View style={styles.inner}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.label}>{ylabel}</Text>
      <LineChart
        data={data}
        width={chartWidth}
        height={chartHeight}
        chartConfig={chartConfig}
        fromZero={false}
        withInnerLines={false}
        withOuterLines={false}
        withDots={false}
        withShadow={false}
      />
    </View>
  );
}
