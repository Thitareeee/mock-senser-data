// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DeviceMonitorScreen from './screens/DeviceMonitorScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen
          name="DeviceMonitor"
          component={DeviceMonitorScreen}
          options={{ title: 'Device Monitor' }}
        />
        {/* เพิ่มหน้าอื่น ๆ ที่นี่ในอนาคต */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}