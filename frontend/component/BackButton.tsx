import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StackParamList } from "../types/StackParamList";

const CustomBack = () => {
  type NavigationProp = NativeStackNavigationProp<StackParamList>;
  const navigation = useNavigation<NavigationProp>();

  return (
    <Button
      mode="contained"
      onPress={() => navigation.goBack()}
      style={{ marginTop: 30 }}
    >
      ← Back
    </Button>
  );
};

export default CustomBack;
