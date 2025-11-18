import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig';

export default function UpdateDishScreen() {
  const router = useRouter();
  const { dishId } = useLocalSearchParams();

  const [dish, setDish] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<any[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<any>(null);
  const [optionGroups, setOptionGroups] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalField, setModalField] = useState('');
  const [modalValue, setModalValue] = useState('');
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    dish?.categoryId || ''
  );
  const apiKey = '95bec918c13c0eee27f992de0543be72';

  // Lấy dữ liệu món
  useEffect(() => {
    const fetchDish = async () => {
      try {
        const dishRef = doc(db, 'dishes', dishId as string);
        const snap = await getDoc(dishRef);
        if (snap.exists()) {
          const data = snap.data();
          setDish(data);
          setImageUrl(data.imageUrl || null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDish();
  }, [dishId]);

  // Lấy categories
  useEffect(() => {
    const fetchCategories = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const qRest = query(
          collection(db, 'restaurants'),
          where('userId', '==', user.uid)
        );
        const restSnap = await getDocs(qRest);
        if (restSnap.empty) return;

        const restaurantId = restSnap.docs[0].id;
        const qCat = query(
          collection(db, 'restaurant_categories'),
          where('restaurant_id', '==', restaurantId)
        );
        const catSnap = await getDocs(qCat);
        if (!catSnap.empty) {
          const cats = catSnap.docs[0].data().category_list || [];
          setCategories(cats);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchCategories();
  }, []);

  // Lấy optionGroups
  useEffect(() => {
    const fetchOptionGroups = async () => {
      const q = query(
        collection(db, 'optionGroup'),
        where('dishId', '==', dishId)
      );
      const snap = await getDocs(q);
      const groups = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOptionGroups(groups);
    };
    fetchOptionGroups();
  }, [dishId]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.5,
        allowsEditing: true,
        aspect: [1, 1], // ép tỷ lệ 1:1
      });
      if (result.canceled) return;
      setLocalImageUri(result.assets[0].uri);
      setModalField('image');
      setModalVisible(true);
    } catch {
      alert('Lỗi chọn ảnh');
    }
  };

  const uploadToImgbb = async (uri: string) => {
    setUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const body = new URLSearchParams();
      body.append('key', apiKey);
      body.append('image', base64);
      const res = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const json = await res.json();
      if (json.success) return json.data.url;
      throw new Error('Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const updateField = async (key: string, value: any) => {
    try {
      const ref = doc(db, 'dishes', dishId as string);
      await updateDoc(ref, { [key]: value });
      setDish((prev: any) => ({ ...prev, [key]: value }));
    } catch {
      alert('Lỗi cập nhật');
    }
  };

  const handleModalSave = async () => {
    if (modalField === 'image' && localImageUri) {
      const url = await uploadToImgbb(localImageUri);
      await updateField('imageUrl', url);
      setImageUrl(url);
      setLocalImageUri(null);
    } else {
      await updateField(modalField, modalValue);
    }
    setModalVisible(false);
  };

  const openOptionGroupModal = (group: any) => {
    setCurrentGroup({ ...group });
    setOptionModalVisible(true);
  };

  const updateChoiceField = (choiceId: string, key: string, value: any) => {
    setCurrentGroup((prev: any) => ({
      ...prev,
      choices: prev.choices.map((c: any) =>
        c.id === choiceId ? { ...c, [key]: value } : c
      ),
    }));
  };

  const addChoice = () => {
    const newChoice = { id: Date.now().toString(), name: '', price: 0 };
    setCurrentGroup((prev: any) => ({
      ...prev,
      choices: [...prev.choices, newChoice],
    }));
  };

  const removeChoice = (choiceId: string) => {
    setCurrentGroup((prev: any) => ({
      ...prev,
      choices: prev.choices.filter((c: any) => c.id !== choiceId),
    }));
  };

  const saveOptionGroup = async () => {
    if (!currentGroup) return;
    const ref = doc(db, 'optionGroup', currentGroup.id);
    await updateDoc(ref, {
      name: currentGroup.name,
      type: currentGroup.type,
      choices: currentGroup.choices,
      updatedAt: new Date(),
    });

    setOptionGroups((prev: any) =>
      prev.map((g: any) => (g.id === currentGroup.id ? currentGroup : g))
    );
    setOptionModalVisible(false);
  };

  if (loading || !dish) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginTop: 50 }}
      >
        <Ionicons
          name="arrow-back"
          size={28}
        />
      </TouchableOpacity>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={styles.header}>Cập nhật món ăn</Text>
        <TouchableOpacity onPress={() => setMoreMenuVisible(true)}>
          <Ionicons
            name="ellipsis-vertical"
            size={24}
          />
        </TouchableOpacity>
      </View>
      {/* Hình ảnh */}
      <TouchableOpacity
        style={styles.fieldRow}
        onPress={pickImage}
      >
        <Text style={styles.fieldLabel}>Hình ảnh</Text>
        {localImageUri || imageUrl ? (
          <Image
            source={{ uri: localImageUri || imageUrl }}
            style={{ width: 80, height: 80, borderRadius: 8 }}
          />
        ) : (
          <Text style={{ color: '#888' }}>Chọn ảnh</Text>
        )}
      </TouchableOpacity>
      {/* Tên, Giá, Mô tả */}
      {['name', 'price', 'description'].map((field) => (
        <TouchableOpacity
          key={field}
          style={styles.fieldRow}
          onPress={() => {
            setModalField(field);
            setModalValue(dish[field]?.toString() || '');
            setModalVisible(true);
          }}
        >
          <Text style={styles.fieldLabel}>
            {field === 'name' ? 'Tên món' : field === 'price' ? 'Giá' : 'Mô tả'}
          </Text>
          <Text style={styles.fieldValue}>
            {field === 'price' ? `${dish[field]} VNĐ` : dish[field]}
          </Text>
        </TouchableOpacity>
      ))}
      {/* Danh mục */}
      <View style={{ marginTop: 10 }}>
        <Text style={styles.fieldLabel}>Danh mục</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            marginTop: 4,
            backgroundColor: '#f8f8f8ff',
            overflow: 'hidden',
          }}
        >
          <Picker
            selectedValue={dish.categoryId}
            onValueChange={async (value) => {
              await updateField('categoryId', value);
            }}
            style={{ height: 50, width: '100%', color: '#000000ff' }}
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

      {/* OptionGroups */}
      <Text style={[styles.label, { marginTop: 20 }]}>Nhóm tùy chọn</Text>
      {optionGroups.map((group: any) => (
        <TouchableOpacity
          key={group.id}
          onPress={() => openOptionGroupModal(group)}
          style={styles.optionGroupBox}
        >
          <Text style={{ fontSize: 16 }}>
            {group.name} ({group.type})
          </Text>
          <Text style={{ color: '#666', marginTop: 4 }}>
            {group.choices
              ?.map((o: any) => `${o.name} (+${o.price})`)
              .join(', ')}
          </Text>
        </TouchableOpacity>
      ))}
      {/* Thêm nhóm mới */}
      <TouchableOpacity
        style={[styles.saveImageBtn, { alignSelf: 'flex-start' }]}
        onPress={async () => {
          const newGroupRef = await addDoc(collection(db, 'optionGroup'), {
            name: 'Nhóm mới',
            type: 'single',
            choices: [],
            dishId,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          const dishRef = doc(db, 'dishes', dishId as string);
          const dishSnap = await getDoc(dishRef);
          const currentOptionGroup = dishSnap.exists()
            ? dishSnap.data().optionGroup || []
            : [];

          await updateDoc(dishRef, {
            optionGroup: [...currentOptionGroup, newGroupRef.id],
          });

          const newGroup = {
            id: newGroupRef.id,
            name: 'Nhóm mới',
            type: 'single',
            choices: [],
          };
          setOptionGroups((prev) => [...prev, newGroup]);
          setDish((prev) => ({
            ...prev,
            optionGroup: [...(prev.optionGroup || []), newGroupRef.id],
          }));

          openOptionGroupModal(newGroup);
        }}
      >
        <Text style={{ color: '#fff' }}>Thêm nhóm tùy chọn mới</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.saveImageBtn,
          { backgroundColor: '#FF3B30', alignSelf: 'flex-start' },
        ]}
        onPress={() => {
          Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn xóa món này? Hành động này không thể hoàn tác.',
            [
              { text: 'Huỷ', style: 'cancel' },
              {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                  try {
                    // 1. Lấy tất cả optionGroup liên quan và xóa
                    const q = query(
                      collection(db, 'optionGroup'),
                      where('dishId', '==', dishId)
                    );
                    const snap = await getDocs(q);
                    for (const docSnap of snap.docs) {
                      await deleteDoc(doc(db, 'optionGroup', docSnap.id));
                    }

                    // 2. Xóa món chính
                    await deleteDoc(doc(db, 'dishes', dishId));

                    // 3. Quay lại màn hình trước
                    router.back();
                  } catch (err) {
                    console.log(err);
                    alert('Xảy ra lỗi khi xóa món');
                  }
                },
              },
            ]
          );
        }}
      >
        <Text style={{ color: '#fff' }}>Xóa món</Text>
      </TouchableOpacity>
      {/* Modal chỉnh tên/giá/mô tả/ảnh */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật {modalField}</Text>
            {modalField !== 'image' ? (
              <TextInput
                style={styles.modalInput}
                value={modalValue}
                onChangeText={setModalValue}
                keyboardType={modalField === 'price' ? 'numeric' : 'default'}
                multiline={modalField === 'description'}
              />
            ) : (
              <Text style={{ marginBottom: 12 }}>Chọn ảnh mới nếu muốn</Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtn, { backgroundColor: '#888' }]}
              >
                <Text style={{ color: '#fff' }}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleModalSave}
                style={[styles.modalBtn, { backgroundColor: '#D7A359' }]}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff' }}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal OptionGroup */}
      <Modal
        visible={optionModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa nhóm</Text>
            <TextInput
              style={styles.modalInput}
              value={currentGroup?.name}
              onChangeText={(text) =>
                setCurrentGroup((prev: any) => ({ ...prev, name: text }))
              }
              placeholder="Tên nhóm"
            />

            <Text style={{ marginBottom: 6 }}>Loại chọn</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              {['single', 'multiple'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: '#D7A359',
                    padding: 8,
                    alignItems: 'center',
                    borderRadius: 6,
                    backgroundColor:
                      currentGroup?.type === t ? '#D7A359' : '#fff',
                  }}
                  onPress={() =>
                    setCurrentGroup((prev: any) => ({ ...prev, type: t }))
                  }
                >
                  <Text
                    style={{
                      color: currentGroup?.type === t ? '#fff' : '#333',
                    }}
                  >
                    {t === 'single' ? 'Chọn 1' : 'Nhiều'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ marginBottom: 6 }}>Options</Text>
            <ScrollView style={{ maxHeight: 200, marginBottom: 12 }}>
              {currentGroup?.choices?.map((c: any) => (
                <View
                  key={c.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      flex: 1,
                      borderRadius: 6,
                      padding: 8,
                    }}
                    value={c.name}
                    onChangeText={(text) =>
                      updateChoiceField(c.id, 'name', text)
                    }
                  />
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      width: 80,
                      marginLeft: 6,
                      borderRadius: 6,
                      padding: 8,
                    }}
                    value={c.price.toString()}
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      updateChoiceField(c.id, 'price', Number(text))
                    }
                  />
                  <TouchableOpacity
                    onPress={() => removeChoice(c.id)}
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
            </ScrollView>

            <TouchableOpacity
              onPress={addChoice}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
              }}
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

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 12,
              }}
            >
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#FF3B30' }]}
                onPress={async () => {
                  if (!currentGroup?.id) return;
                  await deleteDoc(doc(db, 'optionGroup', currentGroup.id));
                  const dishRef = doc(db, 'dishes', dishId as string);
                  const dishSnap = await getDoc(dishRef);
                  const currentOptionGroup = dishSnap.exists()
                    ? dishSnap.data().optionGroup || []
                    : [];
                  const newOptionGroup = currentOptionGroup.filter(
                    (id: string) => id !== currentGroup.id
                  );
                  await updateDoc(dishRef, { optionGroup: newOptionGroup });
                  setOptionGroups((prev) =>
                    prev.filter((g) => g.id !== currentGroup.id)
                  );
                  setDish((prev) => ({
                    ...prev,
                    optionGroup: (prev.optionGroup || []).filter(
                      (id) => id !== currentGroup.id
                    ),
                  }));
                  setOptionModalVisible(false);
                }}
              >
                <Text style={{ color: '#fff' }}>Xóa nhóm</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#D7A359' }]}
                onPress={saveOptionGroup}
              >
                <Text style={{ color: '#fff' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal category */}
      {/* Modal category với Picker */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setCategoryModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn danh mục</Text>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                style={[styles.modalBtn, { backgroundColor: '#888' }]}
              >
                <Text style={{ color: '#fff' }}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await updateField('categoryId', selectedCategory);
                  setCategoryModalVisible(false);
                }}
                style={[styles.modalBtn, { backgroundColor: '#D7A359' }]}
              >
                <Text style={{ color: '#fff' }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

// Chỉnh lại styles
const styles = StyleSheet.create({
  fieldCard: {
    backgroundColor: '#f8f8f8',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  optionGroupBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: '#fafafa',
  },
  saveImageBtn: {
    backgroundColor: '#D7A359',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 40,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  container: { backgroundColor: '#fff', padding: 16, flex: 1 },
  header: { fontSize: 22, fontWeight: '600', marginBottom: 20 },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    marginTop: 10,
  },
  fieldLabel: { fontSize: 14, fontWeight: '500', color: '#666' },
  fieldValue: { fontSize: 16, color: '#333' },
  imageBox: {
    width: 130,
    height: 130,
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: { width: '100%', height: '100%' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  pickerStyle: {
    height: 50,
    width: '100%',
  },
});
