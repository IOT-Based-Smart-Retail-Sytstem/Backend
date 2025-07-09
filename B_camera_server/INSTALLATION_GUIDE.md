# دليل تثبيت Camera Server

## 🚨 **حل مشاكل التثبيت**

### المشكلة الشائعة:
```
AttributeError: module 'pkgutil' has no attribute 'ImpImporter'
```

### الحلول:

## 🔧 **الحل الأول: تثبيت المتطلبات الأساسية فقط**

```bash
cd B_camera_server
pip install -r requirements-simple.txt
```

## 🔧 **الحل الثاني: تثبيت PyTorch منفصلاً**

```bash
# تثبيت المتطلبات الأساسية
pip install flask pillow requests opencv-python numpy firebase-admin

# تثبيت PyTorch من الموقع الرسمي
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

## 🔧 **الحل الثالث: استخدام Conda**

```bash
# إنشاء environment جديد
conda create -n camera-server python=3.9
conda activate camera-server

# تثبيت المتطلبات
conda install flask pillow requests opencv numpy
pip install firebase-admin ultralytics
```

## 🔧 **الحل الرابع: تثبيت تدريجي**

```bash
# الخطوة 1: المتطلبات الأساسية
pip install flask==2.3.3
pip install pillow==10.0.1
pip install requests==2.31.0
pip install opencv-python==4.8.1.78
pip install numpy==1.24.3

# الخطوة 2: Firebase
pip install firebase-admin==6.2.0

# الخطوة 3: YOLO (اختياري)
pip install ultralytics==8.0.196
```

## 🧪 **اختبار التثبيت**

### 1. اختبار Flask
```python
python -c "import flask; print('Flask version:', flask.__version__)"
```

### 2. اختبار OpenCV
```python
python -c "import cv2; print('OpenCV version:', cv2.__version__)"
```

### 3. اختبار Firebase
```python
python -c "import firebase_admin; print('Firebase Admin installed')"
```

## 🚀 **تشغيل Camera Server**

### بعد التثبيت الناجح:

```bash
# تشغيل Flask server
python flaskServer.py
```

### اختبار الأداء:
```bash
# في terminal آخر
python ../camera-performance-test.py
```

## ⚠️ **ملاحظات مهمة:**

### 1. إصدار Python
- استخدم Python 3.8 أو 3.9 لتجنب مشاكل التوافق
- تجنب Python 3.12 مع بعض المكتبات

### 2. YOLO Model
- إذا فشل تثبيت ultralytics، يمكن تشغيل Flask server بدون YOLO
- سيتم إرسال الصور بدون معالجة

### 3. Firebase
- تأكد من وجود ملف `esp-cam-response-firebase-adminsdk-fbsvc-bb1712004b.json`
- أو قم بتعديل `flaskServer.py` لتعطيل Firebase

## 🔄 **تشغيل بدون YOLO (للاختبار)**

إذا فشل تثبيت YOLO، يمكن تشغيل server بسيط:

```python
# flaskServer-simple.py
from flask import Flask, request, send_file
from PIL import Image
import io

app = Flask(__name__)

@app.route('/detect', methods=['POST'])
def detect_objects():
    if not request.data:
        return "No image data received", 400

    try:
        img = Image.open(io.BytesIO(request.data)).convert('RGB')
        # Return the same image without processing
        img_io = io.BytesIO()
        img.save(img_io, format="JPEG")
        img_io.seek(0)
        return send_file(img_io, mimetype='image/jpeg')
    except Exception as e:
        return f"Error: {e}", 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
```

## 📋 **خطوات سريعة:**

1. **تثبيت المتطلبات الأساسية:**
   ```bash
   pip install -r requirements-simple.txt
   ```

2. **تشغيل Server:**
   ```bash
   python flaskServer.py
   ```

3. **اختبار الأداء:**
   ```bash
   python ../camera-performance-test.py
   ```

## 🎯 **النتيجة المتوقعة:**

بعد التثبيت الناجح:
- ✅ Flask server يعمل على port 5000
- ✅ يمكن استقبال طلبات معالجة الصور
- ✅ يمكن اختبار الأداء
- ✅ يمكن قياس images/minute

## 💡 **إذا استمرت المشاكل:**

1. **استخدم virtual environment:**
   ```bash
   python -m venv camera-env
   source camera-env/bin/activate  # Linux/Mac
   camera-env\Scripts\activate     # Windows
   ```

2. **تحديث pip:**
   ```bash
   pip install --upgrade pip
   ```

3. **تثبيت منفصل:**
   ```bash
   pip install flask
   pip install pillow
   pip install requests
   pip install opencv-python
   pip install numpy
   pip install firebase-admin
   ``` 