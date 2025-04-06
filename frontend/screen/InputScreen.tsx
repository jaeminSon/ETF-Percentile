import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';

export default function InputScreen( { navigation }: any) {
  // Ticker
  const [openTicker, setOpenTicker] = useState(false);
  const [ticker, setTicker] = useState('SPY');
  const [itemsTicker, setItemsTicker] = useState([
    { label: 'SPY', value: 'SPY' },
    { label: 'QQQ', value: 'QQQ' },
    { label: 'TQQQ', value: 'TQQQ' },
    { label: 'SOXL', value: 'SOXL' },
    { label: 'SPXL', value: 'SPXL' },
  ]);

  // Mving Average Window Size
  const [openWindow, setOpenWindow] = useState(false);
  const [window, setWindow] = useState(100);
  const [itemsWindow, setItemsWindow] = useState([
    { label: '20', value: 20 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
  ]);

  const handleOpenTicker = () => {
    setOpenTicker(true);
    setOpenWindow(false);
  };

  const handleOpenWindowMA = () => {
    setOpenTicker(false);
    setOpenWindow(true);
  };
  
  const handleSubmit = () => {
    navigation.navigate('MainScreen', {
      ticker: ticker,
      window: window,
    });
  };

  const screenWidth = Dimensions.get('window').width
  const padding = screenWidth / 20

  return (
    <View style={{ padding, backgroundColor: "white" }}>
      <h3 style={{ textAlign: 'left'}}>
        Ticker
      </h3>
      <DropDownPicker
        open={openTicker}
        value={ticker}
        items={itemsTicker}
        setOpen={setOpenTicker}
        setValue={setTicker}
        setItems={setItemsTicker}
        onOpen={handleOpenTicker}
        zIndex={2000}
        zIndexInverse={2000}
        containerStyle={{ marginBottom: 20 }}
      />
      <h3 style={{ textAlign: 'left'}}>
        Moving Average Window
      </h3>
      <DropDownPicker
        open={openWindow}
        value={window}
        items={itemsWindow}
        setOpen={setOpenWindow}
        setValue={setWindow}
        setItems={setItemsWindow}
        onOpen={handleOpenWindowMA}
        zIndex={1000}
        zIndexInverse={1000}
        containerStyle={{ marginBottom: 20 }}
      />
      
      <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 30 }}>
        Compute Percentile
      </Button>
    </View>
  );
}
