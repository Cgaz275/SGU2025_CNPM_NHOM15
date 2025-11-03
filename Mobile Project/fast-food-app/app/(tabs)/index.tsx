import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
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
import { getAddresses } from '../../data/address';
import {
  categories,
  restaurants as mockRestaurants,
} from '../../data/mockData';

const banners = [
  require('@/assets/images/banner4.png'),
  require('@/assets/images/banner4.png'),
  require('@/assets/images/banner4.png'),
];

const screenWidth = Dimensions.get('window').width;

const popularDishes = mockRestaurants.flatMap((r) =>
  r.dishes.map((dish) => ({
    ...dish,
    restaurantName: r.name,
  }))
);

export default function HomeScreen() {
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

  // auto slide banner
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= banners.length) nextIndex = 0;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
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

      {/* Dấu chấm */}
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

      {/* Món phổ biến */}
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
            <TouchableOpacity style={styles.card}>
              <Image
                source={item.image}
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Tôi muốn ăn... */}
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
          keyExtractor={(item) => 'cat' + item.id}
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
                source={item.image}
                style={styles.cardImage}
              />
              <Text style={styles.cardTitle}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.sectionContainer}>
        {/* Header của phần “Nhà hàng gần bạn” + nút “Xem tất cả” */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nhà hàng gần bạn</Text>
          <TouchableOpacity onPress={() => router.push('./restaurant')}>
            <Text style={styles.seeAllText}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionSubtitle}>
          Top quán ngon sát bên, lên đơn liền thôi 😋
        </Text>

        {/* ✅ Hiển thị 4 nhà hàng dọc xuống */}
        <FlatList
          data={[...mockRestaurants]
            .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
            .slice(0, 4)}
          keyExtractor={(item) => 'near' + item.id}
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
                source={item.image}
                style={styles.restaurantImage}
              />
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{item.name}</Text>
                <View style={styles.restaurantMeta}>
                  <Text style={styles.restaurantCategory}>⭐{item.rating}</Text>
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
  deliveryLabel: { fontSize: 13, color: '#ffffffff', marginBottom: 2 },
  addressRow: { flexDirection: 'row', alignItems: 'center', maxWidth: '90%' },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffffff',
    flexShrink: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 5,
    paddingHorizontal: 16,
  },
  restaurantCard: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // ✅ giữ phần text trên cùng
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
  },
  restaurantImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
    justifyContent: 'flex-start', // ✅ giữ phần text trên cùng
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantDistance: {
    fontSize: 13,
    color: '#666',
  },
  separator: {
    marginHorizontal: 6, // ✅ tạo khoảng cách đều hai bên dấu “|”
    color: '#aaa',
    fontSize: 13,
  },
  dot: {
    fontSize: 13,
    color: '#aaa',
    marginHorizontal: 5,
  },
  restaurantCategory: {
    fontSize: 13,
    color: '#666',
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#777', // xám nhẹ cho mềm mắt
    marginTop: 2,
    marginLeft: 17,
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 14,
    color: '#e67e22',
    fontWeight: '600',
  },
  sectionContainer: {
    marginTop: 10,
    marginBottom: 5,
    marginHorizontal: 5,
    backgroundColor: '#fcfcfcff', // 🌤 màu nền nhẹ kiểu cam nhạt
    borderRadius: 10,
    paddingVertical: 12,
    paddingBottom: 16,

    elevation: 0.2, // hiệu ứng nổi nhẹ trên Android
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

  bannerImage: {
    width: screenWidth * 0.9,
    height: 180,
    borderRadius: 16,
    resizeMode: 'cover',
    marginHorizontal: 5, // ✅ thêm xíu khoảng cách giữa banner
  },

  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dotActive: { backgroundColor: '#e67e22' },
  dotInactive: { backgroundColor: '#ccc' },

  card: {
    marginHorizontal: 4,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#fcfcfcff',
  },
  cardImage: { width: 150, height: 150, borderRadius: 5 },
  cardTitle: { textAlign: 'center', paddingVertical: 6, fontWeight: '600' },
});
