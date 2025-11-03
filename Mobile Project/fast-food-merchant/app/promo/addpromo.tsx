import { restaurants } from '@/data/mockData';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface PromoCondition {
  minOrderValue?: number;
  firstTimeUserOnly?: boolean;
  applicableItems?: string[];
}

interface PromoCode {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  description?: string;
  condition?: PromoCondition;
}

export default function AddPromo() {
  const router = useRouter();

  const [code, setCode] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [usageLimit, setUsageLimit] = useState('');
  const [description, setDescription] = useState('');

  // Điều kiện
  const [minOrderValue, setMinOrderValue] = useState('');
  const [firstTimeUserOnly, setFirstTimeUserOnly] = useState(false);

  const [applicableItems, setApplicableItems] = useState<string[]>([]);
  const [showDishList, setShowDishList] = useState(false);

  const allDishes = restaurants.flatMap((r) => r.dishes);

  const toggleDish = (id: string) => {
    if (applicableItems.includes(id)) {
      setApplicableItems(applicableItems.filter((i) => i !== id));
    } else {
      setApplicableItems([...applicableItems, id]);
    }
  };

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const savePromo = () => {
    const newPromo: PromoCode = {
      id: Date.now().toString(),
      code,
      type,
      value: Number(value),
      startDate,
      endDate,
      usageLimit: usageLimit ? Number(usageLimit) : undefined,
      description,
      condition: {
        minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
        firstTimeUserOnly,
        applicableItems:
          applicableItems.length > 0 ? applicableItems : undefined,
      },
    };

    console.log('Promo added:', newPromo);
    router.back();
  };

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Thêm khuyến mãi</Text>

      <TextInput
        style={styles.input}
        placeholder="Mã giảm giá"
        value={code}
        onChangeText={setCode}
      />

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'percent' && styles.typeSelected]}
          onPress={() => setType('percent')}
        >
          <Text
            style={
              type === 'percent' ? styles.typeSelectedText : styles.typeText
            }
          >
            %
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'fixed' && styles.typeSelected]}
          onPress={() => setType('fixed')}
        >
          <Text
            style={type === 'fixed' ? styles.typeSelectedText : styles.typeText}
          >
            ₫
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Giá trị giảm"
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
      />

      <TouchableOpacity
        onPress={() => setShowStartPicker(true)}
        style={styles.dateBtn}
      >
        <Text>Ngày bắt đầu: {formatDate(startDate)}</Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, d) => {
            if (d) setStartDate(d);
            setShowStartPicker(false);
          }}
        />
      )}

      <TouchableOpacity
        onPress={() => setShowEndPicker(true)}
        style={styles.dateBtn}
      >
        <Text>Ngày kết thúc: {formatDate(endDate)}</Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, d) => {
            if (d) setEndDate(d);
            setShowEndPicker(false);
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Giới hạn sử dụng"
        value={usageLimit}
        onChangeText={setUsageLimit}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Mô tả"
        value={description}
        onChangeText={setDescription}
      />

      {/* Điều kiện sử dụng */}
      <Text style={styles.subHeader}>Điều kiện sử dụng</Text>
      <TextInput
        style={styles.input}
        placeholder="Giá trị đơn tối thiểu"
        value={minOrderValue}
        onChangeText={setMinOrderValue}
        keyboardType="numeric"
      />

      <View style={styles.switchRow}>
        <Text>Chỉ áp dụng khách hàng lần đầu</Text>
        <Switch
          value={firstTimeUserOnly}
          onValueChange={setFirstTimeUserOnly}
        />
      </View>

      {/* Món áp dụng */}
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowDishList(!showDishList)}
      >
        <Text>Món áp dụng ({applicableItems.length} đã chọn)</Text>
      </TouchableOpacity>

      {showDishList &&
        allDishes.map((dish) => {
          const selected = applicableItems.includes(dish.id);
          return (
            <TouchableOpacity
              key={dish.id}
              style={[styles.dishItem, selected && styles.dishSelected]}
              onPress={() => toggleDish(dish.id)}
            >
              <Text style={{ color: selected ? '#fff' : '#000' }}>
                {dish.name}
              </Text>
            </TouchableOpacity>
          );
        })}

      <TouchableOpacity
        style={styles.addBtn}
        onPress={savePromo}
      >
        <Text style={styles.addBtnText}>Thêm khuyến mãi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  subHeader: { fontSize: 16, fontWeight: '600', marginVertical: 8 },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeSelected: { backgroundColor: '#007AFF' },
  typeText: { color: '#000', fontWeight: '600' },
  typeSelectedText: { color: '#fff', fontWeight: '600' },
  dateBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dishItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dishSelected: { backgroundColor: '#007AFF' },
  addBtn: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
