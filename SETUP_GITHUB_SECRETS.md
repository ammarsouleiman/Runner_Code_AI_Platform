# 🔐 إعداد GitHub Secrets للنشر

## الخطوات لإضافة API Keys كـ GitHub Secrets:

### 1. افتح صفحة Secrets في GitHub:
افتح الرابط التالي في المتصفح:
```
https://github.com/ammarsouleiman/Runner_Code_AI_Platform/settings/secrets/actions
```

### 2. أضف Secret الأول (OpenRouter API Key):

1. اضغط على زر **"New repository secret"**
2. في حقل **Name** اكتب:
   ```
   VITE_OPENROUTER_API_KEY
   ```
3. في حقل **Secret** اكتب المفتاح التالي:
   ```
   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
   ```
4. اضغط **"Add secret"**

### 3. أضف Secret الثاني (Pexels API Key):

1. اضغط على زر **"New repository secret"** مرة أخرى
2. في حقل **Name** اكتب:
   ```
   VITE_PEXELS_API_KEY
   ```
3. في حقل **Secret** اكتب المفتاح التالي:
   ```
   OMfpYQBueRaHVMMu7QKoqF4uPbO5iuJvTUHpfitMhFNDmHZ2pbSffE7Y
   ```
4. اضغط **"Add secret"**

### 4. تحقق من Secrets المضافة:

يجب أن ترى الآن Secretين:
- ✅ `VITE_OPENROUTER_API_KEY`
- ✅ `VITE_PEXELS_API_KEY`

### 5. النشر:

بعد إضافة Secrets، يمكنك النشر بطريقتين:

#### الطريقة 1: النشر التلقائي
- ادفع أي تغيير إلى فرع `main` وسيعمل workflow تلقائياً

#### الطريقة 2: النشر اليدوي
```bash
npm run deploy
```

أو من GitHub:
- اذهب إلى تبويب **Actions**
- اختر workflow **"Deploy to GitHub Pages"**
- اضغط **"Run workflow"**

---

## ✅ بعد النشر:

بعد اكتمال النشر (عادة 2-3 دقائق)، سيكون التطبيق متاحاً على:
```
https://ammarsouleiman.github.io/Runner_Code_AI_Platform/
```

---

## 🔒 ملاحظات أمان:

- ✅ `.env.local` محمي ولن يُرفع إلى GitHub
- ✅ API Keys موجودة فقط في GitHub Secrets (آمنة)
- ✅ الكود المصدري لا يحتوي على أي مفاتيح

