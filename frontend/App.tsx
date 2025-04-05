import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ChartScreen from './screen/ChartScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ChartScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
