import requests
import pandas as pd

# URL ของ API
url = "https://raw.githubusercontent.com/Thitareeee/mock-senser-data/refs/heads/main/sensor_mock_data_unexpected_errors_fixed.json"

# ดึงข้อมูลจาก API
response = requests.get(url)
data = response.json()

# แปลงข้อมูลเป็น DataFrame
df = pd.DataFrame(data)

# แปลงคอลัมน์ที่เกี่ยวข้องให้เป็นตัวเลข
numeric_columns = ["temperature", "humidity", "vpo", "dew_point", "EC", "pH", "CO2"]
df[numeric_columns] = df[numeric_columns].apply(pd.to_numeric, errors='coerce')

# แสดงข้อมูลตัวอย่าง
print(df.head())

# ฟังก์ชันตรวจจับข้อผิดพลาด
def detect_errors(data):
    # เงื่อนไขไฟดับ
    if all(value == 0 for value in [data["temperature"], data["humidity"], data["vpo"], data["dew_point"], data["EC"], data["pH"], data["CO2"]]):
        return 1  # ไฟดับ
    if data["EC"] == 0 or data["pH"] == 0:
        return 1  # ถ่านหมด
    if data["pH"] < 3 or data["pH"] > 10:
        return 1  # เซ็นเซอร์เสีย (pH)
    if data["CO2"] < 200:
        return 1  # เซ็นเซอร์เสีย (CO2)
    return 0  # ปกติ

# เพิ่มคอลัมน์ is_faulty
df["is_faulty"] = df.apply(detect_errors, axis=1)

# แสดงข้อมูลตัวอย่าง
print(df.head())

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# เลือกฟีเจอร์ที่ใช้สำหรับการฝึกโมเดล
features = ["temperature", "humidity", "vpo", "dew_point", "EC", "pH", "CO2"]
X = df[features]
y = df["is_faulty"]

# แบ่งข้อมูลเป็นชุดฝึกและชุดทดสอบ
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ฝึกโมเดล Random Forest
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# ประเมินประสิทธิภาพของโมเดล
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"ความแม่นยำของโมเดล: {accuracy * 100:.2f}%")

# ข้อมูลใหม่สำหรับการพยากรณ์
new_data = pd.DataFrame([{
    "temperature": 30.5,
    "humidity": 75.2,
    "vpo": 40.12,
    "dew_point": 26.10,
    "EC": 1.80,
    "pH": 3.50,
    "CO2": 300.45
}])

# ทำนายผล
prediction = model.predict(new_data)
if prediction[0] == 1:
    print("⚠️ แจ้งเตือน: คาดการณ์ว่าจะเกิดข้อผิดพลาด!")
else:
    print("✅ ปกติ: ไม่มีข้อผิดพลาดคาดการณ์")

def send_alert(prediction):
    if prediction == 1:
        print("⚠️ แจ้งเตือน: คาดการณ์ว่าจะเกิดข้อผิดพลาด!")
    else:
        print("✅ ปกติ: ไม่มีข้อผิดพลาดคาดการณ์")

# ใช้ฟังก์ชันแจ้งเตือน
send_alert(prediction[0])

import joblib

# บันทึกโมเดล
joblib.dump(model, "sensor_fault_prediction_model.pkl")

# โหลดโมเดล
loaded_model = joblib.load("sensor_fault_prediction_model.pkl")

