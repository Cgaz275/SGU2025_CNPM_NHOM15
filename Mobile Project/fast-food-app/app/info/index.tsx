import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../FirebaseConfig';

export default function ProfileScreen() {
  const router = useRouter();

  // Khai báo kiểu dữ liệu userData có thể có các trường
  const [userData, setUserData] = useState<{
    email?: string;
    name?: string;
    phone?: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace('../(auth)');
        return;
      }

      try {
        const docRef = doc(db, 'user', user.uid); // sửa 'user' thành 'users' nếu bạn lưu collection tên đó
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('No such document!');
          setUserData({});
        }
      } catch (error) {
        console.log('Error getting user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const user = {
    name: userData?.name ?? '', // nếu không có thì để trống
    email: userData?.email ?? 'Đang tải...',
    phone: userData?.phone ?? '',
  };

  const renderItem = (label: string, value: string, route: string) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => router.push(route)}
    >
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity
        style={{ paddingTop: 35, paddingBottom: 10 }}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text style={styles.title}>Thông tin cá nhân</Text>

      {renderItem('Họ và tên', user.name, '/info/edit-name')}
      {renderItem('Email', user.email, '')}
      {renderItem('Số điện thoại', user.phone, '/info/edit-phone')}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  label: { fontSize: 15, color: '#333', fontWeight: '500' },
  value: { fontSize: 14, color: '#777', marginTop: 4 },
  arrow: { fontSize: 22, color: '#ccc', marginLeft: 8 },
});
