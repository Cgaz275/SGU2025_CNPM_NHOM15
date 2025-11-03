import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CartItem,
  getCart,
  removeFromCart,
  updateQuantity,
} from '../../../data/cart';

export default function CartScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // id của restaurant
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 🧠 Lấy giỏ hàng theo restaurant
  const refreshCart = () => {
    const items = getCart().filter((i) => i.restaurantId === id);
    setCartItems(items);
  };

  useEffect(() => {
    refreshCart();
  }, [id]);

  // 💰 Tính tổng có options phụ thu
  const total = cartItems.reduce((sum, item) => {
    const optionExtra = Object.values(item.options || {}).reduce(
      (acc, opt: any) => {
        if (Array.isArray(opt)) {
          return acc + opt.reduce((s, o) => s + (o.price || 0), 0);
        } else if (opt?.price) {
          return acc + opt.price;
        }
        return acc;
      },
      0
    );

    return sum + (item.price + optionExtra) * item.quantity;
  }, 0);

  // ⚙️ Tăng giảm số lượng
  const handleQuantityChange = (item: CartItem, delta: number) => {
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      removeFromCart(item.id, item.restaurantId, item.options);
    } else {
      updateQuantity(item.id, item.restaurantId, newQuantity, item.options);
    }
    refreshCart();
  };

  // 💥 Render từng món
  const renderItem = ({ item }: { item: CartItem }) => {
    // Tính phụ thu option để hiển thị giá chính xác
    const optionExtra = Object.values(item.options || {}).reduce(
      (acc, opt: any) => {
        if (Array.isArray(opt)) {
          return acc + opt.reduce((s, o) => s + (o.price || 0), 0);
        } else if (opt?.price) {
          return acc + opt.price;
        }
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

          {/* Hiển thị options */}
          {item.options && Object.keys(item.options).length > 0 && (
            <View style={{ marginTop: 4 }}>
              {Object.entries(item.options).map(([group, value], i) => (
                <Text
                  key={i}
                  style={styles.optionText}
                >
                  {group}:{' '}
                  {Array.isArray(value)
                    ? value.map((v) => v.name).join(', ')
                    : typeof value === 'object'
                    ? value.name || value
                    : value}
                </Text>
              ))}
            </View>
          )}

          <Text style={styles.itemPrice}>{totalPrice.toLocaleString()}đ</Text>
        </View>
        {/* Nút tăng giảm */}
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
        {/* Xoá món */}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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

      <Text style={styles.title}>Giỏ hàng của bạn</Text>

      <FlatList
        data={cartItems}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Giỏ hàng trống 🛒</Text>
        }
      />

      {/* Footer */}
      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.totalText}>Tổng: {total.toLocaleString()}đ</Text>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() =>
              router.push({
                pathname: '/restaurantsc/[id]/checkout',
                params: { id: String(id) },
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
  removeText: { fontSize: 18, color: '#999' },
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
