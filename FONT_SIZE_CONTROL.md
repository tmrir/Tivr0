# إضافة التحكم في حجم الخط لقسم Home Content

## 🎯 الميزة الجديدة

### **المطلوب:**
- ✅ **إضافة التحكم في حجم الخط** لقسم Home Content
- ✅ **واجهة سهلة** لاختيار أحجام الخط المناسبة
- ✅ **دعم Tailwind CSS** classes
- ✅ **حفظ الإعدادات** في قاعدة البيانات

---

## 🔧 التغييرات التي تم تنفيذها

### **1. إضافة أنواع جديدة (types.ts)**

#### **FontSizeSettings Interface:**
```typescript
export interface FontSizeSettings {
    heroTitle: string; // CSS font-size value like 'text-4xl', 'text-5xl', etc.
    heroSubtitle: string; // CSS font-size value
    servicesTitle: string; // CSS font-size value
    servicesSubtitle: string; // CSS font-size value
    teamTitle: string; // CSS font-size value
}
```

#### **إضافة fontSizes إلى SiteSettings:**
```typescript
export interface SiteSettings {
  // ... باقي الحقول
  
  // CMS - Font Size Settings
  fontSizes: FontSizeSettings;
  
  // ... باقي الحقول
}
```

---

### **2. تحديث settingsService.ts**

#### **إضافة Import:**
```typescript
import { SiteSettings, FontSizeSettings } from '../types';
```

#### **تحديث mapFromDB:**
```typescript
fontSizes: row.font_sizes || {
  heroTitle: 'text-4xl',
  heroSubtitle: 'text-xl',
  servicesTitle: 'text-3xl',
  servicesSubtitle: 'text-lg',
  teamTitle: 'text-2xl'
},
```

#### **تحديث mapToDB:**
```typescript
font_sizes: settings.fontSizes,
```

#### **تحديث getDefaultSettings:**
```typescript
fontSizes: {
  heroTitle: 'text-4xl',
  heroSubtitle: 'text-xl',
  servicesTitle: 'text-3xl',
  servicesSubtitle: 'text-lg',
  teamTitle: 'text-2xl'
},
```

---

### **3. تحديث SettingsContext.tsx**

#### **إضافة Import:**
```typescript
import { SiteSettings, FontSizeSettings } from '../types';
```

#### **إضافة fontSizes إلى defaultSettings:**
```typescript
fontSizes: {
  heroTitle: 'text-4xl',
  heroSubtitle: 'text-xl',
  servicesTitle: 'text-3xl',
  servicesSubtitle: 'text-lg',
  teamTitle: 'text-2xl'
},
```

---

### **4. تحديث واجهة SettingsNew.tsx**

#### **إضافة قسم جديد:**
```typescript
{/* Font Size Controls */}
<div className="border border-slate-200 rounded-lg overflow-hidden">
  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3">
    <h4 className="font-bold flex items-center gap-2">
      📏 أحجام الخطوط (Font Sizes)
    </h4>
  </div>
  <div className="p-4 space-y-4">
    {/* ... محتوى التحكم في أحجام الخط */}
  </div>
</div>
```

#### **التحكم في أحجام الخط:**
- **العنوان الرئيسي:** text-2xl إلى text-6xl
- **العنوان الفرعي:** text-sm إلى text-2xl
- **عنوان الأعمال:** text-xl إلى text-5xl
- **وصف الأعمال:** text-sm إلى text-2xl
- **زر البدء:** text-sm إلى text-2xl

---

### **5. تحديث insert_default_settings.sql**

#### **إضافة font_sizes column:**
```sql
font_sizes,
```

#### **بيانات font_sizes الافتراضية:**
```sql
'{
    "heroTitle": "text-4xl",
    "heroSubtitle": "text-xl",
    "servicesTitle": "text-3xl",
    "servicesSubtitle": "text-lg",
    "teamTitle": "text-2xl"
}'
```

---

## 📊 أحجام الخط المتاحة

### **🚀 العنوان الرئيسي (heroTitle):**
- **صغير:** text-2xl
- **متوسط:** text-3xl
- **كبير:** text-4xl (افتراضي)
- **كبير جداً:** text-5xl
- **ضخم:** text-6xl

### **📝 العنوان الفرعي (heroSubtitle):**
- **صغير جداً:** text-sm
- **صغير:** text-base
- **متوسط:** text-lg
- **كبير:** text-xl (افتراضي)
- **كبير جداً:** text-2xl

