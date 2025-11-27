-- تعطيل RLS مؤقتاً لحل مشكلة المصادقة
-- قم بتشغيل هذا الكود في Supabase SQL Editor

-- تعطيل RLS بالكامل للجدول
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- التحقق من أن RLS معطل
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'site_settings';

-- اختبار القراءة والكتابة
SELECT * FROM site_settings WHERE id = 1;

UPDATE site_settings 
SET updated_at = NOW() 
WHERE id = 1;

SELECT * FROM site_settings WHERE id = 1;
