import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = (type: string) => {
    console.log(`Login with ${type}`);
    router.replace('/(tabs)');
  };

  const handleGuest = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Food Fast xin chào!</Text>
        <Text style={styles.subtitle}>
          Thưởng thức những nhà hàng ngon nhất hoặc mua những gì bạn cần từ các
          cửa hàng gần đó, được giao tận nơi.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.google]}
          onPress={() => handleLogin('Google')}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={require('../../assets/icons/google.png')}
              style={styles.icon}
            />
          </View>
          <Text style={styles.buttonText}>Đăng nhập với Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.gmail]}
          onPress={() => handleLogin('Gmail')}
        >
          <View style={styles.iconWrapper}>
            <Image
              source={require('../../assets/icons/mail.png')}
              style={[styles.icon, { tintColor: '#fff' }]}
            />
          </View>
          <Text style={[styles.buttonText, { color: '#fff' }]}>
            Đăng nhập với Email
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestButton}
          onPress={handleGuest}
        >
          <Text style={styles.guestText}>Tiếp tục với tư cách khách</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  google: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  gmail: {
    backgroundColor: '#000',
  },
  iconWrapper: {
    width: 28, // cố định để chữ luôn bắt đầu từ cùng 1 chỗ
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  guestButton: {
    marginTop: 14,
  },
  guestText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#555',
    textDecorationLine: 'underline',
  },
});
