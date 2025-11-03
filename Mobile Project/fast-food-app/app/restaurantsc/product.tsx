import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
} from 'react-native';
import { restaurants } from '../../data/mockData';

export default function ProductScreen() {
  const router = useRouter();

  // Lấy món cố định từ Phở Thìn
  const phoThin = restaurants.find((r) => r.name === 'Phở Thìn');
  const dish = phoThin.dishes.find((d) => d.id === 'd1'); // luôn lấy món Phở bò tái

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={{ padding: 8 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../assets/icons/arrow.png')} // đường dẫn tới icon của m
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Image
        source={dish.image}
        style={styles.image}
      />
      <Text style={styles.name}>{dish.name}</Text>
      <Text style={styles.desc}>{dish.description}</Text>
      <Text style={styles.price}>{dish.price.toLocaleString()}đ</Text>

      {/* Chọn thuộc tính (dummy) */}
      <Text style={styles.sectionTitle}>Chọn option:</Text>
      {dish.options.map((opt, i) => (
        <TouchableOpacity
          key={i}
          style={styles.optionButton}
        >
          <Text>{opt}</Text>
        </TouchableOpacity>
      ))}

      {/* Thêm vào giỏ */}
      <TouchableOpacity
        style={styles.addToCart}
        onPress={() => router.back()} // quay về index.tsx
      >
        <Text style={styles.addText}>Thêm vào giỏ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  image: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: '700' },
  desc: { color: '#666', marginVertical: 8 },
  price: {
    fontWeight: '700',
    fontSize: 18,
    color: '#e67e22',
    marginBottom: 16,
  },
  backButton: {
    padding: 12,
    backgroundColor: '#eee',
    margin: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  addToCart: {
    marginTop: 24,
    backgroundColor: '#e67e22',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
