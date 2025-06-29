import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingScreen from "./screen/LandingScreen";
import InputScreen from "./screen/InputScreen";
import GaugeScreen from "./screen/GaugeScreen";
import ExplainScreen from "./screen/ExplainScreen";
import IndexETFScreen from "./screen/IndexETFScreen";
import { StackParamList } from "./types/StackParamList";

const Stack = createNativeStackNavigator<StackParamList>();

const linking = {
  prefixes: [],
  config: {
    screens: {
      LandingScreen: "",
      InputScreen: "input",
      GaugeScreen: "gauge/:ticker/:window",
      TableScreen: "table",
      ExplainScreen: "explain",
    },
  },
};

export default function App() {
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
          name="TableScreen"
          component={IndexETFScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
