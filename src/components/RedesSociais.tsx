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

  const scrollBy = (dir: number) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

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
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-16">

          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="pl-3 border-l-2 border-white text-2xl md:text-3xl font-bold text-white">
              Unimontes (Almenara) nas Redes
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm font-semibold hidden md:inline">Siga-nos:</span>
              <a href="https://www.instagram.com/unimontes.almenara" target="_blank" rel="noopener noreferrer"
                className="text-white hover:text-yellow-400 transition-colors" aria-label="Instagram">
                <Instagram size={22} />
              </a>
            </div>
          </div>

          {/* Carrossel com scroll nativo + drag */}
          {loading ? (
            <div className="flex gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-60 h-44 rounded-xl bg-white/10 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-white/50 text-sm">Nenhuma postagem encontrada. Adicione dados na aba REDES SOCIAIS da planilha.</p>
          ) : (
            <div
              ref={trackRef}
              className="flex gap-5 overflow-x-auto pb-2 select-none"
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
            >
              {posts.map((post, i) => (
                <button
                  key={i}
                  onClick={() => !isDragging.current && setModalPost(post)}
                  className="flex-shrink-0 w-56 md:w-64 rounded-xl overflow-hidden relative group focus:outline-none"
                  style={{
                    height: '18rem',
                    backgroundImage: `url('${post.imagem}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                  draggable={false}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                    {post.tipo === 'video' || post.tipo === 'reels'
                      ? <Play size={16} className="text-white ml-0.5" />
                      : <ImageIcon size={14} className="text-white" />
                    }
                  </div>
                  <h3 className="absolute bottom-0 left-0 right-0 p-3 text-white font-semibold text-sm text-left line-clamp-3 z-10">
                    {post.legenda}
                  </h3>
                </button>
              ))}
            </div>
          )}

          {/* Controles */}
          {!loading && posts.length > 0 && (
            <div className="flex items-center justify-end gap-4 mt-6">
              <button onClick={() => scrollBy(-1)}
                className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollBy(1)}
                className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-all">
                <ChevronRight size={18} />
              </button>
              <a href="https://www.instagram.com/unimontes.almenara" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-white text-sm font-medium hover:text-yellow-400 transition-colors ml-2">
                Perfil oficial no Instagram <ChevronRight size={15} />
              </a>
            </div>
          )}

        </div>
      </div>

      {/* Modal */}
      {modalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setModalPost(null)}>
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-3xl flex flex-col md:flex-row max-h-[90vh]"
            onClick={e => e.stopPropagation()}>

            {/* Imagem com proporção 9:16 como card */}
            <div className="md:w-[45%] flex-shrink-0 bg-black" style={{ aspectRatio: '9/16', maxHeight: '70vh' }}>
              <img
                src={modalPost.imagem}
                alt={modalPost.legenda}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Instagram size={18} className="text-white" />
                    </div>
                    <span className="font-bold text-sm text-gray-800">unimontes.almenara</span>
                  </div>
                  <button onClick={() => setModalPost(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{modalPost.legenda}</p>
              </div>
              {modalPost.link && (
                <div className="mt-6 pt-4 border-t border-gray-100">
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
