import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { SegmentedArc } from "@shipt/segmented-arc-for-react-native";

const screenHeight = Dimensions.get("window").height;

type Props = {
  leftColor: string;
  leftText: string;
  rightColor: string;
  rightText: string;
  title: string;
  percentile: number;
};

function interpolateColors(
  startColor: string,
  endColor: string,
  steps: number,
): string[] {
  const hexToRgb = (hex: string) => {
    const normalized = hex.replace("#", "");
    const bigint = parseInt(normalized, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  const start = hexToRgb(startColor);
  const end = hexToRgb(endColor);
  const colors: string[] = [];

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1); // from 0 to 1
    const r = start.r + (end.r - start.r) * ratio;
    const g = start.g + (end.g - start.g) * ratio;
    const b = start.b + (end.b - start.b) * ratio;
    colors.push(rgbToHex(r, g, b));
  }

  return colors;
}

export default function CustomGaugerAndroid({
  leftColor,
  leftText,
  rightColor,
  rightText,
  title,
  percentile,
}: Props) {
  const colors = interpolateColors(leftColor, rightColor, 4);
  const color_index = Math.round(percentile / 34);
  const percent = Math.round(percentile * 10) / 10;

  const segments = [
    {
      scale: 1,
      filledColor: colors[color_index],
      emptyColor: "#F2F3F5",
    },
  ];

  const styles = StyleSheet.create({
    inner: {
      flex: 1,
      paddingHorizontal: 0,
      paddingTop: screenHeight / 30,
      paddingBottom: screenHeight / 30,
      backgroundColor: "white",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 28,
      fontWeight: "600",
      marginBottom: 8,
      marginRight: 10,
      textAlign: "center",
    },
    value: {
      flex: 1,
      fontSize: 28,
      fontWeight: "600",
      textAlign: "center",
      justifyContent: "space-between",
      alignItems: "center",
      lineHeight: 130,
    },
  });

  return (
    <View style={styles.inner}>
      <Text style={styles.title}>{title}</Text>
      <SegmentedArc
        segments={segments}
        fillValue={percent}
        isAnimated={true}
        animationDelay={10}
        showArcRanges={false}
        children={() => <Text style={styles.value}>{percent} %</Text>}
      ></SegmentedArc>
    </View>
  );
}
