// app/order/checkout3.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { restaurants } from '../../data/mockData';
import { getOrders, updateOrderStatus } from '../../data/orders';

export default function Checkout3Screen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const orders = getOrders();
    const found = orders.find((o) => o.id === orderId);
    setOrder(found);
  }, [orderId]);

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const restaurant = restaurants.find((r) => r.id === order.restaurantId);

  const handleCancel = () => {
    Alert.alert('Hủy đơn hàng', 'Bạn có chắc muốn hủy đơn này?', [
      { text: 'Không' },
      {
        text: 'Có',
        onPress: () => {
          updateOrderStatus(order.id, 'cancelled');
          setOrder({ ...order, status: 'cancelled' });
          Alert.alert('✅', 'Đơn hàng đã được hủy.');
        },
      },
    ]);
  };

  const handleConfirmReceived = () => {
    updateOrderStatus(order.id, 'completed');
    setOrder({ ...order, status: 'completed' });
    Alert.alert('🎉', 'Cảm ơn bạn! Đơn hàng đã được xác nhận hoàn tất.');
  };

  const renderStatusMessage = () => {
    switch (order.status) {
      case 'pending':
        return 'Đang đợi nhà hàng xác nhận đơn hàng.';
      case 'confirmed':
        return 'Nhà hàng đã xác nhận, đang chuẩn bị món ăn.';
      case 'waitingCustomer':
        return 'Tài xế đã giao hàng, vui lòng xác nhận nếu bạn đã nhận.';
      case 'completed':
        return 'Đơn hàng đã hoàn tất. Cảm ơn bạn đã đặt món!';
      case 'cancelled':
        return 'Đơn hàng đã bị hủy.';
      default:
        return '';
    }
  };

  const showCancelButton =
    order.status === 'pending' || order.status === 'waitingCustomer';
  const showConfirmButton = order.status === 'waitingCustomer';

  const serviceFee = 5000;
  const shippingFee = 15000;
  const total = order.total + serviceFee + shippingFee;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={{ padding: 8 }}
        onPress={() => router.push('../order/present')}
      >
        <Image
          source={require('../../assets/icons/close.png')}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Thông báo */}
      <View style={styles.section}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/time-left.png')}
            style={styles.waitImage}
          />
        </View>
        <Text style={styles.infoTextCentered}>{renderStatusMessage()}</Text>
      </View>

      {/* Hàng đã đặt */}
      <View style={styles.section}>
        <Text style={styles.orderId}>Mã đơn hàng: {order.id}</Text>
        <Text style={styles.sectionTitle}>🛒 Hàng đã đặt</Text>
        {order.items.map((item: any) => (
          <View
            key={item.id}
            style={styles.dishRow}
          >
            <Image
              source={item.image}
              style={styles.dishImage}
            />
            <View style={styles.dishInfo}>
              <Text style={styles.dishName}>{item.name}</Text>
              <Text style={styles.dishPrice}>
                {item.price.toLocaleString()}đ x {item.quantity}
              </Text>
            </View>
          </View>
        ))}

        {/* Tổng phí */}
        <View style={styles.feeRow}>
          <Text>Phí dịch vụ</Text>
          <Text>{serviceFee.toLocaleString()}đ</Text>
        </View>
        <View style={styles.feeRow}>
          <Text>Phí giao hàng</Text>
          <Text>{shippingFee.toLocaleString()}đ</Text>
        </View>
        <View style={[styles.feeRow, { marginTop: 8 }]}>
          <Text style={{ fontWeight: '700' }}>Tổng cộng</Text>
          <Text style={{ fontWeight: '700' }}>{total.toLocaleString()}đ</Text>
        </View>
      </View>

      {/* Nút hành động */}
      {showCancelButton && order.status !== 'cancelled' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={styles.cancelText}>Hủy đơn hàng</Text>
        </TouchableOpacity>
      )}

      {showConfirmButton && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmReceived}
        >
          <Text style={styles.confirmText}>Xác nhận đã nhận hàng</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  imageContainer: { alignItems: 'center', marginVertical: 16 },
  waitImage: { width: 120, height: 120, resizeMode: 'contain' },
  infoTextCentered: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  section: { marginHorizontal: 16, marginTop: 80 },
  orderId: { fontSize: 14, fontWeight: '600', marginBottom: 16 },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginBottom: 12 },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  dishImage: { width: 60, height: 60, borderRadius: 8 },
  dishInfo: { flex: 1, marginLeft: 12 },
  dishName: { fontSize: 16, fontWeight: '600' },
  dishPrice: { fontWeight: '700', color: '#e67e22', marginTop: 4 },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  confirmButton: {
    backgroundColor: '#27ae60',
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
