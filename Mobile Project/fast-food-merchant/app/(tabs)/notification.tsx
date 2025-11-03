import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { notifications, Notification } from '@/data/notification';

const typeColors = {
  order: '#4caf50',
  customer: '#ff9800',
  system: '#2196f3',
  finance: '#9c27b0',
  promotion: '#f44336',
} as const;

const FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đơn hàng', value: 'order' },
  { label: 'Khách hàng', value: 'customer' },
  { label: 'Tài chính', value: 'finance' },
  { label: 'Khuyến mãi', value: 'promotion' },
  { label: 'Hệ thống', value: 'system' },
];

export default function NotificationScreen() {
  const [data, setData] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | Notification['type']>('all');

  useEffect(() => {
    // Giả lập fetch data từ RAM
    setTimeout(() => {
      setData(notifications);
    }, 500);
  }, []);

  const filteredData =
    filter === 'all' ? data : data.filter((item) => item.type === filter);

  const renderItem = ({ item }: { item: Notification }) => (
    <View
      style={[
        styles.card,
        { borderLeftWidth: 4, borderLeftColor: typeColors[item.type] },
      ]}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thông báo</Text>

      {/* Thanh filter */}
      <View style={styles.filterContainer}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[
              styles.filterButton,
              filter === f.value && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f.value as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách noti */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#000',
  },
  filterText: {
    color: '#333',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
});
