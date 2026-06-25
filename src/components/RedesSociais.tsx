import { useState, useEffect, useRef } from 'react';
import { Instagram, ChevronLeft, ChevronRight, Play, Image as ImageIcon, X } from 'lucide-react';

interface Post {
  imagem: string;
  legenda: string;
  link: string;
  tipo: string;
}

const SHEET_ID = '1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0';
const GID = '1013562204';

// Lista de redes sociais — adicionar novas redes aqui (ex: TikTok, YouTube)
const REDES = [
  { nome: 'Instagram', url: 'https://www.instagram.com/unimontes.almenara', Icon: Instagram },
];

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

export function RedesSociais() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalPost, setModalPost] = useState<Post | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
        const res = await fetch(url);
        const csv = await res.text();
        const lines = csv.trim().split('\n').slice(1);
        const parsed: Post[] = lines
          .map(l => parseCSVLine(l))
          .filter(cells => cells[0]?.trim())
          .map(cells => ({
            imagem: cells[0]?.trim() || '',
            legenda: cells[1]?.trim() || '',
            link:    cells[2]?.trim() || '',
            tipo:    cells[3]?.trim().toLowerCase() || 'foto',
          }));
        setPosts(parsed);
      } catch (err) {
        console.error('Erro ao carregar posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Drag to scroll
  const onMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = 'grabbing';
    trackRef.current.style.userSelect = 'none';
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    trackRef.current.scrollLeft = scrollLeft.current - walk;
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (trackRef.current) {
      trackRef.current.style.cursor = 'grab';
      trackRef.current.style.userSelect = '';
    }
  };

  // Touch drag
  const onTouchStart = (e: React.TouchEvent) => {
    if (!trackRef.current) return;
    startX.current = e.touches[0].pageX;
    scrollLeft.current = trackRef.current.scrollLeft;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!trackRef.current) return;
    const walk = (startX.current - e.touches[0].pageX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft.current + walk;
  };

  const CARD_STEP = 220; // largura aproximada do card + gap, usada para paginação

  const scrollBy = (dir: number) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * CARD_STEP, behavior: 'smooth' });
  };

  const updatePageIndicator = () => {
    if (!trackRef.current) return;
    const { scrollLeft: sl, scrollWidth, clientWidth } = trackRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const pages = Math.max(1, Math.ceil(scrollWidth / clientWidth));
    const page = maxScroll > 0 ? Math.round((sl / maxScroll) * (pages - 1)) + 1 : 1;
    setTotalPages(pages);
    setCurrentPage(Math.min(pages, Math.max(1, page)));
  };

  useEffect(() => {
    updatePageIndicator();
    const handleResize = () => updatePageIndicator();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [posts]);

  return (
    <>
      {/* Seção com fundo escuro — ocupa 100vw saindo do padding do pai */}
      <div
        className="mt-16"
        style={{
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
          width: '100vw',
          backgroundColor: '#1a2744',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-10 md:py-16">

          {/* Cabeçalho — apenas título */}
          <div className="mb-6 md:mb-8">
            <h2 className="pl-3 border-l-2 border-white text-lg md:text-3xl font-bold text-white">
              🤳🏼 📲 Unimontes (Almenara) nas Redes
            </h2>
          </div>

          {/* Carrossel com scroll nativo + drag */}
          {loading ? (
            <div className="flex gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32 md:w-60 h-44 md:h-64 rounded-xl bg-white/10 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-white/50 text-sm">Nenhuma postagem encontrada. Adicione dados na aba REDES SOCIAIS da planilha.</p>
          ) : (
            <div
              ref={trackRef}
              className="flex gap-3 md:gap-5 overflow-x-auto pb-2 select-none"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                cursor: 'grab',
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onScroll={updatePageIndicator}
            >
              {posts.map((post, i) => (
                <button
                  key={i}
                  onClick={() => !isDragging.current && setModalPost(post)}
                  className="flex-shrink-0 w-32 md:w-64 rounded-xl overflow-hidden relative group focus:outline-none"
                  style={{
                    height: '15rem',
                    backgroundImage: `url('${post.imagem}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  draggable={false}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    {post.tipo === 'video' || post.tipo === 'reels'
                      ? <Play size={14} className="text-white ml-0.5 md:w-4 md:h-4" />
                      : <ImageIcon size={12} className="text-white md:w-[14px] md:h-[14px]" />
                    }
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 md:p-3 z-10">
                    <h3 className="text-white font-semibold text-[11px] md:text-sm text-left line-clamp-2 md:line-clamp-3 overflow-hidden">
                      {post.legenda}
                    </h3>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Controles — setas com indicador de página, ícones de redes abaixo */}
          {!loading && posts.length > 0 && (
            <div className="flex flex-col items-center gap-4 mt-5 md:mt-6">
              {/* Setas + página atual */}
              <div className="flex items-center gap-3">
                <button onClick={() => scrollBy(-1)}
                  className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-white/70 text-sm font-medium min-w-[3rem] text-center">
                  {currentPage} / {totalPages}
                </span>
                <button onClick={() => scrollBy(1)}
                  className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Ícones das redes sociais */}
              <div className="flex items-center gap-3">
                {REDES.map(({ nome, url, Icon }) => (
                  <a key={nome} href={url} target="_blank" rel="noopener noreferrer"
                    className="text-white hover:text-yellow-400 transition-colors" aria-label={nome}>
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal */}
      {modalPost && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setModalPost(null)}>
          <div
            className="bg-white w-full md:max-w-3xl md:rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
            style={{ maxHeight: '92vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Imagem — retangular no mobile (16:9), vertical no desktop (9:16) */}
            <div className="flex-shrink-0 bg-black w-full md:w-[40%]">
              {/* Mobile: 16:9 */}
              <div className="md:hidden w-full" style={{ aspectRatio: '16/9' }}>
                <img src={modalPost.imagem} alt={modalPost.legenda} className="w-full h-full object-cover" />
              </div>
              {/* Desktop: 9:16 */}
              <div className="hidden md:block h-full" style={{ aspectRatio: '9/16', maxHeight: '70vh' }}>
                <img src={modalPost.imagem} alt={modalPost.legenda} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Instagram size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-sm text-gray-800">unimontes.almenara</span>
                  </div>
                  <button onClick={() => setModalPost(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{modalPost.legenda}</p>
              </div>
              {modalPost.link && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a href={modalPost.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
                    <Instagram size={16} /> Ver no Instagram
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
