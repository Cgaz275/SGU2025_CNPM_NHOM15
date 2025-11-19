import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
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
import { auth, db } from '../../../FirebaseConfig';

export default function Checkout2Screen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;
  const [loadingData, setLoadingData] = useState(true);

  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Visa');
  const [promotion, setPromotion] = useState<any>(null);

  const serviceFee = 5000;
  const shippingFee = 15000;
  const params = useLocalSearchParams();

  // ---------------- Load cart + address + promotion ----------------
  useEffect(() => {
    const load = async () => {
      try {
        const data = getCart();
        setCart(data || []);

        const user = auth.currentUser;
        if (!user) {
          router.replace('../(auth)');
          return;
        }

        // 1️⃣ Load address
        if (params.selectedAddressId) {
          const ref = doc(db, 'address', params.selectedAddressId as string);
          const snap = await getDoc(ref);
          if (snap.exists()) setDefaultAddress({ id: snap.id, ...snap.data() });
        } else {
          const userRef = doc(db, 'user', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const defaultId = userSnap.data().defaultAddressId;
            if (defaultId) {
              const addrSnap = await getDoc(doc(db, 'address', defaultId));
              if (addrSnap.exists())
                setDefaultAddress({ id: addrSnap.id, ...addrSnap.data() });
            }
          }
        }

        // 2️⃣ Load promotion nếu có param
        if (params.selectedPromoId) {
          const promoRefs = [
            doc(db, 'promotions', params.selectedPromoId as string),
            doc(db, 'promotions_restaurant', params.selectedPromoId as string),
          ];
          for (const ref of promoRefs) {
            const snap = await getDoc(ref);
            if (snap.exists()) {
              const data = snap.data();
              const orderTotal = getCart().reduce((sum, item) => {
                let itemExtra = 0;
                if (item.options) {
                  Object.entries(item.options).forEach(
                    ([_, value]: [string, any]) => {
                      if (Array.isArray(value))
                        value.forEach((v) => (itemExtra += v.price || 0));
                      else if (typeof value === 'object' && value.price)
                        itemExtra += value.price;
                    }
                  );
                }
                return sum + (item.price + itemExtra) * item.quantity;
              }, 0);

              if (orderTotal >= (data.minPrice || 0)) {
                setPromotion({ id: snap.id, ...data });
              } else {
                Alert.alert(
                  'Voucher không hợp lệ',
                  `Đơn hàng tối thiểu ${data.minPrice.toLocaleString()}đ để áp dụng voucher này`
                );
                setPromotion(null);
              }
              break;
            }
          }
        }
      } catch (err) {
        console.error('Lỗi load checkout:', err);
      } finally {
        setLoadingData(false);
      }
    };

    load();
  }, [params.selectedAddressId, params.selectedPromoId]);

  // ---------------- Tính tổng ----------------
  const orderTotal = cart.reduce((sum, item) => {
    let itemExtra = 0;
    if (item.options) {
      Object.entries(item.options).forEach(([_, value]: [string, any]) => {
        if (Array.isArray(value))
          value.forEach((v) => (itemExtra += v.price || 0));
        else if (typeof value === 'object' && value.price)
          itemExtra += value.price;
      });
    }
    return sum + (item.price + itemExtra) * item.quantity;
  }, 0);

  const discount =
    promotion && orderTotal >= (promotion.minPrice || 0)
      ? (orderTotal * (promotion.discount_percentage || 0)) / 100
      : 0;

  const total = orderTotal + serviceFee + shippingFee - discount;

  // ---------------- Đặt hàng ----------------
  const handleOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Hãy chọn món trước khi đặt hàng nhé!');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Chưa đăng nhập', 'Vui lòng đăng nhập để đặt hàng.');
      router.replace('../(auth)');
      return;
    }

    const restaurantRef = doc(db, 'restaurants', cart[0].restaurantId);
    const restaurantSnap = await getDoc(restaurantRef);
    if (!restaurantSnap.exists()) {
      Alert.alert('Lỗi', 'Không lấy được thông tin nhà hàng.');
      return;
    }
    const pickup_latlong = restaurantSnap.data().latlong;

    try {
      const newOrder = await addOrder({
        restaurantId: cart[0].restaurantId,
        items: cart,
        total,
        paymentMethod,
        address: defaultAddress,
        userId: user.uid,
        drone_id: '',
        package_weight_kg: 0.5,
        pickup_latlong,
        promotionCode: promotion?.code || null,
      });

      clearCart();
      router.push({
        pathname: '/checkout/[id]',
        params: { id: newOrder.id, from: 'checkout' },
      });
    } catch (err) {
      Alert.alert('Lỗi đặt hàng', 'Không thể tạo order, thử lại sau.');
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity
        style={{ marginTop: 50, marginLeft: 20, paddingBottom: 10 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Address */}
        <TouchableOpacity
          style={{
            margin: 16,
            padding: 12,
            backgroundColor: '#f8f8f8',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ddd',
          }}
          onPress={() => router.push('../restaurantsc/address?from=checkout')}
        >
          <Text style={{ fontWeight: '700', fontSize: 16 }}>
            Địa chỉ giao hàng
          </Text>
          {defaultAddress ? (
            <>
              <Text style={{ marginTop: 6 }}>
                Địa chỉ: {defaultAddress.address}
              </Text>
              <Text>Tên: {defaultAddress.name}</Text>
              <Text>SĐT: {defaultAddress.phone}</Text>
            </>
          ) : (
            <Text style={{ marginTop: 6, color: '#999' }}>Chọn địa chỉ</Text>
          )}
        </TouchableOpacity>

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
                  source={{ uri: item.image }}
                  style={styles.cartImage}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                  <Text>
                    {item.price.toLocaleString()}đ x {item.quantity}
                  </Text>
                  {item.options && (
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

        {/* Promotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mã khuyến mãi</Text>
          <TouchableOpacity
            style={{
              padding: 12,
              backgroundColor: '#f4f4f4',
              borderRadius: 8,
              marginTop: 8,
            }}
            onPress={() =>
              router.push({
                pathname: './promotion',
                params: { restaurantId: cart[0]?.restaurantId },
              })
            }
          >
            <Text>{promotion ? promotion.code : 'Chọn mã khuyến mãi'}</Text>
            {promotion && <Text>Giảm {promotion.discount_percentage}%</Text>}
          </TouchableOpacity>
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình thức thanh toán</Text>

          <View style={styles.paymentRow}>
            {['Visa', 'VNPay', 'COD'].map((method) => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.paymentButton,
                  paymentMethod === method && styles.paymentButtonActive,
                ]}
                onPress={() => setPaymentMethod(method)}
              >
                <Text
                  style={[
                    styles.paymentText,
                    paymentMethod === method && styles.paymentTextActive,
                  ]}
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
          {promotion && (
            <View style={styles.totalRow}>
              <Text>Giảm giá:</Text>
              <Text>-{discount.toLocaleString()}đ</Text>
            </View>
          )}
          <View style={[styles.totalRow, { marginTop: 8 }]}>
            <Text style={{ fontWeight: '700' }}>Tổng cộng:</Text>
            <Text style={{ fontWeight: '700' }}>{total.toLocaleString()}đ</Text>
          </View>
        </View>
      </ScrollView>

      {/* Nút đặt hàng */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.orderButton,
            (loadingData || cart.length === 0 || !defaultAddress) && {
              backgroundColor: '#ccc',
            },
          ]}
          onPress={handleOrder}
          disabled={loadingData || cart.length === 0 || !defaultAddress}
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
  paymentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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
  paymentRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  paymentButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f8f8f8',
  },

  paymentButtonActive: {
    backgroundColor: '#e67e22',
    borderColor: '#e67e22',
  },

  paymentText: {
    color: '#444',
    fontWeight: '600',
  },

  paymentTextActive: {
    color: '#fff',
  },
});
