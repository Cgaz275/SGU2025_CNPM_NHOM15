import { useFocusEffect, useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../../FirebaseConfig';

export default function AddressScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = collection(db, 'address');
      const snap = await getDocs(ref);

      const list: any[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        if (d.userId === user.uid) {
          list.push({ id: doc.id, ...d });
        }
      });

      setAddresses(list);
      setLoading(false);
    };

    load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadAddresses = async () => {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) return;

        const ref = collection(db, 'address');
        const snap = await getDocs(ref);

        const list: any[] = [];
        snap.forEach((doc) => {
          const d = doc.data();
          if (d.userId === user.uid) {
            list.push({ id: doc.id, ...d });
          }
        });

        setAddresses(list);
        setLoading(false);
      };

      loadAddresses();
    }, [])
  );
  const selectAddress = (addr: any) => {
    router.replace({
      pathname: './checkout', // NHỚ chỉnh đúng route
      params: {
        selectedAddressId: addr.id,
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
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontWeight: '700', fontSize: 18 }}>
            Chọn địa chỉ giao hàng
          </Text>

          {/* NÚT THÊM ĐỊA CHỈ */}
          <TouchableOpacity
            onPress={() => router.push('/address/add')}
            style={{
              backgroundColor: '#ff6b00',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>+ Thêm</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 12 }} />

        {loading ? (
          <Text>Đang tải...</Text>
        ) : addresses.length === 0 ? (
          <Text>Bạn chưa có địa chỉ nào</Text>
        ) : (
          addresses.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => selectAddress(item)}
              style={{
                padding: 12,
                marginBottom: 12,
                backgroundColor: '#f4f4f4',
                borderRadius: 8,
              }}
            >
              <Text style={{ fontWeight: '600' }}>{item.address}</Text>
              <Text>{item.name}</Text>
              <Text>{item.phone}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
