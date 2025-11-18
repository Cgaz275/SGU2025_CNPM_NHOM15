import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  GeoPoint,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig';
import { getTempAddress } from '../../data/address';

export default function RegisterRestaurant() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>(''); // để rỗng
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Lấy categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, 'categories'));
        const list: any[] = [];
        snap.forEach((docu) => list.push({ id: docu.id, ...docu.data() }));
        setCategories(list);
      } catch (err) {
        console.log('Fetch categories error:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleRegister = async () => {
    if (!name || !phone || !email || !password || !rePassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (password !== rePassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'user', uid), {
        name,
        email,
        phone,
        role: 'merchant',
        is_enable: true,
        createdAt: serverTimestamp(),
      });

      const temp = getTempAddress();

      await setDoc(doc(db, 'restaurants', uid), {
        userId: uid,
        name,
        address: temp?.address || null,
        bannerURL: null,
        categories: categoryId || null,
        imageUrl: null,
        is_enable: true,
        lastRatedAt: null,
        latlong:
          temp?.lat && temp?.lng ? new GeoPoint(temp.lat, temp.lng) : null,
        rating: 0,
        ratingCount: 0,
        status: 'pending',
      });
      Alert.alert(
        'Thành công',
        'Tạo tài khoản nhà hàng thành công!',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push('./registerLocation');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (err: any) {
      console.log(err);
      Alert.alert('Lỗi', err.message || 'Đã xảy ra lỗi khi tạo tài khoản');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Đăng ký nhà hàng</Text>

      <TextInput
        placeholder="Tên nhà hàng"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Số điện thoại"
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mật khẩu"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        placeholder="Nhập lại mật khẩu"
        style={styles.input}
        value={rePassword}
        onChangeText={setRePassword}
        secureTextEntry
      />

      <Text style={styles.label}>Danh mục</Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          backgroundColor: '#f8f8f8',
          marginBottom: 12,
        }}
      >
        <Picker
          selectedValue={categoryId}
          onValueChange={(value) => setCategoryId(value)}
        >
          <Picker.Item
            label="Chọn danh mục"
            value=""
          />
          {categories.map((c) => (
            <Picker.Item
              key={c.id}
              label={c.name}
              value={c.id}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#a8a8a8ff',
  },
  button: {
    backgroundColor: '#D7A359',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '500', marginTop: 12, marginBottom: 4 },
});
