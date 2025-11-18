import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig';

export default function PresentOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.warn('Chưa đăng nhập!');
      return;
    }

    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid)
      );
      const ordersSnap = await getDocs(ordersQuery);

      const ordersData = await Promise.all(
        ordersSnap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const restaurantId = data.restaurantId;

          let restaurantName = 'Không rõ';
          if (restaurantId) {
            const resRef = doc(db, 'restaurants', restaurantId);
            const resSnap = await getDoc(resRef);
            if (resSnap.exists()) {
              restaurantName = resSnap.data().name || 'Không rõ';
            }
          }

          return {
            id: docSnap.id,
            ...data,
            restaurantName,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          };
        })
      );

      setOrders(ordersData);
    } catch (error) {
      console.error('Lỗi khi fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Đang tải đơn hàng...</Text>
      </View>
    );
  }

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
            (o) =>
              o.status === 'pending' ||
              o.status === 'shipping' ||
              o.status === 'confirmed' ||
              o.status === 'waitingCustomer'
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const thumbnail = item.items[0]?.image;
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
                  {thumbnail && (
                    <Image
                      source={{ uri: thumbnail }}
                      style={styles.orderThumbnail}
                    />
                  )}

                  <View style={styles.orderInfo}>
                    <Text style={styles.restaurantName}>
                      {item.restaurantName}
                    </Text>
                    <Text style={styles.status}>
                      {item.status === 'pending'
                        ? 'Chờ nhà hàng xác nhận'
                        : item.status === 'confirmed'
                        ? 'Nhà hàng đã xác nhận'
                        : item.status === 'shipping'
                        ? 'Đơn hàng đang được giao đến bạn'
                        : 'Đang chờ khách xác nhận'}
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
