import { useState, useEffect } from 'react';
import { Instagram, Play, Image, ExternalLink } from 'lucide-react';

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
            link: cells[2]?.trim() || '',
            tipo: cells[3]?.trim().toLowerCase() || 'foto',
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

  if (loading) return null;
  if (posts.length === 0) return null;

  return (
    <>
      <div className="mt-16">
        {/* Cabeçalho da seção */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Unimontes (Almenara) nas Redes
            </h2>
          </div>
          <a
            href="https://www.instagram.com/unimontes.almenara"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
          >
            <Instagram size={18} />
            <span className="hidden md:inline">Seguir no Instagram</span>
          </a>
        </div>

        {/* Grid de posts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {posts.slice(0, 8).map((post, i) => (
            <button
              key={i}
              onClick={() => setModalPost(post)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Imagem */}
              <img
                src={post.imagem}
                alt={post.legenda}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3C/svg%3E';
                }}
              />

              {/* Overlay ao hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <p className="text-white text-xs leading-snug line-clamp-3">{post.legenda}</p>
              </div>

              {/* Ícone do tipo */}
              <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm rounded-full p-1">
                {post.tipo === 'video' || post.tipo === 'reels' ? (
                  <Play size={12} className="text-white" />
                ) : (
                  <Image size={12} className="text-white" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Link ver mais */}
        <div className="flex justify-end mt-4">
          <a
            href="https://www.instagram.com/unimontes.almenara"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
          >
            Ver todas as postagens
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* Modal */}
      {modalPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
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
                className="w-full h-full object-contain max-h-[400px]"
              />
            </div>

            {/* Conteúdo */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                {/* Header modal */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Instagram size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-sm text-gray-800">unimontes.almenara</span>
                  </div>
                  <button
                    onClick={() => setModalPost(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-light"
                  >
                    ✕
                  </button>
                </div>

                {/* Legenda */}
                <p className="text-gray-700 text-sm leading-relaxed">{modalPost.legenda}</p>
              </div>

              {/* Rodapé modal */}
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
