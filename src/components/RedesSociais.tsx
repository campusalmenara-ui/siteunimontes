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
  const [current, setCurrent] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const CARD_WIDTH = 304; // px — largura do card + gap
  const VISIBLE = 4;

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

  const maxIndex = Math.max(0, posts.length - VISIBLE);

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => setCurrent(c => Math.min(maxIndex, c + 1));

  return (
    <>
      {/* Seção fundo escuro — idêntica à estrutura da UFMG */}
      <div className="mt-16 -mx-4 md:-mx-8 lg:-mx-16 xl:-mx-24 bg-[#1a2744] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-16 space-y-8">

          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <h2 className="pl-3 border-l-2 border-white text-3xl md:text-4xl font-bold">
              Unimontes (Almenara) nas Redes
            </h2>
            <div className="hidden md:flex items-center gap-3">
              <span className="font-semibold text-sm text-white/70">Siga-nos:</span>
              <a
                href="https://www.instagram.com/unimontes.almenara"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={22} />
              </a>
            </div>
          </div>

          {/* Carrossel */}
          {loading ? (
            <div className="flex gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-72 h-[22rem] rounded-lg bg-white/10 animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-white/50 text-sm">Nenhuma postagem encontrada. Adicione dados na aba REDES SOCIAIS da planilha.</p>
          ) : (
            <div className="overflow-hidden" ref={carouselRef}>
              <div
                className="flex gap-8 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${current * CARD_WIDTH}px)` }}
              >
                {posts.map((post, i) => (
                  <button
                    key={i}
                    onClick={() => setModalPost(post)}
                    className="flex-shrink-0 w-72 h-[22rem] md:h-[26rem] rounded-lg overflow-hidden relative group cursor-pointer focus:outline-none"
                    style={{
                      backgroundImage: `url('${post.imagem}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Ícone play/foto */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                      {post.tipo === 'video' || post.tipo === 'reels'
                        ? <Play size={20} className="text-white ml-1" />
                        : <ImageIcon size={18} className="text-white" />
                      }
                    </div>

                    {/* Título sobreposto no rodapé */}
                    <h3 className="absolute bottom-0 left-0 right-0 p-4 text-white font-semibold text-base text-left line-clamp-3 z-10">
                      {post.legenda}
                    </h3>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Controles + link */}
          <div className="flex items-center justify-between">
            {/* Mobile — ícones redes */}
            <div className="flex md:hidden items-center gap-3">
              <a href="https://www.instagram.com/unimontes.almenara" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>

            {/* Navegação carrossel */}
            {posts.length > VISIBLE && (
              <div className="flex items-center gap-4 ml-auto">
                <button
                  onClick={prev}
                  disabled={current === 0}
                  className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-white/60">
                  {current + 1} / {maxIndex + 1}
                </span>
                <button
                  onClick={next}
                  disabled={current >= maxIndex}
                  className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Link ver mais */}
            <a
              href="https://www.instagram.com/unimontes.almenara"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white font-medium text-sm hover:text-yellow-400 transition-colors ml-6"
            >
              Perfil oficial no Instagram
              <ChevronRight size={16} />
            </a>
          </div>

        </div>
      </div>

      {/* Modal */}
      {modalPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setModalPost(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col md:flex-row"
            onClick={e => e.stopPropagation()}
          >
            {/* Imagem */}
            <div className="md:w-1/2 bg-black flex items-center justify-center min-h-[260px]">
              <img
                src={modalPost.imagem}
                alt={modalPost.legenda}
                className="w-full h-full object-contain max-h-[420px]"
              />
            </div>

            {/* Conteúdo */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Instagram size={16} className="text-white" />
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
                  <a
                    href={modalPost.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    <Instagram size={16} />
                    Ver no Instagram
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
