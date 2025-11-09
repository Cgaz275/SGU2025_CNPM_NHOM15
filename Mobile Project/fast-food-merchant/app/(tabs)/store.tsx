import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StoreScreen() {
  const router = useRouter();

  const buttons = [
    {
      id: 'info',
      label: 'Thông tin cửa hàng',
      icon: 'storefront-outline',
      onPress: () => router.push('../storeinfo'),
      color: '#2196f3',
    },
    {
      id: 'menu',
      label: 'Thực đơn',
      icon: 'restaurant-outline',
      onPress: () => router.push('../menu'),
      color: '#4caf50',
    },
    {
      id: 'statistic',
      label: 'Thống kê',
      icon: 'stats-chart-outline',
      onPress: () => router.push('../statistic'),
      color: '#9c27b0',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý cửa hàng</Text>

      {buttons.map((btn) => (
        <TouchableOpacity
          key={btn.id}
          style={[styles.button, { backgroundColor: btn.color }]}
          onPress={btn.onPress}
          activeOpacity={0.8}
        >
          <Ionicons
            name={btn.icon as any}
            size={22}
            color="#fff"
            style={styles.icon}
          />
          <Text style={styles.label}>{btn.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'left',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
