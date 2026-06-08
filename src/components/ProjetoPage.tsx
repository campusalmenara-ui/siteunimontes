import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, ExternalLink } from 'lucide-react';
import { Header } from '@/components/Header';

interface PostItem {
  imageUrl: string;
  caption: string;
  link: string;
  curso: string;
}

interface ProjetoPageProps {
  title: string;
  intro: string | React.ReactNode;
  sheetGid: string; // gid da aba na planilha
  configGid?: string; // gid da aba CONFIGURAÇÃO para buscar os cursos
}

const SHEET_ID = '1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0';
const CARDS_PER_PAGE = 6;

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

export function ProjetoPage({ title, intro, sheetGid, configGid = '2102872257' }: ProjetoPageProps) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [cursos, setCursos] = useState<string[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar cursos da aba CONFIGURAÇÃO
        const configUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${configGid}`;
        const configRes = await fetch(configUrl);
        const configCsv = await configRes.text();
        const configLines = configCsv.trim().split('\n').slice(1); // pula header
        const cursosLista = configLines
          .map(l => parseCSVLine(l)[0]?.trim())
          .filter(Boolean) as string[];
        setCursos(['Todos', ...cursosLista]);

        // Buscar posts da aba do projeto
        const postsUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${sheetGid}`;
        const postsRes = await fetch(postsUrl);
        const postsCsv = await postsRes.text();
        const postsLines = postsCsv.trim().split('\n').slice(1); // pula header

        const parsed: PostItem[] = postsLines
          .map(l => parseCSVLine(l))
          .filter(cells => cells[0]?.trim())
          .map(cells => ({
            imageUrl: cells[0]?.trim() || '',
            caption: cells[1]?.trim() || '',
            link: cells[2]?.trim() || '',
            curso: cells[3]?.trim() || 'Todos',  // col D opcional, fallback Todos
          }));

        setPosts(parsed);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Não foi possível carregar os dados. Verifique se a planilha está pública.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sheetGid, configGid]);

  // Filtrar posts pelo curso ativo
  const postsFiltrados = filtroAtivo === 'Todos'
    ? posts
    : posts.filter(p => p.curso === filtroAtivo);

  // Paginação
  const totalPaginas = Math.ceil(postsFiltrados.length / CARDS_PER_PAGE);
  const inicio = (paginaAtual - 1) * CARDS_PER_PAGE;
  const postsPagina = postsFiltrados.slice(inicio, inicio + CARDS_PER_PAGE);

  const mudarFiltro = (curso: string) => {
    setFiltroAtivo(curso);
    setPaginaAtual(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-yellow-50 flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-10 flex-1">

        {/* Título e introdução */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{title}</h1>
          <div className="text-gray-600 leading-relaxed text-base md:text-lg max-w-4xl">
            {intro}
          </div>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Filtros por curso */}
        {!loading && !error && cursos.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {cursos.map(curso => (
              <button
                key={curso}
                onClick={() => mudarFiltro(curso)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  filtroAtivo === curso
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {curso}
              </button>
            ))}
          </div>
        )}

        {/* Estados de loading e erro */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-8">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Grid de cards */}
        {!loading && !error && postsPagina.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-lg">Nenhum registro encontrado.</p>
          </div>
        )}

        {!loading && !error && postsPagina.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {postsPagina.map((post, i) => (
                <div
                  key={i}
                  onClick={() => post.link && window.open(post.link, '_blank')}
                  className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col ${post.link ? 'cursor-pointer' : ''}`}
                >
                  {/* Imagem */}
                  <div className="relative h-52 bg-gray-100 overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={e => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%239ca3af" font-size="16"%3ESem imagem%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {post.curso && post.curso !== 'Todos' && (
                      <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {post.curso}
                      </span>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{post.caption}</p>
                    {post.link && (
                      <div className="mt-3 flex items-center gap-1 text-blue-500 text-sm font-semibold">
                        <ExternalLink size={14} /> Saiba mais
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-semibold hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="text-sm text-gray-500">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaAtual === totalPaginas}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-semibold hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Próximo <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Rodapé */}
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
