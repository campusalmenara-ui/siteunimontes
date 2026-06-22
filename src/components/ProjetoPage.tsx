import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, ExternalLink, Calendar, X } from 'lucide-react';
import { Header } from '@/components/Header';

interface PostItem {
  imageUrl: string;
  caption: string;
  link: string;
  curso: string;
  data?: string;
  dataObj?: Date;
  texto?: string;
}

interface ProjetoPageProps {
  title: string;
  intro: string | React.ReactNode;
  sheetGid: string;
  configGid?: string;
}

const SHEET_ID = '1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0';
const CARDS_PER_PAGE = 6;

// Parser de CSV completo que respeita quebras de linha dentro de células com aspas
const parseCSV = (csv: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let insideQuotes = false;
  let i = 0;

  while (i < csv.length) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        cell += '"';
        i += 2;
        continue;
      }
      insideQuotes = !insideQuotes;
      i++;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      row.push(cell);
      cell = '';
      i++;
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      i++;
      continue;
    }

    cell += char;
    i++;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter(r => r.some(c => c.trim() !== ''));
};

const parseDateBR = (raw: string): Date | null => {
  const trimmed = raw.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!match) return null;

  const dia = parseInt(match[1], 10);
  const mes = parseInt(match[2], 10);
  let ano = parseInt(match[3], 10);
  if (ano < 100) ano += 2000;

  const date = new Date(ano, mes - 1, dia);
  if (isNaN(date.getTime())) return null;
  return date;
};

const formatDateBR = (date: Date) => {
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${date.getFullYear()}`;
};

export function ProjetoPage({ title, intro, sheetGid, configGid = '2102872257' }: ProjetoPageProps) {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [cursos, setCursos] = useState<string[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalPost, setModalPost] = useState<PostItem | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const configUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${configGid}`;
        const configRes = await fetch(configUrl);
        const configCsv = await configRes.text();
        const configRows = parseCSV(configCsv).slice(1);
        const cursosLista = configRows
          .map(cells => cells[0]?.trim())
          .filter(Boolean) as string[];
        setCursos(['Todos', ...cursosLista]);

        const postsUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${sheetGid}`;
        const postsRes = await fetch(postsUrl);
        const postsCsv = await postsRes.text();
        const postsRows = parseCSV(postsCsv).slice(1);

        const parsed: PostItem[] = postsRows
          .filter(cells => cells[0]?.trim())
          .map(cells => {
            const dataRaw = cells[4]?.trim() || '';
            const dataObj = dataRaw ? parseDateBR(dataRaw) : null;
            return {
              imageUrl: cells[0]?.trim() || '',
              caption: cells[1]?.trim() || '',
              link: cells[2]?.trim() || '',
              curso: cells[3]?.trim() || 'Todos',
              data: dataObj ? formatDateBR(dataObj) : undefined,
              dataObj: dataObj || undefined,
              texto: cells[5]?.trim() || '',
            };
          });

        parsed.sort((a, b) => {
          if (a.dataObj && b.dataObj) return b.dataObj.getTime() - a.dataObj.getTime();
          if (a.dataObj) return -1;
          if (b.dataObj) return 1;
          return 0;
        });

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

  const postsFiltrados = filtroAtivo === 'Todos'
    ? posts
    : posts.filter(p => p.curso === filtroAtivo);

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

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{title}</h1>
          <div className="text-gray-600 leading-relaxed text-base md:text-lg max-w-4xl">
            {intro}
          </div>
        </div>

        <hr className="border-gray-200 mb-8" />

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
                  onClick={() => setModalPost(post)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                >
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

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{post.caption}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      {post.data && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar size={13} className="flex-shrink-0" />
                          <span>{post.data}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-blue-500 text-sm font-semibold ml-auto">
                        Saiba mais
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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

      {modalPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 md:px-0"
          onClick={() => setModalPost(null)}
        >
          <div
            className="bg-white w-full rounded-2xl md:max-w-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ maxHeight: '90dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Imagem — oculta no mobile para dar espaço ao conteúdo */}
            <div className="hidden md:block w-full flex-shrink-0 bg-black" style={{ aspectRatio: '16/9', maxHeight: '240px' }}>
              <img
                src={modalPost.imageUrl}
                alt={modalPost.caption}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Cabeçalho do modal (título, badge, data, botão X) — fixo, não rola */}
            <div className="px-6 pt-5 pb-3 flex-shrink-0 border-b border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {modalPost.curso && modalPost.curso !== 'Todos' && (
                    <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                      {modalPost.curso}
                    </span>
                  )}
                  <h2 className="font-bold text-lg md:text-xl text-gray-800 leading-snug">{modalPost.caption}</h2>
                  {modalPost.data && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Calendar size={12} className="flex-shrink-0" />
                      <span>{modalPost.data}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setModalPost(null)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1">
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Corpo — área scrollável com altura limitada */}
            <div className="px-6 py-4 overflow-y-auto min-h-0 max-h-48">
              {modalPost.texto ? (
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{modalPost.texto}</p>
              ) : (
                <p className="text-gray-400 text-sm italic">Conteúdo completo não disponível.</p>
              )}
            </div>

            {/* Botão Ver mais — fixo sempre no rodapé, fora da área de scroll */}
            {modalPost.link && (
              <div className="px-6 py-4 flex-shrink-0 border-t border-gray-100 bg-white">
                <a
                  href={modalPost.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink size={16} /> Ver mais
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
