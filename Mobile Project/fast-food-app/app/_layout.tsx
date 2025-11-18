import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const isLoggedIn = false; // sau này m thay bằng check token

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        initialRouteName="(auth)"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="category"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="map"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="order"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="info"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="checkout"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="restaurantsc"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="address"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="promotion"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
