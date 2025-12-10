-- SQL لإصلاح سياسات RLS لجدول الإعدادات
-- قم بتشغيل هذا الكود في Supabase SQL Editor

-- تعطيل RLS مؤقتاً للجدول
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- أو إنشاء سياسة RLS تسمح بالوصول الكامل (إذا كنت تريد الحفاظ على RLS)
-- أولاً حذف السياسات القديمة
DROP POLICY IF EXISTS "site_settings_full_access" ON site_settings;
DROP POLICY IF EXISTS "site_settings_select_policy" ON site_settings;
DROP POLICY IF EXISTS "site_settings_insert_policy" ON site_settings;
DROP POLICY IF EXISTS "site_settings_update_policy" ON site_settings;
DROP POLICY IF EXISTS "site_settings_delete_policy" ON site_settings;

-- تمكين RLS مرة أخرى
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة تسمح بالوصول الكامل باستخدام Service Role
CREATE POLICY "site_settings_full_access" ON site_settings
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- إنشاء سياسة تسمح بالوصول للجميع (خيار بديل)
-- CREATE POLICY "site_settings_public_access" ON site_settings
--   FOR ALL USING (true)
--   WITH CHECK (true);

-- التحقق من السياسات الحالية
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'site_settings';

-- اختبار الوصول باستخدام Service Role
-- (يجب أن يعمل هذا بدون أخطاء)
SELECT count(*) FROM site_settings;

-- تحديث الوقت لاختبار التحديث
UPDATE site_settings 
SET updated_at = NOW() 
WHERE id = 1;

-- التحقق من التحديث
SELECT * FROM site_settings WHERE id = 1;
