import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { restaurants } from '../../data/mockData';

export default function RestaurantScreen() {
  const router = useRouter();

  const handlePress = (restaurantId: string) => {
    // Chuyển sang màn hình chi tiết món ăn (ở đây bạn có thể mở luôn Phở Thìn hoặc truyền id)
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Nhà hàng</Text>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/restaurantsc/[id]',
                params: { id: item.id },
              })
            }
          >
            <Image
              source={item.image}
              style={styles.cardImage}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>
                {item.distance} • ⭐ {item.rating}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 20 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 20,
    marginLeft: 10,
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  name: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 14, color: '#666', marginTop: 4 },
});
