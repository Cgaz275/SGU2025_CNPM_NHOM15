import { useFocusEffect, useRouter } from 'expo-router';
import { doc, GeoPoint, updateDoc } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig';
import { clearTempAddress, getTempAddress } from '../../data/address';

export default function RegisterLocation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  // Khi trang focus lại, check tempAddress và update restaurant
  useFocusEffect(
    useCallback(() => {
      const temp = getTempAddress();
      if (temp && auth.currentUser) {
        const updateAddress = async () => {
          setLoading(true);
          try {
            const docRef = doc(db, 'restaurants', auth.currentUser!.uid);
            await updateDoc(docRef, {
              address: temp.address || null,
              latlong:
                temp.lat !== undefined && temp.lng !== undefined
                  ? new GeoPoint(temp.lat, temp.lng)
                  : null,
            });
            clearTempAddress(); // xóa temp sau khi update
            Alert.alert('Thành công', 'Địa chỉ nhà hàng đã được cập nhật!');
          } catch (err) {
            console.log('Update address error:', err);
            Alert.alert('Lỗi', 'Không thể cập nhật địa chỉ');
          } finally {
            setLoading(false);
          }
        };
        updateAddress();
      }
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Chọn địa chỉ nhà hàng</Text>

      <TouchableOpacity
        style={styles.selectBtn}
        onPress={() => router.push('./location')}
      >
        <Text style={{ color: '#fff' }}>Mở trang chọn địa chỉ</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  selectBtn: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#D7A359',
    alignItems: 'center',
    marginBottom: 12,
  },
});
