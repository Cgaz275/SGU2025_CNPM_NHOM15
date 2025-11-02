import {
  getAddresses,
  getDefaultAddress,
  setDefaultAddress,
} from '@/data/address';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddressScreen() {
  const router = useRouter();
  const [list, setList] = useState(getAddresses());
  const [defaultAddr, setDefaultAddrState] = useState(getDefaultAddress());

  // ✅ Hàm reload lại danh sách (dùng lại nhiều chỗ)
  const reloadList = useCallback(() => {
    const newList = getAddresses();
    const newDefault = getDefaultAddress();
    setList(newList);
    setDefaultAddrState(newDefault);
  }, []);

  // 🔁 Reload mỗi khi quay lại trang
  useFocusEffect(
    useCallback(() => {
      reloadList();
    }, [reloadList])
  );

  // 🟠 Khi nhấn chọn 1 địa chỉ
  const handleSelectDefault = (id: string) => {
    setDefaultAddress(id);
    reloadList();
    Alert.alert(
      '✅ Đã chọn làm mặc định',
      'Địa chỉ này sẽ được sử dụng tự động khi đặt hàng.'
    );
  };

  // ✅ Khi bấm thêm địa chỉ mới → đi đến /add và sau khi back thì tự reload
  const handleAddAddress = () => {
    router.push({
      pathname: '/address/add',
      params: { refresh: Date.now().toString() }, // ép tạo param mới mỗi lần → router refresh
    });
  };

  const renderItem = ({ item }: { item: (typeof list)[0] }) => (
    <TouchableOpacity
      style={[
        styles.addressCard,
        item.isDefault && { borderColor: '#e67e22', borderWidth: 2 },
      ]}
      onPress={() => handleSelectDefault(item.id)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.label}>{item.tag}</Text>
        {item.isDefault && (
          <Text style={{ color: '#e67e22', fontWeight: '600' }}>Mặc định</Text>
        )}
      </View>

      <Text style={styles.detail}>
        {item.name} - {item.phone}
      </Text>
      <Text style={styles.detail}>{item.address}</Text>

      {item.building ? (
        <Text style={styles.detail}>Tòa nhà: {item.building}</Text>
      ) : null}
      {item.gate ? <Text style={styles.detail}>Cổng: {item.gate}</Text> : null}
      {item.note ? (
        <Text style={[styles.detail, { fontStyle: 'italic', color: '#888' }]}>
          Ghi chú: {item.note}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Nút quay lại */}
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
