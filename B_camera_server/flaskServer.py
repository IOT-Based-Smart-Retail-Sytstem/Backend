from flask import Flask, request, send_file
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO
import io
import os
import firebase_admin
from firebase_admin import credentials, db
from datetime import datetime
import base64
import requests

app = Flask(__name__)

IMGBB_API_KEY = "3f0f0ca4ce375b7df7b166584a2105f3"

cred = credentials.Certificate("esp-cam-response-firebase-adminsdk-fbsvc-bb1712004b.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://esp-cam-response-default-rtdb.firebaseio.com/'
})

model_path = r'D:\VS\B_camera_server\bestm.pt'
if not os.path.isfile(model_path):
    raise FileNotFoundError(f"Model file not found: {model_path}")

try:
    model = YOLO(model_path)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

class_colors = {
    "Normal": (0, 255, 0),
    "Shoplifting": (255, 0, 0)
}

def upload_image_to_imgbb(img_bytes):
    url = "https://api.imgbb.com/1/upload"
    encoded_image = base64.b64encode(img_bytes).decode("utf-8")
    payload = {
        "key": IMGBB_API_KEY,
        "image": encoded_image
    }
    try:
        response = requests.post(url, data=payload)
        if response.status_code == 200:
            return response.json()["data"]["url"]
        else:
            print("❌ ImgBB Upload Error:", response.text)
            return None
    except Exception as e:
        print("❌ ImgBB Upload Exception:", e)
        return None

@app.route('/detect', methods=['POST'])
def detect_objects():
    print("🔵 Received POST request")
    print("🔵 Request content length:", len(request.data))
    if model is None:
        return "Model not loaded", 500

    if not request.data:
        return "No image data received", 400

    try:
        img = Image.open(io.BytesIO(request.data)).convert('RGB')
    except Exception as e:
        return f"Invalid image: {e}", 400

    results = model(img)[0]
    img = img.convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except:
        font = ImageFont.load_default()

    alert_triggered = False
    alert_confidence = 0.0

    if results.boxes:
        for box in results.boxes:
            coords = box.xyxy[0].tolist()
            conf = box.conf[0].item()
            cls = int(box.cls[0].item())
            class_name = model.names[cls]
            label = f"{class_name}: {conf:.2f}"

            color = class_colors.get(class_name, (255, 255, 255))
            draw.rectangle(coords, outline=color + (255,), width=2)

            text_size = draw.textbbox((0, 0), label, font=font)
            text_width = text_size[2] - text_size[0]
            text_height = text_size[3] - text_size[1]
            x1, y1 = coords[0], coords[1]
            label_bg_coords = [x1, y1 - text_height, x1 + text_width, y1]

            draw.rectangle(label_bg_coords, fill=(255, 255, 255, 255))
            draw.text((x1, y1 - text_height), label, fill=(0, 0, 0, 255), font=font)

            if class_name == "Shoplifting":
                alert_triggered = True
                alert_confidence = max(alert_confidence, conf)

    img = Image.alpha_composite(img, overlay).convert("RGB")

    if alert_triggered:
        try:
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='JPEG')
            img_bytes.seek(0)

            image_url = upload_image_to_imgbb(img_bytes.getvalue())

            if image_url:
                alert_data = {
                    "status": "Shoplifting",
                    "confidence": round(alert_confidence, 2),
                    "timestamp": datetime.utcnow().isoformat(),
                    "image_url": image_url
                }

                db.reference('alerts').push(alert_data)
                print("✅ Alert pushed to Realtime DB:", alert_data)
            else:
                print("❌ Image upload failed")
        except Exception as e:
            print("❌ Error processing alert:", e)

    img_io = io.BytesIO()
    img.save(img_io, format="JPEG")
    img_io.seek(0)
    return send_file(img_io, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
