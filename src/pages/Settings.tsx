
import React from 'react';
import { useSettings, SettingsData } from '../hooks/useSettings';
import { Layout } from '../components/Layout'; // Assuming you have a Layout component
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, loading, saving, error, saveSettings, restoreDefault, setSettings } = useSettings();
  const [successMsg, setSuccessMsg] = React.useState('');

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveSettings(settings);
    if (success) {
      setSuccessMsg('تم حفظ الإعدادات وتحديث النسخة الاحتياطية بنجاح.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleRestore = async () => {
    if (!confirm('هل أنت متأكد؟ سيتم استعادة آخر نسخة تم حفظها بنجاح.')) return;
    const success = await restoreDefault();
    if (success) {
      setSuccessMsg('تم استعادة البيانات الافتراضية.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">إعدادات الموقع</h1>
            <button
              onClick={handleRestore}
              disabled={saving}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-red-600 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition"
            >
              <RotateCcw size={16} />
              استعادة البيانات الافتراضية
            </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle /> {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 flex items-center gap-3 animate-fade-in">
            <CheckCircle /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* بيانات الاتصال */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-700 border-b pb-2">بيانات الاتصال</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  value={settings.contact_email} 
                  onChange={e => handleChange('contact_email', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف</label>
                <input 
                  type="text" 
                  value={settings.contact_phone} 
                  onChange={e => handleChange('contact_phone', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
                <input 
                  type="text" 
                  value={settings.address} 
                  onChange={e => handleChange('address', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </section>

          {/* التواصل الاجتماعي */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-700 border-b pb-2">التواصل الاجتماعي</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Facebook URL</label>
                <input 
                  type="text" 
                  value={settings.social_facebook} 
                  onChange={e => handleChange('social_facebook', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Twitter (X) URL</label>
                <input 
                  type="text" 
                  value={settings.social_twitter} 
                  onChange={e => handleChange('social_twitter', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instagram URL</label>
                <input 
                  type="text" 
                  value={settings.social_instagram} 
                  onChange={e => handleChange('social_instagram', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </section>

           {/* الصور والروابط */}
           <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-700 border-b pb-2">الشعارات والوسائط</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">رابط الشعار (Logo URL)</label>
                <input 
                  type="text" 
                  value={settings.logo_url} 
                  onChange={e => handleChange('logo_url', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">رابط الأيقونة (Icon URL)</label>
                <input 
                  type="text" 
                  value={settings.icon_url} 
                  onChange={e => handleChange('icon_url', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </section>

          {/* زر الحفظ العائم */}
          <div className="fixed bottom-8 left-8 right-8 md:left-auto md:right-12">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:bg-emerald-700 transition flex items-center gap-3 disabled:opacity-70"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};
