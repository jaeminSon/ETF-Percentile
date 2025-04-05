import React from 'react';
import GaugeChart from 'react-gauge-chart';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width
const chartWidth = 4*screenWidth / 5;
const textMarginTop = -chartWidth / 20
const fontsize = chartWidth / 30

type Props = {
  // x: number[];
  // y: number[];
  leftColor: string;
  leftText: string;
  rightColor: string;
  rightText: string;
  title: string;
};

export default function CustomGaugeChart({ leftColor, leftText, rightColor, rightText, title }: Props) {
  return (
    <div style={{ width: chartWidth, margin: 'auto'}}>
      <h1 style={{ textAlign: 'center'}}>
        {title}
      </h1>
      <GaugeChart
        id={title}
        nrOfLevels={10}
        percent={0.3}
        colors={[leftColor, rightColor]} // gradient left to right
        arcPadding={0.02}
        needleColor="#345243"
        needleBaseColor="#345243"
        textColor="#333"
      />
            <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: textMarginTop,
        }}
      >
        <span style={{ fontSize: fontsize, color: leftColor }}>{leftText}</span>
        <span style={{ fontSize: fontsize, color: rightColor }}>{rightText}</span>
      </div>
      </div>
  );
}
