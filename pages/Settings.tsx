
import React, { useState } from 'react';
import { useSettings, SettingsData } from '../hooks/useSettings';
import { Layout } from '../components/Layout';
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle, Globe, Phone, Share2, Image as ImageIcon } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { 
    settings, 
    setSettings, 
    loading, 
    saving, 
    error, 
    saveSettings, 
    restoreDefaultSettings 
  } = useSettings();

  const [successMsg, setSuccessMsg] = useState('');

  // دالة مساعدة لتحديث الحقول
  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // معالجة الحفظ
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveSettings(settings);
    if (success) {
      setSuccessMsg('تم حفظ الإعدادات وتحديث النسخة الاحتياطية بنجاح.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // معالجة الاستعادة
  const handleRestore = async () => {
    if (!confirm('هل أنت متأكد؟ سيتم استعادة آخر نسخة تم حفظها بنجاح (Snapshot) ومسح التعديلات الحالية.')) return;
    
    const success = await restoreDefaultSettings();
    if (success) {
      setSuccessMsg('تم استعادة البيانات الافتراضية بنجاح.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6 md:p-10 animate-fade-in">
        
        {/* الهيدر */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">إعدادات الموقع</h1>
            <p className="text-slate-500">إدارة بيانات الاتصال، الروابط، والشعارات.</p>
          </div>
          
          <button
            onClick={handleRestore}
            disabled={saving}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 border border-slate-300 px-4 py-2.5 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
          >
            <RotateCcw size={16} />
            استعادة البيانات الافتراضية
          </button>
        </div>

        {/* رسائل التنبيه */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 flex items-center gap-3 border border-red-100">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-8 flex items-center gap-3 border border-green-100">
            <CheckCircle size={20} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* القسم 1: بيانات الاتصال */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Phone size={20}/></div>
              <h2 className="text-xl font-bold text-slate-800">بيانات الاتصال</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  value={settings.contact_email} 
                  onChange={e => handleChange('contact_email', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رقم الهاتف</label>
                <input 
                  type="text" 
                  value={settings.contact_phone} 
                  onChange={e => handleChange('contact_phone', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                  placeholder="+966 50 000 0000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">العنوان الفعلي</label>
                <input 
                  type="text" 
                  value={settings.address} 
                  onChange={e => handleChange('address', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                  placeholder="الرياض، المملكة العربية السعودية"
                />
              </div>
            </div>
          </section>

          {/* القسم 2: التواصل الاجتماعي */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Share2 size={20}/></div>
              <h2 className="text-xl font-bold text-slate-800">التواصل الاجتماعي</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Facebook URL</label>
                <input 
                  type="url" 
                  value={settings.social_facebook} 
                  onChange={e => handleChange('social_facebook', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Twitter (X) URL</label>
                <input 
                  type="url" 
                  value={settings.social_twitter} 
                  onChange={e => handleChange('social_twitter', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Instagram URL</label>
                <input 
                  type="url" 
                  value={settings.social_instagram} 
                  onChange={e => handleChange('social_instagram', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </section>

          {/* القسم 3: الوسائط */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><ImageIcon size={20}/></div>
              <h2 className="text-xl font-bold text-slate-800">الشعارات والأيقونات</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رابط الشعار (Logo URL)</label>
                <input 
                  type="text" 
                  value={settings.logo_url} 
                  onChange={e => handleChange('logo_url', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                  placeholder="https://..."
                />
                {settings.logo_url && <img src={settings.logo_url} alt="Logo Preview" className="mt-3 h-12 object-contain border border-slate-200 rounded p-1" />}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رابط الأيقونة (Icon URL)</label>
                <input 
                  type="text" 
                  value={settings.icon_url} 
                  onChange={e => handleChange('icon_url', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition"
                  placeholder="https://..."
                />
                {settings.icon_url && <img src={settings.icon_url} alt="Icon Preview" className="mt-3 h-8 w-8 object-contain border border-slate-200 rounded p-1" />}
              </div>
            </div>
          </section>

          {/* مسافة إضافية للزر العائم */}
          <div className="h-24"></div>

          {/* زر الحفظ العائم */}
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-full px-6 max-w-5xl pointer-events-none">
            <div className="flex justify-end pointer-events-auto">
               <button
                type="submit"
                disabled={saving}
                className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-slate-800 transition flex items-center gap-3 disabled:opacity-70 transform hover:-translate-y-1"
              >
                {saving ? <Loader2 className="animate-spin" /> : <Save />}
                {saving ? 'جاري الحفظ والمعالجة...' : 'حفظ التغييرات وتحديث النسخة'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </Layout>
  );
};
