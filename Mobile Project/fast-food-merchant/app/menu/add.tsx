import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { categories } from '../../data/mockData';

export default function AddDishScreen() {
  const [dish, setDish] = useState({
    name: '',
    price: '',
    categoryId: '',
    description: '',
    image: null as any,
  });
  const router = useRouter();
  const [optionGroups, setOptionGroups] = useState<any[]>([]);

  const handleChange = (key: string, value: any) => {
    setDish((prev) => ({ ...prev, [key]: value }));
  };

  const addOptionGroup = () => {
    setOptionGroups((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', type: 'single', options: [] },
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

  const handleAddImage = () => {
    setDish((prev) => ({
      ...prev,
      image: require('@/assets/images/pho.webp'),
    }));
  };

  const handleSubmit = () => {
    console.log('Dish info:', dish);
    console.log('Options:', optionGroups);
    router.back();
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
      <ScrollView>
        <Text style={styles.header}>Thêm món ăn mới</Text>

        <View style={styles.imageRow}>
          {/* Ảnh */}
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={handleAddImage}
          >
            {dish.image ? (
              <Image
                source={dish.image}
                style={styles.image}
              />
            ) : (
              <>
                <Ionicons
                  name="camera-outline"
                  size={32}
                  color="#888"
                />
                <Text style={styles.imagePickerText}>Thêm ảnh</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Chú thích */}
          <Text style={styles.imageNote}>Chỉ chấp nhận ảnh 1x1</Text>
        </View>

        {/* Tên món */}
        <Text style={styles.label}>Tên món ăn</Text>
        <TextInput
          placeholder="Tên món ăn"
          style={styles.input}
          value={dish.name}
          onChangeText={(text) => handleChange('name', text)}
        />

        {/* Giá */}
        <Text style={styles.label}>Giá</Text>
        <TextInput
          placeholder="Giá (VNĐ)"
          style={styles.input}
          keyboardType="numeric"
          value={dish.price}
          onChangeText={(text) => handleChange('price', text)}
        />

        {/* Dropdown danh mục */}
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
              {categories.map((c) => (
                <Picker.Item
                  key={c.id}
                  label={c.name}
                  value={c.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Mô tả */}
        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          placeholder="Mô tả món ăn"
          style={[styles.input, { height: 80 }]}
          multiline
          value={dish.description}
          onChangeText={(text) => handleChange('description', text)}
        />

        {/* Nhóm tùy chọn */}
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
            <Text style={styles.submitText}>Lưu món ăn (Demo)</Text>
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
