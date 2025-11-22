import React, { useState } from 'react';
import { useSettings, SettingsData } from '../hooks/useSettings';
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle, Phone, Share2, Image as ImageIcon } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, setSettings, loading, saving, error, saveSettings, restoreDefaultSettings } = useSettings();
  const [msg, setMsg] = useState<{type:'success'|'error', text:string} | null>(null);

  const handleChange = (field: keyof SettingsData, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveSettings(settings);
    if (success) {
      setMsg({ type: 'success', text: 'تم الحفظ بنجاح وتحديث الموقع!' });
      setTimeout(() => setMsg(null), 3000);
    } else {
      setMsg({ type: 'error', text: 'فشل الحفظ' });
    }
  };

  const onRestore = async () => {
    if(confirm('استعادة الإعدادات السابقة؟')) {
        const success = await restoreDefaultSettings();
        if(success) setMsg({ type: 'success', text: 'تمت الاستعادة' });
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">إعدادات الموقع</h2>
        <button onClick={onRestore} disabled={saving} className="text-red-600 border border-red-200 px-3 py-2 rounded hover:bg-red-50 flex gap-2 text-sm">
          <RotateCcw size={16}/> استعادة
        </button>
      </div>

      {msg && <div className={`p-4 rounded mb-6 ${msg.type==='success'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{msg.text}</div>}

      <form onSubmit={onSave} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-full font-bold text-slate-600 border-b pb-2 flex gap-2"><Phone size={18}/> بيانات الاتصال</div>
            <div>
                <label className="block text-sm font-bold mb-1">Email</label>
                <input className="w-full border p-2 rounded" value={settings.contact_email} onChange={e=>handleChange('contact_email',e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Phone</label>
                <input className="w-full border p-2 rounded" value={settings.contact_phone} onChange={e=>handleChange('contact_phone',e.target.value)} />
            </div>
            <div className="col-span-full">
                <label className="block text-sm font-bold mb-1">Address</label>
                <input className="w-full border p-2 rounded" value={settings.address} onChange={e=>handleChange('address',e.target.value)} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="col-span-full font-bold text-slate-600 border-b pb-2 flex gap-2"><Share2 size={18}/> التواصل الاجتماعي</div>
            <div>
                <label className="block text-sm font-bold mb-1">Facebook</label>
                <input className="w-full border p-2 rounded" value={settings.social_facebook} onChange={e=>handleChange('social_facebook',e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Twitter</label>
                <input className="w-full border p-2 rounded" value={settings.social_twitter} onChange={e=>handleChange('social_twitter',e.target.value)} />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Instagram</label>
                <input className="w-full border p-2 rounded" value={settings.social_instagram} onChange={e=>handleChange('social_instagram',e.target.value)} />
            </div>
        </div>

        <div className="pt-6 flex justify-end">
            <button type="submit" disabled={saving} className="bg-tivro-dark text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800">
                {saving && <Loader2 className="animate-spin" size={18}/>} حفظ التغييرات
            </button>
        </div>
      </form>
    </div>
  );
};