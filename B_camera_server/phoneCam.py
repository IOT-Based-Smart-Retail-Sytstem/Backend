import cv2
import requests
import numpy as np
import time

FLASK_SERVER_URL = "http://127.0.0.1:5000/detect"

stream_url = "http://192.168.1.3:4747/video"

cap = cv2.VideoCapture(stream_url)

if not cap.isOpened():
    print("❌ Cannot open video stream")
    exit()

CAPTURE_INTERVAL = 3  

while True:
    start_time = time.time()

    ret, frame = cap.read()
    if not ret:
        print("❌ Failed to grab frame")
        continue

    _, img_encoded = cv2.imencode('.jpg', frame)

    try:
        response = requests.post(
            FLASK_SERVER_URL,
            data=img_encoded.tobytes(),
            headers={"Content-Type": "image/jpeg"},
            timeout=5
        )

        if response.status_code == 200:
            nparr = np.frombuffer(response.content, np.uint8)
            result_frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            cv2.imshow("YOLO Live Detection", result_frame)
        else:
            print("❌ Error from server:", response.status_code)

    except requests.exceptions.RequestException as e:
        print("❌ Request failed:", e)

    elapsed_time = time.time() - start_time
    sleep_time = CAPTURE_INTERVAL - elapsed_time
    if sleep_time > 0:
        time.sleep(sleep_time)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
