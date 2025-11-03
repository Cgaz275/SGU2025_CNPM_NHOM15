import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { restaurants } from '../../data/mockData';

export default function CheckoutTracking() {
  const router = useRouter();

  // Lấy Phở Thìn làm ví dụ
  const phoThin = restaurants.find((r) => r.name === 'Phở Thìn');
  if (!phoThin) return null;

  // Giả lập đơn hàng: món + số lượng
  const orderItems = phoThin.dishes.map((dish) => ({ ...dish, quantity: 1 }));

  const serviceFee = 5000;
  const shippingFee = 10000;
  const subtotal = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const total = subtotal + serviceFee + shippingFee;

  return (
    <ScrollView style={styles.container}>
      {/* Quay lại */}
      <TouchableOpacity
        style={{ padding: 8 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../assets/icons/close.png')} // đường dẫn tới icon của m
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Hình trạng đơn hàng */}
      <Image
        source={require('../../assets/images/wait.png')}
        style={styles.image}
      />
      <Text style={styles.eta}>Thời gian dự kiến: 10-15 phút</Text>
      <Text style={styles.status}>
        Thức ăn đang được chuẩn bị, sẽ bắt đầu giao khi đã sẵn sàng
      </Text>

      {/* Thông tin nhà hàng */}
      <View style={styles.infoContainer}>
        <Text style={styles.restaurantName}>{phoThin.name}</Text>
        <Text style={styles.orderCode}>Mã order: #123456</Text>
      </View>

      {/* Danh sách món */}
      <View style={styles.section}>
        {orderItems.map((item) => (
          <View
            key={item.id}
            style={styles.itemRow}
          >
            <Image
              source={item.image}
              style={styles.itemImage}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              {(item.price * item.quantity).toLocaleString()}đ
            </Text>
          </View>
        ))}
      </View>

      {/* Phí dịch vụ, phí ship */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text>Phí dịch vụ</Text>
          <Text>{serviceFee.toLocaleString()}đ</Text>
        </View>
        <View style={styles.row}>
          <Text>Phí giao hàng</Text>
          <Text>{shippingFee.toLocaleString()}đ</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.totalText}>Tổng</Text>
          <Text style={styles.totalText}>{total.toLocaleString()}đ</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  backButton: { marginBottom: 16 },
  backText: { fontSize: 16, color: '#e67e22' },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 12,
  },
  eta: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  status: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  infoContainer: { marginBottom: 16 },
  restaurantName: { fontSize: 20, fontWeight: '700' },
  orderCode: { fontSize: 14, color: '#666', marginTop: 4 },
  section: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  itemImage: { width: 70, height: 70, borderRadius: 8 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemQuantity: { fontSize: 14, color: '#666', marginTop: 4 },
  itemPrice: { fontWeight: '700', color: '#e67e22' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalText: { fontWeight: '700', fontSize: 16 },
});
