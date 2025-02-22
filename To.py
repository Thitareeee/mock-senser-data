import requests
import pandas as pd
import numpy as np

# ฟังก์ชันตรวจจับข้อผิดพลาด
def is_power_outage(row):
    """ตรวจสอบว่าไฟดับหรือไม่ (ทุกค่าเป็น 0)"""
    return all(value == 0 for value in row[['temperature', 'humidity', 'vpo', 'dew_point', 'EC', 'pH', 'CO2']])

def is_battery_dead(row):
    """ตรวจสอบว่าถ่านหมดหรือไม่ (ค่า EC หรือ pH เป็น 0)"""
    return row['EC'] == 0 or row['pH'] == 0

def is_sensor_faulty(row):
    """ตรวจสอบว่าเซ็นเซอร์เสียหรือไม่ (ค่า pH นอกช่วง 3-10 หรือ CO2 ต่ำกว่า 200 ppm)"""
    try:
        # แปลงค่า pH และ CO2 เป็น float ก่อนตรวจสอบ
        pH = float(row['pH'])
        CO2 = float(row['CO2'])
        return (pH < 3 or pH > 10) or (CO2 < 200)
    except (ValueError, TypeError):
        # ถ้าแปลงค่าไม่ได้ (เช่น มีอีโมจิหรือสตริงที่ไม่ใช่ตัวเลข) ให้ถือว่าเซ็นเซอร์เสีย
        return True

# ฟังก์ชันแจ้งเตือน
def send_alert(timestamp, issue):
    """แจ้งเตือนเมื่อพบข้อผิดพลาด"""
    print(f"Alert at {timestamp}: {issue}")

# อ่านข้อมูลจาก API
url = "https://raw.githubusercontent.com/Thitareeee/mock-senser-data/refs/heads/main/sensor_mock_data_unexpected_errors_fixed.json"
response = requests.get(url)
data = response.json()

# แปลงข้อมูลเป็น DataFrame
df = pd.DataFrame(data)

# ทำความสะอาดข้อมูล: แปลงคอลัมน์ที่ควรเป็นตัวเลขให้เป็น float
numeric_columns = ['temperature', 'humidity', 'vpo', 'dew_point', 'EC', 'pH', 'CO2']
for col in numeric_columns:
    df[col] = pd.to_numeric(df[col], errors='coerce')  # แปลงเป็น NaN ถ้าไม่สามารถแปลงเป็นตัวเลขได้

# แทนที่ NaN ด้วยค่าเริ่มต้น (เช่น 0)
df.fillna(0, inplace=True)

# เพิ่มคอลัมน์สำหรับตรวจจับข้อผิดพลาด
df['power_outage'] = df.apply(is_power_outage, axis=1)
df['battery_dead'] = df.apply(is_battery_dead, axis=1)
df['sensor_faulty'] = df.apply(is_sensor_faulty, axis=1)

# แจ้งเตือนเมื่อพบข้อผิดพลาด
for index, row in df.iterrows():
    if row['power_outage']:
        send_alert(row['timestamp'], "Power Outage Detected!")
    if row['battery_dead']:
        send_alert(row['timestamp'], "Battery Dead Detected!")
    if row['sensor_faulty']:
        send_alert(row['timestamp'], "Sensor Faulty Detected!")

# บันทึกผลลัพธ์ลงในไฟล์ CSV
df.to_csv('sensor_data_with_errors.csv', index=False)
print("Data with error detection saved to 'sensor_data_with_errors.csv'.")