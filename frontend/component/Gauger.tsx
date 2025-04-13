import { Platform } from "react-native";
import CustomGaugerAndroid from "./GaugerAndroid";
import CustomGaugerWeb from "./GaugerWeb";

type Props = {
  leftColor: string;
  leftText: string;
  rightColor: string;
  rightText: string;
  title: string;
  percentile: number;
};

export default function CustomGauger({
  leftColor,
  leftText,
  rightColor,
  rightText,
  title,
  percentile,
}: Props) {
  if (Platform.OS === "web") {
    return (
      <CustomGaugerWeb
        leftColor={leftColor}
        leftText={leftText}
        rightColor={rightColor}
        rightText={rightText}
        title={title}
        percentile={percentile}
      />
    );
  } else if (Platform.OS === "android") {
  }
}
