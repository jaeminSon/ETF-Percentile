import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import LandingScreen from "./screen/LandingScreen";
import InputScreen from "./screen/InputScreen";
import GaugeScreen from "./screen/GaugeScreen";
import ExplainScreen from "./screen/ExplainScreen";
import TechScreen from "./screen/TechScreen";
import AssetScreen from "./screen/AssetScreen";
import GlobalScreen from "./screen/GlobalScreen";
import SectorScreen from "./screen/SectorScreen";
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
      AssetScreen: "defensive",
      ExplainScreen: "explain",
      GlobalScreen: "global",
      SectorScreen: "sector",
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
          name="AssetScreen"
          component={AssetScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GlobalScreen"
          component={GlobalScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SectorScreen"
          component={SectorScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
