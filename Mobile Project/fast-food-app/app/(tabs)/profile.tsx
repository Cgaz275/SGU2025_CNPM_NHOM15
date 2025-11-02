import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
export default function ProfileScreen() {
  const router = useRouter();
  const userName = 'Anthony';
  const pendingOrders = 3; // số đơn hàng đang chờ, mock data

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Chào {userName}!</Text>
        <Text style={styles.pendingOrders}>
          {pendingOrders} đơn hàng đang chờ
        </Text>
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Liên kết nhanh</Text>
        <TouchableOpacity style={styles.linkItem}>
          <Text style={styles.linkText}>Hỗ trợ người dùng</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('../order')}
          style={styles.linkItem}
        >
          <Text style={styles.linkText}>Lịch sử đơn hàng</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>
        <TouchableOpacity style={styles.linkItem}>
          <Text style={styles.linkText}>Thông tin cá nhân</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkItem}>
          <Text style={styles.linkText}>Địa chỉ</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60, // đẩy xuống thấp hơn
  },

  header: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  greeting: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  pendingOrders: { fontSize: 16, color: '#666' },

  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  linkItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  linkText: { fontSize: 16 },
});
