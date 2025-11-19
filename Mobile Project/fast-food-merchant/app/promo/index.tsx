import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig';

interface PromoCode {
  id: string;
  code: string;
  discount_percentage: number;
  minPrice: number;
  detail: string;
  createdAt: Date;
  expiryDate: Date;
  usage_limit: number;
  usage_count: number;
  is_enable: boolean;
  restaurantId: string;
}

export default function Promotion() {
  const router = useRouter();
  const [promoList, setPromoList] = useState<PromoCode[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // ---- LOAD RESTAURANT ----
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

  // ---- SAFE DATE CONVERT ----
  const safeDate = (value: any) => {
    if (!value) return new Date();
    if (value?.toDate) return value.toDate(); // Timestamp
    return new Date(value); // string or anything else
  };

  // ---- LOAD PROMO ----
  useEffect(() => {
    if (!restaurantId) return;

    const loadPromo = async () => {
      const q = query(
        collection(db, 'promotions_restaurant'),
        where('restaurantId', '==', restaurantId)
      );

      const snap = await getDocs(q);

      const promos = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          code: data.code,
          discount_percentage: data.discount_percentage,
          minPrice: data.minPrice,
          detail: data.detail,
          createdAt: safeDate(data.createdAt),
          expiryDate: safeDate(data.expiryDate),
          usage_limit: data.usage_limit,
          usage_count: data.usage_count,
          is_enable: data.is_enable,
          restaurantId: data.restaurantId,
        } as PromoCode;
      });

      setPromoList(promos);
    };

    loadPromo();
  }, [restaurantId]);

  // ---- DELETE ----
  const handleDelete = (promo: PromoCode) => {
    Alert.alert('Xác nhận', `Xóa promo ${promo.code}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () =>
          setPromoList((prev) => prev.filter((p) => p.id !== promo.id)),
      },
    ]);
  };

  // ---- FORMAT DATE ----
  const formatDate = (date: Date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#fff' }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Quản lý khuyến mãi</Text>
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push('../promo/addpromo')}
      >
        <Text style={styles.addBtnText}>+ Thêm khuyến mãi</Text>
      </TouchableOpacity>

      {promoList.length === 0 && (
        <Text style={{ textAlign: 'center', color: '#888', marginTop: 12 }}>
          Chưa có khuyến mãi nào
        </Text>
      )}

      {promoList.map((p) => (
        <View
          key={p.id}
          style={styles.card}
        >
          <Text style={styles.code}>{p.code}</Text>
          <Text>Giảm: {p.discount_percentage}%</Text>
          <Text>Mức tối thiểu: {p.minPrice.toLocaleString()}đ</Text>
          <Text>
            Thời gian: {formatDate(p.createdAt)} → {formatDate(p.expiryDate)}
          </Text>
          <Text>
            Sử dụng: {p.usage_count}/{p.usage_limit}
          </Text>
          <Text>Mô tả: {p.detail}</Text>
          <Text>Trạng thái: {p.is_enable ? 'Bật' : 'Tắt'}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '../promo/editpromo',
                  params: { promoId: p.id },
                })
              }
              style={styles.actionBtn}
            >
              <Ionicons
                name="pencil-outline"
                size={20}
                color="#007AFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDelete(p)}
              style={styles.actionBtn}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color="#f00"
              />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ---- CSS ----
const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 5,
  },
  pageTitle: { fontSize: 20, fontWeight: '600', marginLeft: 12 },
  addBtn: {
    backgroundColor: '#D7A359',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  code: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: '#ff9800' },
  actionRow: { flexDirection: 'row', marginTop: 8 },
  actionBtn: { marginRight: 16 },
});
