import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../../../FirebaseConfig';
import { addToCart } from '../../../../data/cart';

type OptionChoice = { name: string; price: number };
type OptionGroup = {
  name: string;
  type: 'single' | 'multiple' | 'text';
  choices?: OptionChoice[];
  placeholder?: string;
};

type Dish = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  optionGroups?: OptionGroup[];
  restaurantId: string;
};

type Restaurant = {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
  rating: number;
};

export default function ProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const dishId = Array.isArray(params.dishId)
    ? params.dishId[0]
    : params.dishId;
  const restaurantId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [dish, setDish] = useState<Dish | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true); // Thêm loading state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>(
    {}
  );

  useEffect(() => {
    if (!dishId) return;

    const fetchDish = async () => {
      setLoading(true); // Bắt đầu load
      try {
        // 1. Lấy dish
        const dishRef = doc(db, 'dishes', String(dishId));
        const dishDoc = await getDoc(dishRef);

        if (!dishDoc.exists()) {
          console.log('Dish not found');
          setLoading(false);
          return;
        }
        const d = dishDoc.data() as any;

        // 2. Lấy restaurant
        if (d.restaurantId) {
          const restDoc = await getDoc(doc(db, 'restaurants', d.restaurantId));
          if (restDoc.exists()) {
            setRestaurant({ id: restDoc.id, ...restDoc.data() } as Restaurant);
          }
        }

        // 3. ✅ LẤY OPTION GROUP (SỬA Ở ĐÂY)
        let optionGroups: OptionGroup[] = [];

        // d.optionGroup là một mảng ID (string[])
        const optionGroupIds: string[] = d.optionGroup || [];

        if (optionGroupIds.length > 0) {
          const fetchPromises = optionGroupIds
            .filter((id) => typeof id === 'string' && id.length > 0) // Lọc ID rỗng/không hợp lệ
            .map((id) => getDoc(doc(db, 'optionGroup', id)));

          const ogDocs = await Promise.all(fetchPromises);

          optionGroups = ogDocs
            .filter((doc) => doc.exists)
            .map((doc) => {
              const ogData = doc.data() as any;
              return {
                name: ogData.name,
                type: ogData.type,
                choices: ogData.choices,
                placeholder: ogData.placeholder,
              } as OptionGroup;
            });
        }

        setDish({
          id: dishDoc.id,
          name: d.name,
          description: d.description,
          imageUrl: d.imageUrl,
          price: Number(d.price),
          restaurantId: d.restaurantId,
          optionGroups,
        });
      } catch (err) {
        console.error('Error fetching dish:', err);
      } finally {
        setLoading(false); // Kết thúc load
      }
    };

    fetchDish();
  }, [dishId]);

  const handleSelect = (
    groupName: string,
    choice: OptionChoice,
    type: 'single' | 'multiple'
  ) => {
    setSelectedOptions((prev) => {
      if (type === 'single') return { ...prev, [groupName]: choice };
      if (type === 'multiple') {
        const current = prev[groupName] || [];
        const exists = current.find((c: any) => c.name === choice.name);
        return {
          ...prev,
          [groupName]: exists
            ? current.filter((c: any) => c.name !== choice.name)
            : [...current, choice],
        };
      }
      return prev;
    });
  };

  if (!dish || !restaurant) {
    return (
      <View style={styles.center}>
        <Text>Đang tải món ăn...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 44 }}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Image
          source={require('../../../../assets/icons/arrow.png')}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: dish.imageUrl }}
          style={styles.image}
        />
        <Text style={styles.name}>{dish.name}</Text>
        <Text style={styles.desc}>{dish.description}</Text>
        <Text style={styles.price}>{dish.price.toLocaleString()}đ</Text>

        {dish.optionGroups?.map((group, i) => (
          <View
            key={i}
            style={{ marginBottom: 16 }}
          >
            <Text style={{ fontWeight: '600', marginBottom: 8 }}>
              {group.name}
            </Text>

            {group.type !== 'text' && group.choices
              ? group.choices.map((choice, j) => {
                  const isSelected =
                    group.type === 'single'
                      ? selectedOptions[group.name]?.name === choice.name
                      : selectedOptions[group.name]?.some?.(
                          (c: any) => c.name === choice.name
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
                      onPress={() =>
                        handleSelect(group.name, choice, group.type)
                      }
                    >
                      <Text>
                        {choice.name}{' '}
                        {choice.price > 0 &&
                          `(+${choice.price.toLocaleString()}đ)`}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              : group.type === 'text' && (
                  <TextInput
                    style={styles.textInput}
                    placeholder={group.placeholder || 'Nhập ghi chú...'}
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

        <TouchableOpacity
          style={styles.addToCart}
          onPress={() => {
            addToCart({
              id: dish.id,
              name: dish.name,
              price: dish.price,
              quantity: 1,
              image: dish.imageUrl,
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
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
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