### **🛠️ عنوان الأعمال (servicesTitle):**
- **صغير:** text-xl
- **متوسط:** text-2xl
- **كبير:** text-3xl (افتراضي)
- **كبير جداً:** text-4xl
- **ضخم:** text-5xl

### **📄 وصف الأعمال (servicesSubtitle):**
- **صغير جداً:** text-sm
- **صغير:** text-base
- **متوسط:** text-lg (افتراضي)
- **كبير:** text-xl
- **كبير جداً:** text-2xl

### **🎯 زر البدء (teamTitle):**
- **صغير جداً:** text-sm
- **صغير:** text-base
- **متوسط:** text-lg
- **كبير:** text-xl
- **كبير جداً:** text-2xl (افتراضي)

---

## 🎨 واجهة المستخدم

### **📏 قسم أحجام الخطوط:**
- **لون مميز:** Purple gradient header
- **معلومات:** Blue info box مع شرح Tailwind CSS
- **تنظيم:** Grid layout (2 columns on desktop)
- **سهولة:** Dropdown selects بالعربي والإنجليزي

### **💡 معلومات للمستخدم:**
```html
💡 <strong>ملاحظة:</strong> اختر حجم الخط المناسب لكل عنصر. تستخدم قيم Tailwind CSS مثل: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl, text-5xl, text-6xl
```

---

## 🔄 كيفية الاستخدام

### **1. فتح لوحة التحكم:**
1. **افتح** `/#admin#settings`
2. **اختر** `Home Content`
3. **انتقل لأسفل** إلى قسم "📏 أحجام الخطوط"

### **2. تعديل أحجام الخط:**
1. **اختر** حجم الخط المناسب لكل عنصر
2. **شاهد** الوصف العربي والإنجليزي لكل حجم
3. **اضغط** `Save` لحفظ التغييرات
4. **شاهد** التغييرات فوراً في الصفحة الرئيسية

### **3. التطبيق في الصفحة الرئيسية:**
```typescript
// مثال لاستخدام أحجام الخط في Home.tsx
<h1 className={settings.fontSizes.heroTitle}>
  {settings.homeSections.heroTitle[lang]}
</h1>
```

---

## 📋 خطوات التحقق

### **1. تشغيل SQL Script:**
```sql
-- في Supabase SQL Editor
-- قم بتشغيل insert_default_settings.sql
```

### **2. التحقق من لوحة التحكم:**
1. افتح `/#admin#settings`
2. اختر `Home Content`
3. يجب أن ترى قسم "📏 أحجام الخطوط"
4. يجب أن ترى 5 dropdown selects

### **3. التحقق من الصفحة الرئيسية:**
1. افتح الصفحة الرئيسية
2. يجب أن تطبق أحجام الخط الجديدة
3. عند التعديل والحفظ، يجب أن تتحدث الأحجام فوراً

---

## 🎉 الفوائد الرئيسية

### **للمستخدم:**
- ✅ **تحكم كامل** في أحجام الخط
- ✅ **واجهة سهلة** مع dropdown selects
- ✅ **معاينة فورية** عند الحفظ
- ✅ **دعم عربي** كامل

### **للمطور:**
- ✅ **كود نظيف** مع TypeScript interfaces
- ✅ **قابلية التوسعة** لإضافة المزيد من أحجام الخط
- ✅ **تكامل كامل** مع نظام الإعدادات
- ✅ **دعم Tailwind CSS** standard classes

### **للواجهة:**
- ✅ **تصميم متجاوب** مع grid layout
- ✅ **ألوان مميزة** لكل قسم
- ✅ **معلومات واضحة** للمستخدم
- ✅ **تجربة مستخدم** ممتازة

---

## 🚀 ملخص سريع

**الإضافة الجديدة:**
- ✅ **5 عناصر** للتحكم في حجم الخط
- ✅ **5 خيارات** لكل عنصر (صغير إلى ضخم)
- ✅ **واجهة سهلة** مع dropdown selects
- ✅ **حفظ تلقائي** في قاعدة البيانات
- ✅ **تطبيق فوري** في الصفحة الرئيسية

**النتيجة:**
- **تحكم كامل** في مظهر البانر العلوي
- **واجهة احترافية** سهلة الاستخدام
- **تكامل كامل** مع نظام الإعدادات
- **قابلية التوسعة** للمستقبل

**الآن يمكنك التحكم في أحجام الخط لكل عنصر في البانر العلوي بسهولة! 🎊**
