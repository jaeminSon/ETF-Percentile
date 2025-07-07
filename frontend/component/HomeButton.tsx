import { IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { StackParamList } from "../types/StackParamList";

const HomeButton = () => {
  type NavigationProp = NativeStackNavigationProp<StackParamList>;
  const navigation = useNavigation<NavigationProp>();

  return (
    <IconButton
      icon={() => <Ionicons name="home-outline" size={32} color="#000" />}
      onPress={() => navigation.navigate("LandingScreen")}
      style={{ marginTop: 10 }}
      size={50}
    />
  );
};

export default HomeButton;
