import { useState } from 'react';
import { ChevronDown, BookOpen, User, Clock, AlertCircle } from 'lucide-react';

/**
 * Design Philosophy: Corporativo Moderno com Accent Dinâmico
 * - Cards com borda colorida à esquerda
 * - Expansão vertical ao clicar
 * - Tipografia: Poppins (títulos) + Inter (corpo)
 * - Cores: Azul marinho (#001F4D) + Vermelho (#E63946)
 * - Animações suaves 250-300ms
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

const classesData: ClassInfo[] = [
  {
    id: '1',
    period: '1º Período',
    subject: 'Sem agendamento',
    color: 'from-blue-400 to-blue-500',
  },
  {
    id: '3',
    period: '3º Período',
    subject: 'Linguagem na Educação Infantil',
    professor: 'Rossane Glads',
    hours: '60h',
    color: 'from-purple-400 to-purple-500',
  },
  {
    id: '5',
    period: '5º Período',
    subject: 'Fund. Metod. Ens. Geografia AIEF',
    professor: 'Sérgio Renato',
    hours: '60h',
    color: 'from-green-400 to-green-500',
  },
  {
    id: '6',
    period: '6º Período',
    subject: 'Estágio Supervisionado II',
    professor: 'Mary Durães',
    hours: '120h',
    color: 'from-orange-400 to-orange-500',
  },
  {
    id: '8',
    period: '8º Período',
    subject: 'Sem agendamento',
    color: 'from-red-400 to-red-500',
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative w-full h-64 md:h-80 bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310419663030187894/57Ypr7wbFX6eHCZZ7V6o8w/hero-background-Ezp326BvRDVjonJnBEVwAF.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay para melhor legibilidade */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Conteúdo do Hero */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Agenda Semanal
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-4">
            Pedagogia - Almenara
          </p>
          <p className="text-base md:text-lg text-white/80">
            06/04 a 11/04
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 md:py-12">
        {/* Instruções */}
        <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm md:text-base text-gray-700">
            <span className="font-semibold text-blue-900">💡 Dica:</span> Clique em sua turma para ver os detalhes da aula da próxima semana
          </p>
        </div>

        {/* Grid de Turmas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classesData.map((classInfo) => (
            <div
              key={classInfo.id}
              className="transition-all duration-300 ease-out"
            >
              <button
                onClick={() => toggleExpand(classInfo.id)}
                className={`w-full text-left bg-white border-l-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${classInfo.color.split(' ')[0] === 'from-blue-400' ? 'border-blue-500' : classInfo.color.split(' ')[0] === 'from-purple-400' ? 'border-purple-500' : classInfo.color.split(' ')[0] === 'from-green-400' ? 'border-green-500' : classInfo.color.split(' ')[0] === 'from-orange-400' ? 'border-orange-500' : 'border-red-500'}`}
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
                          <User size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
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

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Agenda atualizada para a semana de <span className="font-semibold">06 a 11 de abril</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">
            @unimontes.almenara
          </p>
        </div>
      </div>
    </div>
  );
}
