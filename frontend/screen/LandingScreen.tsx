import React, { useState } from "react";
import {
  ScrollView,
  View,
  Dimensions,
  StyleSheet,
  Pressable,
  Platform,
  RefreshControl,
  Linking,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ExplainScreen from "./ExplainScreen";
import KoFiWidget from "../component/kofi";
import IndexETFScreen from "./IndexETFScreen";
import InputScreen from "./InputScreen";

export default function LandingScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  const handleInputScreen = () => {
    navigation.navigate("InputScreen", {});
  };

  const handleExplainScreen = () => {
    navigation.navigate("ExplainScreen", {});
  };

  const handleTechScreen = () => {
    navigation.navigate("TechScreen", {});
  };

  const handleDefensiveAssetScreen = () => {
    navigation.navigate("DefensiveAssetScreen", {});
  };

  const handleAndroidDownload = () => {
    const playStoreUrl =
      "https://play.google.com/store/apps/details?id=com.jaeminson.etfpercentile";
    Linking.openURL(playStoreUrl);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const screenHeight = Dimensions.get("window").height;
  const paddingTop = screenHeight / 5;
  const paddinglinkTop = screenHeight / 20;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "white",
    },
    iconContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: paddinglinkTop,
    },
    iconWrapper: {
      marginHorizontal: 16,
    },
    cofiSection: {
      marginTop: paddingTop,
    },
    androidDownloadSection: {
      marginTop: 20,
      alignItems: "center",
    },
    androidDownloadButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#4285F4",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    androidDownloadText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
      marginLeft: 8,
    },
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#0000ff"]}
          tintColor="#0000ff"
        />
      }
    >
      {Platform.OS === "android" && (
        <View style={styles.iconContainer}>
          <Pressable onPress={handleExplainScreen} style={styles.iconWrapper}>
            <Ionicons name="information-circle-outline" size={32} />
          </Pressable>
          <Pressable onPress={handleTechScreen} style={styles.iconWrapper}>
            <Ionicons name="rocket-outline" size={32} />
          </Pressable>
          <Pressable
            onPress={handleDefensiveAssetScreen}
            style={styles.iconWrapper}
          >
            <Ionicons name="cash-outline" size={32} />
          </Pressable>
          <Pressable onPress={handleInputScreen} style={styles.iconWrapper}>
            <Ionicons name="calculator-outline" size={32} />
          </Pressable>
        </View>
      )}

      {Platform.OS === "web" && (
        <View style={styles.androidDownloadSection}>
          <Pressable
            onPress={handleAndroidDownload}
            style={styles.androidDownloadButton}
          >
            <Ionicons name="logo-google-playstore" size={24} color="white" />
            <Text style={styles.androidDownloadText}>More on Android App</Text>
          </Pressable>
        </View>
      )}

      {Platform.OS === "web" && <InputScreen navigation={navigation} />}

      {Platform.OS === "android" && <IndexETFScreen />}

      {Platform.OS === "web" && (
        <View>
          <View>
            <ExplainScreen />
          </View>
          <View style={styles.cofiSection}>
            <KoFiWidget />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
