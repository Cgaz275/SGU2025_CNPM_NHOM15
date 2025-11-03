import { restaurants } from '@/data/mockData';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Modal,
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

  const [minOrderValue, setMinOrderValue] = useState('');
  const [firstTimeUserOnly, setFirstTimeUserOnly] = useState(false);

  const [applicableItems, setApplicableItems] = useState<string[]>([]);
  const [showDishModal, setShowDishModal] = useState(false);

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
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Thêm khuyến mãi</Text>
      </View>

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

      {/* Nút mở modal chọn món */}
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowDishModal(true)}
      >
        <Text>Món áp dụng ({applicableItems.length} đã chọn)</Text>
      </TouchableOpacity>

      {/* Modal chọn món */}
      <Modal
        visible={showDishModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDishModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn món áp dụng</Text>
            <ScrollView>
              {allDishes.map((dish) => {
                const selected = applicableItems.includes(dish.id);
                return (
                  <TouchableOpacity
                    key={dish.id}
                    style={[styles.dishItem, selected && styles.dishSelected]}
                    onPress={() => toggleDish(dish.id)}
                  >
                    {dish.image && (
                      <Image
                        source={dish.image}
                        style={styles.dishImage}
                      />
                    )}
                    <Text
                      style={{
                        marginLeft: 10,
                        color: selected ? '#fff' : '#000',
                        fontWeight: '500',
                      }}
                    >
                      {dish.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowDishModal(false)}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeSelected: { backgroundColor: '#D7A359' },
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
  addBtn: {
    backgroundColor: '#D7A359',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  subHeader: { fontSize: 16, fontWeight: '600', marginVertical: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  dishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dishSelected: { backgroundColor: '#D7A359' },
  dishImage: { width: 40, height: 40, borderRadius: 6 },
  closeBtn: {
    backgroundColor: '#D7A359',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
});
