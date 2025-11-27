-- إضافة عمود footer_description لجدول site_settings
-- قم بتشغيل هذا الكود في Supabase SQL Editor

-- التحقق من وجود العمود أولاً
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='site_settings' 
        AND column_name='footer_description'
    ) THEN
        -- إضافة العمود إذا لم يكن موجوداً
        ALTER TABLE site_settings 
        ADD COLUMN footer_description JSONB DEFAULT '{"ar":"وكالة تسويق رقمي سعودية متكاملة.","en":"A full-service Saudi digital marketing agency."}'::jsonb;
        
        RAISE NOTICE '✅ تم إضافة عمود footer_description بنجاح';
    ELSE
        RAISE NOTICE 'ℹ️ عمود footer_description موجود مسبقاً';
    END IF;
END $$;

-- تحديث السجل الحالي إذا كان موجوداً
UPDATE site_settings 
SET footer_description = '{"ar":"وكالة تسويق رقمي سعودية متكاملة.","en":"A full-service Saudi digital marketing agency."}'::jsonb
WHERE id = 1 AND footer_description IS NULL;

-- التحقق من النتيجة
SELECT id, footer_description FROM site_settings WHERE id = 1;
