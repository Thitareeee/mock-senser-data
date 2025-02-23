import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const SensorDetailScreen = () => {
  const navigation = useNavigation();
  const [sensorData, setSensorData] = useState([]);
  const [currentIssues, setCurrentIssues] = useState([]);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/Thitareeee/mock-senser-data/refs/heads/main/sensor_mock_data_unexpected_errors_fixed.json');
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: Expected an array");
        }

        setSensorData(data);

        // ตรวจสอบข้อผิดพลาด
        const issues = data.map(entry => {
          const errors = [];
          if (entry.temperature === 0 && entry.humidity === 0 && entry.EC === 0 && entry.pH === 0 && entry.CO2 === 0) {
            errors.push({ type: 'ไฟดับ', timestamp: entry.timestamp, details: 'ทุกค่าของเซ็นเซอร์เป็น 0' });
          }
          if (entry.EC === 0 || entry.pH === 0) {
            errors.push({ type: 'ถ่านหมด', timestamp: entry.timestamp, details: 'ค่า EC หรือ pH เป็น 0' });
          }
          if (entry.pH < 3 || entry.pH > 10 || entry.CO2 < 200) {
            errors.push({ type: 'เซ็นเซอร์เสีย', timestamp: entry.timestamp, details: `ค่า pH อยู่นอกช่วง 3-10 หรือค่า CO2 ต่ำกว่า 200 ppm` });
          }
          return errors;
        }).flat();

        setCurrentIssues(issues);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchSensorData();
  }, []);

  const handleViewErrorHistory = () => {
    navigation.navigate('ErrorHistory', { errorHistory: currentIssues });
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.fg}>
          <Text style={styles.header}>System Status</Text>
          <Switch value={true} trackColor={{ false: '#ccc', true: '#4CAF50' }} />
        </View>

        <View style={styles.sensorContainer}>
          <Text style={styles.sensorText}>Sensor IBS-TH3</Text>
        </View>

        <View style={styles.statusGrid}>
          <View style={[styles.statusBox, { backgroundColor: '#E7F8E9' }]}>
            <Icon name="wifi" size={24} color="#4CAF50" />
            <Text style={styles.statusTitle}>WiFi Status</Text>
            <Text style={styles.statusText}>Connected</Text>
          </View>
          <View style={[styles.statusBox, { backgroundColor: '#FFF3CD' }]}>
            <Icon name="battery-alert" size={24} color="#FFA000" />
            <Text style={styles.statusTitle}>Battery Status</Text>
            <Text style={styles.statusText}>20%</Text>
          </View>
          <View style={[styles.statusBox, { backgroundColor: '#E3EAFD' }]}>
            <Icon name="data-usage" size={24} color="#1976D2" />
            <Text style={styles.statusTitle}>Data Status</Text>
            <Text style={styles.statusText}>Normal</Text>
          </View>
          <View style={[styles.statusBox, { backgroundColor: '#FDE8E8' }]}>
            <Icon name="error" size={24} color="#D32F2F" />
            <Text style={styles.statusTitle}>Device Health</Text>
            <Text style={styles.statusText}>Error</Text>
          </View>
        </View>

        <Text style={styles.subHeader}>Current Issues</Text>
        {currentIssues.slice(0, 2).map((issue, index) => (
          <View key={index} style={styles.issueBox}>
            <Icon name="error" size={24} color="red" />
            <View>
              <Text style={styles.issueTitle}>{issue.type}</Text>
              <Text style={styles.issueText}>{issue.details}</Text>
              <Text style={styles.issueTimestamp}>{issue.timestamp}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={handleViewErrorHistory} style={styles.errorHistory}>
          <Icon name="history" size={24} color="#1976D2" />
          <Text style={styles.historyText}>View past error reports</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 20 },
  fg: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  sensorContainer: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15 },
  sensorText: { fontSize: 18, fontWeight: '500' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statusBox: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTitle: { fontSize: 14, color: '#555' },
  statusText: { fontSize: 16, fontWeight: 'bold' },
  subHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  issueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  issueTitle: { fontSize: 16, fontWeight: 'bold', color: 'red' },
  issueText: { fontSize: 14, color: '#333' },
  issueTimestamp: { fontSize: 12, color: '#555' },
  errorHistory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
  },
  historyText: { fontSize: 16, color: '#1976D2', marginLeft: 10 },
});

export default SensorDetailScreen;