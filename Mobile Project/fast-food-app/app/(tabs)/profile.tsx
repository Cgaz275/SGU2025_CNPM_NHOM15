import { auth } from '@/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../FirebaseConfig';

export default function ProfileScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState('Người dùng');
  const [pendingOrders, setPendingOrders] = useState(0);

  getAuth().onAuthStateChanged((user) => {
    if (!user) router.replace('../(auth)');
  });

  useEffect(() => {
    const auth = getAuth();
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace('../(auth)');
        return;
      }

      // Lấy tên user từ Firestore
      try {
        const userDoc = await getDoc(doc(db, 'user', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.name) setUserName(data.name);
        }
      } catch (err) {
        console.log('Lỗi lấy tên user:', err);
      }

      // Lấy số đơn hàng đang chờ
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', user.uid),
          where('status', 'in', [
            'pending',
            'confirmed',
            'shipping',
            'waitingCustomer',
          ])
        );
        const snap = await getDocs(q);
        setPendingOrders(snap.size);
      } catch (err) {
        console.log('Lỗi lấy đơn hàng:', err);
      }
    });

    return unsub;
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '700' }}>
          Chào {userName}!
        </Text>
        <Text style={{ fontSize: 16, color: '#555' }}>
          {pendingOrders} đơn hàng đang chờ
        </Text>
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Liên kết nhanh</Text>

        <TouchableOpacity style={styles.linkItem}>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color="#e67e22"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.linkText}>Hỗ trợ người dùng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('../order')}
          style={styles.linkItem}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color="#e67e22"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.linkText}>Lịch sử đơn hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('../promotion')}
          style={styles.linkItem}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color="#e67e22"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.linkText}>Voucher</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt</Text>

        <TouchableOpacity
          onPress={() => router.push('../info')}
          style={styles.linkItem}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color="#e67e22"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.linkText}>Thông tin cá nhân</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('../address')}
          style={styles.linkItem}
        >
          <Ionicons
            name="location-outline"
            size={20}
            color="#e67e22"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.linkText}>Địa chỉ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => auth.signOut()}
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60, // đẩy xuống thấp hơn
  },

  header: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  pendingOrders: { fontSize: 16, color: '#666' },

  section: { marginTop: 30, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  linkItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
  },
  linkText: { fontSize: 16 },
  logoutButton: {
    backgroundColor: '#e74c3c',
    marginTop: 40,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
