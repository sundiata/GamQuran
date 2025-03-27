import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { COLORS } from './src/constants/theme';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <AppNavigator />
        <StatusBar style="dark" backgroundColor={COLORS.background} />
      </View>
    </SafeAreaProvider>
  );
} 