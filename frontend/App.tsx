import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import LandingScreen from "./screen/LandingScreen";
import InputScreen from "./screen/InputScreen";
import GaugeScreen from "./screen/GaugeScreen";
import ExplainScreen from "./screen/ExplainScreen";
import TechScreen from "./screen/TechScreen";
import DefensiveAssetScreen from "./screen/DefensiveAssetScreen";
import { StackParamList } from "./types/StackParamList";

const Stack = createNativeStackNavigator<StackParamList>();

const linking = {
  prefixes: [],
  config: {
    screens: {
      LandingScreen: "",
      InputScreen: "input",
      GaugeScreen: "gauge/:ticker/:window",
      TechScreen: "tech",
      DefensiveAssetScreen: "defensive",
      ExplainScreen: "explain",
    },
  },
};

export default function App() {
  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "ETF Percentile";
    }
  }, []);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen
          name="LandingScreen"
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="InputScreen"
          component={InputScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GaugeScreen"
          component={GaugeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ExplainScreen"
          component={ExplainScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TechScreen"
          component={TechScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DefensiveAssetScreen"
          component={DefensiveAssetScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
