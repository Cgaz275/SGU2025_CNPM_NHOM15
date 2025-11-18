import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig';

interface Category {
  id: string;
  name: string;
}

export default function CategoryManager() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');

  // Load restaurant hiện tại
  useEffect(() => {
    const loadRestaurant = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const qRes = query(
        collection(db, 'restaurants'),
        where('userId', '==', user.uid)
      );
      const snapRes = await getDocs(qRes);
      if (!snapRes.empty) {
        const rId = snapRes.docs[0].id;
        setRestaurantId(rId);
        loadCategories(rId);
      }
    };
    loadRestaurant();
  }, []);

  // Load danh mục
  const loadCategories = async (rId: string) => {
    try {
      const qCate = query(
        collection(db, 'restaurant_categories'),
        where('restaurant_id', '==', rId)
      );
      const snapCate = await getDocs(qCate);
      if (!snapCate.empty) {
        const docData = snapCate.docs[0].data();
        const list = docData.category_list || [];
        setCategories(list);
      }
    } catch (e) {
      console.log('Lỗi load category:', e);
    }
  };

  // Thêm danh mục mới
  const addCategory = async () => {
    if (!restaurantId || !newCategoryName.trim()) return;

    try {
      const qCate = query(
        collection(db, 'restaurant_categories'),
        where('restaurant_id', '==', restaurantId)
      );
      const snapCate = await getDocs(qCate);

      if (!snapCate.empty) {
        const docRef = snapCate.docs[0].ref;
        const currentList = snapCate.docs[0].data().category_list || [];
        const newCat: Category = {
          id: Date.now().toString(),
          name: newCategoryName.trim(),
        };
        const updatedList = [...currentList, newCat];
        await updateDoc(docRef, {
          category_list: updatedList,
          updatedAt: serverTimestamp(),
        });
        setCategories(updatedList);
        setNewCategoryName('');
      }
    } catch (e) {
      console.log('Lỗi thêm category:', e);
    }
  };

  // Sửa danh mục
  const saveEditCategory = async () => {
    if (!editingCategory || !editName.trim() || !restaurantId) return;

    try {
      // Query document category của nhà hàng hiện tại
      const qCate = query(
        collection(db, 'restaurant_categories'),
        where('restaurant_id', '==', restaurantId)
      );
      const snapCate = await getDocs(qCate);

      if (!snapCate.empty) {
        const docRef = snapCate.docs[0].ref;
        const currentList = snapCate.docs[0].data().category_list || [];

        const updatedList = currentList.map((c: Category) =>
          c.id === editingCategory.id ? { ...c, name: editName.trim() } : c
        );

        await updateDoc(docRef, {
          category_list: updatedList,
          updatedAt: serverTimestamp(),
        });

        setCategories(updatedList);
        setEditingCategory(null);
        setEditName('');
      }
    } catch (e) {
      console.log('Lỗi sửa category:', e);
    }
  };

  // Xóa danh mục
  const deleteCategory = async (cat: Category) => {
    if (!restaurantId) return;

    Alert.alert('Xác nhận', `Xóa danh mục "${cat.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            // Query document category của nhà hàng hiện tại
            const qCate = query(
              collection(db, 'restaurant_categories'),
              where('restaurant_id', '==', restaurantId)
            );
            const snapCate = await getDocs(qCate);

            if (!snapCate.empty) {
              const docRef = snapCate.docs[0].ref;
              const currentList = snapCate.docs[0].data().category_list || [];

              const updatedList = currentList.filter(
                (c: Category) => c.id !== cat.id
              );

              await updateDoc(docRef, {
                category_list: updatedList,
                updatedAt: serverTimestamp(),
              });

              setCategories(updatedList);
            }
          } catch (e) {
            console.log('Lỗi xóa category:', e);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
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
      <Text style={styles.title}>Quản lý danh mục</Text>

      {/* Thêm danh mục */}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Tên danh mục mới"
          placeholderTextColor="#888"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={addCategory}
        >
          <Ionicons
            name="add-circle-outline"
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* List danh mục */}
      {categories.map((cat) => (
        <View
          key={cat.id}
          style={styles.categoryRow}
        >
          {editingCategory?.id === cat.id ? (
            <>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={editName}
                onChangeText={setEditName}
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={saveEditCategory}
              >
                <Text style={{ color: '#fff' }}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setEditingCategory(null)}
                style={styles.cancelBtn}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ flex: 1 }}>{cat.name}</Text>
              <TouchableOpacity
                onPress={() => {
                  setEditingCategory(cat);
                  setEditName(cat.name);
                }}
              >
                <Ionicons
                  name="pencil-outline"
                  size={22}
                  color="#007AFF"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteCategory(cat)}>
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color="#f00"
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    color: '#000',
  },
  addBtn: {
    backgroundColor: '#D7A359',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    padding: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelBtn: {
    padding: 6,
    marginLeft: 4,
  },
});
