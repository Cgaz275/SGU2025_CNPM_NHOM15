import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = (type: string) => {
    router.replace('/(tabs)');
  };

  const handleGuest = () => {
    router.replace('/(tabs)');
  };

  // tạo player
  const player = useVideoPlayer(
    require('../../assets/videos/background.mp4'),
    (p) => {
      p.play();
      p.loop = true;
      p.muted = true;
    }
  );

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Food Fast xin chào!</Text>
          <Text style={styles.subtitle}>
            Khám phá món ngon yêu thích hoặc sắm mọi thứ bạn cần từ cửa hàng gần
            nhà, giao tận tay bạn nhanh chóng.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* nút Google */}
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

          {/* nút Email */}
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

          {/* nút khách */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuest}
          >
            <Text style={styles.guestText}>Tiếp tục với tư cách khách</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    flex: 1,
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
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#eee',
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
    width: 28,
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
    color: '#fff',
    textDecorationLine: 'underline',
  },
});
