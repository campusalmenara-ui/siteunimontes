import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsItem {
  imageUrl: string;
  title: string;
  link: string;
}

export function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    fetchNews();
  }, []);

  // Parser CSV que respeita aspas (mesmo do Home.tsx)
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

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Dados mock para demonstração
      const mockNews: NewsItem[] = [
        {
          imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
          title: 'Novo Calendário Acadêmico 2026 Divulgado',
          link: 'https://www.unimontes.br'
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f70504c11?w=400https://images.unsplash.com/photo-1427504494785-cdaa41d52470?w=400&h=300&fit=croph=300https://images.unsplash.com/photo-1427504494785-cdaa41d52470?w=400&h=300&fit=cropfit=crop',
          title: 'Inscrições Abertas para Programas de Bolsa',
          link: 'https://www.unimontes.br'
        },
        {
          imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop',
          title: 'Seminário de Educação e Tecnologia',
          link: 'https://www.unimontes.br'
        }
      ];

      setNews(mockNews);
      setError(null);
      return;

      // Código original comentado para referência futura
      // URL do Google Sheets que funciona com compartilhamento
      // gid=1463370073 é a aba NOTÍCIAS
      // const sheetUrl = 'https://docs.google.com/spreadsheets/d/1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0/export?format=csv&gid=1463370073';

      // Código original comentado para referência futura
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Erro ao buscar notícias:', errorMsg);
      console.error('Stack:', err instanceof Error ? err.stack : 'N/A');
      setError(`Erro: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('news-carousel');
    if (!container) return;
    
    const scrollAmount = 320; // Largura do card + gap
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  if (loading) {
    return (
      <div className="py-12 px-4 md:px-8 lg:px-16 xl:px-24 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Notícias</h2>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return null; // Não mostrar seção se houver erro ou não houver notícias
  }

  return (
    <div className="py-12 px-4 md:px-8 lg:px-16 xl:px-24 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Título */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-wide">
            NOTÍCIAS
          </h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto mt-4"></div>
        </div>

        {/* Carrossel */}
        <div className="relative">
          {/* Botão Esquerda */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Notícia anterior"
          >
            <ChevronLeft className="w-6 h-6 text-blue-500" />
          </button>

          {/* Container de scroll */}
          <div
            id="news-carousel"
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            {news.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 group cursor-pointer"
                onClick={() => {
                  if (item.link) {
                    window.open(item.link, '_blank');
                  }
                }}
              >
                {/* Card */}
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  {/* Imagem */}
                  <div className="relative overflow-hidden h-48 bg-gray-200">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-800 line-clamp-3 group-hover:text-blue-500 transition-colors">
                      {item.title}
                    </h3>
                    
                    {item.link && (
                      <div className="mt-auto pt-4">
                        <span className="inline-block text-blue-500 text-sm font-semibold group-hover:underline">
                          Ler mais →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botão Direita */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Próxima notícia"
          >
            <ChevronRight className="w-6 h-6 text-blue-500" />
          </button>
        </div>


      </div>
    </div>
  );
}
