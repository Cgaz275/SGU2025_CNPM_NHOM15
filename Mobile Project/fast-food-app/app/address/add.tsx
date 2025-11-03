import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addAddress } from '../../data/address';

export default function AddAddressScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    building: '',
    gate: '',
    tag: 'Nhà riêng',
    note: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name || !form.phone || !form.address) {
      alert('Vui lòng nhập đầy đủ Tên, Số điện thoại và Địa chỉ!');
      return;
    }

    const newAddress = {
      id: Date.now().toString(),
      name: form.name,
      phone: form.phone,
      address: form.address,
      building: form.building,
      gate: form.gate,
      tag: form.tag,
      note: form.note,
      isDefault: false, // mặc định không phải là default
    };

    addAddress(newAddress);
    console.log('📦 Đã thêm địa chỉ:', newAddress);

    router.back();
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

      <View style={styles.field}>
        <Text style={styles.label}>Tên *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên người nhận"
          value={form.name}
          onChangeText={(v) => handleChange('name', v)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Số điện thoại *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => handleChange('phone', v)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Địa chỉ *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập địa chỉ cụ thể"
          value={form.address}
          onChangeText={(v) => handleChange('address', v)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Tòa nhà / Số tầng (không bắt buộc)</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: Tòa A, tầng 5"
          value={form.building}
          onChangeText={(v) => handleChange('building', v)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Cổng (không bắt buộc)</Text>
        <TextInput
          style={styles.input}
          placeholder="VD: Cổng sau, gần bãi xe..."
          value={form.gate}
          onChangeText={(v) => handleChange('gate', v)}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Loại địa chỉ</Text>
        <View style={styles.tagContainer}>
          {['Nhà riêng', 'Văn phòng', 'Khác'].map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagButton, form.tag === tag && styles.tagSelected]}
              onPress={() => handleChange('tag', tag)}
            >
              <Text
                style={{
                  color: form.tag === tag ? '#fff' : '#000',
                  fontWeight: form.tag === tag ? '700' : '400',
                }}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
  backText: { color: '#e67e22', marginBottom: 10, fontWeight: '500' },
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
  tagContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  tagButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
  },
  tagSelected: {
    backgroundColor: '#e67e22',
    borderColor: '#e67e22',
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
