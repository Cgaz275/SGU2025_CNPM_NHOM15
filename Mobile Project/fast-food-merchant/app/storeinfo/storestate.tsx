import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StoreState() {
  const navigation = useNavigation();
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Row trạng thái với icon tròn màu xanh */}
      <View style={styles.statusRow}>
        <View style={styles.statusCircle} />
        <Text style={styles.statusText}>Nhà hàng đang mở cửa</Text>
      </View>

      {/* Row 2: Lịch đóng cửa */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push('../storeinfo/close')}
      >
        <Text style={styles.label}>Lịch đóng cửa</Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#888"
        />
      </TouchableOpacity>

      {/* Row 3: Giờ cố định hàng ngày */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push('../storeinfo/daily')}
      >
        <Text style={styles.label}>Giờ mở cửa cố định</Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#888"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingVertical: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12, // khoảng cách giữa icon và text
  },
  statusCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0a0', // xanh lá
  },
  statusText: {
    fontSize: 16,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
});
