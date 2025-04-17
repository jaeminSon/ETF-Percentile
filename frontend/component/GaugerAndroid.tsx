import React from "react";
import { Dimensions } from "react-native";
import { View, Text, Pressable } from "react-native";
import { SegmentedArc } from "@shipt/segmented-arc-for-react-native";

const screenWidth = Dimensions.get("window").width;
const chartWidth = (screenWidth * 2) / 5;
const textMarginTop = -chartWidth / 20;
const fontsize = chartWidth / 10;

type Props = {
  leftColor: string;
  leftText: string;
  rightColor: string;
  rightText: string;
  title: string;
  percentile: number;
};

export default function CustomGaugerAndroid({
  leftColor,
  leftText,
  rightColor,
  rightText,
  title,
  percentile,
}: Props) {
  const segments = [
    {
      scale: 0.25,
      filledColor: "#FF746E",
      emptyColor: "#F2F3F5",
      data: { label: "Red" },
    },
    {
      scale: 0.25,
      filledColor: "#F5E478",
      emptyColor: "#F2F3F5",
      data: { label: "Yellow" },
    },
    {
      scale: 0.25,
      filledColor: "#78F5CA",
      emptyColor: "#F2F3F5",
      data: { label: "Green" },
    },
    {
      scale: 0.25,
      filledColor: "#6E73FF",
      emptyColor: "#F2F3F5",
      data: { label: "Blue" },
    },
  ];

  const ranges = ["10", "20", "30", "40", "50"];

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <SegmentedArc
        segments={segments}
        fillValue={70}
        isAnimated={true}
        animationDelay={1000}
        showArcRanges={true}
        ranges={ranges}
      ></SegmentedArc>
    </View>
  );
}
