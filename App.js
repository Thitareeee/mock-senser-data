import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DeviceMonitorScreen from './screens/DeviceMonitorScreen';
import FullChartScreen from './screens/FullChartScreen';
import SensorDetailScreen from './screens/SensorDetailScreen';
import ErrorHistoryScreen from './screens/ErrorHistoryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DeviceMonitor">
        <Stack.Screen name="DeviceMonitor" component={DeviceMonitorScreen} />
        <Stack.Screen name="SensorDetail" component={SensorDetailScreen} />
        <Stack.Screen name="FullChart" component={FullChartScreen} />
        <Stack.Screen name="ErrorHistory" component={ErrorHistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}