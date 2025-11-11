import { getDefaultAddress } from '@/data/address'; // import hàm lấy địa chỉ mặc định
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { clearCart, getCart } from '../../../data/cart';
import { addOrder } from '../../../data/orders';

export default function Checkout2Screen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  const [defaultAddress, setDefaultAddress] = useState(getDefaultAddress());

  useFocusEffect(
    useCallback(() => {
      setDefaultAddress(getDefaultAddress());
    }, [])
  );

  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Visa' | 'VNPay'>('Cash');

  const serviceFee = 5000;
  const shippingFee = 15000;

  useEffect(() => {
    const data = getCart();
    setCart(data || []);
  }, []);

  const orderTotal = cart.reduce((sum, item) => {
    let itemExtra = 0;
    if (item.options) {
      Object.entries(item.options).forEach(([key, value]: [string, any]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => (itemExtra += v.price || 0));
        } else if (typeof value === 'object' && value.price) {
          itemExtra += value.price;
        }
      });
    }
    return sum + (item.price + itemExtra) * item.quantity;
  }, 0);

  const total = orderTotal + serviceFee + shippingFee;

  const handleOrder = () => {
    if (cart.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Hãy chọn món trước khi đặt hàng nhé!');
      return;
    }

    const newOrder = addOrder({
      restaurantId: cart[0].restaurantId,
      items: cart,
      total,
      paymentMethod,
      address: defaultAddress
        ? `${defaultAddress.address}${
            defaultAddress.building ? ', ' + defaultAddress.building : ''
          }${defaultAddress.gate ? ', ' + defaultAddress.gate : ''}`
        : 'Không có địa chỉ',
    });

    clearCart();
    router.push({
      pathname: '/checkout/[id]',
      params: { id: newOrder.id, from: 'checkout' },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <TouchableOpacity
        style={{ marginTop: 50, marginLeft: 20, paddingBottom: 10 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      {/* Phần nội dung scroll được */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Địa chỉ mặc định */}
        {defaultAddress && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: '#f8f8f8',
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>
              Địa chỉ giao hàng
            </Text>
            <Text style={{ fontWeight: '600' }}>
              {defaultAddress.name} - {defaultAddress.phone}
            </Text>
            <Text>{defaultAddress.address}</Text>
            {defaultAddress.building && <Text>{defaultAddress.building}</Text>}
            {defaultAddress.gate && <Text>{defaultAddress.gate}</Text>}
            <Text style={{ fontStyle: 'italic', marginTop: 4 }}>
              {defaultAddress.tag}
            </Text>

            <TouchableOpacity
              style={{ marginTop: 8 }}
              onPress={() => router.push('../../address')}
            >
              <Text style={{ color: '#007BFF' }}>Thay đổi địa chỉ</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Giỏ hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giỏ hàng</Text>
          {cart.length === 0 ? (
            <Text style={{ color: '#999' }}>Giỏ hàng trống</Text>
          ) : (
            cart.map((item, index) => (
              <View
                key={`${item.id}-${index}`}
                style={styles.cartItem}
              >
                <Image
                  source={item.image}
                  style={styles.cartImage}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                  <Text>
                    {item.price.toLocaleString()}đ x {item.quantity}
                  </Text>

                  {item.options && Object.keys(item.options).length > 0 && (
                    <View style={{ marginTop: 4 }}>
                      {Object.entries(item.options).map(([group, value]) => (
                        <View key={group}>
                          <Text style={styles.optionGroup}>• {group}:</Text>
                          {Array.isArray(value) ? (
                            value.map((v, idx) => (
                              <Text
                                key={idx}
                                style={styles.optionItem}
                              >
                                - {v.name}
                                {v.price
                                  ? ` (+${v.price.toLocaleString()}đ)`
                                  : ''}
                              </Text>
                            ))
                          ) : (
                            <Text style={styles.optionItem}>
                              - {value.name}
                              {value.price
                                ? ` (+${value.price.toLocaleString()}đ)`
                                : ''}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Thanh toán */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình thức thanh toán</Text>
          <View style={styles.paymentContainer}>
            {['Visa', 'VNPay'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentButton,
                  paymentMethod === method && styles.paymentSelected,
                ]}
                onPress={() => setPaymentMethod(method as any)}
              >
                <Text
                  style={{
                    color: paymentMethod === method ? '#fff' : '#000',
                    fontWeight: paymentMethod === method ? '700' : '400',
                  }}
                >
                  {method}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tổng tiền */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng tiền</Text>
          <View style={styles.totalRow}>
            <Text>Tổng giá sản phẩm:</Text>
            <Text>{orderTotal.toLocaleString()}đ</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Phí dịch vụ:</Text>
            <Text>{serviceFee.toLocaleString()}đ</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Phí vận chuyển:</Text>
            <Text>{shippingFee.toLocaleString()}đ</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 8 }]}>
            <Text style={{ fontWeight: '700' }}>Tổng cộng:</Text>
            <Text style={{ fontWeight: '700' }}>{total.toLocaleString()}đ</Text>
          </View>
        </View>
      </ScrollView>

      {/* ✅ Nút đặt hàng dính cố định ở cuối */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={handleOrder}
        >
          <Text style={styles.orderText}>Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: '#fff' },
  mapPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
  },
  section: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontWeight: '700', fontSize: 16, marginBottom: 8 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cartImage: { width: 60, height: 60, borderRadius: 8 },
  optionGroup: { color: '#666', fontSize: 13, fontWeight: '500' },
  optionItem: { color: '#666', fontSize: 13, marginLeft: 8 },
  paymentContainer: { flexDirection: 'column', gap: 12 },
  paymentButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
  },
  paymentSelected: {
    backgroundColor: '#e67e22',
    borderColor: '#e67e22',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  orderButton: {
    backgroundColor: '#e67e22',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  orderText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
