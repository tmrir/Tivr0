
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSettingsContext } from '../context/SettingsContext';
import { Layout } from '../components/Layout';
import { SiteSettings } from '../types';
import { Loader2 } from 'lucide-react';

interface LegalPageProps {
    type: 'privacy' | 'terms';
}

export const Legal: React.FC<LegalPageProps> = ({ type }) => {
    const { t, lang } = useApp();
    const { settings, loading } = useSettingsContext();

    if (loading) return <Layout><div className="flex justify-center p-20"><Loader2 className="animate-spin"/></div></Layout>;

    const title = type === 'privacy' ? t('nav.privacy') : t('nav.terms');
    const content = type === 'privacy' ? settings?.privacyPolicy?.[lang] : settings?.termsOfService?.[lang];

    return (
        <Layout>
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-4xl font-bold text-slate-900 mb-8">{title}</h1>
                <div className="prose prose-lg max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                    {content || (lang === 'ar' ? 'لا يوجد محتوى حالياً.' : 'No content available.')}
                </div>
            </div>
        </Layout>
    );
};
