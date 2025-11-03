import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function OrderLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#e67e22',
        headerShown: false, // có header trên cùng
      }}
    >
      <Tabs.Screen
        name="present"
        options={{
          title: 'Đơn hiện tại',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="time"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="past"
        options={{
          title: 'Lịch sử',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="book"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
