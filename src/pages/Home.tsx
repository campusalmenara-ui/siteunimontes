import { useState, useEffect } from 'react';
import { ChevronDown, BookOpen, User, Clock, AlertCircle, Coffee, Instagram, MapPin, Menu, X } from 'lucide-react';
import { NewsSection } from '@/components/NewsSection';
import { useState as useStateNav, useEffect as useEffectNav } from 'react';

/**
 * Design Philosophy: Lúdico Azul e Amarelo
 * - Cores vibrantes: Azul (#4A90E2) + Amarelo (#FDB913)
 * - Cards com borda colorida à esquerda
 * - Expansão vertical ao clicar
 * - Tipografia: Poppins (títulos) + Inter (corpo)
 * - Animações suaves 250-300ms
 * - Organização por curso (Pedagogia e Letras/Português)
 * - Dados carregados dinamicamente do Google Sheets
 */

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
}

// Cores para cada curso
const courseColors: { [key: string]: { border: string; bg: string } } = {
  'Pedagogia': { border: 'border-purple-400', bg: 'bg-purple-50' },
  'Letras': { border: 'border-blue-400', bg: 'bg-blue-50' },
};

export default function Home() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [coursesData, setCoursesData] = useState<CourseData[]>([]);
  const [weekDates, setWeekDates] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'agenda' | 'noticias' | 'calendario' | 'editais'>('agenda');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (section: 'agenda' | 'noticias' | 'calendario' | 'editais') => {
    if (section === 'calendario') {
      window.open('https://drive.google.com/file/d/1KtIHqC2_AzpwGb-lZFTKTyxNVGr_MIcV/view?usp=drive_link', '_blank');
      return;
    }
    if (section === 'editais') {
      window.open('https://www.coteps.unimontes.br/', '_blank');
      return;
    }
    setActiveSection(section);
    setMobileMenuOpen(false);
    document.getElementById(section === 'agenda' ? 'agenda-section' : 'noticias-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch dados do Google Sheets
  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        setLoading(true);
        setError(null);

        // URL do Google Sheets que funciona com compartilhamento
        const sheetUrl = 'https://docs.google.com/spreadsheets/d/1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0/export?format=csv';

        let response = await fetch(sheetUrl);
        let csv = await response.text();
        
        // Se receber HTML (redirect), extrair URL e fazer novo fetch
        if (csv.includes('Temporary Redirect') && csv.includes('HREF')) {
          const match = csv.match(/HREF="([^"]+)"/);
          if (match && match[1]) {
            const redirectUrl = match[1].replace(/&amp;/g, '&');
            response = await fetch(redirectUrl);
            csv = await response.text();
          }
        }
        
        if (!response.ok) throw new Error(`Erro ao buscar dados da planilha: ${response.status}`);
        
        // Validar se recebeu CSV válido
        if (!csv || csv.includes('<HTML>') || csv.includes('<!DOCTYPE')) {
          throw new Error('Planilha não está acessível. Verifique se está compartilhada publicamente.');
        }
        const lines = csv.trim().split('\n');

        // Extrair datas: A2 (linha 1, coluna 0) e B2 (linha 1, coluna 1)
        if (lines.length > 1) {
          const dataLine = parseCSVLine(lines[1]);
          const startDate = dataLine[0]?.trim() || '';
          const endDate = dataLine[1]?.trim() || '';
          setWeekDates({ start: startDate, end: endDate });
        }

        // Processar dados das aulas (a partir da linha 2, começando na coluna C)
        const courses: { [key: string]: ClassInfo[] } = {};

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Parse CSV com suporte a aspas
          const cells = parseCSVLine(line);
          
          // Dados começam na coluna C (índice 2)
          if (cells.length < 5) continue;

          const curso = cells[2]?.trim() || '';
          const periodo = cells[3]?.trim() || '';
          const materia = cells[4]?.trim() || '';
          const professor = cells[5]?.trim() || '';
          const cargaHoraria = cells[6]?.trim() || '';
          const observacao = cells[7]?.trim() || '';

          if (!curso || !periodo || !materia) continue;

          // Inicializar curso se não existir
          if (!courses[curso]) {
            courses[curso] = [];
          }

          // Determinar cor baseado no curso
          const colorObj = courseColors[curso] || { border: 'border-gray-400', bg: 'bg-gray-50' };

          // Criar ID único
          const id = `${curso.toLowerCase()}-${periodo.toLowerCase()}-${i}`;

          courses[curso].push({
            id,
            period: `${periodo} Período`,
            subject: materia,
            professor: professor || undefined,
            hours: cargaHoraria || undefined,
            observation: observacao || undefined,
            color: colorObj.border,
            bgColor: colorObj.bg,
          });
        }

        // Converter para array de CourseData
        const coursesList: CourseData[] = [
          {
            name: 'Pedagogia',
            bgColor: 'from-purple-400 to-purple-500',
            classes: courses['Pedagogia'] || [],
          },
          {
            name: 'Letras/Português',
            bgColor: 'from-blue-400 to-blue-500',
            classes: courses['Letras'] || [],
          },
        ].filter(course => course.classes.length > 0);

        setCoursesData(coursesList);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados da planilha. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchSheetData();
  }, []);

  // Parser CSV que respeita aspas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current);
    return result;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const hasDetails = (classInfo: ClassInfo) => {
    return classInfo.professor || classInfo.hours || classInfo.observation;
  };

  const isNoClass = (classInfo: ClassInfo) => {
    return classInfo.subject === 'Sem agendamento';
  };

  // Estado de carregamento
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

  // Estado de erro
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
      {/* Cabeçalho */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="py-4 px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="max-w-7xl mx-auto">
            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between">
              {/* Logo - Desktop */}
              <div className="flex-shrink-0">
                <img 
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030187894/57Ypr7wbFX6eHCZZ7V6o8w/logo_cc3239cb.png" 
                  alt="Unimontes Logo" 
                  className="h-12 md:h-14 w-auto"
                />
              </div>

              {/* Navegacao Principal - Desktop */}
              <div className="flex items-center gap-2 md:gap-4 lg:gap-6 flex-1 justify-center flex-nowrap min-w-0 overflow-hidden">
                <button
                  onClick={() => handleNavClick('agenda')}
                  className={`text-xs md:text-sm lg:text-base font-semibold transition-all duration-300 pb-2 whitespace-nowrap flex-shrink-0 ${
                    activeSection === 'agenda'
                      ? 'text-blue-600 border-b-3 border-blue-600'
                      : 'text-gray-600 hover:text-blue-600 border-b-3 border-transparent'
                  }`}
                >
                  Agenda Semanal
                </button>
                <button
                  onClick={() => handleNavClick('noticias')}
                  className={`text-xs md:text-sm lg:text-base font-semibold transition-all duration-300 pb-2 whitespace-nowrap flex-shrink-0 ${
                    activeSection === 'noticias'
                      ? 'text-blue-600 border-b-3 border-blue-600'
                      : 'text-gray-600 hover:text-blue-600 border-b-3 border-transparent'
                  }`}
                >
                  Notícias
                </button>
                <button
                  onClick={() => handleNavClick('calendario')}
                  className="text-xs md:text-sm lg:text-base font-semibold transition-all duration-300 pb-2 text-gray-600 hover:text-blue-600 border-b-3 border-transparent whitespace-nowrap flex-shrink-0"
                >
                  Calendário Escolar
                </button>
                <button
                  onClick={() => handleNavClick('editais')}
                  className="text-xs md:text-sm lg:text-base font-semibold transition-all duration-300 pb-2 text-gray-600 hover:text-blue-600 border-b-3 border-transparent whitespace-nowrap flex-shrink-0"
                >
                  Editais
                </button>
              </div>

              {/* Ícones de Redes Sociais - Desktop */}
              <div className="flex items-center gap-4">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/unimontes.almenara"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-pink-600 transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/5538991840146?text=Olá%20Unimontes%20Campus%20Almenara"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"/>
                </svg>
              </a>

              {/* Localização */}
              <a
                href="https://www.google.com/maps/place/Universidade+Estadual+de+Montes+Claros-Campus+Almenara/@-16.1728886,-40.6997711,19.5z/data=!4m6!3m5!1s0x74979a777fe4b51:0xa5de31e5bfa50efc!8m2!3d-16.1728958!4d-40.6993386!16s%2Fg%2F1tk4rb_5?entry=ttu&g_ep=EgoyMDI2MDQxMi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-red-600 transition-colors duration-300"
                aria-label="Localização"
              >
                <MapPin size={24} />
              </a>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden flex items-center justify-center relative">
              {/* Menu Hamburger - Mobile (Esquerda Absoluta) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-blue-600 transition-colors absolute left-0"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Logo - Mobile (Centro Absoluto) */}
              <div className="flex justify-center">
                <img 
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030187894/57Ypr7wbFX6eHCZZ7V6o8w/logo_cc3239cb.png" 
                  alt="Unimontes Logo" 
                  className="h-10 w-auto"
                />
              </div>

              {/* Ícones de Redes Sociais - Mobile (Direita Absoluta) */}
              <div className="flex items-center gap-2 absolute right-0">
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/unimontes.almenara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/5538991840146?text=Olá%20Unimontes%20Campus%20Almenara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 transition-colors duration-300"
                  aria-label="WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M26.576 5.363c-2.69-2.69-6.406-4.354-10.511-4.354-8.209 0-14.865 6.655-14.865 14.865 0 2.732 0.737 5.291 2.022 7.491l-0.038-0.070-2.109 7.702 7.879-2.067c2.051 1.139 4.498 1.809 7.102 1.809h0.006c8.209-0.003 14.862-6.659 14.862-14.868 0-4.103-1.662-7.817-4.349-10.507l0 0zM16.062 28.228h-0.005c-0 0-0.001 0-0.001 0-2.319 0-4.489-0.64-6.342-1.753l0.056 0.031-0.451-0.267-4.675 1.227 1.247-4.559-0.294-0.467c-1.185-1.862-1.889-4.131-1.889-6.565 0-6.822 5.531-12.353 12.353-12.353s12.353 5.531 12.353 12.353c0 6.822-5.53 12.353-12.353 12.353h-0zM22.838 18.977c-0.371-0.186-2.197-1.083-2.537-1.208-0.341-0.124-0.589-0.185-0.837 0.187-0.246 0.371-0.958 1.207-1.175 1.455-0.216 0.249-0.434 0.279-0.805 0.094-1.15-0.466-2.138-1.087-2.997-1.852l0.010 0.009c-0.799-0.74-1.484-1.587-2.037-2.521l-0.028-0.052c-0.216-0.371-0.023-0.572 0.162-0.757 0.167-0.166 0.372-0.434 0.557-0.65 0.146-0.179 0.271-0.384 0.366-0.604l0.006-0.017c0.043-0.087 0.068-0.188 0.068-0.296 0-0.131-0.037-0.253-0.101-0.357l0.002 0.003c-0.094-0.186-0.836-2.014-1.145-2.758-0.302-0.724-0.609-0.625-0.836-0.637-0.216-0.010-0.464-0.012-0.712-0.012-0.395 0.010-0.746 0.188-0.988 0.463l-0.001 0.002c-0.802 0.761-1.3 1.834-1.3 3.023 0 0.026 0 0.053 0.001 0.079l-0-0.004c0.131 1.467 0.681 2.784 1.527 3.857l-0.012-0.015c1.604 2.379 3.742 4.282 6.251 5.564l0.094 0.043c0.548 0.248 1.25 0.513 1.968 0.74l0.149 0.041c0.442 0.14 0.951 0.221 1.479 0.221 0.303 0 0.601-0.027 0.889-0.078l-0.031 0.004c1.069-0.223 1.956-0.868 2.497-1.749l0.009-0.017c0.165-0.366 0.261-0.793 0.261-1.242 0-0.185-0.016-0.366-0.047-0.542l0.003 0.019c-0.092-0.155-0.34-0.247-0.712-0.434z"/>
                  </svg>
                </a>

                {/* Localização */}
                <a
                  href="https://www.google.com/maps/place/Universidade+Estadual+de+Montes+Claros-Campus+Almenara/@-16.1728886,-40.6997711,19.5z/data=!4m6!3m5!1s0x74979a777fe4b51:0xa5de31e5bfa50efc!8m2!3d-16.1728958!4d-40.6993386!16s%2Fg%2F1tk4rb_5?entry=ttu&g_ep=EgoyMDI2MDQxMi4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-red-600 transition-colors duration-300"
                  aria-label="Localização"
                >
                  <MapPin size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Lateral Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-md z-40 max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="px-4 py-4 space-y-2">
            <button
              onClick={() => handleNavClick('agenda')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeSection === 'agenda'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Agenda Semanal
            </button>
            <button
              onClick={() => handleNavClick('noticias')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeSection === 'noticias'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Notícias
            </button>
            <button
              onClick={() => handleNavClick('calendario')}
              className="w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-gray-600 hover:bg-gray-100"
            >
              Calendário Escolar
            </button>
            <button
              onClick={() => handleNavClick('editais')}
              className="w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-gray-600 hover:bg-gray-100"
            >
              Editais
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="py-8 md:py-12 px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="max-w-7xl mx-auto">
          {/* Seção de Agenda */}
          <div id="agenda-section">
          {/* Header Card - Imagem + Barra Azul */}
          <div className="header-card rounded-lg overflow-hidden mb-8 shadow-md">
            {/* Hero Section com Imagem de Agenda Semanal */}
            <div
              className="relative w-full"
              style={{
                backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310419663030187894/57Ypr7wbFX6eHCZZ7V6o8w/agenda%20semanal_b5d79cb6.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                paddingBottom: '40%',
              }}
            >
              {/* Overlay suave */}
              <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* Título da Semana */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4">
              <div className="py-2 md:py-3">
                <h2 className="text-lg md:text-xl font-bold text-center border-3 border-white rounded-lg px-4 py-1">
                  {weekDates.start && weekDates.end
                    ? `Semana de ${weekDates.start} a ${weekDates.end}`
                    : 'Carregando semana...'}
                </h2>
              </div>
            </div>
          </div>
          {/* Cursos */}
          {coursesData.length > 0 ? (
            coursesData.map((course) => (
              <div key={course.name} className="mb-12">
                {/* Header do Curso */}
                <div className={`bg-gradient-to-r ${course.bgColor} text-white rounded-lg p-6 mb-6 shadow-lg`}>
                  <h3 className="text-2xl md:text-3xl font-bold">{course.name}</h3>
                </div>

                {/* Grid de Turmas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.classes.map((classInfo) => (
                    <div
                      key={classInfo.id}
                      className="transition-all duration-300 ease-out"
                    >
                      <button
                        onClick={() => toggleExpand(classInfo.id)}
                        className={`w-full text-left rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                          isNoClass(classInfo)
                            ? 'bg-gradient-to-br from-gray-100 to-gray-50 border-l-4 border-gray-300 opacity-75 cursor-not-allowed'
                            : `border-l-4 ${classInfo.color} ${classInfo.bgColor}`
                        }`}
                        disabled={isNoClass(classInfo)}
                      >
                        {/* Header do Card */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                {classInfo.period}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {isNoClass(classInfo) && (
                                  <Coffee size={18} className="text-gray-400 flex-shrink-0" />
                                )}
                                <h3 className={`text-base md:text-lg font-bold line-clamp-2 pr-2 ${
                                  isNoClass(classInfo) ? 'text-gray-500 italic' : 'text-gray-900'
                                }`}>
                                  {classInfo.subject}
                                </h3>
                              </div>
                            </div>
                            {hasDetails(classInfo) && !isNoClass(classInfo) && (
                              <ChevronDown
                                size={20}
                                className={`flex-shrink-0 text-gray-600 transition-transform duration-300 ${
                                  expandedId === classInfo.id ? 'rotate-180' : ''
                                }`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Conteúdo Expandido */}
                        {hasDetails(classInfo) && (
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-out ${
                              expandedId === classInfo.id ? 'max-h-96' : 'max-h-0'
                            }`}
                          >
                            <div className="px-4 pb-4 pt-6 border-t border-gray-200 space-y-3 bg-gray-50">
                              {/* Matéria */}
                              <div className="flex items-start gap-3">
                                <BookOpen size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase">
                                    Matéria
                                  </p>
                                  <p className="text-sm md:text-base font-semibold text-gray-900">
                                    {classInfo.subject}
                                  </p>
                                </div>
                              </div>

                              {/* Professor */}
                              {classInfo.professor && (
                                <div className="flex items-start gap-3">
                                  <User size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                      Professor
                                    </p>
                                    <p className="text-sm md:text-base font-semibold text-gray-900">
                                      {classInfo.professor}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Carga Horária */}
                              {classInfo.hours && (
                                <div className="flex items-start gap-3">
                                  <Clock size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                      Carga Horária
                                    </p>
                                    <p className="text-sm md:text-base font-semibold text-gray-900">
                                      {classInfo.hours}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Observação */}
                              {classInfo.observation && (
                                <div className="flex items-start gap-3">
                                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase">
                                      Observação
                                    </p>
                                    <p className="text-sm md:text-base text-gray-900">
                                      {classInfo.observation}
                                    </p>
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
          {/* Fim da Seção de Agenda */}

          {/* Seção de Notícias */}
          <div id="noticias-section" className="mt-16">
            <NewsSection />
          </div>
          {/* Fim da Seção de Notícias */}

        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8 px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold">
            Universidade Estadual de Montes Claros - UNIMONTES - Campus Almenara
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © 2026 - Desenvolvido por Secretaria da Unimontes - Campus Almenara
          </p>
        </div>
      </div>
    </div>
  );
}
