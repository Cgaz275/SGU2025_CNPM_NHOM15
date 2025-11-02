import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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

import {
  categories,
  restaurants as mockRestaurants,
} from '../../data/mockData';

const router = useRouter();

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
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= banners.length) nextIndex = 0;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 3000); // 3s

    return () => clearInterval(interval);
  }, [activeIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  return (
    <ScrollView style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Xin chào</Text>
      {/* Banner trượt ngang */}
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => 'banner' + index}
        renderItem={({ item }) => (
          <Image
            source={item}
            style={styles.bannerImage}
          />
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
      />

      {/* Dấu chấm track banner */}
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

      {/* Section 1 */}
      <Text style={styles.sectionTitle}>Món ăn phổ biến</Text>
      <FlatList
        horizontal
        data={popularDishes}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
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

      {/* Section 2 */}
      <Text style={styles.sectionTitle}>Tôi muốn ăn...</Text>
      <FlatList
        horizontal
        data={categories} // 👈 dùng categories thay vì restaurants
        keyExtractor={(item) => 'cat' + item.id}
        showsHorizontalScrollIndicator={false}
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

      {/* Section 3 */}
      <Text style={styles.sectionTitle}>Nhà hàng gần bạn</Text>
      <FlatList
        horizontal
        data={[...mockRestaurants].sort(
          (a, b) => parseFloat(a.distance) - parseFloat(b.distance) // 👈 sort theo km
        )}
        keyExtractor={(item) => 'near' + item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push('/restaurantsc')}
            style={styles.card}
          >
            <Image
              source={item.image}
              style={styles.cardImage}
            />
            <Text style={styles.cardTitle}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 10,
  },
  bannerContainer: {
    height: 180,
  },
  bannerImage: {
    width: screenWidth,
    height: 180,
    resizeMode: 'cover',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: '#e67e22' },
  dotInactive: { backgroundColor: '#ccc' },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 16,
  },
  card: {
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  cardImage: {
    width: 140,
    height: 100,
  },
  cardTitle: {
    textAlign: 'center',
    paddingVertical: 6,
    fontWeight: '600',
  },
});
