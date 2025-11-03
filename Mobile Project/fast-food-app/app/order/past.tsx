import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getOrders, getRestaurantName } from '../../data/orders';

export default function PastOrder() {
  const router = useRouter();
  const [orders, setOrders] = useState(getOrders());

  // Mỗi lần màn hình được focus => reload lại data
  useFocusEffect(
    useCallback(() => {
      setOrders(getOrders());
    }, [])
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ padding: 8 }}
        onPress={() => router.push('../(tabs)/profile')}
      >
        <Image
          source={require('../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={styles.title}>Đơn hiện tại</Text>

      {orders.length === 0 ? (
        <Text style={{ color: '#999', marginTop: 12 }}>
          Chưa có đơn hàng nào
        </Text>
      ) : (
        <FlatList
          data={orders.filter(
            (o) => o.status === 'completed' || o.status === 'cancelled'
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const restaurantName = getRestaurantName(item.restaurantId);
            const thumbnail = item.items[0]?.image; // món đầu tiên
            return (
              <TouchableOpacity
                style={styles.orderCard}
                onPress={() =>
                  router.push({
                    pathname: '/checkout/[id]',
                    params: { id: item.id },
                  })
                }
              >
                <View style={styles.orderCardContent}>
                  {/* Hình món */}
                  {thumbnail && (
                    <Image
                      source={thumbnail}
                      style={styles.orderThumbnail}
                    />
                  )}

                  {/* Thông tin */}
                  <View style={styles.orderInfo}>
                    <Text style={styles.restaurantName}>{restaurantName}</Text>
                    <Text style={styles.status}>
                      {item.status === 'completed'
                        ? 'Đơn hàng đã hoàn thành'
                        : item.status === 'cancelled'
                        ? 'Đơn hàng đã bị hủy'
                        : 'Tình trạng không xác định'}
                    </Text>
                    <Text style={styles.total}>
                      Tổng: {item.total.toLocaleString()}đ
                    </Text>
                    <Text style={styles.time}>
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  orderCardContent: { flexDirection: 'row', alignItems: 'center' },
  orderThumbnail: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  restaurantName: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  orderCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  orderInfo: { marginBottom: 8 },
  status: { fontWeight: '600', fontSize: 14, color: '#333' },
  total: { fontSize: 16, color: '#e67e22', fontWeight: '700', marginTop: 4 },
  time: { fontSize: 12, color: '#666', marginTop: 2 },
});
