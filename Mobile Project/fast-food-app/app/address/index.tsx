import { useFocusEffect, useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig'; // 👈 nhớ export auth từ FirebaseConfig

export default function AddressScreen() {
  const router = useRouter();
  const [list, setList] = useState<any[]>([]);
  const [defaultAddrId, setDefaultAddrId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Hàm tải địa chỉ từ Firestore
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Chưa đăng nhập, quay về login...');
        router.replace('../(auth)');
        return;
      }

      const USER_ID = user.uid;

      // Lấy user để biết defaultAddress
      const userDoc = await getDoc(doc(db, 'user', USER_ID));
      const userData = userDoc.exists() ? userDoc.data() : {};
      const defaultAddressId = userData?.defaultAddressId || '';

      // Lấy danh sách address của user
      const addrQuery = query(
        collection(db, 'address'),
        where('userId', '==', USER_ID)
      );
      const addrSnap = await getDocs(addrQuery);

      const addresses = addrSnap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          name: d.name,
          phone: d.phone,
          address: d.address,
          note: d.note,
          isDefault: docSnap.id === defaultAddressId,
        };
      });

      setList(addresses);
      setDefaultAddrId(defaultAddressId);
    } catch (error) {
      console.error('Lỗi load địa chỉ:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 🔁 Mỗi lần focus lại trang → reload
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses])
  );

  // 🟠 Chọn địa chỉ mặc định
  const handleSelectDefault = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const USER_ID = user.uid;

    try {
      await updateDoc(doc(db, 'user', USER_ID), {
        defaultAddressId: id,
      });
      setDefaultAddrId(id);
      setList((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    } catch (error) {
      console.error('Lỗi cập nhật địa chỉ mặc định:', error);
    }
  };

  // ✅ Thêm địa chỉ mới
  const handleAddAddress = () => {
    router.push({
      pathname: '/address/add',
      params: { refresh: Date.now().toString() },
    });
  };

  // 🔹 Render từng item
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.addressCard,
        item.isDefault && { borderColor: '#e67e22', borderWidth: 2 },
      ]}
      onPress={() => handleSelectDefault(item.id)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.label}>{item.name}</Text>
        {item.isDefault && (
          <Text style={{ color: '#e67e22', fontWeight: '600' }}>Mặc định</Text>
        )}
      </View>

      <Text style={styles.detail}>{item.phone}</Text>
      <Text style={styles.detail}>{item.address}</Text>
      {item.note ? (
        <Text style={[styles.detail, { fontStyle: 'italic', color: '#888' }]}>
          Ghi chú: {item.note}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#e67e22"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* nút back */}
      <TouchableOpacity
        style={{ paddingTop: 35, paddingLeft: 20, paddingBottom: 10 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddAddress}
      >
        <Text style={styles.addButtonText}>+ Thêm địa chỉ mới</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  addressCard: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  label: { fontSize: 16, fontWeight: '600' },
  detail: { fontSize: 14, color: '#666', marginTop: 4 },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#e67e22',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
