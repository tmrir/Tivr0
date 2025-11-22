// Update Work Section rendering
<section id="work" className="py-24 bg-white">
  <div className="container mx-auto px-4 md:px-8">
    <div className="flex justify-between items-end mb-12">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-tivro-dark mb-2">
          {settings?.sectionTexts?.workTitle?.[lang] || t('section.work')}
        </h2>
        <p className="text-slate-500">
          {settings?.sectionTexts?.workSubtitle?.[lang] || (lang === 'ar' ? 'أرقام تتحدث عن إنجازاتنا' : 'Numbers speaking our achievements')}
        </p>
      </div>
      <a href="#" className="text-tivro-primary font-bold hover:underline hidden md:block">{lang === 'ar' ? 'مشاهدة الكل' : 'View All'}</a>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {cases.map(c => (
        <div key={c.id} className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer">
          <div className="aspect-video overflow-hidden bg-slate-200">
             <img src={c.image} alt={c.title[lang]} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-8">
            <span className="text-tivro-primary font-bold text-sm mb-2">{c.category[lang]}</span>
            <h3 className="text-white text-2xl font-bold mb-2">{c.title[lang]}</h3>
            <p className="text-slate-300 text-sm mb-4">{c.result[lang]}</p>
            <div className="flex gap-4 flex-wrap">
              {c.stats.map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur rounded px-3 py-1">
                  <span className="block text-white font-bold">{stat.value}</span>
                  <span className="text-xs text-slate-300">{stat.label[lang]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>