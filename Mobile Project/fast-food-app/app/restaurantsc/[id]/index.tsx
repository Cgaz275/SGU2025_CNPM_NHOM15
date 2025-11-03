import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { restaurants } from '../../../data/mockData';

export default function RestaurantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const restaurant = restaurants.find((r) => r.id === id);

  if (!restaurant) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy nhà hàng 😢</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: '#e67e22', marginTop: 10 }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
      }}
    >
      {/* Nút quay lại */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <FlatList
        data={restaurant.dishes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            {/* Ảnh và thông tin */}
            <Image
              source={restaurant.image}
              style={styles.image}
            />

            <View style={styles.infoContainer}>
              <Text style={styles.title}>{restaurant.name}</Text>
              <Text style={styles.sub}>
                📍 {restaurant.distance} • ⭐ {restaurant.rating}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Thực đơn</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.dishCard}>
            <Image
              source={item.image}
              style={styles.dishImage}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.dishName}>{item.name}</Text>
              <Text style={styles.dishDesc}>{item.description}</Text>
              <Text style={styles.dishPrice}>
                {item.price.toLocaleString()}đ
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                router.push({
                  pathname: `/restaurantsc/[id]/product/[dishId]`,
                  params: { id: restaurant.id, dishId: item.id },
                })
              }
            >
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Nút giỏ hàng (cố định dưới) */}
      <View style={styles.cartContainer}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() =>
            router.push({
              pathname: `/restaurantsc/[id]/cart`,
              params: { id: restaurant.id },
            })
          }
        >
          <Text style={styles.cartText}>Giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#e67e22',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  image: { width: '100%', height: 200, resizeMode: 'cover' },
  infoContainer: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  sub: { fontSize: 14, color: '#666', marginTop: 4 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
  },
  backButton: {
    position: 'absolute',
    top: 50, // chỉnh nếu ông có SafeArea
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 10,
    elevation: 1,
  },
  dishImage: { width: 90, height: 90, borderRadius: 8 },
  dishName: { fontSize: 16, fontWeight: '600' },
  dishDesc: { color: '#666', fontSize: 13, marginVertical: 4 },
  dishPrice: { fontWeight: '700', color: '#e67e22' },
  cartContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff', // ✅ nền trắng che phần dưới
    paddingTop: 8, // khoảng cách trên nhẹ cho đẹp
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // bo cho safe area
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // hiệu ứng nổi nhẹ
  },
  cartButton: {
    backgroundColor: '#e67e22',
    width: '90%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cartText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
