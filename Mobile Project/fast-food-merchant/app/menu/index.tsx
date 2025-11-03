import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router'; // 🧩 thêm dòng này
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { categories, restaurants } from '../../data/mockData';

export default function MenuScreen() {
  const router = useRouter(); // 🧩 và thêm dòng này
  const restaurant = restaurants[0]; // tạm thời lấy nhà hàng đầu tiên
  const [search, setSearch] = useState('');
  const [dishes, setDishes] = useState(restaurant.dishes);

  const handleToggleAvailable = (id: string) => {
    setDishes((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  const filteredDishes = dishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={{ marginTop: 50, marginLeft: 7, paddingBottom: 10 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý menu</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('./menu/add')}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color="#333"
            />
            <Text style={styles.iconText}>Món ăn</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchBox}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#888"
        />
        <TextInput
          placeholder="Tìm món ăn..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      {/* Danh sách món */}
      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const categoryName =
            categories.find((c) => c.id === item.categoryId)?.name || 'Khác';
          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '../menu/edit',
                })
              }
            >
              <View style={styles.card}>
                <Image
                  source={item.image}
                  style={styles.image}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.dishName}>{item.name}</Text>
                  <Text style={styles.category}>{categoryName}</Text>
                  <Text style={styles.price}>
                    {item.price.toLocaleString()}đ
                  </Text>
                </View>
                <Switch
                  value={item.available ?? true}
                  onValueChange={() => handleToggleAvailable(item.id)}
                />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 30 }}>
            Không có món nào
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '600' },
  headerButtons: { flexDirection: 'row', gap: 12 },
  iconButton: { alignItems: 'center' },
  iconText: { fontSize: 12, color: '#333', marginTop: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  input: { flex: 1, marginLeft: 8, height: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  image: { width: 60, height: 60, borderRadius: 10 },
  dishName: { fontSize: 16, fontWeight: '500' },
  category: { color: '#888', fontSize: 12 },
  price: { color: '#333', fontWeight: '600', marginTop: 4 },
});
