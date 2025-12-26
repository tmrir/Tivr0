import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../services/db';
import { ContactUsSettings, ContactFormField } from '../types';
import { TrendingUp, Loader2 } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ContactUsSectionProps {
  settings?: ContactUsSettings;
  fallbackSettings?: ContactUsSettings;
}

const IconComponent = ({ name, className }: { name: string, className?: string }) => {
  const Icon = (Icons as any)[name] || Icons.HelpCircle;
  return <Icon className={className} />;
};

const HorizontalProgressBar = ({ progress, lang }: { progress: number; lang: string }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white text-sm font-medium">
          {lang === 'ar' ? `الصورة ${progress >= 0.9 ? 'اقتربت' : 'غير مكتملة'}` : `Picture ${progress >= 0.9 ? 'Almost Complete' : 'Incomplete'}`}
        </span>
        <span className="text-white text-xs font-medium">{Math.round(progress * 100)}%</span>
      </div>
      <div className="w-full h-3 bg-black border border-white rounded-full relative overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-white transition-all duration-700 ease-out rounded-full"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
};

const sanitizeHTML = (html: string): string => {
  if (typeof window === 'undefined') return html;
  // Basic HTML sanitization - allow only safe tags
  const allowedTags = ['div', 'p', 'span', 'strong', 'em', 'br', 'ul', 'ol', 'li'];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html || '', 'text/html');

  // Remove dangerous tags entirely
  ['script', 'iframe', 'object', 'embed', 'link', 'style'].forEach((tag) => {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  });

  const isDangerousUrl = (value: string) => {
    const v = String(value || '').trim().toLowerCase();
    return v.startsWith('javascript:') || v.startsWith('data:') || v.startsWith('vbscript:');
  };

  // Only sanitize inside <body> to avoid invalid DOM operations on document-level nodes.
  Array.from(doc.body.querySelectorAll('*')).forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (!allowedTags.includes(tag)) {
      // Replace the node with its text content (safe) but only if it has a non-document parent.
      const parent = el.parentNode;
      if (parent && parent.nodeType !== Node.DOCUMENT_NODE) {
        const text = doc.createTextNode(el.textContent || '');
        el.replaceWith(text);
      } else {
        el.remove();
      }
      return;
    }

    // Strip dangerous attributes
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
        return;
      }

      if ((name === 'href' || name === 'src' || name === 'xlink:href') && isDangerousUrl(value)) {
        el.removeAttribute(attr.name);
        return;
      }
    });
  });

  return doc.body.innerHTML;
};

export const ContactUsSection: React.FC<ContactUsSectionProps> = ({
  settings,
  fallbackSettings
}) => {
  const { t, lang } = useApp();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [progressBarFill, setProgressBarFill] = useState(0.7);

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
        // Animate progress bar to 90%
        setProgressBarFill(0.9);
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
              <h4 className="text-xl font-bold mb-4">
                {cardIndex === 0 ? (
                  <div className="mb-4">
                    <HorizontalProgressBar progress={progressBarFill} lang={lang} />
                  </div>
                ) : (card.iconType === 'svg' ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(card.iconSVG) }}
                    className="text-tivro-primary"
                  />
                ) : (
                  <IconComponent name={card.iconSVG} className="text-tivro-primary" />
                ))}
                {cardIndex !== 0 && (card.heading?.[lang] || (lang === 'ar' ? 'حجز استشارة' : 'Book Consultation'))}
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
