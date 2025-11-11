import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const isValid = () =>
    name.trim() &&
    phone.trim() &&
    email.trim() &&
    password &&
    password === confirm;

  const handleRegister = () => {
    if (!isValid()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin hợp lệ.');
      return;
    }
    router.push('/email');
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
            label="Tên"
            value={name}
            onChangeText={setName}
            placeholder="Nguyễn Văn A"
          />
          <Input
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            placeholder="0912345678"
            keyboardType="phone-pad"
          />
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
          onPress={handleRegister}
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
});
