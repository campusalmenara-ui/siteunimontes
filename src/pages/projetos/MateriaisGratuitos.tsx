import { useState, useEffect } from 'react';
import { Download, BookOpen, AlertCircle } from 'lucide-react';
import { Header } from '@/components/Header';

interface Material {
  titulo: string;
  descricao: string;
  linkPdf: string;
  categoria: string;
  imagemCapa: string;
}

const SHEET_ID = '1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0';
const GID_MATERIAIS = '290021874';

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

export default function MateriaisGratuitos() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMateriais = async () => {
      try {
        setLoading(true);
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_MATERIAIS}`;
        const res = await fetch(url);
        const csv = await res.text();
        const lines = csv.trim().split('\n').slice(1);

        const parsed: Material[] = lines
          .map(l => parseCSVLine(l))
          .filter(cells => cells[0]?.trim())
          .map(cells => ({
            titulo: cells[0]?.trim() || '',
            descricao: cells[1]?.trim() || '',
            linkPdf: cells[2]?.trim() || '',
            categoria: cells[3]?.trim() || 'Geral',
            imagemCapa: cells[4]?.trim() || '',
          }));

        setMateriais(parsed);

        const cats = ['Todos', ...Array.from(new Set(parsed.map(m => m.categoria).filter(Boolean)))];
        setCategorias(cats);
      } catch (err) {
        setError('Não foi possível carregar os materiais. Verifique se a planilha está pública.');
      } finally {
        setLoading(false);
      }
    };
    fetchMateriais();
  }, []);

  const filtrados = filtroAtivo === 'Todos'
    ? materiais
    : materiais.filter(m => m.categoria === filtroAtivo);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-yellow-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-10">

        {/* Cabeçalho */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="text-blue-600" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Materiais Gratuitos</h1>
          </div>
          <p className="text-gray-500 leading-relaxed max-w-2xl">
            Acesse gratuitamente PDFs, e-books e materiais de apoio disponibilizados para os estudantes do Campus Almenara.
          </p>
        </div>

        {/* Filtros */}
        {!loading && !error && categorias.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroAtivo(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filtroAtivo === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

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

        {/* Grid */}
        {!loading && !error && filtrados.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <p>Nenhum material encontrado nesta categoria.</p>
          </div>
        )}

        {!loading && !error && filtrados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtrados.map((m, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">

                {/* Capa */}
                <div className="relative h-52 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                  {m.imagemCapa ? (
                    <img
                      src={m.imagemCapa}
                      alt={m.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={48} className="text-blue-300" />
                    </div>
                  )}
                  {m.categoria && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                      {m.categoria}
                    </span>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-base leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {m.titulo}
                  </h3>
                  {m.descricao && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                      {m.descricao}
                    </p>
                  )}
                  {m.linkPdf && (
                    <a
                      href={m.linkPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-blue-600 text-blue-600 font-bold text-sm hover:bg-blue-600 hover:text-white transition-all duration-200"
                    >
                      <Download size={16} />
                      Fazer Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
