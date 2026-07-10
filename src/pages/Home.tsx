import { useState, useEffect } from 'react';
import { useHashLocation } from 'wouter/use-hash-location';
import { ChevronDown, BookOpen, User, Clock, AlertCircle, Coffee } from 'lucide-react';
import { NewsSection } from '@/components/NewsSection';
import { CalendarioEscolar } from '@/components/CalendarioEscolar';
import { RedesSociais } from '@/components/RedesSociais';
import { Header } from '@/components/Header';

interface ClassInfo {
  id: string;
  period: string;
  subject: string;
  professor?: string;
  hours?: string;
  observation?: string;
  color: string;
  bgColor: string;
}

interface CourseData {
  name: string;
  classes: ClassInfo[];
  bgColor: string;
  wrapperBg: string;
}

export default function Home() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [, navigate] = useHashLocation();
  const [coursesData, setCoursesData] = useState<CourseData[]>([]);
  const [weekDates, setWeekDates] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleHighlightClick = (menu: 'projetos' | 'secretaria') => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      if (typeof (window as any).__highlightHeaderMenu === 'function') {
        (window as any).__highlightHeaderMenu(menu);
      }
    }, 400);
  };

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoading(true);
        setError(null);
        const sheetUrl = 'https://docs.google.com/spreadsheets/d/1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0/export?format=csv';
        let response = await fetch(sheetUrl);
        let csv = await response.text();
        if (csv.includes('Temporary Redirect') && csv.includes('HREF')) {
          const match = csv.match(/HREF="([^"]+)"/);
          if (match && match[1]) {
            const redirectUrl = match[1].replace(/&amp;/g, '&');
            response = await fetch(redirectUrl);
            csv = await response.text();
          }
        }
        if (!response.ok) throw new Error(`Erro ao buscar dados da planilha: ${response.status}`);
        if (!csv || csv.includes('<HTML>') || csv.includes('<!DOCTYPE')) {
          throw new Error('Planilha não está acessível. Verifique se está compartilhada publicamente.');
        }
        const lines = csv.trim().split('\n');
        if (lines.length > 1) {
          const firstRow = parseCSVLine(lines[1]);
          setWeekDates({ start: firstRow[0]?.trim() || '', end: firstRow[1]?.trim() || '' });
        }
        const courseColorMap: { [key: string]: { border: string; bg: string } } = {
          'Pedagogia': { border: 'border-purple-400', bg: 'bg-purple-50' },
          'Letras':    { border: 'border-blue-400',   bg: 'bg-blue-50'   },
        };
        const coursesMap: { [key: string]: ClassInfo[] } = {};
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const cells = parseCSVLine(line);
          if (cells.length < 5) continue;
          const curso     = cells[2]?.trim() || '';
          const periodo   = cells[3]?.trim() || '';
          const materia   = cells[4]?.trim() || '';
          const professor = cells[5]?.trim() || '';
          const hours     = cells[6]?.trim() || '';
          const obs       = cells[7]?.trim() || '';
          if (!curso || !periodo || !materia) continue;
          const colors = courseColorMap[curso] || { border: 'border-gray-400', bg: 'bg-gray-50' };
          const id = `${curso.toLowerCase()}-${periodo.toLowerCase()}-${i}`;
          if (!coursesMap[curso]) coursesMap[curso] = [];
          coursesMap[curso].push({
            id, period: `${periodo} Período`, subject: materia,
            professor: professor || undefined, hours: hours || undefined,
            observation: obs || undefined, color: colors.border, bgColor: colors.bg,
          });
        }
        const coursesArray: CourseData[] = [
          { name: 'Pedagogia',        bgColor: 'from-purple-400 to-purple-500', wrapperBg: 'bg-purple-50 shadow-lg', classes: coursesMap['Pedagogia'] || [] },
          { name: 'Letras/Português', bgColor: 'from-blue-400 to-blue-500',     wrapperBg: 'bg-blue-50 shadow-lg',   classes: coursesMap['Letras'] || [] },
        ].filter(c => c.classes.length > 0);
        setCoursesData(coursesArray);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados da planilha. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    fetchSheetData();
  }, []);

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') { insideQuotes = !insideQuotes; }
      else if (char === ',' && !insideQuotes) { result.push(current); current = ''; }
      else { current += char; }
    }
    result.push(current);
    return result;
  };

  const toggleExpand = (id: string) => { setExpandedId(expandedId === id ? null : id); };
  const hasDetails = (c: ClassInfo) => c.professor || c.hours || c.observation;
  const isNoClass = (c: ClassInfo) => c.subject === 'Sem agendamento';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-yellow-50">

      {/* Header com efeito flutuante ao rolar */}
      <Header />

      {/* ─── Hero Institucional ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500">

        <style>{`
          @keyframes heroReveal {
            from { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); opacity: 0; }
            to   { clip-path: polygon(30% 0, 100% 0, 100% 100%, 0% 100%);    opacity: 0.22; }
          }
          @keyframes heroFadeUp {
            from { opacity: 0; transform: translateY(28px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes heroSlideLeft {
            from { opacity: 0; transform: translateX(-40px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes heroSlideRight {
            from { opacity: 0; transform: translateX(40px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          .hero-logo    { opacity: 0; animation: heroSlideLeft  0.7s cubic-bezier(0.16,1,0.3,1) 0.15s forwards; }
          .hero-card-0  { opacity: 0; animation: heroSlideRight 0.6s cubic-bezier(0.16,1,0.3,1) 0.30s forwards; }
          .hero-card-1  { opacity: 0; animation: heroSlideRight 0.6s cubic-bezier(0.16,1,0.3,1) 0.42s forwards; }
          .hero-card-2  { opacity: 0; animation: heroSlideRight 0.6s cubic-bezier(0.16,1,0.3,1) 0.54s forwards; }
          .hero-card-3  { opacity: 0; animation: heroSlideRight 0.6s cubic-bezier(0.16,1,0.3,1) 0.66s forwards; }
          .hero-desc    { opacity: 0; animation: heroFadeUp     0.6s cubic-bezier(0.16,1,0.3,1) 0.78s forwards; }
          .hero-buttons { opacity: 0; animation: heroFadeUp     0.6s cubic-bezier(0.16,1,0.3,1) 0.92s forwards; }
        `}</style>

        {/* Padrão geométrico */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-home" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-home)" />
          </svg>
        </div>

        {/* Foto campus — diagonal reveal */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/siteunimontes/campus.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0,
            animation: 'heroReveal 1.4s cubic-bezier(0.16,1,0.3,1) 0.1s forwards',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-6">

            {/* Logo */}
            <div className="hero-logo flex items-center justify-center">
              <img
                src="/siteunimontes/LogoCapa.png"
                alt="Unimontes Campus Almenara"
                className="w-full max-w-xs md:max-w-sm lg:max-w-md h-auto object-contain drop-shadow-2xl"
              />
            </div>

            {/* Cards + descrição */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { titulo: 'Agenda Semanal', desc: 'Veja as disciplinas da semana', emoji: '📅', acao: () => { const el = document.getElementById('agenda-section'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); } },
                  { titulo: 'Projetos',       desc: 'PIBID, AACC, AIEX e mais',      emoji: '🔬', acao: () => handleHighlightClick('projetos') },
                  { titulo: 'Secretaria',     desc: 'Solicitações e contatos',        emoji: '📋', acao: () => handleHighlightClick('secretaria') },
                  { titulo: 'Notícias',       desc: 'Novidades do campus',            emoji: '📰', acao: () => { const el = document.getElementById('noticias-section'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); } },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.acao}
                    className={`hero-card-${i} bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-left transition-all duration-200 hover:scale-105 flex flex-col justify-center`}
                  >
                    <span className="text-2xl mb-2 block">{item.emoji}</span>
                    <p className="text-white font-bold text-sm">{item.titulo}</p>
                    <p className="text-blue-200 text-xs mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
              <p className="hero-desc text-blue-100 text-xs md:text-sm leading-relaxed whitespace-nowrap">
                Universidade pública de qualidade no Vale do Jequitinhonha.<br />
                Conhecimento, cultura e extensão a serviço da comunidade desde 2001.
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="hero-buttons flex flex-wrap justify-center gap-3">
            <button
              onClick={() => { const el = document.getElementById('agenda-section'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-5 py-2.5 rounded-full shadow-md transition-all duration-200 hover:scale-105 text-sm"
            >
              Ver Agenda Semanal
            </button>
            <button
              onClick={() => navigate('/sobre')}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-5 py-2.5 rounded-full border border-white/30 transition-all duration-200 text-sm"
            >
              Conhecer o Campus
            </button>
          </div>
        </div>
      </div>
      {/* ─── Fim Hero ───────────────────────────────────────────────────── */}

      {/* Main Content */}
      <div className="py-8 md:py-12 px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="max-w-7xl mx-auto">

          {/* Agenda */}
          <div id="agenda-section">
            <div className="header-card rounded-lg overflow-hidden mb-3 shadow-md">
              <div className="relative w-full">
                <picture>
                  <source media="(max-width: 767px)" srcSet="/siteunimontes/agendasemanal2.png" />
                  <img src="/siteunimontes/agendasemanal.png" alt="Agenda Semanal" className="w-full h-auto block" />
                </picture>
                <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
              </div>
              <h2 className="w-full bg-[#ffbf00] text-[#3a3184] font-bold text-lg md:text-xl py-4 px-4 text-center tracking-wide">
                📅 {weekDates.start && weekDates.end ? `Semana de ${weekDates.start} a ${weekDates.end}` : 'Carregando semana...'}
              </h2>
            </div>

            {coursesData.length > 0 ? (
              coursesData.map((course) => (
                <div key={course.name} className={`mb-3 ${course.wrapperBg} rounded-2xl p-5 md:p-7`}>
                  <div className={`bg-gradient-to-r ${course.bgColor} text-white rounded-xl p-5 mb-5 shadow-md`}>
                    <h3 className="text-2xl md:text-3xl font-bold">{course.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {course.classes.map((classInfo) => (
                      <div key={classInfo.id} className="transition-all duration-300 ease-out">
                        <button
                          onClick={() => toggleExpand(classInfo.id)}
                          className={`w-full text-left rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                            isNoClass(classInfo)
                              ? 'bg-white/60 border-l-4 border-gray-300 opacity-75 cursor-not-allowed'
                              : `bg-white border-l-4 ${classInfo.color}`
                          }`}
                          disabled={isNoClass(classInfo)}
                        >
                           <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide mb-1 ${
                                  classInfo.color.includes('purple') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                }`}>{classInfo.period}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  {isNoClass(classInfo) && <Coffee size={18} className="text-gray-400 flex-shrink-0" />}
                                  <h3 className={`text-base md:text-lg font-bold line-clamp-2 pr-2 ${isNoClass(classInfo) ? 'text-gray-500 italic' : 'text-gray-900'}`}>{classInfo.subject}</h3>
                                </div>
                              </div>
                              {hasDetails(classInfo) && !isNoClass(classInfo) && (
                                <ChevronDown size={20} className={`flex-shrink-0 text-gray-600 transition-transform duration-300 ${expandedId === classInfo.id ? 'rotate-180' : ''}`} />
                              )}
                            </div>
                          </div>
                          {hasDetails(classInfo) && (
                            <div className={`overflow-hidden transition-all duration-300 ease-out ${expandedId === classInfo.id ? 'max-h-96' : 'max-h-0'}`}>
                              <div className="px-4 pb-4 pt-6 border-t border-gray-200 space-y-3 bg-gray-50">
                                <div className="flex items-start gap-3">
                                  <BookOpen size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">Matéria</p>
                                    <p className="text-sm md:text-base font-semibold text-gray-900">{classInfo.subject}</p>
                                  </div>
                                </div>
                                {classInfo.professor && (
                                  <div className="flex items-start gap-3">
                                    <User size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 uppercase">Professor</p>
                                      <p className="text-sm md:text-base font-semibold text-gray-900">{classInfo.professor}</p>
                                    </div>
                                  </div>
                                )}
                                {classInfo.hours && (
                                  <div className="flex items-start gap-3">
                                    <Clock size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 uppercase">Carga Horária</p>
                                      <p className="text-sm md:text-base font-semibold text-gray-900">{classInfo.hours}</p>
                                    </div>
                                  </div>
                                )}
                                {classInfo.observation && (
                                  <div className="flex items-start gap-3">
                                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 uppercase">Observação</p>
                                      <p className="text-sm md:text-base text-gray-900">{classInfo.observation}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-gray-600">Nenhuma aula encontrada para esta semana.</p>
              </div>
            )}
          </div>

          {/* Redes Sociais */}
          <div id="redes-section">
            <RedesSociais />
          </div>

          {/* Calendário + Notícias */}
          <div id="noticias-section" className="mt-16 grid md:grid-cols-2 gap-10">
            <CalendarioEscolar />
            <NewsSection />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8 px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold">Universidade Estadual de Montes Claros - UNIMONTES - Campus Almenara</p>
          <p className="text-xs text-gray-400 mt-2">© 2026 - Desenvolvido por Secretaria da Unimontes - Campus Almenara</p>
        </div>
      </div>
    </div>
  );
}
