import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig';

export default function StoreInfoScreen() {
  const router = useRouter();

  const [storeInfo, setStoreInfo] = useState<{
    name: string;
    address?: string;
    phone?: string;
    image: string;
    bannerURL: string;
    categories?: any;
    is_enable?: boolean;
    latlong?: any;
    rating?: number;
    status?: string;
    userId?: string;
  } | null>(null);

  const [restaurantDocId, setRestaurantDocId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [prepTime, setPrepTime] = useState('15');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadRestaurant = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        // Lấy số điện thoại từ bảng user
        const userDocRef = doc(db, 'user', user.uid);
        const userDoc = await getDoc(userDocRef);
        const phone = userDoc.exists() ? userDoc.data().phone || '' : '';

        // Lấy thông tin quán theo userId
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
            is_enable: docData.is_enable ?? true,
            latlong: docData.latlong || null,
            rating: docData.rating || 0,
            status: docData.status || '',
            userId: docData.userId || '',
          });
        } else {
          setStoreInfo(null);
        }
      } catch (err) {
        console.log('Lỗi load info quán:', err);
        setStoreInfo(null);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, []);

  const handleSavePrepTime = () => {
    console.log('Thời gian chuẩn bị:', prepTime, 'phút');
    setModalVisible(false);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator
          size="large"
          color="#D7A359"
        />
      </View>
    );
  }

  if (!storeInfo) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text>Không tìm thấy dữ liệu nhà hàng.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{ marginTop: 10, marginLeft: 20, paddingBottom: 10 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Banner full width */}
      <View style={styles.bannerWrapper}>
        {storeInfo.bannerURL ? (
          <Image
            source={{ uri: storeInfo.bannerURL }}
            style={styles.banner}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.banner, { backgroundColor: '#ddd' }]} />
        )}

        {/* Avatar overlay (đè vào banner) */}
        <View style={styles.avatarContainer}>
          {storeInfo.image ? (
            <Image
              source={{ uri: storeInfo.image }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#ccc' }]} />
          )}
        </View>
      </View>

      {/* Tên quán */}
      <Text style={styles.storeName}>{storeInfo.name}</Text>

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
  bannerContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    marginBottom: 20,
  },

  bannerBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 10,
  },

  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '10%',
    paddingHorizontal: 20,
    position: 'relative', // để nội dung trên ảnh banner
    backgroundColor: 'rgba(0,0,0,0.3)', // Optional: overlay màu mờ để text nổi bật
    borderRadius: 10,
  },

  storeAddress: {
    fontSize: 14,
    color: '#eee',
    marginTop: 4,
  },
  cardWrapper: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },

  bannerSmall: {
    width: '100%',
    height: 110,
  },

  avatarWrapper: {
    position: 'absolute',
    left: 15,
    top: 65,
  },

  avatarSmall: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },

  cardInfo: {
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  storeNameSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  storeAddressSmall: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  topWrapper: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 25,
    marginTop: 10,
    alignItems: 'center',
  },

  bannerWrapper: {
    width: '100%',
    height: 150,
    position: 'relative',
    marginBottom: 50, // chừa chỗ cho avatar đè xuống
  },

  banner: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  avatarContainer: {
    position: 'absolute',
    bottom: -40, // avatar đè ra ngoài banner
    left: '50%',
    transform: [{ translateX: -60 }],
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
  },

  storeName: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
  },
});
