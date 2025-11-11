import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAddresses } from '../../data/address';

import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { restaurants } from '../../data/mockData';

export default function RestaurantScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [defaultAddress, setDefaultAddress] =
    useState<string>('Chưa có địa chỉ');

  // 🔥 Mỗi khi quay lại trang này thì tự lấy lại địa chỉ mặc định
  useFocusEffect(
    useCallback(() => {
      const list = getAddresses();
      const def = list.find((a) => a.isDefault);
      setDefaultAddress(def ? def.address : 'Chưa có địa chỉ');
    }, [])
  );

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
      {/* Title */}
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
                ⭐ {item.rating} | {item.distance}
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
