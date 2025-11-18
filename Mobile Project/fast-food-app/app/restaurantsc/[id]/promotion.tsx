import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { db } from '../../../FirebaseConfig';

export default function PromotionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const restaurantId = params.restaurantId as string; // từ checkout

  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPromotions = async () => {
      setLoading(true);
      const list: any[] = [];

      // --- Global promotions ---
      const globalSnap = await getDocs(collection(db, 'promotions'));
      globalSnap.forEach((doc) => {
        const d = doc.data();
        if (d.is_enable) {
          // Tạm chưa filter minPrice ở đây, check ở checkout
          list.push({
            id: doc.id,
            code: d.code,
            detail: d.detail,
            discount_percentage: d.discount_percentage,
            expiredDay: d.expiredDay,
            minPrice: d.minPrice ?? 0, // thêm field minPrice
          });
        }
      });

      // --- Restaurant-specific promotions ---
      const restSnap = await getDocs(
        query(
          collection(db, 'promotions_restaurant'),
          where('restaurantID', '==', restaurantId),
          where('is_enable', '==', true)
        )
      );
      restSnap.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));

      setPromotions(list);
      setLoading(false);
    };

    loadPromotions();
  }, [restaurantId]);

  const selectPromo = (promo: any) => {
    router.replace({
      pathname: './checkout',
      params: {
        selectedPromoId: promo.id,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TouchableOpacity
        style={{ marginTop: 50, marginLeft: 20, paddingBottom: 10 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>

      <ScrollView style={{ padding: 16 }}>
        <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 12 }}>
          Chọn mã khuyến mãi
        </Text>

        {loading ? (
          <Text>Đang tải...</Text>
        ) : promotions.length === 0 ? (
          <Text>Hiện không có mã nào</Text>
        ) : (
          promotions.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => selectPromo(item)}
              style={{
                padding: 12,
                marginBottom: 12,
                backgroundColor: '#f4f4f4',
                borderRadius: 8,
              }}
            >
              <Text style={{ fontWeight: '600' }}>{item.code}</Text>
              <Text>{item.detail}</Text>
              <Text>Giảm {item.discount_percentage}%</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
