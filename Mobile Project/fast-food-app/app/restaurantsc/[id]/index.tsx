import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../../FirebaseConfig';

export default function RestaurantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [dishes, setDishes] = useState<any[]>([]);
  // categories là mảng các object {id, name}
  const [categories, setCategories] = useState<any[]>([]);
  // selectedCat lưu ID của category (mặc định là 'ALL')
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // 1️⃣ Lấy restaurant
        const docRef = doc(db, 'restaurants', id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setRestaurant({
            id: docSnap.id,
            ...data,
            image: { uri: data.imageUrl },
          });
        }

        // 2️⃣ Lấy danh sách category (từ bảng restaurant_categories)
        const catQuery = query(
          collection(db, 'restaurant_categories'),
          where('restaurant_id', '==', id)
        );

        const catSnap = await getDocs(catQuery);
        if (!catSnap.empty) {
          const catData = catSnap.docs[0].data().category_list || [];

          // ✅ SỬA LẠI: Tạo object cho mục "Tất cả" để đồng bộ cấu trúc dữ liệu
          const allOption = { id: 'ALL', name: 'Tất cả' };

          // Gộp vào mảng: [ {id:'ALL', name:'Tất cả'}, {id:'123', name:'Phở'}, ... ]
          setCategories([allOption, ...catData]);
        }

        // 3️⃣ Lấy dishes
        const dishesQuery = query(
          collection(db, 'dishes'),
          where('restaurantId', '==', id)
        );
        const dishesSnap = await getDocs(dishesQuery);

        const dishesData = dishesSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            ...d,
            id: doc.id,
            price: Number(d.price),
            image: { uri: d.imageUrl },
          };
        });
        setDishes(dishesData);
      } catch (err) {
        console.error('Lỗi fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ✅ SỬA LẠI: Logic lọc dựa trên ID
  const filteredDishes =
    selectedCat === 'ALL'
      ? dishes
      : dishes.filter((d) => d.categoryId === selectedCat);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Đang tải...</Text>
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
      {/* back */}
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
        data={filteredDishes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <Image
              source={restaurant.image}
              style={styles.image}
            />

            <View style={styles.infoContainer}>
              <Text style={styles.title}>{restaurant.name}</Text>
              <Text style={styles.sub}>
                📍 {restaurant.address} • ⭐ {restaurant.rating}
              </Text>
            </View>

            {/* ✅ SỬA LẠI: Phần hiển thị Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingHorizontal: 10, marginBottom: 10 }}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id} // Dùng ID làm key -> Hết lỗi duplicate key
                  onPress={() => setSelectedCat(cat.id)} // Set ID khi bấm
                  style={[
                    styles.tabItem,
                    selectedCat === cat.id && styles.tabItemActive, // So sánh ID
                  ]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      selectedCat === cat.id && styles.tabTextActive,
                    ]}
                  >
                    {cat.name} {/* Hiển thị Tên -> Hết lỗi Object invalid */}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
                router.push(`/restaurantsc/${restaurant.id}/product/${item.id}`)
              }
            >
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.cartContainer}>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push(`../restaurantsc/${restaurant.id}/cart`)}
        >
          <Text style={styles.cartText}>Giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
  },
  tabItemActive: {
    backgroundColor: '#e67e22',
  },
  tabText: { color: '#333' },
  tabTextActive: { color: '#fff', fontWeight: '600' },

  addButton: {
    backgroundColor: '#e67e22',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  image: { width: '100%', height: 200, resizeMode: 'cover' },
  infoContainer: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700' },
  sub: { fontSize: 14, color: '#666', marginTop: 4 },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    marginTop: 10,
  },

  dishCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 10,
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
    backgroundColor: '#fff',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    alignItems: 'center',
  },
  cartButton: {
    backgroundColor: '#e67e22',
    width: '90%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cartText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
