from flask import Flask, request, jsonify, render_template
import requests
import os
from functools import wraps

app = Flask(__name__, 
            static_folder='../static',
            template_folder='../templates')

# تكوين CORS للسماح بالطلبات من أي مصدر
@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

# دالة للتحقق من صلاحية توكن بوت تلغرام
def verify_telegram_token(token):
    try:
        # إرسال طلب إلى API تلغرام للتحقق من التوكن
        response = requests.get(f'https://api.telegram.org/bot{token}/getMe', timeout=10)
        data = response.json()
        
        # التحقق من نجاح الطلب
        if response.status_code == 200 and data.get('ok'):
            result = data.get('result', {})
            
            # محاولة الحصول على صورة البوت إذا كانت متوفرة
            photo_url = None
            try:
                photos_response = requests.get(f'https://api.telegram.org/bot{token}/getUserProfilePhotos?user_id={result["id"]}&limit=1', timeout=10)
                photos_data = photos_response.json()
                
                if photos_data.get('ok') and photos_data.get('result', {}).get('total_count', 0) > 0:
                    file_id = photos_data['result']['photos'][0][0]['file_id']
                    file_response = requests.get(f'https://api.telegram.org/bot{token}/getFile?file_id={file_id}', timeout=10)
                    file_data = file_response.json()
                    
                    if file_data.get('ok'):
                        file_path = file_data['result']['file_path']
                        photo_url = f'https://api.telegram.org/file/bot{token}/{file_path}'
            except Exception as e:
                # إذا فشل الحصول على الصورة، نتجاهل الخطأ ونستمر بدون صورة
                print(f"Error fetching bot photo: {str(e)}")
            
            # إعداد بيانات البوت للإرجاع
            bot_data = {
                'id': result.get('id'),
                'first_name': result.get('first_name'),
                'username': result.get('username'),
                'is_bot': result.get('is_bot', True),
                'photo_url': photo_url
            }
            
            return {
                'success': True,
                'bot': bot_data
            }
        else:
            # إرجاع رسالة الخطأ من API تلغرام
            error_description = data.get('description', 'توكن غير صالح')
            return {
                'success': False,
                'error': error_description
            }
    except requests.exceptions.RequestException as e:
        # التعامل مع أخطاء الاتصال
        return {
            'success': False,
            'error': f'خطأ في الاتصال: {str(e)}'
        }
    except Exception as e:
        # التعامل مع الأخطاء العامة
        return {
            'success': False,
            'error': f'خطأ غير متوقع: {str(e)}'
        }

# المسار الرئيسي لعرض الصفحة
@app.route('/')
def index():
    return render_template('index.html')

# نقطة نهاية API للتحقق من التوكن
@app.route('/api/verify', methods=['POST'])
def verify_token():
    # التحقق من وجود بيانات JSON في الطلب
    if not request.is_json:
        return jsonify({
            'success': False,
            'error': 'يجب إرسال بيانات بتنسيق JSON'
        }), 400
    
    # استخراج التوكن من البيانات
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({
            'success': False,
            'error': 'التوكن مطلوب'
        }), 400
    
    # التحقق من صلاحية التوكن
    result = verify_telegram_token(token)
    
    # إرجاع النتيجة
    return jsonify(result)

# تكوين للتشغيل المحلي
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 3000)), debug=True)

