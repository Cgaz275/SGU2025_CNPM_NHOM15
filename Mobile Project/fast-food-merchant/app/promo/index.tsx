import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Type trực tiếp trong file
interface PromoCondition {
  minOrderValue?: number;
  firstTimeUserOnly?: boolean;
}

interface PromoCode {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  description?: string;
  condition?: PromoCondition;
}

// Mock data
const initialPromo: PromoCode[] = [
  {
    id: '1',
    code: 'SALE20',
    type: 'percent',
    value: 20,
    startDate: new Date('2025-11-01'),
    endDate: new Date('2025-11-30'),
    usageLimit: 100,
    description: 'Giảm 20% cho đơn hàng từ 100k trở lên',
  },
  {
    id: '2',
    code: 'FREE50K',
    type: 'fixed',
    value: 50000,
    startDate: new Date('2025-11-05'),
    endDate: new Date('2025-12-05'),
  },
];

export default function Promotion() {
  const [promoList, setPromoList] = useState<PromoCode[]>(initialPromo);
  const router = useRouter();

  const handleDelete = (promo: PromoCode) => {
    Alert.alert('Xác nhận', `Xóa promo ${promo.code}?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setPromoList(promoList.filter((p) => p.id !== promo.id));
        },
      },
    ]);
  };

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Danh sách khuyến mãi</Text>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() =>
          router.push({
            pathname: '../promo/addpromo',
          })
        }
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
          <Text>
            Loại giảm: {p.type === 'percent' ? `${p.value}%` : `${p.value}₫`}
          </Text>
          <Text>
            Thời gian: {formatDate(p.startDate)} → {formatDate(p.endDate)}
          </Text>
          {p.usageLimit && <Text>Giới hạn sử dụng: {p.usageLimit}</Text>}
          {p.description && <Text>Mô tả: {p.description}</Text>}

          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '../promo/editpromo',
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  addBtn: {
    backgroundColor: '#4caf50',
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
