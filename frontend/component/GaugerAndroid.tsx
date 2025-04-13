import React from "react";
import Gauge from "react-native-gauge";
import { Dimensions } from "react-native";

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
  return (
    <div style={{ width: chartWidth, margin: "auto" }}>
      <h1 style={{ textAlign: "center" }}>{title}</h1>
      <Gauge
        size={75}
        progress={percentile / 100}
        animated={true}
        alwaysUseEndAngle={true}
        endAngle={0}
        unfilledEndAngle={0}
        thickness={chartWidth / 20}
        borderWidth={1}
        needleWidth={10}
        needleHeight={chartWidth / 20}
        needleBorderRadius={25}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: textMarginTop,
        }}
      >
        <span style={{ fontSize: fontsize, color: leftColor }}>
          {percentile} %
        </span>
        <span style={{ fontSize: fontsize, color: rightColor }}>
          {rightText}
        </span>
      </div>
    </div>
  );
}
