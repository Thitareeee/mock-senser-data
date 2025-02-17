import requests
import time

# ฟังก์ชันตรวจจับข้อผิดพลาด
def detect_errors(data):
    # เงื่อนไขไฟดับ
    if all(value == 0 for value in [data["temperature"], data["humidity"], data["vpo"], data["dew_point"], data["EC"], data["pH"], data["CO2"]]):
        return "ไฟดับ", "💡"
    
    # เงื่อนไขถ่านหมด
    if data["EC"] == 0 or data["pH"] == 0:
        return "ถ่านหมด", "🔋"
    
    # เงื่อนไขเซ็นเซอร์เสีย
    if data["pH"] < 3 or data["pH"] > 10:
        return "เซ็นเซอร์เสีย (pH)", "⚠️"
    if data["CO2"] < 200:
        return "เซ็นเซอร์เสีย (CO2)", "⚠️"
    
    # ถ้าไม่มีข้อผิดพลาด
    return "ปกติ", "✅"

# ฟังก์ชันแจ้งเตือน
def send_alert(data, error_type, emoji):
    # สร้างข้อความแจ้งเตือน
    message = f"⚠️ แจ้งเตือน: {error_type} {emoji}\n"
    message += f"เวลา: {data['timestamp']}\n"
    message += f"รายละเอียด:\n"
    message += f"อุณหภูมิ: {data['temperature']}\n"
    message += f"ความชื้น: {data['humidity']}\n"
    message += f"CO2: {data['CO2']}\n"
    message += f"EC: {data['EC']}\n"
    message += f"pH: {data['pH']}\n"
    
    # แสดงผลบนหน้าจอ
    print(message)

# ฟังก์ชันจำลองการดึงข้อมูลแบบ Real-time
def simulate_real_time(data):
    for index, sensor_data in enumerate(data):
        print(f"\nกำลังตรวจสอบข้อมูลที่ {index + 1}:")
        print(sensor_data)
        
        # ตรวจสอบข้อผิดพลาด
        error_type, emoji = detect_errors(sensor_data)
        if error_type != "ปกติ":
            send_alert(sensor_data, error_type, emoji)
        
        # หน่วงเวลาเพื่อจำลอง Real-time (รอ 5 วินาที)
        time.sleep(5)

# ดึงข้อมูลจาก Mock API
url = "https://raw.githubusercontent.com/Thitareeee/mock-senser-data/refs/heads/main/sensor_mock_data_unexpected_errors_fixed.json"
print("กำลังดึงข้อมูลจาก Mock API...")
response = requests.get(url)
data = response.json()

# เริ่มต้นการจำลอง Real-time
print("\nเริ่มต้นการจำลอง Real-time...")
simulate_real_time(data)