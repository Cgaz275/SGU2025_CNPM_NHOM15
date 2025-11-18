import { clearTempAddress, getTempAddress } from '@/data/address';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import {
  addDoc,
  collection,
  GeoPoint,
  serverTimestamp,
} from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig';

export default function AddAddressScreen() {
  const router = useRouter();

  type AddressForm = {
    name: string;
    phone: string;
    address: string;
    note: string;
    latlong: GeoPoint | null;
  };

  const [form, setForm] = useState<AddressForm>({
    name: '',
    phone: '',
    address: '',
    note: '',
    latlong: null,
  });

  const [formKey, setFormKey] = useState(0);

  // ✅ Khi quay lại trang → load địa chỉ tạm (nếu có)
  useFocusEffect(
    useCallback(() => {
      const temp = getTempAddress();
      if (temp) {
        setForm((prev) => ({
          ...prev,
          address: temp.address ?? prev.address,
          latlong:
            temp.lat && temp.lng
              ? new GeoPoint(temp.lat, temp.lng)
              : prev.latlong,
        }));
        clearTempAddress();
      }
    }, [])
  );

  // ✅ Cập nhật field
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Lưu lên Firebase
  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập đầy đủ Tên, Số điện thoại và Địa chỉ!'
      );
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Lỗi', 'Bạn chưa đăng nhập!');
      router.replace('../(auth)');
      return;
    }

    try {
      await addDoc(collection(db, 'address'), {
        userId: user.uid,
        name: form.name,
        phone: form.phone,
        address: form.address,
        note: form.note || '',
        latlong: form.latlong || null,
        createdAt: serverTimestamp(),
      });

      console.log('📦 Đã thêm địa chỉ mới cho user:', user.uid);
      Alert.alert('Thành công', 'Đã lưu địa chỉ!');
      router.back();
    } catch (error) {
      console.error('Lỗi khi thêm địa chỉ:', error);
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ. Vui lòng thử lại.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity
        style={{ paddingBottom: 10, paddingTop: 10 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={styles.title}>Thêm địa chỉ mới</Text>

      {/* Họ tên */}
      <View style={styles.field}>
        <Text style={styles.label}>Tên *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên người nhận"
          value={form.name}
          onChangeText={(v) => handleChange('name', v)}
        />
      </View>

      {/* Số điện thoại */}
      <View style={styles.field}>
        <Text style={styles.label}>Số điện thoại *</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: '#e67e22',
              paddingHorizontal: 10,
              paddingVertical: 13,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontWeight: '500', color: '#fff' }}>+84</Text>
          </View>

          <TextInput
            style={{
              flex: 1,
              paddingHorizontal: 10,
              paddingVertical: 12,
              backgroundColor: '#fff',
              fontSize: 16,
            }}
            placeholder="Nhập số điện thoại"
            keyboardType="phone-pad"
            value={form.phone?.replace(/^\+84/, '')}
            maxLength={10}
            onChangeText={(v) => {
              let cleaned = v.replace(/[^0-9]/g, '');
              if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
              handleChange('phone', '+84' + cleaned);
            }}
          />
        </View>
      </View>

      {/* Địa chỉ */}
      <View style={styles.field}>
        <Text style={styles.label}>Địa chỉ *</Text>

        <TouchableOpacity
          style={[
            styles.input,
            {
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
          ]}
          onPress={() =>
            router.push({
              pathname: './location',
              params: form,
            })
          }
        >
          <Text
            key={formKey}
            style={{ color: form.address ? '#000' : '#888' }}
          >
            {form.address ? form.address : 'Chọn địa chỉ'}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={18}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Ghi chú */}
      <View style={styles.field}>
        <Text style={styles.label}>Ghi chú (không bắt buộc)</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          placeholder="VD: Gọi trước khi giao hàng..."
          value={form.note}
          onChangeText={(v) => handleChange('note', v)}
        />
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
      >
        <Text style={styles.saveText}>Lưu địa chỉ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#e67e22',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
