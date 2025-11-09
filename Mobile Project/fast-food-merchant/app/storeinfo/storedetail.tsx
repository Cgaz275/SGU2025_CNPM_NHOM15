import { restaurants } from '@/data/mockData';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
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
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Thông tin quán</Text>
      </View>

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
        {/* Nút đăng xuất */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
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
              style={[styles.modalButton, { backgroundColor: '#D7A359' }]}
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
      {/* Modal xác nhận */}
      <Modal
        transparent
        visible={logoutModalVisible}
        animationType="fade"
      >
        <View style={styles.logoutModalOverlay}>
          <View style={styles.logoutModalContent}>
            <Text style={styles.logoutModalTitle}>
              Bạn có chắc muốn đăng xuất?
            </Text>
            <View style={styles.logoutModalButtonsRow}>
              <TouchableOpacity
                style={[styles.logoutModalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.logoutModalButtonTextCancel}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.logoutModalButton,
                  { backgroundColor: '#D9534F' },
                ]}
                onPress={() => router.replace('../(auth)')}
              >
                <Text style={styles.logoutModalButtonTextConfirm}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
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
  changeText: { marginLeft: 4, color: '#D7A359', fontSize: 14 },
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
    backgroundColor: '#D7A359',
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 10,
    paddingHorizontal: 5,
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12, // khoảng cách giữa mũi tên và title
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

  storeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#D9534F',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  logoutModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  logoutModalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  logoutModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  logoutModalButtonTextCancel: {
    color: '#333',
    fontWeight: '600',
  },
  logoutModalButtonTextConfirm: {
    color: '#fff',
    fontWeight: '600',
  },
});
