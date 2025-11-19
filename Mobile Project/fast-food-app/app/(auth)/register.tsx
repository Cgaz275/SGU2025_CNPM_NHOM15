import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [modal, setModal] = useState({ visible: false, message: '' });

  const showModal = (msg: string) => {
    setModal({ visible: true, message: msg });
  };

  const isValid = () => email.trim() && password && password === confirm;

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, 'user', user.uid), {
        email: user.email,
        createdAt: new Date(),
        is_enable: true,
        role: 'customer',
        name: '',
        phone: '',
        defaultAddress: '',
        defaultAddressId: '',
      });

      if (user) router.replace('../(tabs)');
    } catch (error: any) {
      console.log(error);

      let message = 'Đăng ký thất bại';
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Email này đã được đăng ký';
          break;
        case 'auth/invalid-email':
          message = 'Email không hợp lệ';
          break;
        case 'auth/weak-password':
          message = 'Mật khẩu quá yếu (ít nhất 6 ký tự)';
          break;
        case 'auth/operation-not-allowed':
          message = 'Chức năng đăng ký bằng email chưa được bật';
          break;
        default:
          message = error.message || message;
      }

      // Hiện modal hoặc alert
      showModal(message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Nhập thông tin của bạn để đăng ký</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          <Input
            label="Nhập lại mật khẩu"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="••••••••"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={signUp}
          activeOpacity={0.8}
          disabled={!isValid()}
          style={[styles.button, !isValid() && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/email')}>
          <Text style={styles.loginLink}>
            Đã có tài khoản?{' '}
            <Text style={styles.loginHighlight}>Đăng nhập</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    </KeyboardAvoidingView>
  );
}

function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#999"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#e67e22',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
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
    shadowColor: '#e67e22',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginLink: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
  },
  loginHighlight: {
    color: '#e67e22',
    fontWeight: '600',
  },
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
