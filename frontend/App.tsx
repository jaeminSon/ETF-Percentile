import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InputScreen from "./screen/InputScreen";
import MainScreen from "./screen/MainScreen";
import { StackParamList } from "./types/StackParamList";

const Stack = createNativeStackNavigator<StackParamList>();

const linking = {
  prefixes: ["http://localhost:8081"],
  config: {
    screens: {
      InputScreen: "",
      MainScreen: "main/:ticker/:window",
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
