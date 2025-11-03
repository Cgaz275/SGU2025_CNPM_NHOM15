import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#D7A359',
        tabBarInactiveTintColor: '#999',

        // 🔥 Hiệu ứng chuyển tab mượt như iOS
        animation: 'shift', // hoặc thử 'slide_from_right'
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          height: 70,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Đơn hàng',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="receipt-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="notifications-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="store"
        options={{
          title: 'Cửa hàng',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="storefront-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
