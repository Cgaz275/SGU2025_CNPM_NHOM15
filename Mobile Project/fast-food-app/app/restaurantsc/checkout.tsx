import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { restaurants } from '../../data/mockData';
type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: any;
};

export default function CheckoutScreen() {
  const router = useRouter();
  // Mock vài món lấy từ mockData
  const phoThin = restaurants.find((r) => r.name === 'Phở Thìn');
  const comTam = restaurants.find((r) => r.name === 'Cơm Tấm Ba Ghiền');

  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      id: 'o1',
      name: phoThin?.dishes[0].name ?? 'Phở bò tái',
      price: phoThin?.dishes[0].price ?? 45000,
      quantity: 1,
      image: phoThin?.dishes[0].image,
    },
    {
      id: 'o2',
      name: comTam?.dishes[0].name ?? 'Cơm tấm sườn bì chả',
      price: comTam?.dishes[0].price ?? 55000,
      quantity: 2,
      image: comTam?.dishes[0].image,
    },
  ]);

  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={{ padding: 8 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../assets/icons/arrow.png')} // đường dẫn tới icon của m
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <FlatList
        data={orderItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Image
              source={item.image}
              style={styles.itemImage}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              {(item.price * item.quantity).toLocaleString()}đ
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <View style={styles.footer}>
        <Text style={styles.totalText}>Tổng: {total.toLocaleString()}đ</Text>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() => router.push('/restaurantsc/checkout2')}
        >
          <Text style={styles.payText}>Thanh toán</Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 12,
    backgroundColor: '#eee',
    margin: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  itemImage: { width: 70, height: 70, borderRadius: 8 },
  itemName: { fontSize: 16, fontWeight: '600' },
  itemQuantity: { fontSize: 14, color: '#666', marginTop: 4 },
  itemPrice: { fontWeight: '700', color: '#e67e22', fontSize: 16 },
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
