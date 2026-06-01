import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Info } from 'lucide-react';
import { Header } from '@/components/Header';

interface Solicitacao {
  titulo: string;
  conteudo: string | null; // null = conteúdo a preencher
}

const solicitacoes: Solicitacao[] = [
  { titulo: 'Abono de Faltas', conteudo: null },
  { titulo: 'Acesso ao WEBGIZ ("WebAluno")', conteudo: null },
  { titulo: 'Aproveitamento de Carga Horária (PIBID/RP) para Estágio', conteudo: null },
  { titulo: 'Alteração de Dados Cadastrais', conteudo: null },
  { titulo: 'Cancelamento de Matrícula em Disciplina (Apenas uma)', conteudo: null },
  { titulo: 'Colação de Grau / Colação Extemporânea (depois do prazo)', conteudo: null },
  { titulo: 'Declaração no Formato Digital', conteudo: null },
  { titulo: 'Declaração Impressa', conteudo: null },
  { titulo: 'Desistência de Curso', conteudo: null },
  { titulo: 'Diplomas Graduação - 1ª VIA', conteudo: null },
  { titulo: 'Diplomas Graduação - 2ª VIA', conteudo: null },
  { titulo: 'Diplomas/Certificados Pós-Graduação - 1ª VIA', conteudo: null },
  { titulo: 'Diplomas/Certificados Pós-Graduação - 2ª VIA', conteudo: null },
  { titulo: 'Dispensa de Disciplinas / Aproveitamento de Estudos', conteudo: null },
  { titulo: 'Documentos Pendentes', conteudo: null },
  { titulo: 'Ementas', conteudo: null },
  { titulo: 'Equivalência Curricular', conteudo: null },
  { titulo: 'Históricos no Formato Digital', conteudo: null },
  { titulo: 'Históricos Impressos', conteudo: null },
  { titulo: 'Matrícula em Disciplina de Outro Curso (Multicurso)', conteudo: null },
  { titulo: 'Matrícula Fora do Prazo (Renovação)', conteudo: null },
  { titulo: 'Matriz Curricular', conteudo: null },
  { titulo: 'Nome Social', conteudo: null },
  { titulo: 'Obtenção de Novo Título', conteudo: null },
  { titulo: 'Plano de Ensino', conteudo: null },
  { titulo: 'Prova de 2ª Oportunidade', conteudo: null },
  { titulo: 'Renovação de Matrícula', conteudo: null },
  { titulo: 'Retorno ao Curso', conteudo: null },
  { titulo: 'Revisão de Nota / Prova', conteudo: null },
  { titulo: 'Tratamento Excepcional (Atestado Médico a partir de 4 dias)', conteudo: null },
  { titulo: 'Trancamento de Curso', conteudo: null },
  { titulo: 'Transferência EX-OFFÍCIO', conteudo: null },
  { titulo: 'Transferência Externa', conteudo: null },
  { titulo: 'Transferência Interna', conteudo: null },
];

export default function Solicitacoes() {
  const [aberto, setAberto] = useState<number | null>(null);
  const [busca, setBusca] = useState('');

  const filtradas = solicitacoes.filter(s =>
    s.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-yellow-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-10">

        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Solicitações</h1>
          </div>
          <p className="text-gray-500 leading-relaxed">
            Encontre abaixo as informações sobre como realizar cada tipo de solicitação junto à Secretaria Geral do Campus Almenara. Clique em um item para ver os detalhes e o passo a passo.
          </p>
        </div>

        {/* Busca */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Buscar solicitação..."
            value={busca}
            onChange={e => { setBusca(e.target.value); setAberto(null); }}
            className="w-full px-5 py-3 pl-12 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400"
          />
          <svg className="absolute left-4 top-3.5 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>

        {/* Lista */}
        {filtradas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>Nenhuma solicitação encontrada para "<strong>{busca}</strong>"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtradas.map((s, i) => {
              const isOpen = aberto === i;
              return (
                <div
                  key={i}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-blue-300 bg-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setAberto(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        isOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}>
                        {isOpen ? '−' : '+'}
                      </span>
                      <span className={`font-semibold transition-colors ${isOpen ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-600'}`}>
                        {s.titulo}
                      </span>
                    </div>
                    {isOpen ? <ChevronUp size={18} className="text-blue-500 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-blue-100">
                      <div className="mt-4">
                        {s.conteudo ? (
                          <p className="text-gray-600 leading-relaxed">{s.conteudo}</p>
                        ) : (
                          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
                            <p className="text-blue-600 text-sm">
                              Conteúdo em breve. As instruções detalhadas sobre como realizar esta solicitação serão adicionadas em breve.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-10">
          {filtradas.length} solicitação{filtradas.length !== 1 ? 'ões' : ''} {busca ? 'encontrada' + (filtradas.length !== 1 ? 's' : '') : 'disponíve' + (filtradas.length !== 1 ? 'is' : 'l')}
        </p>
      </main>

      <footer className="mt-16 py-8 bg-white border-t border-gray-100 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Unimontes — Campus Almenara
      </footer>
    </div>
  );
}
