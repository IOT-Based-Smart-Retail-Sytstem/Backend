from flask import Flask, request, send_file
from PIL import Image
import io
import time
from datetime import datetime

app = Flask(__name__)

# Simple performance tracking
request_count = 0
start_time = time.time()

@app.route('/')
def home():
    return "Camera Server is running!"

@app.route('/detect', methods=['POST'])
def detect_objects():
    global request_count
    request_count += 1
    
    print(f"🔵 Received request #{request_count}")
    print(f"🔵 Request content length: {len(request.data)}")
    
    if not request.data:
        return "No image data received", 400

    try:
        # Process image (simple echo for testing)
        img = Image.open(io.BytesIO(request.data)).convert('RGB')
        
        # Add timestamp to image for testing
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(img)
        
        try:
            font = ImageFont.truetype("arial.ttf", 20)
        except:
            font = ImageFont.load_default()
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        text = f"Processed: {timestamp} (Request #{request_count})"
        
        # Add text to image
        draw.text((10, 10), text, fill=(255, 255, 255), font=font)
        
        # Calculate performance metrics
        elapsed_time = time.time() - start_time
        requests_per_minute = (request_count / elapsed_time) * 60
        
        print(f"✅ Processed request #{request_count}")
        print(f"📊 Current rate: {requests_per_minute:.1f} requests/minute")
        
        # Return processed image
        img_io = io.BytesIO()
        img.save(img_io, format="JPEG")
        img_io.seek(0)
        return send_file(img_io, mimetype='image/jpeg')
        
    except Exception as e:
        print(f"❌ Error processing image: {e}")
        return f"Error processing image: {e}", 400

@app.route('/stats')
def get_stats():
    """Get performance statistics"""
    elapsed_time = time.time() - start_time
    requests_per_minute = (request_count / elapsed_time) * 60 if elapsed_time > 0 else 0
    
    return {
        'total_requests': request_count,
        'elapsed_time': elapsed_time,
        'requests_per_minute': requests_per_minute,
        'uptime': elapsed_time
    }

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'requests_processed': request_count
    }

if __name__ == '__main__':
    print("🚀 Starting Simple Camera Server...")
    print("📸 Server will process images without YOLO detection")
    print("🔗 Endpoints:")
    print("   - POST /detect - Process image")
    print("   - GET /stats - Performance statistics")
    print("   - GET /health - Health check")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=False) 