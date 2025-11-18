import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../FirebaseConfig';

export default function Email() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modal, setModal] = useState({ visible: false, message: '' });

  const showModal = (msg: string) => {
    setModal({ visible: true, message: msg });
  };

  const signIn = async () => {
    setModal({ visible: false, message: '' }); // clear modal trước khi login
    if (!email.trim() || !password.trim()) return;

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      const ref = doc(db, 'user', uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return showModal('Tài khoản không tồn tại.');
      }

      const data = snap.data();

      if (data.is_enable !== true) {
        return showModal('Tài khoản đã bị khóa.');
      }

      if (data.role !== 'user' && data.role !== 'merchant') {
        return showModal('Bạn không có quyền truy cập.');
      }

      router.replace('../(tabs)');
    } catch (error: any) {
      console.log(error);
      showModal('Sai tên đăng nhập hoặc mật khẩu');
    }
  };

  const signUp = async () => {
    setModal({ visible: false, message: '' }); // clear modal
    if (!email.trim() || !password.trim()) return;

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      router.replace('./(tabs)');
    } catch (error: any) {
      console.log(error);
      showModal('Đăng ký thất bại: ' + error.message);
    }
  };

  const isValid = () => email.trim() && password.trim();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={{ paddingTop: 10, position: 'absolute', top: 40, left: 16 }}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={28}
            color="#e67e22"
          />
        </TouchableOpacity>
        <Text style={styles.title}>Chào mừng trở lại 👋</Text>
        <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Mật khẩu"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={signIn}
          disabled={!isValid()}
          style={[styles.button, !isValid() && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.registerLink}>
            Chưa có tài khoản?{' '}
            <Text style={styles.registerHighlight}>Đăng ký</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ----- MODAL ------ */}
      <Modal
        transparent
        animationType="fade"
        visible={modal.visible}
        onRequestClose={() => setModal({ ...modal, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>{modal.message}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModal({ ...modal, visible: false })}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* ------------------ */}
    </KeyboardAvoidingView>
  );
}

function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e67e22',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 15,
    marginBottom: 32,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  button: {
    backgroundColor: '#e67e22',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerLink: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
  registerHighlight: {
    color: '#e67e22',
    fontWeight: '600',
  },

  /* --- MODAL STYLES --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 24,
    width: '100%',
  },
  modalText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#e67e22',
    borderRadius: 12,
    paddingVertical: 12,
  },
  modalButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
