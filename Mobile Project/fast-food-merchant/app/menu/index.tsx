import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig';

export default function MenuScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [dishes, setDishes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(''); // -------------------------------------------------------------
  // 🔥 LOAD RESTAURANT → CATEGORY → DISHES
  // -------------------------------------------------------------
  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // lấy nhà hàng theo userId
      const qRes = query(
        collection(db, 'restaurants'),
        where('userId', '==', user.uid)
      );

      const snapRes = await getDocs(qRes);
      if (snapRes.empty) return;

      const rId = snapRes.docs[0].id;
      setRestaurantId(rId);

      loadCategories(rId);
      loadDishes(rId);
    } catch (e) {
      console.log('Lỗi load restaurant:', e);
    }
  };

  // -------------------------------------------------------------
  // 🔥 LOAD CATEGORY LIST
  // -------------------------------------------------------------
  const loadCategories = async (rId: string) => {
    try {
      const qCate = query(
        collection(db, 'restaurant_categories'),
        where('restaurant_id', '==', rId)
      );

      const snapCate = await getDocs(qCate);
      if (!snapCate.empty) {
        const data = snapCate.docs[0].data().category_list || [];
        setCategories(data);
      }
    } catch (e) {
      console.log('Lỗi load category:', e);
    }
  };

  // -------------------------------------------------------------
  // 🔥 LOAD DISHES
  // -------------------------------------------------------------
  const loadDishes = async (rId: string) => {
    try {
      const qDish = query(
        collection(db, 'dishes'),
        where('restaurantId', '==', rId)
      );

      const snapDish = await getDocs(qDish);

      const list = snapDish.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setDishes(list);
    } catch (e) {
      console.log('Lỗi load dishes:', e);
    }
  };

  // -------------------------------------------------------------
  // 🔥 UPDATE TRẠNG THÁI BẬT/TẮT MÓN
  // -------------------------------------------------------------
  const handleToggleAvailable = async (id: string, current: boolean) => {
    try {
      const dishRef = doc(db, 'dishes', id);
      await updateDoc(dishRef, { is_enable: !current });

      setDishes((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_enable: !current } : i))
      );
    } catch (e) {
      console.log('Lỗi toggle:', e);
    }
  };

  // lọc theo tên món
  const filteredDishes = dishes.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Back */}
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý menu</Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          {/* Thêm danh mục */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('./menu/addcate')}
          >
            <Ionicons
              name="pricetag-outline"
              size={24}
              color="#333"
            />
            <Text style={styles.iconText}>Thêm danh mục</Text>
          </TouchableOpacity>
          {/* Thêm món */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              router.push({
                pathname: './menu/add',
                params: { restaurantId },
              })
            }
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color="#333"
            />
            <Text style={styles.iconText}>Thêm món</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Search */}
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
      {/* LIST DISHES */}
      <FlatList
        data={filteredDishes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const catName =
            categories.find((c) => c.id === item.categoryId)?.name || 'Khác';

          return (
            <TouchableOpacity
              onPress={() => router.push(`./menu/edit?dishId=${item.id}`)}
            >
              <View style={styles.card}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.dishName}>{item.name}</Text>
                  <Text style={styles.category}>{catName}</Text>
                  <Text style={styles.price}>
                    {item.price.toLocaleString()}đ
                  </Text>
                </View>

                <Switch
                  value={item.is_enable}
                  onValueChange={() =>
                    handleToggleAvailable(item.id, item.is_enable)
                  }
                  trackColor={{ false: '#ccc', true: '#D7A359' }} // màu nền bật/tắt
                  thumbColor={item.is_enable ? '#fff' : '#fff'} // màu nút tròn
                />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40 }}>
            Không có món nào
          </Text>
        }
      />
      {/* Modal thêm danh mục */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm danh mục mới</Text>
            <TextInput
              placeholder="Tên danh mục"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 10,
                paddingHorizontal: 12,
                height: 40,
                marginBottom: 20,
              }}
            />
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              <TouchableOpacity
                onPress={() => {
                  setCategoryModalVisible(false);
                  setNewCategoryName('');
                }}
                style={[styles.modalBtn, { backgroundColor: '#888' }]}
              >
                <Text style={{ color: '#fff' }}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (!newCategoryName.trim() || !restaurantId) return;

                  try {
                    // Lấy document restaurant_categories của nhà hàng
                    const qCate = query(
                      collection(db, 'restaurant_categories'),
                      where('restaurant_id', '==', restaurantId)
                    );
                    const snapCate = await getDocs(qCate);

                    if (!snapCate.empty) {
                      const docRef = snapCate.docs[0].ref;
                      const data = snapCate.docs[0].data();
                      const category_list = data.category_list || [];

                      // Thêm category mới
                      const newCategory = {
                        id: Date.now().toString(),
                        name: newCategoryName.trim(),
                      };
                      await updateDoc(docRef, {
                        category_list: [...category_list, newCategory],
                        updatedAt: new Date(),
                      });

                      setCategories((prev) => [...prev, newCategory]);
                      setNewCategoryName('');
                      setCategoryModalVisible(false);
                    }
                  } catch (e) {
                    console.log('Lỗi thêm category:', e);
                  }
                }}
                style={[styles.modalBtn, { backgroundColor: '#D7A359' }]}
              >
                <Text style={{ color: '#fff' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  iconButton: { alignItems: 'center' },
  iconText: { fontSize: 12, marginTop: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  input: { flex: 1, marginLeft: 8, height: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  image: { width: 60, height: 60, borderRadius: 10 },
  dishName: { fontSize: 16, fontWeight: '500' },
  category: { color: '#888', fontSize: 12 },
  price: { marginTop: 4, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
});
