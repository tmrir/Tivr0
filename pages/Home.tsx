import React, { useState } from 'react';

export const Home = () => {
  const [lang, setLang] = useState('AR');
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLang = () => setLang(lang === 'AR' ? 'EN' : 'AR');

  return (
    <div dir={lang === 'AR' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-900 overflow-x-hidden scroll-smooth">
      {/* Header */}
      <header className="bg-white shadow relative z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-blue-600">tivro.sa</span>
            <span className={`text-sm text-gray-500 font-bold ${lang === 'AR' ? 'border-r-2 pr-3 mr-1' : 'border-l-2 pl-3 ml-1'} border-gray-300`}>
              للتسويق الرقمي
            </span>
          </div>
          
          <nav className="hidden md:flex gap-8 font-medium">
            <a href="#home" className="hover:text-blue-600 transition-colors">الرئيسية</a>
            <a href="#services" className="hover:text-blue-600 transition-colors">خدماتنا</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">تواصل معنا</a>
          </nav>
          
          <button 
            className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="md:hidden bg-white border-t border-gray-100 p-4 pb-6 flex flex-col space-y-4 font-medium shadow-lg absolute w-full left-0 z-40">
            <a href="#home" className="hover:text-blue-600 transition p-2 bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>الرئيسية</a>
            <a href="#services" className="hover:text-blue-600 transition p-2 bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>خدماتنا</a>
            <a href="#contact" className="hover:text-blue-600 transition p-2 bg-gray-50 rounded" onClick={() => setMenuOpen(false)}>تواصل معنا</a>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-slate-900 text-white py-24 md:py-32 flex-grow flex items-center relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-600 opacity-20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-purple-600 opacity-20 blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10 w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            ننمو معاً... <span className="text-blue-500 block sm:inline">نحو النجاح الرقمي</span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base md:text-xl lg:text-2xl mb-10 max-w-2xl mx-auto font-light leading-relaxed px-2">
            نقدم حلولاً تسويقية مبتكرة تلبي طموحاتك وتحقق نتائج مبهرة باستخدام أفضل الاستراتيجيات المدروسة.
          </p>
          <a href="#contact" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-4 px-10 md:px-14 rounded-full transition-all transform hover:scale-105 hover:-translate-y-1 shadow-lg shadow-blue-600/30">
            تواصل معنا
          </a>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-28 bg-gray-50">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-12 lg:mb-16 text-slate-800 tracking-tight">
            لماذا تختارنا؟
          </h2>
          
          {/* Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { title: 'الأسهل', desc: 'عملية سلسة ومبسطة من لحظة التواصل الأولى وحتى تسليم النتائج.', color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'الأوضح', desc: 'شفافية تامة في الخطط، الأسعار، وتقارير الأداء بشكل مستمر.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { title: 'وغالباً...', desc: 'نتجاوز توقعاتك ونقدم قيمة مضافة حقيقية تفوق المستهدف المطلوب.', color: 'text-purple-600', bg: 'bg-purple-50' },
              { title: 'الخطأ', desc: 'نحن نتعلم من كل خطوة لنضمن أفضل أداء يخلو من الأخطاء المتكررة.', color: 'text-rose-500', bg: 'bg-rose-50' }
            ].map((service, index) => (
              <div key={index} className="bg-white p-8 md:p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col items-center text-center group">
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${service.bg} ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <strong className="text-2xl md:text-3xl font-black">{index + 1}</strong>
                </div>
                <h3 className={`text-xl md:text-2xl font-bold ${service.color} mb-3`}>{service.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm md:text-base font-medium">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-28 bg-white border-t border-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-10 text-slate-800">ابدأ نجاحك معنا اليوم</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <a href="mailto:info@tivro.sa" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 px-8 py-4 md:py-5 rounded-full font-bold transition-colors text-slate-700 shadow-sm border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              تواصل عبر البريد
            </a>
            <a href="https://wa.me/966500000000" target="_blank" rel="noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-green-50 hover:bg-green-100 px-8 py-4 md:py-5 rounded-full font-bold transition-colors text-green-800 border border-green-200 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              مراسلة واتســــاب
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-8 border-t border-slate-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm">جميع الحقوق محفوظة &copy; {new Date().getFullYear()} tivro.sa</p>
          <button 
            onClick={toggleLang} 
            className="flex items-center gap-2 hover:text-white transition-colors focus:outline-none bg-slate-800 px-4 py-2 rounded-full text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>{lang === 'AR' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
