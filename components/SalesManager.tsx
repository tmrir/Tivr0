import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { Client, Invoice, Quote } from '../types';
import { Plus, Trash2, Edit2, FileText, Users, DollarSign, Calendar, CheckCircle, Clock, XCircle, Send, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export const SalesManager: React.FC = () => {
    const { t, lang, dir } = useApp();
    const [subTab, setSubTab] = useState<'clients' | 'invoices' | 'quotes'>('clients');

    // UI Helper
    const TabButton = ({ value, label, icon: Icon }: any) => (
        <button
            onClick={() => setSubTab(value)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${subTab === value ? 'bg-tivro-primary text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
            <Icon size={18} /> {label}
        </button>
    );

    return (
        <div>
            <div className="flex flex-wrap gap-4 mb-8">
                <TabButton value="clients" label={lang === 'ar' ? 'العملاء' : 'Clients'} icon={Users} />
                <TabButton value="invoices" label={lang === 'ar' ? 'الفواتير' : 'Invoices'} icon={FileText} />
                <TabButton value="quotes" label={lang === 'ar' ? 'عروض الأسعار' : 'Quotations'} icon={DollarSign} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
                {subTab === 'clients' && <ClientsModule />}
                {subTab === 'invoices' && <InvoicesModule />}
                {subTab === 'quotes' && <QuotesModule />}
            </div>
        </div>
    );
};

// --- Clients Module ---
const ClientsModule = () => {
    const { t, lang } = useApp();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<Client> | null>(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const data = await db.clients.getAll();
            setClients(data);
        } finally { setLoading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        await db.clients.save(editing);
        await load();
        setEditing(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('admin.confirm'))) {
            await db.clients.delete(id);
            await load();
        }
    };

    if (editing) {
        return (
            <div className="p-8">
                <h3 className="font-bold text-xl mb-6">{editing.id === 'new' ? (lang === 'ar' ? 'إضافة عميل' : 'Add Client') : (lang === 'ar' ? 'تعديل بيانات العميل' : 'Edit Client')}</h3>
                <form onSubmit={handleSave} className="max-w-2xl space-y-4">
                    <input className="w-full border p-3 rounded-lg" placeholder={lang === 'ar' ? 'اسم العميل' : 'Client Name'} value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} required />
                    <input className="w-full border p-3 rounded-lg" placeholder={lang === 'ar' ? 'البريد الإلكتروني' : 'Email'} value={editing.email || ''} onChange={e => setEditing({ ...editing, email: e.target.value })} />
                    <input className="w-full border p-3 rounded-lg" placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone'} value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} />
                    <input className="w-full border p-3 rounded-lg" placeholder={lang === 'ar' ? 'الشركة' : 'Company'} value={editing.company || ''} onChange={e => setEditing({ ...editing, company: e.target.value })} />
                    <div className="flex gap-2 justify-end pt-4">
                        <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-slate-600">{t('admin.btn.cancel')}</button>
                        <button type="submit" className="bg-tivro-dark text-white px-6 py-2 rounded-lg font-bold">{t('admin.btn.save')}</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-700">{lang === 'ar' ? 'قائمة العملاء' : 'Clients List'}</h3>
                <button onClick={() => setEditing({ id: 'new', name: '' })} className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18} /> {t('admin.btn.add')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map(client => (
                    <div key={client.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition relative group">
                        <h4 className="font-bold text-lg">{client.name}</h4>
                        {client.company && <p className="text-sm text-slate-500 mb-2">{client.company}</p>}
                        <div className="text-sm text-slate-600 space-y-1">
                            {client.email && <div className="flex items-center gap-2 bg-slate-50 p-1 rounded px-2 w-fit">{client.email}</div>}
                            {client.phone && <div className="flex items-center gap-2 bg-slate-50 p-1 rounded px-2 w-fit">{client.phone}</div>}
                        </div>
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditing(client)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(client.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                {clients.length === 0 && <p className="text-center text-slate-400 col-span-full py-8 italic">{t('admin.empty')}</p>}
            </div>
        </div>
    );
};

// --- Invoices Module ---
const InvoicesModule = () => {
    const { t, lang } = useApp();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [items, setItems] = useState<Invoice[]>([]); // For proper type mapping in editing if needed
    const [editing, setEditing] = useState<Partial<Invoice> | null>(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        const data = await db.invoices.getAll();
        setInvoices(data);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        await db.invoices.save(editing);
        await load();
        setEditing(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('admin.confirm'))) {
            await db.invoices.delete(id);
            await load();
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'sent': return 'bg-blue-100 text-blue-700';
            case 'overdue': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    if (editing) {
        return (
            <div className="p-8">
                <form onSubmit={handleSave} className="max-w-3xl space-y-6">
                    <h3 className="font-bold text-xl">{lang === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input className="border p-3 rounded" placeholder={lang === 'ar' ? 'اسم العميل' : 'Client Name'} value={editing.clientName || ''} onChange={e => setEditing({ ...editing, clientName: e.target.value })} />
                        <input type="date" className="border p-3 rounded" value={editing.dueDate || ''} onChange={e => setEditing({ ...editing, dueDate: e.target.value })} />
                        <input className="border p-3 rounded" type="number" placeholder={lang === 'ar' ? 'المبلغ' : 'Amount'} value={editing.amount || ''} onChange={e => setEditing({ ...editing, amount: Number(e.target.value) })} />
                        <select className="border p-3 rounded" value={editing.status || 'draft'} onChange={e => setEditing({ ...editing, status: e.target.value as any })}>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                    {/* Items editor could be added here */}
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-slate-600">{t('admin.btn.cancel')}</button>
                        <button type="submit" className="bg-tivro-dark text-white px-6 py-2 rounded-lg font-bold">{t('admin.btn.save')}</button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-700">{lang === 'ar' ? 'الفواتير' : 'Invoices'}</h3>
                <button onClick={() => setEditing({ id: 'new', status: 'draft', amount: 0, items: [] })} className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18} /> {lang === 'ar' ? 'إنشاء فاتورة' : 'Create Invoice'}</button>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold">
                    <tr>
                        <th className="p-4 text-start">{lang === 'ar' ? 'العميل' : 'Client'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'المبلغ' : 'Amount'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="p-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(inv => (
                        <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-4 font-medium">{inv.clientName}</td>
                            <td className="p-4 font-bold">{inv.amount} {inv.currency}</td>
                            <td className="p-4 text-slate-500">{inv.dueDate}</td>
                            <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                            <td className="p-4 flex gap-2 justify-end">
                                <button onClick={() => setEditing(inv)} className="text-blue-600 p-1"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(inv.id)} className="text-red-600 p-1"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                    {invoices.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">{t('admin.empty')}</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

// --- Quotes Module ---
const QuotesModule = () => {
    const { t, lang } = useApp();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [editing, setEditing] = useState<Partial<Quote> | null>(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        const data = await db.quotes.getAll();
        setQuotes(data);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        await db.quotes.save(editing);
        await load();
        setEditing(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('admin.confirm'))) {
            await db.quotes.delete(id);
            await load();
        }
    };

    if (editing) {
        return (
            <div className="p-8">
                <form onSubmit={handleSave} className="max-w-3xl space-y-6">
                    <h3 className="font-bold text-xl">{lang === 'ar' ? 'عرض سعر جديد' : 'New Quote'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input className="border p-3 rounded" placeholder={lang === 'ar' ? 'اسم العميل' : 'Client Name'} value={editing.clientName || ''} onChange={e => setEditing({ ...editing, clientName: e.target.value })} />
                        <input type="date" className="border p-3 rounded" value={editing.validUntil || ''} onChange={e => setEditing({ ...editing, validUntil: e.target.value })} />
                        <input className="border p-3 rounded" type="number" placeholder={lang === 'ar' ? 'الإجمالي' : 'Total'} value={editing.total || ''} onChange={e => setEditing({ ...editing, total: Number(e.target.value) })} />
                        <select className="border p-3 rounded" value={editing.status || 'draft'} onChange={e => setEditing({ ...editing, status: e.target.value as any })}>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="flex gap-2 justify-end pt-4 border-t">
                        <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-slate-600">{t('admin.btn.cancel')}</button>
                        <button type="submit" className="bg-tivro-dark text-white px-6 py-2 rounded-lg font-bold">{t('admin.btn.save')}</button>
                    </div>
                </form>
            </div>
        );
    }


    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-700">{lang === 'ar' ? 'عروض الأسعار' : 'Quotations'}</h3>
                <button onClick={() => setEditing({ id: 'new', status: 'draft', total: 0 })} className="bg-tivro-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18} /> {lang === 'ar' ? 'إنشاء عرض' : 'New Quote'}</button>
            </div>
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 font-bold">
                    <tr>
                        <th className="p-4 text-start">{lang === 'ar' ? 'العميل' : 'Client'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'القيمة' : 'Total'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'تاريخ الانتهاء' : 'Valid Until'}</th>
                        <th className="p-4 text-start">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="p-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {quotes.map(q => (
                        <tr key={q.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="p-4 font-medium">{q.clientName}</td>
                            <td className="p-4 font-bold">{q.total}</td>
                            <td className="p-4 text-slate-500">{q.validUntil}</td>
                            <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold uppercase">{q.status}</span></td>
                            <td className="p-4 flex gap-2 justify-end">
                                <button onClick={() => setEditing(q)} className="text-blue-600 p-1"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(q.id)} className="text-red-600 p-1"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                    {quotes.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">{t('admin.empty')}</td></tr>}
                </tbody>
            </table>
        </div>
    );
};
