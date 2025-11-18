import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Firebase
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../FirebaseConfig';

export default function EditPhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Lấy số điện thoại hiện tại để hiển thị trong input
    const fetchPhone = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace('../(auth)');
        return;
      }

      try {
        const docRef = doc(db, 'user', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPhone(data.phone || '');
        }
      } catch (error) {
        console.log('Error fetching phone:', error);
      }
    };

    fetchPhone();
  }, []);

  const handleSave = async () => {
    if (phone.trim() === '') {
      Alert.alert('Lỗi', 'Số điện thoại không được để trống.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Lỗi', 'Người dùng chưa đăng nhập.');
      return;
    }

    try {
      const docRef = doc(db, 'user', user.uid);
      await updateDoc(docRef, { phone: phone.trim() });

      Alert.alert('Thành công', 'Số điện thoại đã được cập nhật.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.log('Error updating phone:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật số điện thoại. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>Chỉnh sửa SĐT</Text>
      </View>

      {/* Nội dung chính */}
      <View style={styles.centerBox}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Nhập số điện thoại mới"
          keyboardType="phone-pad"
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    paddingTop: 50,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 16,
  },
  backButton: {
    paddingRight: 10,
    paddingVertical: 4,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 15,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#e67e22',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
