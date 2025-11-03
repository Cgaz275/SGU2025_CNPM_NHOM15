import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { restaurants as allRestaurants, categories } from '../../data/mockData';

const screenWidth = Dimensions.get('window').width;

export default function CategoryScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  // State quản lý
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >(categoryId);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState<'name' | 'distance' | null>(null);

  // --- Lấy & lọc dữ liệu ---
  useEffect(() => {
    let filtered = [...allRestaurants];

    // Lọc theo danh mục
    if (selectedCategoryId) {
      filtered = filtered.filter((r) =>
        r.categories.includes(selectedCategoryId)
      );
    }

    // Lọc theo từ khóa
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sắp xếp
    if (sortType === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'distance') {
      // distance trong mock là "1.2 km" => cần parseFloat
      filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    }

    setRestaurants(filtered);
  }, [selectedCategoryId, searchQuery, sortType]);

  // --- Handler ---
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
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 16 }}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh mục nhà hàng</Text>
      </View>

      {/* Thanh tìm kiếm + filter */}
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

      {/* Category list */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
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
                style={[styles.categoryText, isActive && { color: '#e67e22' }]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Restaurants list */}
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
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
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.restaurantName}>{item.name}</Text>
              <Text style={styles.restaurantDistance}>{item.distance} km</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Nếu không có kết quả */}
      {restaurants.length === 0 && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text>Không tìm thấy nhà hàng nào.</Text>
        </View>
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 16,
  },
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
  sortText: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryCard: {
    width: 90, // ✅ giới hạn chiều ngang mỗi ô
    marginRight: 12,
    alignItems: 'center',
    borderRadius: 12,
    padding: 6,
    backgroundColor: '#f8f8f8',
  },
  categoryImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    resizeMode: 'cover', // ✅ giúp hình không bị méo, căn vừa khung
  },
  categoryText: {
    marginTop: 4,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },

  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    overflow: 'hidden',
    padding: 8,
  },
  restaurantImage: { width: 100, height: 100, borderRadius: 12 },
  restaurantName: { fontSize: 16, fontWeight: '700' },
  restaurantDistance: { fontSize: 13, color: '#888', marginTop: 4 },
});
