import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../../FirebaseConfig';
import {
  CartItem,
  getCart,
  removeFromCart,
  updateQuantity,
} from '../../../data/cart';

export default function CartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 🟢 Lấy restaurantId từ Firebase dựa vào param id
  useEffect(() => {
    const fetchRestaurant = async () => {
      const rid = Array.isArray(params.id) ? params.id[0] : params.id;
      if (!rid) return console.warn('❌ No restaurant id param');

      try {
        const restDoc = await getDoc(doc(db, 'restaurants', rid));
        if (restDoc.exists()) {
          setRestaurantId(restDoc.id);
          console.log('🟢 Fetched restaurantId from Firebase:', restDoc.id);
        } else {
          console.warn('❌ Restaurant not found in Firebase');
        }
      } catch (err) {
        console.error('❌ Error fetching restaurant:', err);
      }
    };

    fetchRestaurant();
  }, [params.id]);

  // 🧠 Refresh cart khi có restaurantId
  const refreshCart = () => {
    if (!restaurantId) return;
    const items = getCart().filter((i) => i.restaurantId === restaurantId);
    console.log('🔹 Cart filtered by restaurant:', items);
    setCartItems(items);
  };

  useEffect(() => {
    refreshCart();
  }, [restaurantId]);

  const total = cartItems.reduce((sum, item) => {
    const optionExtra = Object.values(item.options || {}).reduce(
      (acc, opt: any) => {
        if (Array.isArray(opt))
          return acc + opt.reduce((s, o) => s + (o.price || 0), 0);
        if (opt?.price) return acc + opt.price;
        return acc;
      },
      0
    );
    return sum + (item.price + optionExtra) * item.quantity;
  }, 0);

  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      removeFromCart(item.id, item.restaurantId, item.options);
    } else {
      updateQuantity(item.id, item.restaurantId, newQuantity, item.options);
    }
    refreshCart();
  };

  const renderItem = ({ item }: { item: CartItem }) => {
    const optionExtra = Object.values(item.options || {}).reduce(
      (acc, opt: any) => {
        if (Array.isArray(opt))
          return acc + opt.reduce((s, o) => s + (o.price || 0), 0);
        if (opt?.price) return acc + opt.price;
        return acc;
      },
      0
    );
    const totalPrice = (item.price + optionExtra) * item.quantity;

    return (
      <View style={styles.itemCard}>
        <Image
          source={
            typeof item.image === 'string' ? { uri: item.image } : item.image
          }
          style={styles.itemImage}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.itemName}>{item.name}</Text>

          {item.options &&
            Object.keys(item.options).length > 0 &&
            Object.entries(item.options).map(([group, value], i) => {
              // 🔥 FIX: nếu là object có key 0,1… thì ép thành array
              const normalizedValue = Array.isArray(value)
                ? value
                : typeof value === 'object' &&
                  Object.keys(value).every((k) => !isNaN(Number(k)))
                ? Object.values(value) // chuyển {0:{},1:{}} → [{},{}]
                : value;

              return (
                <Text
                  key={i}
                  style={styles.optionText}
                >
                  {group}:{' '}
                  {Array.isArray(normalizedValue)
                    ? normalizedValue.map((v) => v.name).join(', ')
                    : typeof normalizedValue === 'object'
                    ? normalizedValue.name || JSON.stringify(normalizedValue)
                    : normalizedValue}
                </Text>
              );
            })}

          <Text style={styles.itemPrice}>{totalPrice.toLocaleString()}đ</Text>
        </View>

        <View style={styles.qtyContainer}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleQuantityChange(item, -1)}
          >
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.qtyNumber}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => handleQuantityChange(item, 1)}
          >
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ padding: 8, marginLeft: 10 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={styles.title}>Giỏ hàng</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Giỏ hàng trống 🛒</Text>
        }
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Tổng: {total.toLocaleString()}đ</Text>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() =>
              router.push({
                pathname: '/restaurantsc/[id]/checkout',
                params: { id: restaurantId },
              })
            }
          >
            <Text style={styles.payText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16, marginLeft: 16 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fafafa',
    borderRadius: 10,
    elevation: 1,
  },
  itemImage: { width: 70, height: 70, borderRadius: 8 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemPrice: { fontWeight: '700', color: '#e67e22', fontSize: 16 },
  optionText: { color: '#777', fontSize: 13 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { fontSize: 16, fontWeight: '700' },
  qtyNumber: { marginHorizontal: 10, fontSize: 16, fontWeight: '600' },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    color: '#777',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  totalText: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  payButton: {
    backgroundColor: '#e67e22',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
