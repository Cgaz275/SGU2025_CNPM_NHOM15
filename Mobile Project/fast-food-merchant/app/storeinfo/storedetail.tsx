import { restaurants } from '@/data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StoreDetail() {
  const restaurant = restaurants[0]; // tạm lấy 1 quán
  const [storeInfo, setStoreInfo] = useState({
    name: restaurant.name,
    address: '123 Lê Lợi, Quận 1, TP.HCM',
    phone: '0909 123 456',
    image: restaurant.image,
  });

  const [editField, setEditField] = useState<keyof typeof storeInfo | null>(
    null
  );
  const [tempValue, setTempValue] = useState('');

  const openEditModal = (field: keyof typeof storeInfo) => {
    setEditField(field);
    setTempValue(storeInfo[field]);
  };

  const saveChange = () => {
    if (editField) {
      setStoreInfo({ ...storeInfo, [editField]: tempValue });
    }
    setEditField(null);
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Ảnh đại diện</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image
            source={storeInfo.image}
            style={styles.avatar}
          />
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#888"
          />
        </View>
      </View>

      {/* Info rows */}
      <View style={styles.infoBox}>
        <InfoRow
          label="Tên nhà hàng"
          value={storeInfo.name}
          onPress={() => openEditModal('name')}
        />
        <InfoRow
          label="Địa chỉ"
          value={storeInfo.address}
          onPress={() => openEditModal('address')}
        />
        <InfoRow
          label="Số điện thoại"
          value={storeInfo.phone}
          onPress={() => openEditModal('phone')}
        />
      </View>

      {/* Modal edit */}
      <Modal
        visible={!!editField}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Chỉnh sửa{' '}
              {editField === 'name'
                ? 'tên nhà hàng'
                : editField === 'address'
                ? 'địa chỉ'
                : 'số điện thoại'}
            </Text>
            <TextInput
              style={styles.input}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder="Nhập thông tin..."
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#007AFF' }]}
              onPress={saveChange}
            >
              <Text style={styles.modalButtonText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#ddd' }]}
              onPress={() => setEditField(null)}
            >
              <Text style={[styles.modalButtonText, { color: '#333' }]}>
                Hủy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.infoRowClean}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.value}>{value}</Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#888"
          style={{ marginLeft: 8 }}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff', padding: 16 },
  changeButton: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  changeText: { marginLeft: 4, color: '#007AFF', fontSize: 14 },
  infoBox: { marginTop: 10 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 16,
  },
  avatarBox: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  changeImageBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  changeImageText: {
    color: '#fff',
    fontWeight: '500',
  },

  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 14,
  },

  rowRight: { flexDirection: 'row', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
  },
  modalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: { color: '#fff', fontWeight: '600' },
  infoRowClean: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  label: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
    color: '#000',
  },
});
