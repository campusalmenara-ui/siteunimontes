import { useState } from 'react';
import { ChevronDown, MapPin, Clock, Phone, Mail, BookOpen, Monitor, Users, Building2, GraduationCap, Wifi } from 'lucide-react';
import { Header } from '@/components/Header';

const cursos = [
  {
    nome: 'Pedagogia',
    cor: 'from-purple-500 to-purple-600',
    corLight: 'bg-purple-50 border-purple-200',
    corTexto: 'text-purple-700',
    cidade: 'Almenara',
    turno: 'Noturno',
    area: 'Ciências Humanas',
    modalidade: 'Licenciatura',
    unidade: 'Centro de Ciências Humanas — CCH',
    duracao: '8 Períodos (4 anos)',
    ingresso: 'SISU (ENEM) e Vestibular Próprio COTEPS',
    sobre: 'O curso de Pedagogia forma educadores aptos a atuar na Educação Infantil, nos Anos Iniciais do Ensino Fundamental e na gestão escolar. A formação é sólida em fundamentos filosóficos, sociológicos e psicológicos da educação, aliando teoria à prática por meio de estágios supervisionados desde os primeiros períodos.',
    diferencial: 'A Unimontes Campus Almenara oferece o curso em parceria direta com escolas públicas da região, proporcionando aos estudantes vivência real na educação básica local. O vínculo com programas como PIBID e Residência Pedagógica amplia as oportunidades de formação prática com bolsas.',
    atuacao: 'Docência na Educação Infantil e Anos Iniciais do Ensino Fundamental, coordenação e supervisão pedagógica, gestão escolar, EJA (Educação de Jovens e Adultos) e educação especial/inclusiva.',
  },
  {
    nome: 'Letras / Português',
    cor: 'from-blue-500 to-blue-600',
    corLight: 'bg-blue-50 border-blue-200',
    corTexto: 'text-blue-700',
    cidade: 'Almenara',
    turno: 'Noturno',
    area: 'Linguística, Letras e Artes',
    modalidade: 'Licenciatura',
    unidade: 'Centro de Ciências Humanas — CCH',
    duracao: '8 Períodos (4 anos)',
    ingresso: 'SISU (ENEM) e Vestibular Próprio COTEPS',
    sobre: 'O curso de Letras com habilitação em Língua Portuguesa forma professores para o ensino de Língua Portuguesa e Literatura nos níveis fundamental e médio. O currículo abrange estudos linguísticos, literatura brasileira e portuguesa, produção textual e metodologias de ensino.',
    diferencial: 'A formação em Letras na Unimontes Almenara valoriza a diversidade cultural da região do Vale do Jequitinhonha, integrando estudos de linguagem com a realidade social local. O curso incentiva a pesquisa e a extensão como parte da formação docente.',
    atuacao: 'Docência de Língua Portuguesa e Literatura no Ensino Fundamental e Médio, produção e revisão de textos, assessoria de comunicação, mediação cultural e atuação em projetos de letramento.',
  },
];

const estrutura = [
  { icone: Monitor,    texto: '6 salas de aula equipadas com Data-Show' },
  { icone: Users,      texto: '1 auditório para eventos e palestras' },
  { icone: BookOpen,   texto: '1 biblioteca com acervo físico e digital' },
  { icone: Wifi,       texto: '1 laboratório de informática (UAB)' },
];

