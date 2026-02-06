import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { DashboardUser, UserRole } from '../types';
import { Plus, Trash2, Edit2, Shield, User, Key, Check, Loader2 } from 'lucide-react';

interface Props {
    onUpdate: () => void;
}

const ROLES: { value: UserRole; label: { ar: string; en: string }; description: { ar: string; en: string } }[] = [
    {
        value: 'admin',
        label: { ar: 'مدير (Admin)', en: 'Admin' },
        description: { ar: 'كامل الصلاحيات', en: 'Full access' }
    },
    {
        value: 'manager',
        label: { ar: 'مشرف (Manager)', en: 'Manager' },
        description: { ar: 'صلاحيات أقل من المدير', en: 'Less privileges than Admin' }
    },
    {
        value: 'developer',
        label: { ar: 'مطور (Developer)', en: 'Developer' },
        description: { ar: 'كامل الصلاحيات ما عدا الحذف', en: 'Full access except delete' }
    },
    {
        value: 'sales',
        label: { ar: 'مسؤول مبيعات (Sales)', en: 'Sales' },
        description: { ar: 'متابعة المبيعات والعملاء والفواتير', en: 'Sales, Customers, Invoices' }
    }
];

export const UsersManager: React.FC<Props> = ({ onUpdate }) => {
    const { t, lang } = useApp();
    const [users, setUsers] = useState<DashboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<DashboardUser> | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await db.users.getAll();
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        setSaving(true);
        try {
            await db.users.save(editing);
            await loadUsers();
            setEditing(null);
            onUpdate();
        } catch (e) {
            console.error(e);
            alert('Error saving user');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('admin.confirm'))) {
            await db.users.delete(id);
            await loadUsers();
            onUpdate();
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{lang === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</h2>
                    <p className="text-slate-500 text-sm mt-1">{lang === 'ar' ? 'إدارة أعضاء الفريق وصلاحياتهم' : 'Manage team members and roles'}</p>
                </div>
                <button
                    onClick={() => setEditing({ id: 'new', email: '', name: '', role: 'sales' })}
                    className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm hover:bg-emerald-700 transition"
                >
                    <Plus size={18} /> {t('admin.btn.add')}
                </button>
            </div>

            {editing ? (
                <form onSubmit={handleSave} className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-2xl mx-auto animate-fade-in">
                    <h3 className="font-bold text-xl text-slate-800 mb-6 pb-4 border-b flex items-center gap-2">
                        {editing.id === 'new' ? <Plus size={20} /> : <Edit2 size={20} />}
                        {editing.id === 'new' ? t('admin.btn.add') : t('admin.btn.edit')}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">{lang === 'ar' ? 'الاسم' : 'Name'}</label>
                            <input
                                className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-tivro-primary/20"
                                value={editing.name || ''}
                                onChange={e => setEditing({ ...editing, name: e.target.value })}
                                placeholder="Ex. John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                            <input
                                type="email"
                                className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-tivro-primary/20"
                                value={editing.email || ''}
                                onChange={e => setEditing({ ...editing, email: e.target.value })}
                                placeholder="user@example.com"
                                required
                            />
                            <p className="text-xs text-orange-600 mt-1 bg-orange-50 p-2 rounded">
                                ⚠️ {lang === 'ar'
                                    ? 'تأكد أن هذا البريد مسجل في Supabase Auth ليتمكن المستخدم من الدخول.'
                                    : 'Ensure this email is registered in Supabase Auth for the user to login.'}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">{lang === 'ar' ? 'الصلاحية (Role)' : 'Role'}</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ROLES.map(role => (
                                    <div
                                        key={role.value}
                                        onClick={() => setEditing({ ...editing, role: role.value })}
                                        className={`cursor-pointer border rounded-xl p-3 flex items-start gap-3 transition-all ${editing.role === role.value ? 'bg-tivro-primary/5 border-tivro-primary ring-1 ring-tivro-primary' : 'hover:bg-slate-50 border-slate-200'}`}
                                    >
                                        <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center ${editing.role === role.value ? 'border-tivro-primary bg-tivro-primary' : 'border-slate-300'}`}>
                                            {editing.role === role.value && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-slate-800">{role.label[lang]}</div>
                                            <div className="text-xs text-slate-500">{role.description[lang]}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-6 mt-6 border-t">
                        <button type="button" onClick={() => setEditing(null)} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">{t('admin.btn.cancel')}</button>
                        <button type="submit" disabled={saving} className="bg-tivro-dark text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition">
                            {saving && <Loader2 size={16} className="animate-spin" />} {t('admin.btn.save')}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map(user => {
                        const roleInfo = ROLES.find(r => r.value === user.role);
                        return (
                            <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 group relative">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                        <User size={24} />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                                user.role === 'developer' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-green-100 text-green-700'
                                        }`}>
                                        {roleInfo?.label[lang] || user.role}
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-slate-800">{user.name || 'Unnamed'}</h3>
                                <p className="text-slate-500 text-sm mb-4">{user.email}</p>

                                <div className="border-t pt-4 text-xs text-slate-400 flex items-center gap-2">
                                    <Shield size={12} />
                                    {roleInfo?.description[lang]}
                                </div>

                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditing(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
