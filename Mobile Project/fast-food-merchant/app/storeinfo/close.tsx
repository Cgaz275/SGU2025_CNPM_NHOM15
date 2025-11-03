import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Close() {
  const router = useRouter();

  const [closedDates, setClosedDates] = useState<Date[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  const addDate = (date: Date) => {
    // tránh duplicate
    if (!closedDates.find((d) => d.toDateString() === date.toDateString())) {
      setClosedDates([...closedDates, date]);
    }
    setPickerVisible(false);
  };

  const removeDate = (index: number) => {
    const newDates = [...closedDates];
    newDates.splice(index, 1);
    setClosedDates(newDates);
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

        <Text style={styles.pageTitle}>Lịch đóng cửa</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setPickerVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Thêm ngày đóng cửa</Text>
      </TouchableOpacity>

      {closedDates.length === 0 && (
        <Text style={{ textAlign: 'center', color: '#888', marginTop: 12 }}>
          Chưa có ngày đóng cửa nào
        </Text>
      )}

      {closedDates.map((date, index) => (
        <View
          key={index}
          style={styles.row}
        >
          <Text style={styles.label}>{formatDate(date)}</Text>
          <TouchableOpacity onPress={() => removeDate(index)}>
            <Ionicons
              name="trash-outline"
              size={20}
              color="#f00"
            />
          </TouchableOpacity>
        </View>
      ))}

      {/* Date picker modal */}
      {pickerVisible && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            if (selectedDate) addDate(selectedDate);
            else setPickerVisible(false);
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff', padding: 16 },
  addButton: {
    backgroundColor: '#D7A359',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 5,
    paddingBottom: 20,
  },

  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12, // khoảng cách giữa mũi tên và title
  },
  label: { fontSize: 16, color: '#333' },
});
