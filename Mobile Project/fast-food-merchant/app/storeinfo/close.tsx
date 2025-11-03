import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Close() {
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
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
  addButton: {
    backgroundColor: '#007AFF',
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
  label: { fontSize: 16, color: '#333' },
});
