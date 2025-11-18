import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../FirebaseConfig';

interface Promotion {
  id: string;
  code: string;
  detail: string;
  discount_percentage: number;
  expiredDay: any;
  usage_count: number;
  usage_limit: number;
  createAt: any;
}

export default function PromotionsScreen() {
  const router = useRouter();

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const snap = await getDocs(collection(db, 'promotions'));
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Promotion[];
        setPromotions(data);
      } catch (err) {
        console.error('ERROR loading promotions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPromotions();
  }, []);

  const renderItem = ({ item }: { item: Promotion }) => {
    const expiredDate = item.expiredDay?.toDate?.() || new Date();
    return (
      <View style={styles.card}>
        <Text style={styles.code}>{item.code}</Text>
        <Text style={styles.detail}>{item.detail}</Text>
        <Text style={styles.discount}>{item.discount_percentage}% OFF</Text>
        <Text style={styles.expired}>
          Hạn dùng: {expiredDate.toLocaleDateString()}
        </Text>
        <Text style={styles.usage}>
          Đã dùng: {item.usage_count}/{item.usage_limit}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      ListHeaderComponent={
        <>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 50 : 40,
              left: 7,
              width: 40, // chiều rộng cố định
              height: 40, // chiều cao cố định
              borderRadius: 20, // nửa chiều để tròn
              backgroundColor: 'rgba(255,255,255,0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <Image
              source={require('../../assets/icons/arrow.png')}
              style={{ width: 20, height: 20 }} // icon vừa trong nút
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text style={styles.title}>Khuyến mãi hiện có</Text>
          {loading && (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              Đang tải...
            </Text>
          )}
        </>
      }
      data={promotions}
      style={{ flex: 1, backgroundColor: '#fff' }}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 20,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    margin: 16,
    paddingTop: 70,
    color: '#333',
  },
  card: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  code: { fontSize: 18, fontWeight: '700', color: '#e67e22', marginBottom: 4 },
  detail: { fontSize: 14, color: '#555', marginBottom: 4 },
  discount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 4,
  },
  expired: { fontSize: 12, color: '#999', marginBottom: 2 },
  usage: { fontSize: 12, color: '#999' },
});
