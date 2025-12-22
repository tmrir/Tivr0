import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { ContactUsSettings, ContactFormField } from '../types';
import { TrendingUp, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { ZeigarnikRing } from './ZeigarnikRing';

interface ContactUsSectionProps {
  settings?: ContactUsSettings;
  fallbackSettings?: ContactUsSettings;
}

const IconComponent = ({ name, className }: { name: string, className?: string }) => {
  const Icon = (Icons as any)[name] || Icons.HelpCircle;
  return <Icon className={className} />;
};

const sanitizeHTML = (html: string): string => {
  // Basic HTML sanitization - allow only safe tags
  const allowedTags = ['div', 'p', 'span', 'strong', 'em', 'br', 'ul', 'ol', 'li'];
  const cleanHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, (match) => {
      const tagName = match.replace(/[<>]/g, '').split(' ')[0];
      return allowedTags.includes(tagName) ? match : '';
    });
  return cleanHTML;
};

export const ContactUsSection: React.FC<ContactUsSectionProps> = ({
  settings,
  fallbackSettings
}) => {
  const { t, lang } = useApp();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const hasArabicChars = (value: string) => /[\u0600-\u06FF]/.test(value);

  // Use provided settings or fallback
  const contactSettings = settings || fallbackSettings;

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Submit form data
      const { error } = await db.messages.send(formData.name || '', formData.phone || '');

      if (!error) {
        setSubmitStatus('success');
        setFormData({});
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const ringProgress = useMemo(() => {
    if (submitStatus === 'success') return 1;
    const base = 0.76;
    const nameFilled = String(formData.name || '').trim().length > 0;
    const phoneFilled = String(formData.phone || '').trim().length > 0;
    if (phoneFilled) return 0.96;
    if (nameFilled) return 0.88;
    return base;
  }, [formData.name, formData.phone, submitStatus]);

  if (!contactSettings) {
    return null; // Don't render if no settings available
  }

  return (
    <div id="contact" className={`py-24 bg-tivro-dark text-white ${contactSettings.cssClasses || ''}`}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          {contactSettings.title?.[lang] || (lang === 'ar' ? 'تواصل معنا' : 'Contact Us')}
        </h2>
        <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg">
          {contactSettings.subtitle?.[lang] || (lang === 'ar' ? 'جاهز لنقل مشروعك للمستوى التالي؟' : 'Ready to take your business to the next level?')}
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-6">
          {contactSettings.cards?.map((card, cardIndex) => (
            <div key={cardIndex} className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur text-left">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                {cardIndex === 0 ? (
                  <span id="cta-zeigarnik-ring-anchor" className="text-tivro-primary">
                    <ZeigarnikRing progress={ringProgress} size={22} strokeWidth={2} />
                  </span>
                ) : (card.iconType === 'svg' ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(card.iconSVG) }}
                    className="text-tivro-primary"
                  />
                ) : (
                  <IconComponent name={card.iconSVG} className="text-tivro-primary" />
                ))}
                {card.heading?.[lang] || (lang === 'ar' ? 'حجز استشارة' : 'Book Consultation')}
              </h4>

              <div className="flex gap-4 mt-4 mb-6">
                {contactSettings.socialLinks?.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded bg-slate-800 hover:bg-tivro-primary flex items-center justify-center transition text-white"
                  >
                    <IconComponent name={link.iconSVG_or_name} className="w-4 h-4" />
                  </a>
                ))}
              </div>

              <div
                className="mb-6 text-slate-300"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHTML(
                    lang === 'en' && hasArabicChars(card.contentHTML || '')
                      ? "<p>Let's discuss your goals and craft a strategy tailored to your success.</p>"
                      : (card.contentHTML || '')
                  )
                }}
              />

              <form onSubmit={handleSubmit} className="space-y-4 w-full md:w-80">
                {contactSettings.form?.fields?.map((field: ContactFormField, fieldIndex: number) => (
                  <input
                    key={fieldIndex}
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder?.[lang] || field.label?.[lang]}
                    className="w-full bg-slate-800 border-none rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-tivro-primary outline-none"
                    required={field.required}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                ))}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-tivro-primary hover:bg-emerald-500 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting && <Loader2 className="animate-spin" size={18} />}
                  {contactSettings.form?.submitText?.[lang] || (lang === 'ar' ? 'إرسال الطلب' : 'Send Request')}
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUsSection;
