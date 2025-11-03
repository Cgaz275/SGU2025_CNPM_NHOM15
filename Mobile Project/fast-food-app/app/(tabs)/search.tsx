import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { restaurants as allRestaurants, categories } from '../../data/mockData';

const screenWidth = Dimensions.get('window').width;

export default function Search() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(categoryId);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<'name' | 'distance' | null>(null);

  useEffect(() => {
    let filtered = [...allRestaurants];

    if (selectedCategoryId) {
      filtered = filtered.filter((r) =>
        r.categories.includes(selectedCategoryId)
      );
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortType === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'distance') {
      filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }

    setRestaurants(filtered);
  }, [selectedCategoryId, searchQuery, sortType, categoryId]);

  // Sync lại khi đổi tab có categoryId mới
  useEffect(() => {
    if (categoryId) setSelectedCategoryId(categoryId);
  }, [categoryId]);

  const handleCategoryPress = (id: string) => {
    setSelectedCategoryId((prev) => (prev === id ? undefined : id));
  };

  const handleSortChange = () => {
    if (sortType === null) setSortType('name');
    else if (sortType === 'name') setSortType('distance');
    else setSortType(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm kiếm</Text>
      </View>

      {/* Search + Sort */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm nhà hàng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          onPress={handleSortChange}
          style={styles.sortButton}
        >
          <Text style={styles.sortText}>
            {sortType === 'name'
              ? 'Sắp xếp: Tên ↑'
              : sortType === 'distance'
              ? 'Sắp xếp: Gần nhất'
              : 'Sắp xếp'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Gộp hết trong ScrollView để tránh giật layout */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={{ marginTop: 6 }}>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
            renderItem={({ item }) => {
              const isActive = item.id === selectedCategoryId;
              return (
                <TouchableOpacity
                  onPress={() => handleCategoryPress(item.id)}
                  style={[
                    styles.categoryCard,
                    isActive && { borderColor: '#e67e22', borderWidth: 2 },
                  ]}
                >
                  <Image
                    source={item.image}
                    style={styles.categoryImage}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      isActive && { color: '#e67e22' },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Restaurants */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {restaurants.length > 0 ? (
            restaurants.map((item) => (
              <TouchableOpacity
                key={item.id}
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
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.restaurantName}>{item.name}</Text>
                  <Text style={styles.restaurantDistance}>{item.distance}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text>Không tìm thấy nhà hàng nào.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', marginLeft: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  sortButton: {
    marginLeft: 10,
    backgroundColor: '#e67e22',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sortText: { color: '#fff', fontWeight: '600' },

  // Category styles
  categoryCard: {
    width: 80,
    marginRight: 10,
    alignItems: 'center',
    borderRadius: 10,
    padding: 6,
    backgroundColor: '#f8f8f8',
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  categoryText: {
    marginTop: 3,
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },

  // Restaurant styles
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 8,
  },
  restaurantImage: { width: 80, height: 80, borderRadius: 10 },
  restaurantName: { fontSize: 15, fontWeight: '700' },
  restaurantDistance: { fontSize: 12, color: '#888', marginTop: 2 },
});
