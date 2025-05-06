import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InputScreen from "./screen/InputScreen";
import MainScreen from "./screen/MainScreen";
import ExplainScreen from "./screen/ExplainScreen";
import TableScreen from "./screen/TableScreen";
import { StackParamList } from "./types/StackParamList";

const Stack = createNativeStackNavigator<StackParamList>();

const linking = {
  prefixes: [],
  config: {
    screens: {
      InputScreen: "",
      MainScreen: "main/:ticker/:window",
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
          name="InputScreen"
          component={InputScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainScreen"
          component={MainScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ExplainScreen"
          component={ExplainScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TableScreen"
          component={TableScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
