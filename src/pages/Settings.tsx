import React, { useState } from 'react';
import { useSettings, SettingsData } from '../hooks/useSettings';
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle, Phone, Share2, Image as ImageIcon } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, setSettings, loading, saving, error, saveSettings, restoreDefaultSettings } = useSettings();
  const [msg, setMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveSettings(settings);
    if (success) {
      setMsg({ type: 'success', text: 'تم الحفظ وتحديث النسخة الاحتياطية بنجاح!' });
      setTimeout(() => setMsg(null), 3000);
    } else {
      setMsg({ type: 'error', text: 'فشل الحفظ، راجع السجلات.' });
    }
  };

  const onRestore = async () => {
    if(!confirm('استعادة النسخة الافتراضية؟ سيتم فقدان التعديلات غير المحفوظة.')) return;
    const success = await restoreDefaultSettings();
    if (success) {
      setMsg({ type: 'success', text: 'تم استعادة البيانات الافتراضية.' });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-2 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">إعدادات الموقع</h2>
        <button onClick={onRestore} disabled={saving} className="text-sm text-red-600 border border-red-200 px-3 py-2 rounded hover:bg-red-50 flex gap-2">
          <RotateCcw size={16}/> استعادة الافتراضي
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded mb-4 flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
          {msg.text}
        </div>
      )}

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">System Error: {error}</div>}

      <form onSubmit={onSave} className="space-y-6 bg-white p-6 rounded shadow-sm border border-slate-200">
        
        {/* Contact Info */}
        <div className="border-b pb-4 mb-4">
            <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                <Phone size={20} className="text-blue-500"/>
                <h3>بيانات الاتصال</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1">البريد الإلكتروني</label>
                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={settings.contact_email} onChange={e => handleChange('contact_email', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">رقم الهاتف</label>
                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={settings.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-1">العنوان</label>
                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={settings.address} onChange={e => handleChange('address', e.target.value)} />
                </div>
            </div>
        </div>

        {/* Social Media */}
        <div className="border-b pb-4 mb-4">
             <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                <Share2 size={20} className="text-indigo-500"/>
                <h3>التواصل الاجتماعي</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1">Facebook</label>
                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={settings.social_facebook} onChange={e => handleChange('social_facebook', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Twitter</label>
                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={settings.social_twitter} onChange={e => handleChange('social_twitter', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Instagram</label>
                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 outline-none" value={settings.social_instagram} onChange={e => handleChange('social_instagram', e.target.value)} />
                </div>
            </div>
        </div>

        {/* Media / Branding */}
        <div>
             <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                <ImageIcon size={20} className="text-amber-500"/>
                <h3>الشعارات</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1">رابط الشعار (Logo URL)</label>
                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-500 outline-none" value={settings.logo_url} onChange={e => handleChange('logo_url', e.target.value)} />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">رابط الأيقونة (Icon URL)</label>
                    <input className="w-full border p-2 rounded focus:ring-2 focus:ring-amber-500 outline-none" value={settings.icon_url} onChange={e => handleChange('icon_url', e.target.value)} />
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="bg-slate-900 text-white px-8 py-3 rounded font-bold flex items-center gap-2 hover:bg-slate-800 shadow-lg transition">
            {saving && <Loader2 className="animate-spin" size={18}/>} حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
};