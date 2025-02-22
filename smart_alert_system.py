import requests
import logging
from dotenv import load_dotenv
import os

# โหลดค่าจากไฟล์ .env
load_dotenv()

# ตั้งค่า logging
logging.basicConfig(filename="sensor_monitor.log", level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Line Notify Token (เก็บในไฟล์ .env)
LINE_NOTIFY_TOKEN = os.getenv("LINE_NOTIFY_TOKEN")
LINE_NOTIFY_API = "https://notify-api.line.me/api/notify"

# ฟังก์ชันส่งการแจ้งเตือนผ่าน Line Notify
def send_line_notify(message):
    # ตรวจสอบว่าข้อความไม่ว่างเปล่า
    if not message:
        logging.error("ข้อความว่างเปล่า: ไม่สามารถส่งการแจ้งเตือนได้")
        return

    # ตรวจสอบว่า Token ถูกตั้งค่า
    if not LINE_NOTIFY_TOKEN:
        logging.error("ไม่พบ Line Notify Token")
        return

    # ตรวจสอบความยาวของข้อความ (ไม่เกิน 1,000 ตัวอักษร)
    if len(message) > 1000:
        logging.error("ข้อความยาวเกินไป: ไม่สามารถส่งการแจ้งเตือนได้")
        return

    headers = {
        "Authorization": f"Bearer {LINE_NOTIFY_TOKEN}"
    }
    payload = {
        "message": message
    }

    try:
        response = requests.post(LINE_NOTIFY_API, headers=headers, data=payload)
        response.raise_for_status()  # ตรวจสอบข้อผิดพลาด HTTP
        logging.info("ส่งการแจ้งเตือนผ่าน Line Notify สำเร็จ!")
    except requests.exceptions.HTTPError as e:
        logging.error(f"เกิดข้อผิดพลาดขณะส่งการแจ้งเตือนผ่าน Line Notify: {e}")
        logging.error(f"สถานะการตอบกลับ: {response.status_code}")
        logging.error(f"ข้อความตอบกลับ: {response.text}")
    except Exception as e:
        logging.error(f"เกิดข้อผิดพลาดที่ไม่คาดคิด: {e}")

# ฟังก์ชันตรวจสอบเงื่อนไข error (ตัวอย่าง)
def check_errors(data):
    errors = []

    # เงื่อนไข: ไฟดับ (ทุกค่าเป็น 0)
    if all(value == 0 for key, value in data.items() if key != "timestamp"):
        errors.append("ไฟดับ: ทุกค่าของเซ็นเซอร์เป็น 0")

    # เงื่อนไข: ถ่านหมด (EC หรือ pH เป็น 0)
    if data.get("EC") == 0 or data.get("pH") == 0:
        errors.append("ถ่านหมด: ค่า EC หรือ pH เป็น 0")

    # เงื่อนไข: ค่า CO2 น้อยกว่า 200
    if data.get("CO2", 0) < 200:
        errors.append(f"ค่า CO2 ต่ำเกินไป: {data.get('CO2')} (ควรมากกว่า 200)")

    return errors

# ฟังก์ชันส่งการแจ้งเตือน
def send_alert(timestamp, errors):
    if errors:
        # ส่งข้อความแจ้งเตือนทีละรายการ
        for error in errors:
            message = f"การแจ้งเตือนจากระบบ\nเวลา: {timestamp}\n\n{error}"
            send_line_notify(message)
    else:
        logging.info(f"สถานะปกติ ({timestamp}): ไม่พบปัญหา")

# ฟังก์ชันหลัก
def main():
    # ตัวอย่างข้อมูลเซ็นเซอร์จาก API
    sensor_data = [
        {"timestamp": "2025-02-21 22:29:57", "EC": 0, "pH": 0, "CO2": 0},
        {"timestamp": "2025-02-21 22:30:00", "EC": 1.5, "pH": 7.0, "CO2": 300},
        {"timestamp": "2025-02-21 22:30:05", "EC": 0, "pH": 6.5, "CO2": 150},
    ]

    # วนลูปผ่านข้อมูลเซ็นเซอร์ทั้งหมด
    for entry in sensor_data:
        timestamp = entry.get("timestamp", "ไม่ทราบเวลา")
        errors = check_errors(entry)
        if errors:  # ส่งการแจ้งเตือนเฉพาะเมื่อมีข้อผิดพลาด
            send_alert(timestamp, errors)

# รันโปรแกรม
if __name__ == "__main__":
    main()