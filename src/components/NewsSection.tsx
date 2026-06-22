import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, ExternalLink, Calendar } from 'lucide-react';

interface NewsItem {
  imageUrl: string;
  title: string;
  link: string;
  categoria: string;
  texto: string;
  dia: number;
  mes: number;
  ano: number;
  date: Date;
}

const ITEMS_PER_PAGE = 5;

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalItem, setModalItem] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

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

  // Converte "dd/mm/aa" ou "dd/mm/aaaa" em { dia, mes, ano, date }
  const parseDateBR = (raw: string): { dia: number; mes: number; ano: number; date: Date } | null => {
    const trimmed = raw.trim();
    const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (!match) return null;

    const dia = parseInt(match[1], 10);
    const mes = parseInt(match[2], 10);
    let ano = parseInt(match[3], 10);

    if (ano < 100) ano += 2000;

    const date = new Date(ano, mes - 1, dia);
    if (isNaN(date.getTime())) return null;

    return { dia, mes, ano, date };
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      // URL do Google Sheets que funciona com compartilhamento
      // gid=1463370073 é a aba NOTÍCIAS
      const sheetUrl = 'https://docs.google.com/spreadsheets/d/1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0/export?format=csv&gid=1463370073';

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
      const newsItems: NewsItem[] = [];

      // Pular header (primeira linha) e processar dados
      // Colunas: A=Imagem, B=Título, C=Link, D=Categoria, E=Data(dd/mm/aa), F=Texto
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cells = parseCSVLine(line);

        if (cells.length >= 2) {
          const imageUrl = cells[0]?.trim() || '';
          const title = cells[1]?.trim() || '';
          const link = cells[2]?.trim() || '';
          const categoria = cells[3]?.trim() || '';
          const dataRaw = cells[4]?.trim() || '';
          const texto = cells[5]?.trim() || '';

          const parsedDate = parseDateBR(dataRaw);

          // Validar URLs — itens sem imagem ou sem data válida são ignorados
          if (imageUrl.startsWith('http') && parsedDate) {
            newsItems.push({
              imageUrl,
              title,
              link: link.startsWith('http') ? link : '',
              categoria,
              texto,
              dia: parsedDate.dia,
              mes: parsedDate.mes,
              ano: parsedDate.ano,
              date: parsedDate.date,
            });
          }
        }
      }

      // Ordena da notícia mais recente para a mais antiga
      newsItems.sort((a, b) => b.date.getTime() - a.date.getTime());

      setNews(newsItems);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Erro ao buscar notícias:', errorMsg);
      setError(`Erro: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(news.length / ITEMS_PER_PAGE));
  const paginatedNews = news.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const formatDate = (item: NewsItem) => {
    return `${String(item.dia).padStart(2, '0')}/${String(item.mes).padStart(2, '0')}/${item.ano}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 md:p-8 h-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-7 bg-yellow-500 rounded-full" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Notícias</h2>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return null; // Não mostrar seção se houver erro ou não houver notícias
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 md:p-8 h-full">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-7 bg-yellow-500 rounded-full" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Notícias</h2>
        </div>

        {/* Lista de notícias */}
        <div className="space-y-4">
          {paginatedNews.map((item, index) => (
            <div
              key={index}
              className="flex gap-4 cursor-pointer group pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
              onClick={() => setModalItem(item)}
            >
              {/* Conteúdo textual */}
              <div className="flex-1 min-w-0">
                {item.categoria && (
                  <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                    {item.categoria}
                  </span>
                )}
                <h3 className="font-bold text-sm md:text-base text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <Calendar size={12} className="flex-shrink-0" />
                  <span>{formatDate(item)}</span>
                </div>
              </div>

              {/* Imagem */}
              <div className="flex-shrink-0 w-24 h-20 md:w-28 md:h-24 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E';
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Paginação numérica */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Próxima página"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalItem && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setModalItem(null)}
        >
          <div
            className="bg-white w-full md:max-w-2xl md:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ maxHeight: '92vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Imagem */}
            <div className="w-full flex-shrink-0 bg-black" style={{ aspectRatio: '16/9', maxHeight: '320px' }}>
              <img
                src={modalItem.imageUrl}
                alt={modalItem.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  {modalItem.categoria && (
                    <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                      {modalItem.categoria}
                    </span>
                  )}
                  <h2 className="font-bold text-lg md:text-xl text-gray-800 leading-snug">{modalItem.title}</h2>
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Calendar size={12} className="flex-shrink-0" />
                    <span>{formatDate(modalItem)}</span>
                  </div>
                </div>
                <button onClick={() => setModalItem(null)} className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1">
                  <X size={22} />
                </button>
              </div>

              {modalItem.texto ? (
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mt-4">{modalItem.texto}</p>
              ) : (
                <p className="text-gray-400 text-sm italic mt-4">Conteúdo completo não disponível.</p>
              )}

              {modalItem.link && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <a
                    href={modalItem.link}
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
        </div>
      )}
    </>
  );
}
