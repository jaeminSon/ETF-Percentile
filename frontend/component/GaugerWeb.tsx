import React from "react";
import GaugeChart from "react-gauge-chart";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const chartWidth = (screenWidth * 2) / 5;
const textMarginTop = -chartWidth / 20;
const fontsize = chartWidth / 30;

type Props = {
  leftColor: string;
  leftText: string;
  rightColor: string;
  rightText: string;
  title: string;
  percentile: number;
};

export default function CustomGaugerWeb({
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
      <GaugeChart
        id={title}
        nrOfLevels={5}
        percent={percentile / 100}
        colors={[leftColor, rightColor]} // gradient left to right
        arcPadding={0.02}
        needleColor="#345243"
        needleBaseColor="#345243"
        textColor="#333"
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: textMarginTop,
        }}
      >
        <span style={{ fontSize: fontsize, color: leftColor }}>{leftText}</span>
        <span style={{ fontSize: fontsize, color: rightColor }}>
          {rightText}
        </span>
      </div>
    </div>
  );
}
