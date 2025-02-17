import React from "react";
import { SafeAreaView } from "react-native";
import StatisticScreen from "./screen/StatisticScreen"; // นำเข้าไฟล์ที่เราสร้าง

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatisticScreen />
    </SafeAreaView>
  );
}
