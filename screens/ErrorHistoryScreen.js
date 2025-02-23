import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const ErrorHistoryScreen = () => {
  const route = useRoute();
  const { errorHistory } = route.params;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // จัดกลุ่มข้อผิดพลาดตามเดือนและปี
  const groupedErrors = errorHistory.reduce((acc, error) => {
    const date = new Date(error.timestamp);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(error);
    return acc;
  }, {});

  // กรองข้อผิดพลาดตามเดือนและปีที่เลือก
  const filteredErrors = groupedErrors[`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`] || [];

  const onChangeDate = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Error History</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
        {filteredErrors.map((error, index) => (
          <View key={index} style={styles.errorBox}>
            <Icon name="error" size={24} color="red" />
            <View style={styles.errorDetails}>
              <Text style={styles.errorType}>{error.type}</Text>
              <Text style={styles.errorTimestamp}>{error.timestamp}</Text>
              <Text style={styles.errorText}>{error.details}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
  datePickerButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  datePickerText: { fontSize: 16, color: 'blue' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  errorDetails: { marginLeft: 10 },
  errorType: { fontSize: 16, fontWeight: 'bold', color: 'red' },
  errorTimestamp: { fontSize: 14, color: '#555' },
  errorText: { fontSize: 14, color: '#333' },
});

export default ErrorHistoryScreen;