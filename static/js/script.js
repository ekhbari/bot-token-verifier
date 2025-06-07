document.addEventListener('DOMContentLoaded', function() {
    const tokenForm = document.getElementById('tokenForm');
    const tokenInput = document.getElementById('tokenInput');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultContainer = document.getElementById('resultContainer');
    const successResult = document.getElementById('successResult');
    const errorResult = document.getElementById('errorResult');
    const botDetails = document.getElementById('botDetails');
    const botImageContainer = document.getElementById('botImageContainer');
    const errorMessage = document.getElementById('errorMessage');

    tokenForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // التحقق من وجود قيمة في حقل الإدخال
        const token = tokenInput.value.trim();
        if (!token) {
            showError('الرجاء إدخال توكن البوت');
            return;
        }

        // إظهار مؤشر التحميل وإخفاء النتائج السابقة
        loadingIndicator.classList.remove('d-none');
        resultContainer.classList.add('d-none');
        successResult.classList.add('d-none');
        errorResult.classList.add('d-none');

        // إرسال طلب التحقق إلى الخادم
        fetch('/api/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: token })
        })
        .then(response => response.json())
        .then(data => {
            // إخفاء مؤشر التحميل
            loadingIndicator.classList.add('d-none');
            resultContainer.classList.remove('d-none');

            if (data.success) {
                // عرض نتيجة نجاح التحقق
                successResult.classList.remove('d-none');
                
                // إنشاء تفاصيل البوت
                let detailsHTML = `
                    <p><strong>اسم البوت:</strong> ${data.bot.first_name}</p>
                    <p><strong>معرف البوت:</strong> ${data.bot.id}</p>
                    <p><strong>اسم المستخدم:</strong> @${data.bot.username}</p>
                `;
                
                botDetails.innerHTML = detailsHTML;
                
                // عرض صورة البوت إذا كانت متوفرة
                if (data.bot.photo_url) {
                    botImageContainer.innerHTML = `<img src="${data.bot.photo_url}" alt="${data.bot.first_name}" class="img-fluid">`;
                } else {
                    botImageContainer.innerHTML = `<div class="text-center pt-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-robot text-primary" viewBox="0 0 16 16">
                            <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z"/>
                            <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2V1.866ZM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5Z"/>
                        </svg>
                    </div>`;
                }
            } else {
                // عرض رسالة الخطأ
                errorResult.classList.remove('d-none');
                errorMessage.textContent = data.error || 'حدث خطأ أثناء التحقق من التوكن';
            }
        })
        .catch(error => {
            // إخفاء مؤشر التحميل وعرض رسالة الخطأ
            loadingIndicator.classList.add('d-none');
            resultContainer.classList.remove('d-none');
            errorResult.classList.remove('d-none');
            errorMessage.textContent = 'حدث خطأ في الاتصال بالخادم. الرجاء المحاولة مرة أخرى.';
            console.error('Error:', error);
        });
    });

    // دالة لعرض رسالة خطأ
    function showError(message) {
        loadingIndicator.classList.add('d-none');
        resultContainer.classList.remove('d-none');
        errorResult.classList.remove('d-none');
        successResult.classList.add('d-none');
        errorMessage.textContent = message;
    }
});