function CursoCard({ curso }: { curso: typeof cursos[0] }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${aberto ? 'shadow-lg ' + curso.corLight : 'border-gray-200 bg-white hover:shadow-md'}`}>
      {/* Header clicável */}
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between p-5 text-left group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${curso.cor} flex items-center justify-center flex-shrink-0`}>
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{curso.nome}</h3>
            <p className="text-sm text-gray-500">{curso.modalidade} · {curso.turno}</p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${aberto ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Conteúdo expandido */}
      {aberto && (
        <div className="px-5 pb-6 border-t border-gray-100 pt-5">

          {/* Ficha técnica */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Cidade', value: curso.cidade },
              { label: 'Turno', value: curso.turno },
              { label: 'Área', value: curso.area },
              { label: 'Modalidade', value: curso.modalidade },
              { label: 'Duração', value: curso.duracao },
              { label: 'Unidade', value: curso.unidade },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-gray-100">
                <p className="text-xs text-gray-400 font-medium mb-0.5">{item.label}</p>
                <p className="text-sm text-gray-700 font-semibold leading-tight">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Seções de conteúdo */}
          {[
            { titulo: 'Sobre o Curso', conteudo: curso.sobre },
            { titulo: 'Diferencial na Unimontes', conteudo: curso.diferencial },
            { titulo: 'Áreas de Atuação', conteudo: curso.atuacao },
          ].map((secao, i) => (
            <div key={i} className="mb-4">
              <h4 className={`text-sm font-bold uppercase tracking-wide mb-2 ${curso.corTexto}`}>{secao.titulo}</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{secao.conteudo}</p>
            </div>
          ))}

          {/* Forma de ingresso */}
          <div className={`rounded-xl p-4 ${curso.corLight} border mt-4`}>
            <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${curso.corTexto}`}>Forma de Ingresso</p>
            <p className="text-gray-700 text-sm">{curso.ingresso}</p>
            <p className="text-xs text-gray-500 mt-1">
              Mais informações em{' '}
              <a href="https://www.coteps.unimontes.br/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">coteps.unimontes.br</a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sobre() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-yellow-50">
      <Header />

      {/* Hero — Foto + Título + Introdução + Estrutura */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500">
        {/* Padrão geométrico de fundo */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Texto */}
            <div>
              <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
                Unimontes
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-2">
                Bem-vindo ao
              </h1>
              <h2 className="text-4xl md:text-6xl font-black text-yellow-300 leading-tight mb-6">
                Campus Almenara
              </h2>
              <p className="text-blue-100 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                O Campus de Almenara da Unimontes foi criado pelo Decreto Estadual nº 41.434, de 15 de dezembro de 2000, após aprovação do Conselho Universitário em 20/12/1999. As atividades começaram em março de 2001 com o Curso Normal Superior, expandindo posteriormente para os cursos de Letras/Português e Pedagogia — formando gerações de educadores no Vale do Jequitinhonha.
              </p>

              {/* Estrutura em destaque */}
              <div className="grid grid-cols-2 gap-3">
                {estrutura.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <item.icone size={18} className="text-yellow-300 flex-shrink-0" />
                    <span className="text-white text-xs leading-tight">{item.texto}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Imagem do campus */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Unimontes_-_Almenara.jpg/1200px-Unimontes_-_Almenara.jpg"
                  alt="Campus Almenara - Unimontes"
                  className="w-full h-72 md:h-96 object-cover"
                  onError={e => {
                    const el = e.target as HTMLImageElement;
                    el.parentElement!.innerHTML = `
                      <div class="w-full h-72 md:h-96 bg-gradient-to-br from-blue-800 to-blue-900 flex flex-col items-center justify-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        <p style="color:rgba(255,255,255,0.4);font-size:14px">Campus Almenara</p>
                      </div>
                    `;
                  }}
                />
              </div>
              {/* Badge flutuante */}
              <div className="absolute -bottom-4 -left-4 bg-yellow-400 text-blue-900 rounded-2xl px-4 py-3 shadow-lg">
                <p className="text-xs font-bold uppercase tracking-wide">Fundado em</p>
                <p className="text-2xl font-black">2000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-16">

        {/* Seção Cursos */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="text-blue-600" size={22} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Cursos Oferecidos</h2>
          </div>
          <p className="text-gray-500 mb-8 ml-12">Clique em um curso para ver detalhes completos sobre a formação.</p>
          <div className="space-y-3">
            {cursos.map((curso, i) => (
              <CursoCard key={i} curso={curso} />
            ))}
          </div>
        </div>

        {/* Seção Contatos */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Phone className="text-blue-600" size={22} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Contatos do Campus</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* Card principal */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg">Campus Almenara</p>
                  <p className="text-blue-200 text-sm">Unimontes</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-yellow-300 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Rua Doutor Sabino Silva, nº 1<br />
                    Bairro Santo Antônio — CEP: 39900-000<br />
                    Almenara — MG
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-yellow-300 flex-shrink-0" />
                  <p className="text-blue-100 text-sm">07h às 22h30min</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-yellow-300 flex-shrink-0" />
                  <a href="https://wa.me/5538991840146" target="_blank" rel="noopener noreferrer"
                    className="text-white text-sm font-semibold hover:text-yellow-300 transition-colors">
                    (38) 99184-0146 — WhatsApp
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-yellow-300 flex-shrink-0" />
                  <a href="mailto:campus.almenara@unimontes.br"
                    className="text-white text-sm font-semibold hover:text-yellow-300 transition-colors break-all">
                    campus.almenara@unimontes.br
                  </a>
                </div>
              </div>
            </div>

            {/* Card coordenação */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-lg">Coordenação</p>
                  <p className="text-gray-500 text-sm">Direção do Campus</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Coordenador</p>
                  <p className="font-bold text-gray-800">Sérgio Renato Oliveira</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Horário de Atendimento</p>
                    <p className="text-gray-700 text-sm font-semibold">07h às 22h30min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">E-mail Institucional</p>
                    <a href="mailto:campus.almenara@unimontes.br"
                      className="text-blue-600 text-sm hover:underline break-all">
                      campus.almenara@unimontes.br
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">WhatsApp</p>
                    <a href="https://wa.me/5538991840146" target="_blank" rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline">
                      (38) 99184-0146
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 bg-white border-t border-gray-100 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Unimontes — Campus Almenara
      </footer>
    </div>
  );
}
