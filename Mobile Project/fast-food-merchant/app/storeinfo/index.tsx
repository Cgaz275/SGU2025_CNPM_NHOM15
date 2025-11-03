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
import { restaurants } from '../../data/mockData';

export default function StoreInfoScreen() {
  const router = useRouter();
  const restaurant = restaurants[0];
  const [prepTime, setPrepTime] = useState('15');
  const [modalVisible, setModalVisible] = useState(false);

  const handleSavePrepTime = () => {
    console.log('Thời gian chuẩn bị:', prepTime, 'phút');
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Avatar + Tên nhà hàng */}
      <View style={styles.header}>
        <Image
          source={restaurant.image}
          style={styles.avatar}
        />
        <Text style={styles.storeName}>{restaurant.name}</Text>
      </View>

      {/* Danh sách nút */}
      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push('../storeinfo/storedetail')}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#D7A359"
            />
            <Text style={styles.itemText}>Thông tin quán</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#aaa"
          />
        </TouchableOpacity>

        <View style={styles.item}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={[styles.rowLeft, { flex: 1 }]}
          >
            <Ionicons
              name="time-outline"
              size={22}
              color="#D7A359"
            />
            <Text style={styles.itemText}>Thời gian chuẩn bị đơn</Text>
          </TouchableOpacity>
          <Text style={styles.valueText}>{prepTime} phút</Text>
        </View>

        <TouchableOpacity style={styles.item}>
          <View style={styles.rowLeft}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color="#D7A359"
            />
            <Text style={styles.itemText}>Đổi mật khẩu</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#aaa"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push('../storeinfo/storestate')}
        >
          <View style={styles.rowLeft}>
            <Ionicons
              name="storefront-outline"
              size={22}
              color="#D7A359"
            />
            <Text style={styles.itemText}>Tình trạng mở bán</Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#aaa"
          />
        </TouchableOpacity>
      </View>

      {/* Modal chỉnh thời gian */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thời gian chuẩn bị đơn (phút)</Text>
            <TextInput
              style={styles.input}
              value={prepTime}
              onChangeText={setPrepTime}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: '#D7A359' }]}
              onPress={handleSavePrepTime}
            >
              <Text style={styles.modalBtnText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: '#eee' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalBtnText, { color: '#333' }]}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 150, height: 150, borderRadius: 50, marginBottom: 10 },
  storeName: { fontSize: 20, fontWeight: '600' },
  subInfo: { fontSize: 14, color: '#888', marginTop: 4 },
  menu: { borderTopWidth: 1, borderColor: '#eee' },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemText: { fontSize: 16, color: '#333', fontWeight: '500' },
  valueText: { fontSize: 15, color: '#555', fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    width: '60%',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  modalBtn: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalBtnText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});
