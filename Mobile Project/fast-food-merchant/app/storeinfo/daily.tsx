import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

type TimeRange = { start: Date; end: Date };

export default function Daily() {
  const [openDays, setOpenDays] = useState<boolean[]>(Array(7).fill(true));
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(null);
  const [timeRanges, setTimeRanges] = useState<TimeRange[][]>(
    DAYS.map(() => [
      { start: new Date(0, 0, 0, 8, 0), end: new Date(0, 0, 0, 17, 0) },
    ])
  );

  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [pickerField, setPickerField] = useState<'start' | 'end' | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const toggleDay = (index: number) => {
    const newOpenDays = [...openDays];
    newOpenDays[index] = !newOpenDays[index];
    setOpenDays(newOpenDays);
  };

  const openModal = (index: number) => {
    setCurrentDayIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCurrentDayIndex(null);
  };

  const addTimeRange = () => {
    if (currentDayIndex === null) return;
    const newTimeRanges = [...timeRanges];
    newTimeRanges[currentDayIndex] = [
      ...newTimeRanges[currentDayIndex],
      { start: new Date(0, 0, 0, 8, 0), end: new Date(0, 0, 0, 17, 0) },
    ];
    setTimeRanges(newTimeRanges);
  };

  const showTimePicker = (index: number, field: 'start' | 'end') => {
    setPickerIndex(index);
    setPickerField(field);
    setShowPicker(true);
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (
      currentDayIndex === null ||
      pickerIndex === null ||
      pickerField === null ||
      !selectedDate
    ) {
      setShowPicker(false);
      return;
    }
    const newTimeRanges = [...timeRanges];
    newTimeRanges[currentDayIndex][pickerIndex][pickerField] = selectedDate;
    setTimeRanges(newTimeRanges);
    setShowPicker(false);
  };

  const formatTime = (date: Date) => {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {DAYS.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={styles.row}
            onPress={() => openModal(index)}
          >
            <Text style={styles.label}>{day}</Text>
            <View style={styles.rowRight}>
              <Text
                style={[
                  styles.statusText,
                  { color: openDays[index] ? '#0a0' : '#f00' },
                ]}
              >
                {openDays[index] ? '✓' : '✕'}
              </Text>
              <Switch
                value={openDays[index]}
                onValueChange={() => toggleDay(index)}
                trackColor={{ false: '#fdd', true: '#cfc' }}
                thumbColor={openDays[index] ? '#0a0' : '#a00'}
                style={{ marginLeft: 12 }}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal chỉnh giờ */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentDayIndex !== null ? DAYS[currentDayIndex] : ''}
            </Text>

            {currentDayIndex !== null &&
              timeRanges[currentDayIndex].map((range, idx) => (
                <View
                  key={idx}
                  style={styles.timeRow}
                >
                  <TouchableOpacity
                    style={styles.timeBox}
                    onPress={() => showTimePicker(idx, 'start')}
                  >
                    <Text>{formatTime(range.start)}</Text>
                  </TouchableOpacity>
                  <Text style={{ marginHorizontal: 8 }}>-</Text>
                  <TouchableOpacity
                    style={styles.timeBox}
                    onPress={() => showTimePicker(idx, 'end')}
                  >
                    <Text>{formatTime(range.end)}</Text>
                  </TouchableOpacity>
                </View>
              ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={addTimeRange}
            >
              <Text style={styles.addButtonText}>+ Thêm khung giờ</Text>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 16,
                justifyContent: 'flex-end',
              }}
            >
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: '#ddd', marginRight: 8 },
                ]}
                onPress={closeModal}
              >
                <Text style={[styles.modalButtonText, { color: '#333' }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#007AFF' }]}
                onPress={closeModal}
              >
                <Text style={styles.modalButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>

            {/* Time Picker */}
            {showPicker && (
              <DateTimePicker
                value={
                  currentDayIndex !== null &&
                  pickerIndex !== null &&
                  pickerField !== null
                    ? timeRanges[currentDayIndex][pickerIndex][pickerField]
                    : new Date()
                }
                mode="time"
                display="spinner"
                onChange={onTimeChange}
                is24Hour={true}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  label: { fontSize: 16, color: '#333' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 18, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timeBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  addButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: { color: '#007AFF', fontWeight: '600' },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  modalButtonText: { color: '#fff', fontWeight: '600' },
});
