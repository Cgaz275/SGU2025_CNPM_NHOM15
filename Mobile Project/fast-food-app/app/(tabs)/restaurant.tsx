import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { db } from '../../FirebaseConfig';

export default function RestaurantScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [defaultAddress, setDefaultAddress] =
    useState<string>('Chưa có địa chỉ');
  const [restaurants, setRestaurants] = useState<any[]>([]); // mảng nhà hàng, mỗi nhà hàng có field dishes

  const auth = getAuth();

  useFocusEffect(
    useCallback(() => {
      const loadDefaultAddress = async () => {
        const user = auth.currentUser;
        if (!user) {
          setDefaultAddress('Chưa có địa chỉ');
          return;
        }

        try {
          // 1) Lấy document user
          const userRef = doc(db, 'user', user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            setDefaultAddress('Chưa có địa chỉ');
            return;
          }

          const userData = userSnap.data();
          const addressId = userData.defaultAddressId; // ⭐ ID của địa chỉ mặc định

          // 2) User chưa đặt địa chỉ mặc định
          if (!addressId) {
            setDefaultAddress('Chưa có địa chỉ');
            return;
          }

          // 3) Lấy address theo ID
          const addressRef = doc(db, 'address', addressId);
          const addressSnap = await getDoc(addressRef);

          if (addressSnap.exists()) {
            const addressData = addressSnap.data();
            setDefaultAddress(addressData.address);
          } else {
            setDefaultAddress('Chưa có địa chỉ');
          }
        } catch (err) {
          console.log('Lỗi lấy default address:', err);
          setDefaultAddress('Chưa có địa chỉ');
        }
      };

      loadDefaultAddress();
    }, [])
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy tất cả nhà hàng (nếu nhiều)
        const restaurantsSnapshot = await getDocs(
          collection(db, 'restaurants')
        );
        const restaurantsData: any[] = [];

        for (const docSnap of restaurantsSnapshot.docs) {
          const restaurantData = docSnap.data();
          const restaurantId = docSnap.id;

          // Lấy món ăn của nhà hàng đó
          const dishesQuery = query(
            collection(db, 'dishes'),
            where('restaurantId', '==', restaurantId)
          );
          const dishesSnapshot = await getDocs(dishesQuery);

          const dishesData = dishesSnapshot.docs.map((dishDoc) => {
            const d = dishDoc.data();
            return {
              id: dishDoc.id,
              name: d.name,
              price: d.price,
              image: { uri: d.imageUrl }, // phải chuyển url thành object cho Image
              categoryId: d.categoryId,
              description: d.description,
              restaurantId: d.restaurantId,
            };
          });

          restaurantsData.push({
            id: restaurantId,
            name: restaurantData.name,
            rating: restaurantData.rating,
            image: { uri: restaurantData.imageUrl },
            address: restaurantData.address,
            dishes: dishesData,
          });
        }

        setRestaurants(restaurantsData);
      } catch (error) {
        console.log('Error fetching restaurants and dishes:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header có địa chỉ */}
      <View style={styles.header}>
        <Text style={styles.deliveryLabel}>Giao đến:</Text>

        <TouchableOpacity
          style={styles.addressRow}
          onPress={() => router.push('/address')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="location"
            size={18}
            color="#e67e22"
            style={{ marginRight: 6 }}
          />
          <Text
            style={styles.addressText}
            numberOfLines={1}
          >
            {defaultAddress}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color="#888"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      {/* Title + nút Nearby */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Nhà hàng gần đây</Text>

        <TouchableOpacity
          style={styles.nearbyButton}
          onPress={() => router.push('/map/nearby')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="map"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/restaurantsc/[id]',
                params: { id: item.id },
              })
            }
          >
            {/* Hình nhà hàng */}
            <Image
              source={item.image}
              style={styles.cardImage}
            />

            {/* Thông tin nhà hàng */}
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>
                ⭐ {item.rating} | {item.address}
              </Text>

              {/* Món ăn nổi bật */}
              <View style={styles.dishList}>
                {item.dishes.slice(0, 2).map((dish) => (
                  <View
                    key={dish.id}
                    style={styles.dishItem}
                  >
                    <Image
                      source={dish.image}
                      style={styles.dishImage}
                    />

                    {/* Tên món + giá xếp ngang */}
                    <View style={styles.dishTextRow}>
                      <Text
                        style={styles.dishName}
                        numberOfLines={1}
                      >
                        {dish.name}
                      </Text>
                      <Text style={styles.dishPrice}>{dish.price}đ</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff', paddingTop: 40 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 7,
    marginLeft: 13,
  },
  header: { marginLeft: 16, marginBottom: 10 },
  deliveryLabel: { fontSize: 13, color: '#888', marginBottom: 2 },
  addressRow: { flexDirection: 'row', alignItems: 'center', maxWidth: '90%' },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    marginHorizontal: 16,
    marginVertical: 3,
    borderRadius: 5,
    overflow: 'hidden',
    elevation: 0.5,
    padding: 10,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '700', color: '#333' },
  sub: { fontSize: 13, color: '#777', marginVertical: 4 },
  dishList: {
    flexDirection: 'column',
    marginTop: 4,
  },
  dishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dishImage: {
    width: 42,
    height: 42,
    borderRadius: 6,
    marginRight: 8,
  },
  // 👇 chứa tên món và giá
  dishTextRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between', // tên bên trái, giá bên phải
    alignItems: 'center',
  },
  dishName: {
    fontSize: 13,
    color: '#444',
    flexShrink: 1,
  },
  dishPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D7A359', // xanh nhẹ kiểu app giao đồ ăn
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 13,
    marginBottom: 12,
    marginTop: 7,
  },

  nearbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e67e22',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 15,
  },

  nearbyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});
