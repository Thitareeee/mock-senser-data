import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import { BarChart } from 'react-native-chart-kit';

const DeviceMonitorScreen = () => {
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [sensorEnabled, setSensorEnabled] = useState(true);
  const [showTempChart, setShowTempChart] = useState(false);
  const [showHumidityChart, setShowHumidityChart] = useState(false);
  const [showDewPointChart, setShowDewPointChart] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [latestData, setLatestData] = useState(null);

  // Function to check if a value is valid (not an emoji or error)
  const isValidValue = (value) => {
    return typeof value === 'number' && !isNaN(value);
  };

  useEffect(() => {
    const getBatteryLevel = async () => {
      const level = await Battery.getBatteryLevelAsync();
      setBatteryLevel(Math.round(level * 100));
    };
    getBatteryLevel();

    const fetchSensorData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/Thitareeee/mock-senser-data/refs/heads/main/sensor_mock_data_unexpected_errors_fixed.json');
        const data = await response.json();
    
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format: Expected an array");
        }
    
        // Filter out invalid data (emoji or error values)
        const validData = data.filter(entry => 
          isValidValue(entry.temperature) && 
          isValidValue(entry.humidity) && 
          isValidValue(entry.dew_point)
        );

        if (validData.length === 0) {
          throw new Error("No valid data available");
        }

        const latestEntry = validData[validData.length - 1];
        setLatestData({
          temperature: latestEntry.temperature,
          humidity: latestEntry.humidity,
          dewPoint: latestEntry.dew_point,
          updatedAt: latestEntry.timestamp,
        });

        setSensorData({
          temperature: { labels: validData.map(entry => entry.timestamp), values: validData.map(entry => entry.temperature) },
          humidity: { labels: validData.map(entry => entry.timestamp), values: validData.map(entry => entry.humidity) },
          dewPoint: { labels: validData.map(entry => entry.timestamp), values: validData.map(entry => entry.dew_point) },
        });
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setSensorData(null);
        setLatestData(null);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 3600000); // Fetch data every 1 hour

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const renderChart = (data, color) => {
    if (!data || !data.labels || !data.values || data.values.length === 0) {
      return <Text style={styles.noDataText}>No valid data available</Text>;
    }
  
    // แสดงข้อมูลล่าสุด 5 ชั่วโมง
    const latestLabels = data.labels.slice(-5).map(timestamp => {
      const date = new Date(timestamp);
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`; // แสดงเวลาในรูปแบบ HH:mm
    });
  
    const latestValues = data.values.slice(-5);
  
    return (
      <BarChart
        data={{
          labels: latestLabels,
          datasets: [{ data: latestValues }],
        }}
        width={300}
        height={200}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#FFF',
          backgroundGradientFrom: '#FFF',
          backgroundGradientTo: '#FFF',
          decimalPlaces: 2,
          color: (opacity = 1) => color,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    );
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Device Monitor</Text>
        <Text style={styles.subHeader}>Sensor Status Overview</Text>

        <View style={styles.sensorCard}>
          <View style={styles.sensorHeader}>
            <FontAwesome5 name="microchip" size={20} color="black" />
            <Text style={styles.sensorTitle}>Sensor IBS-TH3</Text>
          </View>
          <Switch value={sensorEnabled} onValueChange={setSensorEnabled} />
        </View>

        <TouchableOpacity onPress={() => setShowTempChart(!showTempChart)}>
          <View style={styles.dataCard}>
            <FontAwesome5 name="temperature-high" size={20} color="blue" />
            <View style={styles.dataText}>
              <Text style={styles.dataTitle}>Temperature</Text>
              <Text style={styles.dataValue}>{latestData ? `${latestData.temperature}°C` : 'Loading...'}</Text>
              <Text style={styles.dataUpdate}>Updated {latestData ? latestData.updatedAt : 'Loading...'}</Text>
            </View>
            <MaterialIcons name={showTempChart ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
          </View>
        </TouchableOpacity>
        {showTempChart && renderChart(sensorData?.temperature, 'blue')}

        <TouchableOpacity onPress={() => setShowHumidityChart(!showHumidityChart)}>
          <View style={styles.dataCard}>
            <FontAwesome5 name="tint" size={20} color="orange" />
            <View style={styles.dataText}>
              <Text style={styles.dataTitle}>Humidity</Text>
              <Text style={styles.dataValue}>{latestData ? `${latestData.humidity}%` : 'Loading...'}</Text>
              <Text style={styles.dataUpdate}>Updated {latestData ? latestData.updatedAt : 'Loading...'}</Text>
            </View>
            <MaterialIcons name={showHumidityChart ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
          </View>
        </TouchableOpacity>
        {showHumidityChart && renderChart(sensorData?.humidity, 'orange')}

        <TouchableOpacity onPress={() => setShowDewPointChart(!showDewPointChart)}>
          <View style={styles.dataCard}>
            <FontAwesome5 name="cloud-rain" size={20} color="cyan" />
            <View style={styles.dataText}>
              <Text style={styles.dataTitle}>Dew Point</Text>
              <Text style={styles.dataValue}>{latestData ? `${latestData.dewPoint}°C` : 'Loading...'}</Text>
              <Text style={styles.dataUpdate}>Updated {latestData ? latestData.updatedAt : 'Loading...'}</Text>
            </View>
            <MaterialIcons name={showDewPointChart ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
          </View>
        </TouchableOpacity>
        {showDewPointChart && renderChart(sensorData?.dewPoint, 'cyan')}

        <View style={styles.statusContainer}>
          <View style={styles.statusBoxGreen}>
            <MaterialIcons name="wifi" size={20} color="green" />
            <Text>WiFi Status</Text>
            <Text>Connected</Text>
          </View>
          <View style={styles.statusBoxYellow}>
            <MaterialIcons name="battery-charging-full" size={20} color="red" />
            <Text>Battery Status</Text>
            <Text>{batteryLevel}%</Text>
          </View>
          <View style={styles.statusBoxBlue}>
            <MaterialIcons name="signal-cellular-alt" size={20} color="blue" />
            <Text>Data Status</Text>
            <Text>Normal</Text>
          </View>
          <View style={styles.statusBoxRed}>
            <MaterialIcons name="error-outline" size={20} color="red" />
            <Text>Device Health</Text>
            <Text>Error</Text>
          </View>
        </View>

        <View style={styles.errorCard}>
          <MaterialIcons name="warning" size={20} color="red" />
          <View style={styles.errorText}>
            <Text style={styles.errorTitle}>Device Errors</Text>
            <Text>1 hour ago</Text>
            <Text>- Temperature sensor calibration required</Text>
            <Text>- Humidity sensor needs maintenance</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, backgroundColor: '#F8FAFC' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 16, color: 'gray', marginBottom: 25 },
  sensorCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 12, marginBottom: 25 },
  sensorHeader: { flexDirection: 'row', alignItems: 'center' },
  sensorTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 12 },
  dataCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 12, marginBottom: 15 },
  dataText: { marginLeft: 12, flex: 1 },
  dataTitle: { fontSize: 14, color: 'gray' },
  dataValue: { fontSize: 20, fontWeight: 'bold' },
  dataUpdate: { fontSize: 12, color: 'gray' },
  statusContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 25 },
  statusBoxGreen: { backgroundColor: '#E1F8E1', padding: 18, borderRadius: 12, width: '48%', alignItems: 'center', marginBottom: 15 },
  statusBoxYellow: { backgroundColor: '#FFF3CD', padding: 18, borderRadius: 12, width: '48%', alignItems: 'center', marginBottom: 15 },
  statusBoxBlue: { backgroundColor: '#E0F2FE', padding: 18, borderRadius: 12, width: '48%', alignItems: 'center', marginBottom: 15 },
  statusBoxRed: { backgroundColor: '#F8D7DA', padding: 18, borderRadius: 12, width: '48%', alignItems: 'center', marginBottom: 15 },
  errorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 12 },
  errorText: { marginLeft: 12 },
  errorTitle: { fontSize: 16, fontWeight: 'bold' },
  noDataText: { textAlign: 'center', marginVertical: 16, color: 'gray' },
});

export default DeviceMonitorScreen;