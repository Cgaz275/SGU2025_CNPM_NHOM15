import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addToCart } from '../../../../data/cart';
import { restaurants } from '../../../../data/mockData';

export default function ProductScreen() {
  const router = useRouter();
  const { id, dishId } = useLocalSearchParams<{ id: string; dishId: string }>();
  const restaurant = restaurants.find((r) => r.id === id);
  const dish = restaurant?.dishes.find((d) => d.id === dishId);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>(
    {}
  );

  if (!restaurant || !dish) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy món ăn 😢</Text>
      </View>
    );
  }

  const handleSelect = (groupName, choice, type) => {
    setSelectedOptions((prev) => {
      if (type === 'single') {
        return { ...prev, [groupName]: choice };
      } else if (type === 'multiple') {
        const current = prev[groupName] || [];
        const exists = current.find((c) => c.name === choice.name);
        return {
          ...prev,
          [groupName]: exists
            ? current.filter((c) => c.name !== choice.name)
            : [...current, choice],
        };
      }
      return prev;
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 44,
      }}
    >
      {/* ✅ Nút quay lại cố định trên đầu */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={dish.image}
          style={styles.image}
        />
        <Text style={styles.name}>{dish.name}</Text>
        <Text style={styles.desc}>{dish.description}</Text>
        <Text style={styles.price}>{dish.price.toLocaleString()}đ</Text>

        {/* Chọn option */}
        <Text style={styles.sectionTitle}>Tùy chọn món:</Text>
        {dish.optionGroups?.map((group, i) => (
          <View
            key={i}
            style={{ marginBottom: 16 }}
          >
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>
              {group.name}
            </Text>

            {group.type !== 'text' ? (
              group.choices.map((choice, j) => {
                const isSelected =
                  group.type === 'single'
                    ? selectedOptions[group.name]?.name === choice.name
                    : selectedOptions[group.name]?.some?.(
                        (c) => c.name === choice.name
                      );

                return (
                  <TouchableOpacity
                    key={j}
                    style={[
                      styles.optionButton,
                      isSelected && {
                        borderColor: '#e67e22',
                        backgroundColor: '#fff5ec',
                      },
                    ]}
                    onPress={() => handleSelect(group.name, choice, group.type)}
                  >
                    <Text>
                      {choice.name}
                      {choice.price > 0 &&
                        ` (+${choice.price.toLocaleString()}đ)`}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <TextInput
                style={styles.textInput}
                placeholder={group.placeholder || 'Nhập ghi chú tại đây...'}
                value={selectedOptions[group.name] || ''}
                onChangeText={(text) =>
                  setSelectedOptions((prev) => ({
                    ...prev,
                    [group.name]: text,
                  }))
                }
              />
            )}
          </View>
        ))}

        {/* Nút thêm vào giỏ */}
        <TouchableOpacity
          style={styles.addToCart}
          onPress={() => {
            addToCart({
              id: dish.id,
              name: dish.name,
              price: dish.price,
              quantity: 1,
              image: dish.image,
              restaurantId: restaurant.id,
              options: selectedOptions,
            });
            router.back();
          }}
        >
          <Text style={styles.addText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  backButton: {
    position: 'absolute',
    top: 50, // chỉnh nếu ông có SafeArea
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
    marginTop: 10,

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { width: '100%', height: 200, borderRadius: 12, marginBottom: 16 },
  name: { fontSize: 22, fontWeight: '700' },
  desc: { color: '#666', marginVertical: 8 },
  price: {
    fontWeight: '700',
    fontSize: 18,
    color: '#e67e22',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    color: '#333',
  },
  addToCart: {
    marginTop: 24,
    backgroundColor: '#e67e22',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  addText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
