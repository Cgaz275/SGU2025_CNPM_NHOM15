import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
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
import { auth, db } from '../../FirebaseConfig';

export default function AddPromo() {
  const router = useRouter();

  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [usageLimit, setUsageLimit] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [detail, setDetail] = useState('');
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  // --------------------------------------------------
  // Load restaurant của user hiện tại
  // --------------------------------------------------
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
        setRestaurantId(snapRes.docs[0].id);
      }
    };
    loadRestaurant();
  }, []);

  const savePromo = async () => {
    if (!restaurantId) return;

    try {
      const newPromo = {
        code,
        discount_percentage: Number(discount),
        createdAt: serverTimestamp(), // Ngày bắt đầu tự động
        expiryDate,
        detail,
        is_enable: true,
        minPrice: minPrice ? Number(minPrice) : 0,
        restaurantId,
        usage_count: 0,
        usage_limit: usageLimit ? Number(usageLimit) : 1,
      };

      await addDoc(collection(db, 'promotions_restaurant'), newPromo);
      router.back();
    } catch (e) {
      console.log('Lỗi thêm promo:', e);
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
        <Text style={styles.pageTitle}>Thêm khuyến mãi</Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Mã giảm giá"
        placeholderTextColor="#888" // màu placeholder
        value={code}
        onChangeText={setCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Giảm giá (%)"
        placeholderTextColor="#888"
        value={discount}
        onChangeText={setDiscount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Giá trị tối thiểu"
        placeholderTextColor="#888"
        value={minPrice}
        onChangeText={setMinPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="#888"
        placeholder="Mô tả"
        value={detail}
        onChangeText={setDetail}
      />
      <TextInput
        style={styles.input}
        placeholder="Giới hạn sử dụng"
        placeholderTextColor="#888"
        value={usageLimit}
        onChangeText={setUsageLimit}
        keyboardType="numeric"
      />

      <TouchableOpacity
        onPress={() => setShowExpiryPicker(true)}
        style={styles.dateBtn}
      >
        <Text>Ngày hết hạn: {formatDate(expiryDate)}</Text>
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
        <Text style={styles.addBtnText}>Thêm khuyến mãi</Text>
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
  input: {
    backgroundColor: '#ffffffff',
    color: '#000', // chữ đen
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
