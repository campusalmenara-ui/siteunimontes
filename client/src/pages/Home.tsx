import { useState } from 'react';
import { ChevronDown, BookOpen, User, Clock, AlertCircle } from 'lucide-react';

/**
 * Design Philosophy: Lúdico Azul e Amarelo
 * - Cores vibrantes: Azul (#4A90E2) + Amarelo (#FDB913)
 * - Cards com borda colorida à esquerda
 * - Expansão vertical ao clicar
 * - Tipografia: Poppins (títulos) + Inter (corpo)
 * - Animações suaves 250-300ms
 * - Organização por curso (Pedagogia e Letras/Português)
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

const coursesData: CourseData[] = [
  {
    name: 'Pedagogia',
    bgColor: 'from-purple-400 to-purple-500',
    classes: [
      {
        id: 'ped-1',
        period: '1º Período',
        subject: 'Sem agendamento',
        color: 'border-purple-400',
      },
      {
        id: 'ped-3',
        period: '3º Período',
        subject: 'Linguagem na Educação Infantil',
        professor: 'Rossane Glads',
        hours: '60h',
        color: 'border-purple-500',
      },
      {
        id: 'ped-5',
        period: '5º Período',
        subject: 'Fund. Metod. Ens. Geografia AIEF',
        professor: 'Sérgio Renato',
        hours: '60h',
        color: 'border-purple-600',
      },
      {
        id: 'ped-6',
        period: '6º Período',
        subject: 'Estágio Supervisionado II',
        professor: 'Mary Durães',
        hours: '120h',
        color: 'border-purple-700',
      },
      {
        id: 'ped-8',
        period: '8º Período',
        subject: 'Sem agendamento',
        color: 'border-purple-800',
      },
    ],
  },
  {
    name: 'Letras (Português)',
    bgColor: 'from-blue-400 to-blue-500',
    classes: [
      {
        id: 'let-6',
        period: '6º Período',
        subject: 'Linguística Aplicada',
        professor: 'Prof. Exemplo',
        hours: '60h',
        color: 'border-blue-500',
      },
      {
        id: 'let-8',
        period: '8º Período',
        subject: 'Sem agendamento',
        color: 'border-blue-600',
      },
    ],
  },
];

export default function Home() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const hasDetails = (classInfo: ClassInfo) => {
    return classInfo.professor || classInfo.hours || classInfo.observation;
  };

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
          <h2 className="text-xl md:text-2xl font-bold text-center">
            Semana de 06/04 a 11/04
          </h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 md:py-12">
        {/* Instruções */}
        <div className="mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg shadow-sm">
          <p className="text-sm md:text-base text-gray-800">
            <span className="font-bold text-yellow-700">💡 Dica:</span> Clique em sua turma para ver os detalhes da aula da próxima semana
          </p>
        </div>

        {/* Cursos */}
        {coursesData.map((course) => (
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
                    className={`w-full text-left bg-white border-l-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${classInfo.color}`}
                  >
                    {/* Header do Card */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            {classInfo.period}
                          </p>
                          <h3 className="text-base md:text-lg font-bold text-gray-900 mt-1 line-clamp-2">
                            {classInfo.subject}
                          </h3>
                        </div>
                        {hasDetails(classInfo) && (
                          <ChevronDown
                            size={20}
                            className={`flex-shrink-0 text-gray-600 transition-transform duration-300 ${
                              expandedId === classInfo.id ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Espaçador entre o título e o conteúdo expandido */}
                    {hasDetails(classInfo) && expandedId === classInfo.id && (
                      <div className="h-4"></div>
                    )}

                    {/* Conteúdo Expandido */}
                    {hasDetails(classInfo) && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-out ${
                          expandedId === classInfo.id ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <div className="px-4 pb-4 pt-0 border-t border-gray-200 space-y-3 bg-gray-50">
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
        ))}

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t-2 border-yellow-300 text-center">
          <p className="text-sm text-gray-600 font-semibold">
            Agenda da Semana - Unimontes Campus Almenara
          </p>
          <p className="text-xs text-gray-500 mt-2">
            @unimontes.almenara
          </p>
        </div>
      </div>
    </div>
  );
}
