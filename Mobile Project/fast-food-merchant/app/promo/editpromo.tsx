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

export default function EditPromo() {
  const router = useRouter();

  // Dummy promo data, giả lập load từ server
  const [promo, setPromo] = useState<PromoCode>({
    id: '1',
    code: 'FIRST50',
    type: 'percent',
    value: 50,
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    usageLimit: 100,
    description: 'Giảm 50% cho khách hàng lần đầu',
    condition: {
      minOrderValue: 50000,
      firstTimeUserOnly: true,
      applicableItems: ['d1', 'd3'],
    },
  });

  // Modal edit state
  const [editField, setEditField] = useState<
    | keyof PromoCode
    | 'minOrderValue'
    | 'firstTimeUserOnly'
    | 'applicableItems'
    | null
  >(null);
  const [tempValue, setTempValue] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateField, setDateField] = useState<'startDate' | 'endDate' | null>(
    null
  );

  const allDishes = restaurants.flatMap((r) => r.dishes);

  const openEdit = (field: typeof editField) => {
    setEditField(field);
    if (field === 'minOrderValue')
      setTempValue(promo.condition?.minOrderValue?.toString() || '');
    else if (field === 'firstTimeUserOnly')
      setTempValue(promo.condition?.firstTimeUserOnly || false);
    else if (field === 'applicableItems')
      setTempValue(promo.condition?.applicableItems || []);
    else if (field) setTempValue(promo[field]);
  };

  const saveEdit = () => {
    if (editField) {
      if (editField === 'minOrderValue') {
        setPromo({
          ...promo,
          condition: { ...promo.condition, minOrderValue: Number(tempValue) },
        });
      } else if (editField === 'firstTimeUserOnly') {
        setPromo({
          ...promo,
          condition: { ...promo.condition, firstTimeUserOnly: tempValue },
        });
      } else if (editField === 'applicableItems') {
        setPromo({
          ...promo,
          condition: { ...promo.condition, applicableItems: tempValue },
        });
      } else {
        setPromo({ ...promo, [editField]: tempValue });
      }
      setEditField(null);
    }
  };

  const toggleDish = (id: string) => {
    if (!Array.isArray(tempValue)) return;
    if (tempValue.includes(id))
      setTempValue(tempValue.filter((i: string) => i !== id));
    else setTempValue([...tempValue, id]);
  };

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Chi tiết khuyến mãi</Text>

      {/* Mã giảm giá */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => openEdit('code')}
      >
        <Text style={styles.label}>Mã giảm giá</Text>
        <Text style={styles.value}>{promo.code}</Text>
      </TouchableOpacity>

      {/* Kiểu giảm */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => openEdit('type')}
      >
        <Text style={styles.label}>Kiểu giảm</Text>
        <Text style={styles.value}>{promo.type === 'percent' ? '%' : '₫'}</Text>
      </TouchableOpacity>

      {/* Giá trị */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => openEdit('value')}
      >
        <Text style={styles.label}>Giá trị</Text>
        <Text style={styles.value}>{promo.value}</Text>
      </TouchableOpacity>

      {/* Ngày bắt đầu */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          setDateField('startDate');
          setShowDatePicker(true);
        }}
      >
        <Text style={styles.label}>Ngày bắt đầu</Text>
        <Text style={styles.value}>{formatDate(promo.startDate)}</Text>
      </TouchableOpacity>

      {/* Ngày kết thúc */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          setDateField('endDate');
          setShowDatePicker(true);
        }}
      >
        <Text style={styles.label}>Ngày kết thúc</Text>
        <Text style={styles.value}>{formatDate(promo.endDate)}</Text>
      </TouchableOpacity>

      {/* Giới hạn sử dụng */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => openEdit('usageLimit')}
      >
        <Text style={styles.label}>Giới hạn sử dụng</Text>
        <Text style={styles.value}>{promo.usageLimit || 'Không giới hạn'}</Text>
      </TouchableOpacity>

      {/* Mô tả */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => openEdit('description')}
      >
        <Text style={styles.label}>Mô tả</Text>
        <Text style={styles.value}>{promo.description || '-'}</Text>
      </TouchableOpacity>

      {/* Điều kiện */}
      <Text style={styles.subHeader}>Điều kiện sử dụng</Text>

      <TouchableOpacity
        style={styles.row}
        onPress={() => openEdit('minOrderValue')}
      >
        <Text style={styles.label}>Giá trị đơn tối thiểu</Text>
        <Text style={styles.value}>
          {promo.condition?.minOrderValue || '-'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => openEdit('firstTimeUserOnly')}
      >
        <Text style={styles.label}>Chỉ áp dụng khách hàng lần đầu</Text>
        <Text style={styles.value}>
          {promo.condition?.firstTimeUserOnly ? 'Có' : 'Không'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => openEdit('applicableItems')}
      >
        <Text style={styles.label}>Món áp dụng</Text>
        <Text style={styles.value}>
          {promo.condition?.applicableItems
            ?.map((id) => allDishes.find((d) => d.id === id)?.name)
            .join(', ') || '-'}
        </Text>
      </TouchableOpacity>

      {/* Modal edit */}
      {editField && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editField === 'minOrderValue'
                ? 'Giá trị đơn tối thiểu'
                : editField === 'firstTimeUserOnly'
                ? 'Chỉ áp dụng khách hàng lần đầu'
                : editField === 'applicableItems'
                ? 'Chọn món'
                : `Chỉnh sửa ${editField}`}
            </Text>

            {/* Nội dung modal theo type */}
            {editField === 'firstTimeUserOnly' ? (
              <Switch
                value={tempValue}
                onValueChange={setTempValue}
              />
            ) : editField === 'applicableItems' ? (
              <ScrollView style={{ maxHeight: 300 }}>
                {allDishes.map((dish) => {
                  const selected = tempValue.includes(dish.id);
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
              </ScrollView>
            ) : (
              <TextInput
                style={styles.input}
                value={tempValue.toString()}
                onChangeText={setTempValue}
                keyboardType={
                  typeof tempValue === 'number' ? 'numeric' : 'default'
                }
              />
            )}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#007AFF' }]}
                onPress={saveEdit}
              >
                <Text style={styles.modalButtonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ddd' }]}
                onPress={() => setEditField(null)}
              >
                <Text style={[styles.modalButtonText, { color: '#333' }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Date Picker modal */}
      {showDatePicker && dateField && (
        <DateTimePicker
          value={promo[dateField]}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, d) => {
            if (d && dateField) {
              setPromo({ ...promo, [dateField]: d });
            }
            setShowDatePicker(false);
            setDateField(null);
          }}
        />
      )}
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
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 15, color: '#555' },
  value: { fontSize: 15, fontWeight: '500', color: '#000' },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
  },
  modalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  input: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8 },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalButtonText: { color: '#fff', fontWeight: '600' },
  dishItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dishSelected: { backgroundColor: '#007AFF' },
});
