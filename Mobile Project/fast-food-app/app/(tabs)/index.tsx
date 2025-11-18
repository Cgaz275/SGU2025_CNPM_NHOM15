import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../FirebaseConfig';

const banners = [
  require('@/assets/images/banner4.png'),
  require('@/assets/images/banner4.png'),
  require('@/assets/images/banner4.png'),
];

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const router = useRouter();
  const auth = getAuth();

  // === STATE FIREBASE ===
  const [defaultAddress, setDefaultAddress] = useState('Chưa có địa chỉ');
  const [categories, setCategories] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [popularDishes, setPopularDishes] = useState<any[]>([]);

  // === CHECK LOGIN ===
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) router.replace('../(auth)');
    });
    return unsub;
  }, []);

  // === LOAD DEFAULT ADDRESS ===
  useFocusEffect(
    useCallback(() => {
      const loadDefaultAddress = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
          const userDoc = await getDoc(doc(db, 'user', user.uid));

          if (!userDoc.exists()) {
            setDefaultAddress('Chưa có địa chỉ');
            return;
          }

          const data = userDoc.data();
          const addressId = data.defaultAddressId;

          if (!addressId) {
            setDefaultAddress('Chưa có địa chỉ');
            return;
          }

          const addressDoc = await getDoc(doc(db, 'address', addressId));

          if (addressDoc.exists()) {
            setDefaultAddress(addressDoc.data().address);
          } else {
            setDefaultAddress('Chưa có địa chỉ');
          }
        } catch (err) {
          console.log('ERROR load default address:', err);
        }
      };

      loadDefaultAddress();
    }, [])
  );

  // === LOAD CATEGORIES ===
  useEffect(() => {
    const loadCategories = async () => {
      const snap = await getDocs(collection(db, 'categories'));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCategories(data);
    };
    loadCategories();
  }, []);

  // === LOAD RESTAURANTS ===
  useEffect(() => {
    const loadRestaurants = async () => {
      const snap = await getDocs(collection(db, 'restaurants'));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRestaurants(data);
    };
    loadRestaurants();
  }, []);

  // === LOAD FOODS (POPULAR DISHES) ===
  useEffect(() => {
    const loadFoods = async () => {
      try {
        const snap = await getDocs(collection(db, 'dishes'));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPopularDishes(data);
      } catch (err) {
        console.log('ERR foods:', err);
      }
    };

    loadFoods();
  }, []);

  // === BANNER AUTOPLAY ===
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      let next = activeIndex + 1;
      if (next >= banners.length) next = 0;

      flatListRef.current?.scrollToIndex({ index: next, animated: true });

      setActiveIndex(next);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* HEADER */}
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

      {/* BANNER */}
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ width: screenWidth, alignItems: 'center' }}>
            <Image
              source={item}
              style={styles.bannerImage}
            />
          </View>
        )}
      />

      {/* DOTS */}
      <View style={styles.dotsContainer}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* POPULAR DISHES */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Món ăn phổ biến</Text>
        </View>

        <Text style={styles.sectionSubtitle}>
          Món ngon gần nhà, đặt ngay fastfood
        </Text>

        <FlatList
          horizontal
          data={popularDishes}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: '/restaurantsc/[id]',
                  params: { id: item.restaurantId },
                })
              }
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* CATEGORY */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hôm nay thèm món gì?</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Đủ món ngon cho mọi tâm trạng
        </Text>

        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: './search',
                  params: { categoryId: item.id },
                })
              }
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* RESTAURANTS */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nhà hàng gần bạn</Text>
          <TouchableOpacity onPress={() => router.push('./restaurant')}>
            <Text style={styles.seeAllText}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionSubtitle}>Top quán ngon sát bên 😋</Text>

        <FlatList
          data={restaurants.slice(0, 4)}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/restaurantsc/[id]',
                  params: { id: item.id },
                })
              }
              style={styles.restaurantCard}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.restaurantImage}
              />

              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <View style={styles.restaurantMeta}>
                  <Text style={styles.restaurantCategory}>
                    ⭐ {item.rating}
                  </Text>
                  <Text style={styles.separator}>|</Text>
                  <Text style={styles.restaurantDistance}>{item.distance}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#193c02ff', paddingTop: 40 },
  header: { marginLeft: 16, marginBottom: 10 },
  deliveryLabel: { fontSize: 13, color: '#fff', marginBottom: 2 },
  addressRow: { flexDirection: 'row', alignItems: 'center', maxWidth: '90%' },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    flexShrink: 1,
  },

  // ===== CARD / SECTIONS =====
  sectionContainer: {
    marginTop: 10,
    marginBottom: 5,
    marginHorizontal: 5,
    backgroundColor: '#fcfcfcff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 5,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#663b00ff',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
    marginLeft: 17,
    marginBottom: 10,
  },

  seeAllText: {
    fontSize: 14,
    color: '#e67e22',
    fontWeight: '600',
  },

  // ===== BANNER =====
  bannerImage: {
    width: screenWidth * 0.9,
    height: 180,
    borderRadius: 16,
    resizeMode: 'cover',
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 5 },
  dotActive: { backgroundColor: '#e67e22' },
  dotInactive: { backgroundColor: '#ccc' },

  // ===== POPULAR / CATEGORY CARD =====
  card: {
    marginHorizontal: 4,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  cardImage: { width: 150, height: 150, borderRadius: 6 },
  cardTitle: { textAlign: 'center', paddingVertical: 6, fontWeight: '600' },

  // ===== RESTAURANT CARD =====
  restaurantCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  restaurantImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginRight: 12,
  },
  restaurantInfo: { flex: 1 },
  restaurantName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  restaurantMeta: { flexDirection: 'row', alignItems: 'center' },

  restaurantCategory: { fontSize: 13, color: '#666' },
  separator: { marginHorizontal: 6, color: '#aaa' },
  restaurantDistance: { fontSize: 13, color: '#666' },
});
