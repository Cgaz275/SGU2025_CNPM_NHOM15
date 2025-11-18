import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../FirebaseConfig';

export default function EditPromo() {
  const router = useRouter();
  const { promoId } = useLocalSearchParams<{ promoId: string }>();

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [usageLimit, setUsageLimit] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [detail, setDetail] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date());
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  // Load dữ liệu promo
  useEffect(() => {
    const loadPromo = async () => {
      if (!promoId) return;
      const docRef = doc(db, 'promotions_restaurant', promoId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCode(data.code || '');
        setDiscount(data.discount_percentage?.toString() || '');
        setExpiryDate(
          data.expiryDate?.toDate
            ? data.expiryDate.toDate()
            : new Date(data.expiryDate)
        );
        setUsageLimit(data.usage_limit?.toString() || '');
        setMinPrice(data.minPrice?.toString() || '');
        setDetail(data.detail || '');
        setCreatedAt(
          data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        );
      }
    };
    loadPromo();
  }, [promoId]);

  const savePromo = async () => {
    if (!promoId) return;
    try {
      const docRef = doc(db, 'promotions_restaurant', promoId);
      await updateDoc(docRef, {
        code,
        discount_percentage: Number(discount),
        expiryDate,
        detail,
        minPrice: minPrice ? Number(minPrice) : 0,
        usage_limit: usageLimit ? Number(usageLimit) : 1,
      });
      router.back();
    } catch (e) {
      console.log('Lỗi update promo:', e);
    }
  };

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Chỉnh sửa khuyến mãi</Text>
      </View>

      <Text style={styles.label}>Mã giảm giá</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mã giảm giá"
        placeholderTextColor="#888"
        value={code}
        onChangeText={setCode}
      />

      <Text style={styles.label}>Giảm giá (%)</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập % giảm"
        placeholderTextColor="#888"
        value={discount}
        onChangeText={setDiscount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Giá trị đơn tối thiểu</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập giá trị tối thiểu"
        placeholderTextColor="#888"
        value={minPrice}
        onChangeText={setMinPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mô tả"
        placeholderTextColor="#888"
        value={detail}
        onChangeText={setDetail}
      />

      <Text style={styles.label}>Giới hạn sử dụng</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập giới hạn sử dụng"
        placeholderTextColor="#888"
        value={usageLimit}
        onChangeText={setUsageLimit}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Ngày bắt đầu</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#eee' }]}
        value={formatDate(createdAt)}
        editable={false}
      />

      <Text style={styles.label}>Ngày hết hạn</Text>
      <TouchableOpacity
        onPress={() => setShowExpiryPicker(true)}
        style={styles.dateBtn}
      >
        <Text>{formatDate(expiryDate)}</Text>
      </TouchableOpacity>
      {showExpiryPicker && (
        <DateTimePicker
          value={expiryDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, d) => {
            if (d) setExpiryDate(d);
            setShowExpiryPicker(false);
          }}
        />
      )}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={savePromo}
      >
        <Text style={styles.addBtnText}>Cập nhật khuyến mãi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  pageTitle: { fontSize: 20, fontWeight: '600', marginLeft: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#000' },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: '#D7A359',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
