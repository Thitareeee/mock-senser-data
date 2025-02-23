import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as Battery from 'expo-battery';
import { BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

const DeviceMonitorScreen = () => {
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [sensorEnabled, setSensorEnabled] = useState(true);
  const [showTempChart, setShowTempChart] = useState(false);
  const [showHumidityChart, setShowHumidityChart] = useState(false);
  const [showDewPointChart, setShowDewPointChart] = useState(false);
  const [showVpoChart, setShowVpoChart] = useState(false);
  const [sensorData, setSensorData] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigation = useNavigation();

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
    
        const validData = data.filter(entry => 
          typeof entry.temperature === 'number' && 
          typeof entry.humidity === 'number' && 
          typeof entry.dew_point === 'number' &&
          typeof entry.vpo === 'number'
        );

        if (validData.length === 0) {
          throw new Error("No valid data available");
        }

        const latestEntry = validData[validData.length - 1];
        setLatestData({
          temperature: latestEntry.temperature,
          humidity: latestEntry.humidity,
          dewPoint: latestEntry.dew_point,
          vpo: latestEntry.vpo,
          updatedAt: latestEntry.timestamp,
        });

        setSensorData({
          temperature: { labels: validData.map(entry => entry.timestamp), values: validData.map(entry => entry.temperature) },
          humidity: { labels: validData.map(entry => entry.timestamp), values: validData.map(entry => entry.humidity) },
          dewPoint: { labels: validData.map(entry => entry.timestamp), values: validData.map(entry => entry.dew_point) },
          vpo: { labels: validData.map(entry => entry.timestamp), values: validData.map(entry => entry.vpo) },
        });

        setErrorMessage(null);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setErrorMessage("Failed to fetch sensor data. Please try again later.");
        setSensorData(null);
        setLatestData(null);
      }
    };

    fetchSensorData();
    const interval = setInterval(fetchSensorData, 3600000); // Fetch data every 1 hour

    return () => clearInterval(interval);
  }, []);

  const renderChart = (data, color, type) => {
    if (!data || !data.labels || !data.values || data.values.length === 0) {
      return <Text style={styles.noDataText}>No valid data available</Text>;
    }
  
    const latestLabels = data.labels.slice(-5).map(timestamp => {
      const date = new Date(timestamp);
      return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    });
  
    const latestValues = data.values.slice(-5);
  
    return (
      <TouchableOpacity onPress={() => navigation.navigate('FullChart', { data: data, color: color, type: type })}>
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
      </TouchableOpacity>
    );
  };

  const handleSensorPress = () => {
    navigation.navigate('SensorDetail', { sensorData, latestData });
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Device Monitor</Text>
        <Text style={styles.subHeader}>Sensor Status Overview</Text>

        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <TouchableOpacity onPress={handleSensorPress}>
          <View style={styles.sensorCard}>
            <View style={styles.sensorHeader}>
              <FontAwesome5 name="microchip" size={20} color="black" />
              <Text style={styles.sensorTitle}>Sensor IBS-TH3</Text>
            </View>
          </View>
        </TouchableOpacity>

        {latestData ? (
          <>
            <TouchableOpacity onPress={() => setShowTempChart(!showTempChart)}>
              <View style={styles.dataCard}>
                <FontAwesome5 name="temperature-high" size={20} color="blue" />
                <View style={styles.dataText}>
                  <Text style={styles.dataTitle}>Temperature</Text>
                  <Text style={styles.dataValue}>{latestData.temperature}°C</Text>
                  <Text style={styles.dataUpdate}>Updated {latestData.updatedAt}</Text>
                </View>
                <MaterialIcons name={showTempChart ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
              </View>
            </TouchableOpacity>
            {showTempChart && renderChart(sensorData?.temperature, 'blue', 'temperature')}

            <TouchableOpacity onPress={() => setShowHumidityChart(!showHumidityChart)}>
              <View style={styles.dataCard}>
                <FontAwesome5 name="tint" size={20} color="orange" />
                <View style={styles.dataText}>
                  <Text style={styles.dataTitle}>Humidity</Text>
                  <Text style={styles.dataValue}>{latestData.humidity}%</Text>
                  <Text style={styles.dataUpdate}>Updated {latestData.updatedAt}</Text>
                </View>
                <MaterialIcons name={showHumidityChart ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
              </View>
            </TouchableOpacity>
            {showHumidityChart && renderChart(sensorData?.humidity, 'orange', 'humidity')}

            <TouchableOpacity onPress={() => setShowDewPointChart(!showDewPointChart)}>
              <View style={styles.dataCard}>
                <FontAwesome5 name="cloud-rain" size={20} color="cyan" />
                <View style={styles.dataText}>
                  <Text style={styles.dataTitle}>Dew Point</Text>
                  <Text style={styles.dataValue}>{latestData.dewPoint}°C</Text>
                  <Text style={styles.dataUpdate}>Updated {latestData.updatedAt}</Text>
                </View>
                <MaterialIcons name={showDewPointChart ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
              </View>
            </TouchableOpacity>
            {showDewPointChart && renderChart(sensorData?.dewPoint, 'cyan', 'dewPoint')}

            <TouchableOpacity onPress={() => setShowVpoChart(!showVpoChart)}>
              <View style={styles.dataCard}>
                <FontAwesome5 name="wind" size={20} color="green" />
                <View style={styles.dataText}>
                  <Text style={styles.dataTitle}>Vapor Pressure Deficit (VPO)</Text>
                  <Text style={styles.dataValue}>{latestData.vpo} kPa</Text>
                  <Text style={styles.dataUpdate}>Updated {latestData.updatedAt}</Text>
                </View>
                <MaterialIcons name={showVpoChart ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
              </View>
            </TouchableOpacity>
            {showVpoChart && renderChart(sensorData?.vpo, 'green', 'vpo')}
          </>
        ) : (
          <Text style={styles.noDataText}>Loading sensor data...</Text>
        )}
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
  noDataText: { textAlign: 'center', marginVertical: 16, color: 'gray' },
  errorContainer: { backgroundColor: '#F8D7DA', padding: 10, borderRadius: 8, marginBottom: 20 },
  errorText: { color: '#721C24', textAlign: 'center' },
});

export default DeviceMonitorScreen;