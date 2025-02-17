import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { FontAwesome5 } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const screenWidth = Dimensions.get("window").width;

const StatisticScreen = () => {
  const [selectedMetrics, setSelectedMetrics] = useState(["Temperature", "Humidity"]);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const sensors = [
    { label: "Sensor IBS-TH3", value: "Sensor IBS-TH3" },
    { label: "Sensor X-200", value: "Sensor X-200" },
    // เพิ่มเซ็นเซอร์อื่น ๆ ตามต้องการ
  ];

  useEffect(() => {
    // Set initial start and end date to today
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);

    // Update current date every second
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); // 1000 milliseconds = 1 second

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const toggleMetric = (metric) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  };

  const showStartDatePicker = () => {
    setStartDatePickerVisibility(true);
  };

  const hideStartDatePicker = () => {
    setStartDatePickerVisibility(false);
  };

  const handleStartDateConfirm = (date) => {
    setStartDate(date.toISOString().split('T')[0]);
    hideStartDatePicker();
  };

  const showEndDatePicker = () => {
    setEndDatePickerVisibility(true);
  };

  const hideEndDatePicker = () => {
    setEndDatePickerVisibility(false);
  };

  const handleEndDateConfirm = (date) => {
    setEndDate(date.toISOString().split('T')[0]);
    hideEndDatePicker();
  };

  const data = {
    labels: ["00", "03", "06", "09", "12", "15", "18"],
    datasets: [
      selectedMetrics.includes("Temperature") && {
        data: [20, 22, 24, 23, 22, 21, 19],
        color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
      },
      selectedMetrics.includes("Humidity") && {
        data: [50, 55, 53, 54, 52, 50, 48],
        color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
      },
      selectedMetrics.includes("Dew Point") && {
        data: [10, 11, 12, 11, 10, 9, 8],
        color: (opacity = 1) => `rgba(0, 255, 127, ${opacity})`,
      },
    ].filter(Boolean),
  };

  const finalData = data.datasets.length > 0 ? data : {
    ...data,
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0], color: () => "transparent" }],
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#F8FAFC" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>Statistic</Text>

      {/* Current Date and Time */}
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        Current Date and Time: {currentDate.toLocaleDateString()} {currentDate.toLocaleTimeString()}
      </Text>

      {/* Sensor Dropdown */}
      <View style={{ backgroundColor: "#fff", borderRadius: 10, padding: 10, marginBottom: 20 }}>
        <Dropdown
          style={{ height: 50, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 10 }}
          placeholderStyle={{ color: "#000" }}
          selectedTextStyle={{ color: "#000" }}
          inputSearchStyle={{ height: 40, fontSize: 16 }}
          data={sensors}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Sensor"
          searchPlaceholder="Search..."
          value={selectedSensor}
          onChange={item => {
            setSelectedSensor(item.value);
          }}
        />
      </View>

      <Text style={{ fontSize: 15, fontWeight: "reregular", marginBottom: 20 }}> SELECT DATE RANGE </Text>

      {/* Date Picker */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 10, marginRight: 10, flexDirection: "row", alignItems: "center" }}
          onPress={showStartDatePicker}
        >
          <FontAwesome5 name="calendar" size={16} color="#1E90FF" style={{ marginRight: 8 }} />
          <Text>{startDate || "Start Date"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 10, marginLeft: 10, flexDirection: "row", alignItems: "center" }}
          onPress={showEndDatePicker}
        >
          <FontAwesome5 name="calendar" size={16} color="#1E90FF" style={{ marginRight: 8 }} />
          <Text>{endDate || "End Date"}</Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      <DateTimePickerModal
        isVisible={isStartDatePickerVisible}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={hideStartDatePicker}
      />
      <DateTimePickerModal
        isVisible={isEndDatePickerVisible}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={hideEndDatePicker}
      />

      {/* Metric Selection */}
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        {["Temperature", "Humidity", "Dew Point"].map((metric) => (
          <TouchableOpacity
            key={metric}
            onPress={() => toggleMetric(metric)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              paddingHorizontal: 16,
              marginRight: 8,
              borderRadius: 20,
              backgroundColor: selectedMetrics.includes(metric)
                ? metric === "Temperature"
                  ? "#FFA500"
                  : metric === "Humidity"
                  ? "#1E90FF"
                  : "#00FF7F"
                : "#E5E7EB",
            }}
          >
            <FontAwesome5
              name={metric === "Temperature" ? "thermometer-half" : metric === "Humidity" ? "tint" : "cloud"}
              size={14}
              color="#fff"
              style={{ marginRight: 5 }}
            />
            <Text style={{ color: "#fff" }}>{metric}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <LineChart
        data={finalData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          strokeWidth: 2,
        }}
        bezier
        style={{ borderRadius: 10 }}
      />
    </ScrollView>
  );
};

export default StatisticScreen;