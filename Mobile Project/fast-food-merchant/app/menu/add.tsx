import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig'; // Đường dẫn file firebase config của bạn

export default function AddDishScreen() {
  const [dish, setDish] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    image: null as any, // có thể là {uri: localUri} hoặc null
  });
  const router = useRouter();
  const [optionGroups, setOptionGroups] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Ảnh preview local + ảnh url trên server (khi upload xong)
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const apiKey = '95bec918c13c0eee27f992de0543be72';

  useEffect(() => {
    const fetchCategories = async () => {
      const user = auth.currentUser;
      if (!user) {
        setCategories([]);
        setLoadingCategories(false);
        return;
      }

      try {
        const qRest = query(
          collection(db, 'restaurants'),
          where('userId', '==', user.uid)
        );
        const restSnapshot = await getDocs(qRest);

        if (restSnapshot.empty) {
          setCategories([]);
          setLoadingCategories(false);
          return;
        }

        const restaurantDoc = restSnapshot.docs[0];
        const restaurantId = restaurantDoc.id;

        const qCategories = query(
          collection(db, 'restaurant_categories'),
          where('restaurant_id', '==', restaurantId)
        );
        const unsubscribe = onSnapshot(qCategories, (snapshot) => {
          if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            const cats = docData.category_list || [];
            setCategories(cats);
          } else {
            setCategories([]);
          }
          setLoadingCategories(false);
        });

        return () => unsubscribe();
      } catch (error) {
        setCategories([]);
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (key: string, value: any) => {
    setDish((prev) => ({ ...prev, [key]: value }));
  };

  const generateId = () =>
    Date.now().toString() + Math.floor(Math.random() * 10000).toString();

  const addOptionGroup = () => {
    setOptionGroups((prev) => [
      ...prev,
      { id: generateId(), name: '', type: 'single', options: [] },
    ]);
  };

  const removeOptionGroup = (groupId: string) => {
    setOptionGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const addOptionValue = (groupId: string) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: [
                ...g.options,
                { label: '', price: 0, id: Date.now().toString() },
              ],
            }
          : g
      )
    );
  };

  const removeOptionValue = (groupId: string, optionId: string) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.filter((opt: any) => opt.id !== optionId),
            }
          : g
      )
    );
  };

  const handleGroupChange = (groupId: string, key: string, value: any) => {
    setOptionGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, [key]: value } : g))
    );
  };

  const handleOptionChange = (
    groupId: string,
    optionId: string,
    key: string,
    value: any
  ) => {
    setOptionGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              options: g.options.map((opt: any) =>
                opt.id === optionId ? { ...opt, [key]: value } : opt
              ),
            }
          : g
      )
    );
  };

  // Hàm chọn ảnh (chỉ preview localUri, chưa upload)
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.5,
        base64: true,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result.canceled) return;

      const localUri = result.assets[0].uri;
      setLocalImageUri(localUri);
      setDish((prev) => ({ ...prev, image: { uri: localUri } }));

      // reset url cũ nếu có
      setImageUrl(null);
    } catch (error) {
      alert('Lỗi chọn ảnh: ' + error);
    }
  };

  // Hàm upload ảnh lên server, trả về url
  const uploadImageToServer = async (uri: string) => {
    try {
      setUploading(true);

      // Lấy base64 từ localUri
      const response = await fetch(uri);
      const blob = await response.blob();

      // Đọc blob thành base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64result = (reader.result as string).split(',')[1]; // bỏ prefix "data:image/xxx;base64,"
          resolve(base64result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const formBody = new URLSearchParams();
      formBody.append('key', apiKey);
      formBody.append('image', base64Data);

      const res = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });

      const json = await res.json();

      if (json.success) {
        return json.data.url;
      } else {
        throw new Error('Upload ảnh thất bại');
      }
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Hàm submit, upload ảnh rồi mới lưu data món ăn
  const handleSubmit = async () => {
    try {
      if (!dish.name.trim()) {
        alert('Vui lòng nhập tên món ăn!');
        return;
      }
      if (!dish.price || isNaN(Number(dish.price))) {
        alert('Vui lòng nhập giá món ăn hợp lệ!');
        return;
      }
      if (!dish.categoryId) {
        alert('Vui lòng chọn danh mục!');
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        alert('Bạn cần đăng nhập để thêm món ăn.');
        return;
      }

      // Lấy restaurantId
      const qRest = query(
        collection(db, 'restaurants'),
        where('userId', '==', user.uid)
      );
      const restSnapshot = await getDocs(qRest);

      if (restSnapshot.empty) {
        alert('Không tìm thấy nhà hàng của bạn!');
        return;
      }

      const restaurantId = restSnapshot.docs[0].id;

      // Nếu có ảnh local thì upload ảnh lên server, lấy URL
      let uploadedImageUrl = imageUrl;
      if (localImageUri && !imageUrl) {
        uploadedImageUrl = await uploadImageToServer(localImageUri);
        setImageUrl(uploadedImageUrl);
      }

      // Tạo dữ liệu món ăn
      const dishData = {
        name: dish.name,
        price: Number(dish.price),
        categoryId: dish.categoryId,
        description: dish.description,
        restaurantId,
        imageUrl: uploadedImageUrl || null,
        createdAt: Timestamp.now(),
        optionGroup: [],
      };

      // Lưu món ăn, lấy doc ref để lấy id
      const dishRef = await addDoc(collection(db, 'dishes'), dishData);
      const dishId = dishRef.id;

      const optionGroupIds: string[] = [];

      // Lưu từng nhóm tùy chọn riêng
      for (const group of optionGroups) {
        const groupData = {
          dishId,
          restaurantId,
          name: group.name,
          type: group.type,
          choices: group.options.map((opt: any) => ({
            id: opt.id,
            name: opt.label,
            price: opt.price,
          })),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const groupRef = await addDoc(collection(db, 'optionGroup'), groupData);
        optionGroupIds.push(groupRef.id);
      }

      // Cập nhật món ăn với optionGroupIds
      await updateDoc(dishRef, {
        optionGroup: optionGroupIds,
        updatedAt: Timestamp.now(),
      });

      alert('Lưu món ăn và nhóm tùy chọn thành công!');
      router.back();
    } catch (error) {
      console.error('Lỗi khi lưu món ăn:', error);
      alert('Lưu món ăn thất bại!');
    }
  };

  return (
    <View style={styles.container}>
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

      {/* Ảnh preview + chọn ảnh */}
      <TouchableOpacity
        style={{
          width: 120,
          height: 120,
          borderRadius: 10,
          backgroundColor: '#eee',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          alignSelf: 'center',
          marginBottom: 16,
        }}
        onPress={pickImage}
      >
        {uploading ? (
          <ActivityIndicator size="large" />
        ) : localImageUri ? (
          <Image
            source={{ uri: localImageUri }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <Text>Chọn ảnh</Text>
        )}
      </TouchableOpacity>

      <ScrollView>
        <Text style={styles.header}>Thêm món ăn mới</Text>

        <Text style={styles.label}>Tên món ăn</Text>
        <TextInput
          placeholder="Tên món ăn"
          style={styles.input}
          value={dish.name}
          onChangeText={(text) => handleChange('name', text)}
        />

        <Text style={styles.label}>Giá</Text>
        <TextInput
          placeholder="Giá (VNĐ)"
          style={styles.input}
          keyboardType="numeric"
          value={dish.price}
          onChangeText={(text) => handleChange('price', text)}
        />

        <View style={styles.pickerBox}>
          <Text style={styles.label}>Danh mục</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={dish.categoryId}
              onValueChange={(value) => handleChange('categoryId', value)}
              style={styles.pickerStyle}
              dropdownIconColor="#D7A359"
            >
              <Picker.Item
                label="Chọn danh mục"
                value=""
              />
              {categories.length === 0 ? (
                <Picker.Item
                  label="Không có danh mục"
                  value=""
                />
              ) : (
                categories.map((c) => (
                  <Picker.Item
                    key={c.id}
                    label={c.name}
                    value={c.id}
                  />
                ))
              )}
            </Picker>
          </View>
        </View>

        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          placeholder="Mô tả món ăn"
          style={[styles.input, { height: 80 }]}
          multiline
          value={dish.description}
          onChangeText={(text) => handleChange('description', text)}
        />

        <View style={{ marginTop: 20 }}>
          <Text style={styles.subHeader}>Nhóm tùy chọn</Text>
          {optionGroups.map((group) => (
            <View
              key={group.id}
              style={styles.groupCard}
            >
              <View style={styles.groupHeader}>
                <TextInput
                  placeholder="Tên nhóm (VD: Chọn size, Topping...)"
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={group.name}
                  onChangeText={(text) =>
                    handleGroupChange(group.id, 'name', text)
                  }
                />
                <TouchableOpacity
                  onPress={() => removeOptionGroup(group.id)}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color="#FF3B30"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Loại chọn:</Text>
              <View style={styles.typeRow}>
                {['single', 'multiple'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeButton,
                      group.type === t && styles.typeButtonActive,
                    ]}
                    onPress={() => handleGroupChange(group.id, 'type', t)}
                  >
                    <Text
                      style={{
                        color: group.type === t ? '#fff' : '#333',
                        fontWeight: '500',
                      }}
                    >
                      {t === 'single' ? 'Chọn 1' : 'Nhiều'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {group.options.map((opt: any) => (
                <View
                  key={opt.id}
                  style={styles.optionRow}
                >
                  <TextInput
                    placeholder="Tên tùy chọn"
                    style={[styles.input, { flex: 1 }]}
                    value={opt.label}
                    onChangeText={(text) =>
                      handleOptionChange(group.id, opt.id, 'label', text)
                    }
                  />
                  <TextInput
                    placeholder="Giá +"
                    style={[styles.input, { width: 80, marginLeft: 8 }]}
                    keyboardType="numeric"
                    value={opt.price?.toString()}
                    onChangeText={(text) =>
                      handleOptionChange(
                        group.id,
                        opt.id,
                        'price',
                        Number(text)
                      )
                    }
                  />
                  <TouchableOpacity
                    onPress={() => removeOptionValue(group.id, opt.id)}
                    style={{ marginLeft: 6 }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="#FF3B30"
                    />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => addOptionValue(group.id)}
                style={styles.addOptionBtn}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={18}
                  color="#D7A359"
                />
                <Text style={{ color: '#D7A359', marginLeft: 4 }}>
                  Thêm tùy chọn
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={addOptionGroup}
            style={styles.addGroupBtn}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color="#D7A359"
            />
            <Text style={{ color: '#D7A359', marginLeft: 4 }}>
              Thêm nhóm tùy chọn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Lưu món ăn</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  subHeader: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  typeRow: { flexDirection: 'row', gap: 10, marginVertical: 8 },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D7A359',
    borderRadius: 6,
    alignItems: 'center',
    paddingVertical: 6,
  },
  typeButtonActive: { backgroundColor: '#D7A359' },
  groupCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  addOptionBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  addGroupBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  submitBtn: {
    backgroundColor: '#D7A359',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: { color: '#fff', fontWeight: '600' },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 10,
  },

  imagePicker: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },

  imagePickerText: {
    color: '#888',
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  imageNote: {
    color: '#888',
    fontSize: 12,
  },
  pickerBox: {
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  pickerStyle: {
    height: 55,
    color: '#333',
  },
  label: {
    color: '#555',
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
});
