import tkinter as tk
from tkinter import messagebox
import cv2
import threading
import time
import requests
import numpy as np

# إعداد عنوان السيرفر
FLASK_SERVER_URL = "http://127.0.0.1:5000/detect"

# حالة التشغيل
running = False
cap = None

def start_camera():
    global running, cap
    if running:
        return
    running = True
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        messagebox.showerror("Error", "❌ Cannot open laptop camera")
        return

    def process_frames():
        last_capture_time = 0
        interval = 5  # ثواني بين كل صورة

        while running:
            ret, frame = cap.read()
            if not ret:
                continue

            current_time = time.time()
            if current_time - last_capture_time >= interval:
                last_capture_time = current_time

                _, img_encoded = cv2.imencode('.jpg', frame)

                try:
                    response = requests.post(
                        FLASK_SERVER_URL.strip(),
                        data=img_encoded.tobytes(),
                        headers={"Content-Type": "image/jpeg"},
                        timeout=10
                    )

                    if response.status_code == 200:
                        nparr = np.frombuffer(response.content, np.uint8)
                        result_frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                        cv2.imshow("YOLO Live Detection", result_frame)
                    else:
                        print("❌ Error from server:", response.status_code)
                except Exception as e:
                    print("❌ Request failed:", e)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()

    thread = threading.Thread(target=process_frames)
    thread.start()

def stop_camera():
    global running
    if not running:
        return
    running = False
    messagebox.showinfo("Stopped", "✅ Camera and detection stopped")

# واجهة التطبيق
root = tk.Tk()
root.title("Smart Camera Detection")
root.geometry("300x200")
root.configure(bg="white")

title_label = tk.Label(root, text="YOLO Camera Detector", font=("Arial", 16), bg="white")
title_label.pack(pady=20)

start_btn = tk.Button(root, text="▶ Start Detection", command=start_camera, bg="#4CAF50", fg="white", font=("Arial", 12))
start_btn.pack(pady=10)

stop_btn = tk.Button(root, text="■ Stop Detection", command=stop_camera, bg="#f44336", fg="white", font=("Arial", 12))
stop_btn.pack(pady=10)

root.mainloop()
