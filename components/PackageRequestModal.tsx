import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Package } from '../types';
import { supabase } from '../services/supabase';

interface PackageRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package | null;
  lang: 'ar' | 'en';
}

export const PackageRequestModal: React.FC<PackageRequestModalProps> = ({
  isOpen,
  onClose,
  package: selectedPackage,
  lang
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  if (!isOpen || !selectedPackage) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    console.log('🚀 Starting package request submission...');
    console.log('📋 Form data:', formData);
    console.log('📦 Selected package:', selectedPackage);

    try {
      const requestData = {
        customer_name: formData.name,
        phone_number: formData.phone,
        email: formData.email,
        package_name: selectedPackage.name[lang],
        package_id: selectedPackage.id,
        status: 'pending'
      };

      console.log('📤 Sending request data:', requestData);

      const { data, error } = await supabase
        .from('package_requests')
        .insert([requestData])
        .select();

      console.log('📥 Response data:', data);
      console.log('❌ Response error:', error);

      if (error) {
        console.error('❌ Error creating package request:', error);
        setSubmitMessage(lang === 'ar' ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'An error occurred, please try again');
      } else {
        console.log('✅ Package request created successfully');
        setSubmitMessage(lang === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Your request has been sent successfully!');
        setFormData({ name: '', phone: '', email: '' });
        setTimeout(() => {
          onClose();
          setSubmitMessage('');
        }, 2000);
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      setSubmitMessage(lang === 'ar' ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'An error occurred, please try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            {lang === 'ar' ? 'طلب الباقة' : 'Package Request'}
          </h3>
          <div className="bg-tivro-primary/10 text-tivro-primary px-4 py-2 rounded-lg text-center">
            <span className="text-sm font-medium">
              {lang === 'ar' ? 'الباقة المختارة:' : 'Selected Package:'}
            </span>
            <div className="font-bold">{selectedPackage.name[lang]}</div>
          </div>
        </div>

        {submitMessage && (
          <div className={`mb-4 p-4 rounded-lg text-center ${
            submitMessage.includes(lang === 'ar' ? 'نجاح' : 'success') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {lang === 'ar' ? 'اسمك طال عمرك' : 'Your Name'}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tivro-primary focus:border-tivro-primary outline-none transition"
              placeholder={lang === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {lang === 'ar' ? 'رقم التواصل' : 'Phone Number'}
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tivro-primary focus:border-tivro-primary outline-none transition"
              placeholder={lang === 'ar' ? 'أدخل رقم التواصل' : 'Enter your phone number'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-tivro-primary focus:border-tivro-primary outline-none transition"
              placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-tivro-primary text-white py-3 rounded-lg font-bold hover:bg-tivro-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
              </>
            ) : (
              lang === 'ar' ? 'ارسل طلبك' : 'Send Your Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
