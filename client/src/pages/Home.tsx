import { useState, useEffect } from 'react';
import { ChevronDown, BookOpen, User, Clock, AlertCircle, Coffee } from 'lucide-react';

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
}

interface CourseData {
  name: string;
  classes: ClassInfo[];
  bgColor: string;
}

// Cores para cada período (alternando entre cursos)
const periodColors: { [key: string]: { [key: string]: string } } = {
  'Pedagogia': {
    '1º': 'border-purple-400',
    '2º': 'border-purple-500',
    '3º': 'border-purple-500',
    '4º': 'border-purple-600',
    '5º': 'border-purple-600',
    '6º': 'border-purple-700',
    '7º': 'border-purple-700',
    '8º': 'border-purple-800',
  },
  'Letras': {
    '1º': 'border-blue-400',
    '2º': 'border-blue-500',
    '3º': 'border-blue-500',
    '4º': 'border-blue-600',
    '5º': 'border-blue-600',
    '6º': 'border-blue-500',
    '7º': 'border-blue-600',
    '8º': 'border-blue-600',
  },
};

export default function Home() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [coursesData, setCoursesData] = useState<CourseData[]>([]);
  const [weekDates, setWeekDates] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

          // Determinar cor baseado no período
          const colorKey = periodo.replace('º', '').replace('ª', '');
          const color = periodColors[curso]?.[colorKey] || 'border-gray-400';

          // Criar ID único
          const id = `${curso.toLowerCase()}-${periodo.toLowerCase()}-${i}`;

          courses[curso].push({
            id,
            period: `${periodo} Período`,
            subject: materia,
            professor: professor || undefined,
            hours: cargaHoraria || undefined,
            observation: observacao || undefined,
            color,
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
            name: 'Letras',
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
      {/* Hero Section com Imagem Personalizada */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310419663030187894/57Ypr7wbFX6eHCZZ7V6o8w/FaculdadeDivertidaAzuleAmareloCapaparaFacebook_59750132.png)',
          backgroundSize: '100% auto',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          aspectRatio: '16 / 9',
        }}
      >
        {/* Overlay suave */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Título da Semana */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-6 px-4">
        <div className="container">
          <h2 className="text-xl md:text-2xl font-bold text-center border-3 border-white rounded-lg px-4 py-2">
            {weekDates.start && weekDates.end
              ? `Semana de ${weekDates.start} a ${weekDates.end}`
              : 'Carregando semana...'}
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 md:py-12 px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="max-w-7xl mx-auto">
        {/* Instruções */}
        <div className="mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg shadow-sm">
          <p className="text-sm md:text-base text-gray-800">
            <span className="font-bold text-yellow-700">💡 Dica:</span> Clique em sua turma para ver os detalhes da aula da próxima semana
          </p>
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
                      className={`w-full text-left border-l-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                        isNoClass(classInfo)
                          ? 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-300 opacity-75 cursor-not-allowed'
                          : `bg-white ${classInfo.color}`
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

          {/* Footer Info */}
          <div className="mt-12 pt-8 border-t-2 border-yellow-300 text-center">
            <p className="text-sm text-gray-600 font-semibold">
              Agenda da Semana - Unimontes Campus Almenara
            </p>
            <p className="text-xs text-gray-500 mt-2">
              
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
