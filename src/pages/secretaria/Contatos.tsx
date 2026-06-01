import { useState, useEffect } from 'react';
import { Mail, Phone, Clock, AlertCircle } from 'lucide-react';
import { Header } from '@/components/Header';

interface Contato {
  curso: string;
  responsavel: string;
  ramal: string;
  horario: string;
  emailSecretaria: string;
  emailCoordenacao: string;
}

const SHEET_ID = '1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0';
const GID_CONTATOS = '31373278';

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

export default function Contatos() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const fetchContatos = async () => {
      try {
        setLoading(true);
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_CONTATOS}`;
        const res = await fetch(url);
        const csv = await res.text();
        const lines = csv.trim().split('\n').slice(1);

        const parsed: Contato[] = lines
          .map(l => parseCSVLine(l))
          .filter(cells => cells[0]?.trim())
          .map(cells => ({
            curso: cells[0]?.trim() || '',
            responsavel: cells[1]?.trim() || '',
            ramal: cells[2]?.trim() || '',
            horario: cells[3]?.trim() || '',
            emailSecretaria: cells[4]?.trim() || '',
            emailCoordenacao: cells[5]?.trim() || '',
          }));

        setContatos(parsed);
      } catch (err) {
        setError('Não foi possível carregar os contatos. Verifique se a planilha está pública.');
      } finally {
        setLoading(false);
      }
    };
    fetchContatos();
  }, []);

  const filtrados = contatos.filter(c =>
    c.curso.toLowerCase().includes(busca.toLowerCase()) ||
    c.responsavel.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-yellow-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-10">

        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Phone className="text-blue-600" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Contatos</h1>
          </div>
          <p className="text-gray-500 leading-relaxed">
            Informações de atendimento dos cursos do Campus Almenara. Entre em contato com a secretaria ou coordenação do seu curso.
          </p>
        </div>

        {/* Busca */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Buscar por curso ou responsável..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full px-5 py-3 pl-12 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400"
          />
          <svg className="absolute left-4 top-3.5 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-8">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && (
          <>
            {filtrados.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p>Nenhum contato encontrado para "<strong>{busca}</strong>"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtrados.map((c, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    {/* Header do card */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4">
                      <h2 className="text-white font-bold text-lg leading-tight">{c.curso}</h2>
                      {c.responsavel && (
                        <p className="text-blue-100 text-sm mt-1">{c.responsavel}</p>
                      )}
                    </div>

                    {/* Corpo do card */}
                    <div className="px-5 py-4 space-y-3">
                      {c.ramal && (
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Phone size={15} className="text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium">Ramal</p>
                            <p className="text-gray-700 font-semibold">{c.ramal}</p>
                          </div>
                        </div>
                      )}

                      {c.horario && (
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-blue-50 rounded-lg">
                            <Clock size={15} className="text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium">Horário de Atendimento</p>
                            <p className="text-gray-700">{c.horario}</p>
                          </div>
                        </div>
                      )}

                      {c.emailSecretaria && (
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-green-50 rounded-lg">
                            <Mail size={15} className="text-green-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium">E-mail Secretaria Geral</p>
                            <a href={`mailto:${c.emailSecretaria}`} className="text-blue-600 hover:underline text-sm break-all">{c.emailSecretaria}</a>
                          </div>
                        </div>
                      )}

                      {c.emailCoordenacao && (
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-purple-50 rounded-lg">
                            <Mail size={15} className="text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-medium">E-mail Coordenação</p>
                            <a href={`mailto:${c.emailCoordenacao}`} className="text-blue-600 hover:underline text-sm break-all">{c.emailCoordenacao}</a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-center text-sm text-gray-400 mt-10">
              {filtrados.length} curso{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </main>

      <footer className="mt-16 py-8 bg-white border-t border-gray-100 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Unimontes — Campus Almenara
      </footer>
    </div>
  );
}
