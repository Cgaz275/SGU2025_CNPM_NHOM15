import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig';

export default function StoreDetail() {
  const router = useRouter();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [storeInfo, setStoreInfo] = useState<any>({
    name: '',
    address: '',
    phone: '',
    image: '',
  });
  const [restaurantDocId, setRestaurantDocId] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [bannerModalVisible, setBannerModalVisible] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [editField, setEditField] = useState<keyof typeof storeInfo | null>(
    null
  );
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    loadRestaurant();
  }, []);

  const loadRestaurant = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // 1️⃣ Lấy thông tin user từ bảng users
      const userDocRef = doc(db, 'user', user.uid);
      const userDoc = await getDoc(userDocRef);
      const phone = userDoc.exists() ? userDoc.data().phone || '' : '';

      // 2️⃣ Lấy thông tin quán
      const restaurantQuery = query(
        collection(db, 'restaurants'),
        where('userId', '==', user.uid)
      );
      const restaurantSnap = await getDocs(restaurantQuery);
      if (!restaurantSnap.empty) {
        const docData = restaurantSnap.docs[0].data();
        setRestaurantDocId(restaurantSnap.docs[0].id);
        setStoreInfo({
          name: docData.name || '',
          address: docData.address || '',
          phone: phone,
          image: docData.imageUrl || '',
          bannerURL: docData.bannerURL || '',
          categories: docData.categories || '',
          is_enable: docData.is_enable || true,
          latlong: docData.latlong || null,
          rating: docData.rating || 0,
          status: docData.status || '',
          userId: docData.userId || '',
        });
      }
    } catch (err) {
      console.log('Lỗi load info quán:', err);
    }
  };

  const openEditModal = (field: keyof typeof storeInfo) => {
    setEditField(field);
    setTempValue(storeInfo[field] as string);
  };

  const saveChange = async () => {
    if (!editField) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      if (editField === 'phone') {
        // Update bảng users
        const userDocRef = doc(db, 'user', user.uid);
        await updateDoc(userDocRef, { phone: tempValue });
      } else {
        // Update bảng restaurants
        if (restaurantDocId) {
          const restaurantDocRef = doc(db, 'restaurants', restaurantDocId);
          await updateDoc(restaurantDocRef, { [editField]: tempValue });
        }
      }

      setStoreInfo({ ...storeInfo, [editField]: tempValue });
      setEditField(null);
    } catch (err) {
      console.log('Lỗi cập nhật Firestore:', err);
    }
  };

  const apiKey = '95bec918c13c0eee27f992de0543be72';

  const pickAndUploadImage = async (type: 'image' | 'banner') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.4,
        base64: true,
        allowsEditing: true,
        aspect: [1, 1], // ép tỷ lệ 1:1
      });

      if (!result.canceled) {
        const base64 = result.assets[0].base64!;
        setUploading(
          type === 'image' ? setUploading(true) : setUploadingBanner(true)
        );

        // Upload base64 to Imgbb
        const formData = new FormData();
        formData.append('image', base64);

        const res = await fetch(
          `https://api.imgbb.com/1/upload?key=${apiKey}`,
          {
            method: 'POST',
            body: formData,
          }
        );

        const json = await res.json();
        if (json.success) {
          const url = json.data.url;

          if (restaurantDocId) {
            const restaurantDocRef = doc(db, 'restaurants', restaurantDocId);
            if (type === 'image') {
              setStoreInfo((prev) => ({ ...prev, image: url }));
              await updateDoc(restaurantDocRef, { imageUrl: url });
            } else {
              setStoreInfo((prev) => ({ ...prev, bannerURL: url }));
              await updateDoc(restaurantDocRef, { bannerURL: url });
            }
          }

          alert(
            `Cập nhật ảnh ${
              type === 'image' ? 'đại diện' : 'banner'
            } thành công!`
          );
          if (type === 'image') setImageModalVisible(false);
          else setBannerModalVisible(false);
        } else {
          alert('Upload ảnh thất bại');
        }
      }
    } catch (error) {
      console.log('Lỗi upload ảnh:', error);
      alert('Có lỗi xảy ra khi upload ảnh');
    } finally {
      if (type === 'image') setUploading(false);
      else setUploadingBanner(false);
    }
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
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Ảnh banner</Text>
        <TouchableOpacity
          onPress={() => setBannerModalVisible(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          {storeInfo.bannerURL ? (
            <Image
              source={{ uri: storeInfo.bannerURL }}
              style={{ width: 100, height: 60, borderRadius: 8 }}
            />
          ) : (
            <View
              style={{
                width: 100,
                height: 60,
                backgroundColor: '#ddd',
                borderRadius: 8,
              }}
            />
          )}
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#888"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Ảnh đại diện</Text>

        <TouchableOpacity
          onPress={() => setImageModalVisible(true)} // mở modal
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          {storeInfo.image ? (
            <Image
              source={{ uri: storeInfo.image }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#ddd' }]} />
          )}
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#888"
          />
        </TouchableOpacity>
      </View>

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

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)}
        >
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

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
                onPress={async () => {
                  try {
                    await signOut(auth); // Thực hiện logout Firebase
                    router.replace('../(auth)'); // Quay về trang auth
                  } catch (e) {
                    console.log('Lỗi logout:', e);
                  }
                }}
              >
                <Text style={styles.logoutModalButtonTextConfirm}>Đồng ý</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Chọn ảnh đại diện mới
            </Text>

            {/* Bỏ phần preview ảnh, chỉ hiện nút tải lên */}

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#D7A359' }]}
              onPress={() => pickAndUploadImage('image')}
              disabled={uploading}
            >
              <Text style={styles.modalButtonText}>
                {uploading ? 'Đang tải lên...' : 'Chọn ảnh và tải lên'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#ccc' }]}
              onPress={() => {
                setImageModalVisible(false);
                setImagePreview(null);
              }}
              disabled={uploading}
            >
              <Text style={[styles.modalButtonText, { color: '#333' }]}>
                Hủy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={bannerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBannerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Chọn ảnh banner mới
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#D7A359' }]}
              onPress={() => pickAndUploadImage('banner')}
              disabled={uploadingBanner}
            >
              <Text style={styles.modalButtonText}>
                {uploadingBanner ? 'Đang tải lên...' : 'Chọn ảnh và tải lên'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#ccc' }]}
              onPress={() => setBannerModalVisible(false)}
              disabled={uploadingBanner}
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

function InfoRow({ label, value, onPress }: any) {
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
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  infoBox: { marginTop: 10 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  pageTitle: { fontSize: 20, fontWeight: '600', marginLeft: 12 },
  label: { fontSize: 15, color: '#555', fontWeight: '500' },
  value: { fontSize: 15, color: '#000' },
  infoRowClean: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
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
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#D9534F',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
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
  logoutModalTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
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
  logoutModalButtonTextCancel: { color: '#333', fontWeight: '600' },
  logoutModalButtonTextConfirm: { color: '#fff', fontWeight: '600' },
});
