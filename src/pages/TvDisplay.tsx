import { useState, useEffect, useCallback } from 'react';
// ─── Interfaces ────────────────────────────────────────────────────────────────

interface ClassInfo {
  period: string;
  subject: string;
  professor?: string;
  hours?: string;
  observation?: string;
  curso: string;
}

interface NewsItem {
  imageUrl: string;
  title: string;
  texto: string;
  categoria: string;
  dia: number;
  mes: number;
  ano: number;
}

interface CalendarItem {
  dia: number;
  mes: number;
  ano: number;
  atividade: string;
}

interface WeatherData {
  temp: number;
  code: number;
  wind: number;
}

interface SocialPost {
  imagem: string;
  legenda: string;
  link: string;
  tipo: string;
  rede: string;
}

// Item unificado para o painel de notícias/social
type FeedItem =
  | { kind: 'news'; imageUrl: string; title: string; texto: string; categoria: string; dia: number; mes: number; ano: number }
  | { kind: 'social'; imagem: string; legenda: string; link: string; tipo: string; rede: string };

// ─── Constantes ────────────────────────────────────────────────────────────────

const SPREADSHEET_ID    = '1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0';
const MESES_ABREV       = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
const MESES_NOMES: { [k: string]: number } = {
  'janeiro':1,'jan':1,'fevereiro':2,'fev':2,'marco':3,'março':3,'mar':3,
  'abril':4,'abr':4,'maio':5,'mai':5,'junho':6,'jun':6,'julho':7,'jul':7,
  'agosto':8,'ago':8,'setembro':9,'set':9,'outubro':10,'out':10,
  'novembro':11,'nov':11,'dezembro':12,'dez':12,
};

const NEWS_ROTATION_MS  = 12_000;   // rotação normal entre notícias
const SLIDE_INTERVAL_MS = 3 * 60_000; // a cada 3 min entra no modo slide
const SLIDE_DURATION_MS = 20_000;    // cada notícia em fullscreen dura 20s
const DATA_REFRESH_MS   = 5 * 60_000;
const WEATHER_REFRESH_MS= 15 * 60_000;

const SOCIAL_GID = '1013562204';

const REDE_CONFIG: Record<string, { label: string; iconBg: string; btnBg: string; btnLabel: string }> = {
  instagram: {
    label:    'Instagram',
    iconBg:   'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    btnBg:    'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    btnLabel: 'Ver no Instagram',
  },
  youtube: {
    label:    'YouTube',
    iconBg:   '#ff0000',
    btnBg:    '#ff0000',
    btnLabel: 'Ver no YouTube',
  },
};

// Mapa simplificado de WMO weather codes → emoji + descrição
const WMO_MAP: { [k: number]: [string, string] } = {
  0:  ['☀️','Céu limpo'],   1:  ['🌤️','Mostly clear'], 2:  ['⛅','Parcialmente nublado'],
  3:  ['☁️','Nublado'],     45: ['🌫️','Neblina'],       48: ['🌫️','Neblina'],
  51: ['🌦️','Garoa leve'],  53: ['🌦️','Garoa'],         55: ['🌧️','Garoa intensa'],
  61: ['🌧️','Chuva leve'],  63: ['🌧️','Chuva'],         65: ['🌧️','Chuva forte'],
  71: ['🌨️','Neve leve'],   80: ['🌦️','Pancadas'],       81: ['⛈️','Pancadas'],
  95: ['⛈️','Trovoada'],    96: ['⛈️','Trovoada c/ granizo'],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseMes(raw: string): number {
  const t = raw.trim();
  const n = parseInt(t, 10);
  if (!isNaN(n) && n >= 1 && n <= 12) return n;
  const norm = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return MESES_NOMES[norm] || 0;
}

function parseDateBR(raw: string) {
  const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (!m) return null;
  const dia = parseInt(m[1], 10);
  const mes = parseInt(m[2], 10);
  let ano   = parseInt(m[3], 10);
  if (ano < 100) ano += 2000;
  const date = new Date(ano, mes - 1, dia);
  return isNaN(date.getTime()) ? null : { dia, mes, ano, date };
}

function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', inQ = false, i = 0;
  while (i < csv.length) {
    const c = csv[i], n = csv[i + 1];
    if (c === '"') { if (inQ && n === '"') { cell += '"'; i += 2; continue; } inQ = !inQ; i++; continue; }
    if (c === ',' && !inQ) { row.push(cell); cell = ''; i++; continue; }
    if ((c === '\n' || c === '\r') && !inQ) {
      if (c === '\r' && n === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = ''; i++; continue;
    }
    cell += c; i++;
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

async function fetchCSV(gid?: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv${gid ? `&gid=${gid}` : ''}`;
  let res  = await fetch(url);
  let text = await res.text();
  if (text.includes('Temporary Redirect') && text.includes('HREF')) {
    const m = text.match(/HREF="([^"]+)"/);
    if (m?.[1]) { res = await fetch(m[1].replace(/&amp;/g, '&')); text = await res.text(); }
  }
  if (!res.ok || text.includes('<HTML>') || text.includes('<!DOCTYPE')) throw new Error('Planilha inacessível');
  return parseCSV(text);
}

function wmoDesc(code: number): [string, string] {
  if (WMO_MAP[code]) return WMO_MAP[code];
  // fallback: find closest lower key
  const keys = Object.keys(WMO_MAP).map(Number).sort((a,b) => a-b);
  for (let i = keys.length - 1; i >= 0; i--) { if (keys[i] <= code) return WMO_MAP[keys[i]]; }
  return ['🌡️','--'];
}

// ─── Relógio ───────────────────────────────────────────────────────────────────

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  const dias = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  return (
    <div className="text-right">
      <div className="text-4xl font-bold text-white tabular-nums leading-none">
        {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
      </div>
      <div className="text-blue-200 text-sm mt-1">
        {dias[now.getDay()]}, {pad(now.getDate())}/{pad(now.getMonth()+1)}/{now.getFullYear()}
      </div>
    </div>
  );
}

// ─── Widget de Clima ───────────────────────────────────────────────────────────

function WeatherWidget({ data }: { data: WeatherData | null }) {
  if (!data) return <div className="text-blue-400 text-xs">Carregando clima...</div>;
  const [emoji, desc] = wmoDesc(data.code);
  return (
    <div className="flex items-center gap-3">
      <span className="text-3xl leading-none">{emoji}</span>
      <div>
        <div className="text-white font-bold text-xl leading-none">{Math.round(data.temp)}°C</div>
        <div className="text-blue-200 text-xs mt-0.5">{desc}</div>
        <div className="text-blue-300 text-[10px]">💨 {Math.round(data.wind)} km/h · Almenara/MG</div>
      </div>
    </div>
  );
}

// ─── Painel de Agenda ──────────────────────────────────────────────────────────

function AgendaPanel({ classes, weekDates }: { classes: ClassInfo[]; weekDates: { start: string; end: string } }) {
  const cursoConfig: { [k: string]: { dot: string; tag: string } } = {
    'Pedagogia': { dot: 'bg-purple-400', tag: 'PEDAGOGIA' },
    'Letras':    { dot: 'bg-sky-400',    tag: 'LETRAS'    },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-6 bg-yellow-400 rounded-full flex-shrink-0" />
        <h2 className="text-xl font-bold text-white">Agenda Semanal</h2>
      </div>

      {/* Destaque da semana */}
      {weekDates.start && (
        <div className="bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
          <span className="text-yellow-300 text-sm">📅</span>
          <p className="text-yellow-200 text-sm font-semibold">
            Semana de <span className="text-yellow-300">{weekDates.start}</span> a <span className="text-yellow-300">{weekDates.end}</span>
          </p>
        </div>
      )}

      {classes.length === 0 ? (
        <p className="text-blue-300 text-sm">Nenhuma aula cadastrada.</p>
      ) : (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {classes.map((c, idx) => {
            const cfg = cursoConfig[c.curso] || { dot: 'bg-gray-400', tag: c.curso.toUpperCase() };
            const isNoClass = c.subject === 'Sem agendamento';
            return (
              <div key={idx} className={`flex-1 min-h-0 rounded-xl px-4 py-2 flex gap-3 items-center overflow-hidden ${isNoClass ? 'bg-white/5 opacity-60' : 'bg-white/10'}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isNoClass ? 'bg-gray-500' : cfg.dot}`} />
                <div className="min-w-0 flex-1">
                  {/* Curso + período na mesma linha */}
                  <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wide leading-tight truncate">
                    {cfg.tag} · {c.period}
                  </div>
                  <p className={`font-semibold text-sm leading-snug mt-0.5 truncate ${isNoClass ? 'text-blue-400 italic' : 'text-white'}`}>
                    {c.subject}
                  </p>
                  {!isNoClass && c.professor && (
                    <p className="text-blue-300 text-xs truncate">{c.professor}</p>
                  )}
                  {!isNoClass && c.hours && (
                    <p className="text-blue-400 text-[10px]">⏱ {c.hours}</p>
                  )}
                  {!isNoClass && c.observation && (
                    <p className="text-yellow-300/80 text-[10px] truncate">⚠ {c.observation}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Painel de Notícias (carrossel normal) ─────────────────────────────────────

const NEWS_PER_PAGE = 3;

// ─── Ícones SVG inline ────────────────────────────────────────────────────────

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function YoutubeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  );
}

// ─── Painel de Notícias + Social (3 por vez) ──────────────────────────────────

function NewsPanel({ feed }: { feed: FeedItem[] }) {
  const totalPages = Math.max(1, Math.ceil(feed.length / NEWS_PER_PAGE));
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (totalPages <= 1) return;
    const id = setInterval(() => setPage(prev => (prev + 1) % totalPages), NEWS_ROTATION_MS);
    return () => clearInterval(id);
  }, [totalPages]);

  if (feed.length === 0) return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-yellow-400 rounded-full flex-shrink-0" />
        <h2 className="text-xl font-bold text-white">Notícias & Redes</h2>
      </div>
      <p className="text-blue-300 text-sm">Nenhum conteúdo disponível.</p>
    </div>
  );

  const slice = feed.slice(page * NEWS_PER_PAGE, page * NEWS_PER_PAGE + NEWS_PER_PAGE);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <div className="w-1 h-6 bg-yellow-400 rounded-full flex-shrink-0" />
        <h2 className="text-xl font-bold text-white">Notícias & Redes</h2>
        {totalPages > 1 && (
          <span className="ml-auto text-blue-300 text-xs">{page + 1}/{totalPages}</span>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-0 justify-center">
        {slice.map((item, i) => {
          const img      = item.kind === 'news' ? item.imageUrl : item.imagem;
          const isSocial = item.kind === 'social';
          const rede     = isSocial ? item.rede : '';
          const cfg      = isSocial ? (REDE_CONFIG[rede] ?? REDE_CONFIG.instagram) : null;

          return (
            <div key={`${page}-${i}`}
              className="rounded-xl overflow-hidden relative flex-shrink-0"
              style={{ height: `calc((100% - ${(slice.length - 1) * 12}px) / ${slice.length})`, maxHeight: '38%' }}>
              <img src={img} alt=""
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Badge: ícone da rede OU categoria */}
              <div className="absolute top-2 left-2 z-10">
                {isSocial ? (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white shadow"
                    style={{ background: cfg!.iconBg }}>
                    {rede === 'youtube' ? <YoutubeIcon size={12} /> : <InstagramIcon size={12} />}
                  </div>
                ) : (item.kind === 'news' && item.categoria) ? (
                  <span className="bg-yellow-400 text-blue-900 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {item.categoria}
                  </span>
                ) : null}
              </div>

              <div className="absolute bottom-0 left-0 right-0 px-3 py-2 z-10">
                <p className="text-white font-semibold text-sm leading-snug line-clamp-2 drop-shadow">
                  {item.kind === 'news' ? item.title : item.legenda}
                </p>
                {item.kind === 'news' && (
                  <p className="text-blue-200 text-[10px] mt-0.5">
                    {String(item.dia).padStart(2,'0')}/{String(item.mes).padStart(2,'0')}/{item.ano}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-1.5 mt-2 justify-center flex-shrink-0">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`rounded-full transition-all duration-300 ${i === page ? 'w-6 h-1.5 bg-yellow-400' : 'w-3 h-1.5 bg-white/30'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Slide Fullscreen ─────────────────────────────────────────────────────────

function NewsSlide({ feed, onDone }: { feed: FeedItem[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (feed.length === 0) { onDone(); return; }
    const id = setInterval(() => {
      setIdx(prev => {
        const next = prev + 1;
        if (next >= feed.length) { clearInterval(id); onDone(); return prev; }
        return next;
      });
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [feed.length, onDone]);

  if (feed.length === 0) return null;

  const item     = feed[idx];
  const isSocial = item.kind === 'social';
  const img      = isSocial ? item.imagem : item.imageUrl;
  const rede     = isSocial ? item.rede : '';
  const cfg      = isSocial ? (REDE_CONFIG[rede] ?? REDE_CONFIG.instagram) : null;
  const hasText  = !isSocial && !!item.texto;
  const legenda  = isSocial ? item.legenda : '';

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0f1f4a' }}>
      {/* Imagem de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <img src={img} alt=""
          className="w-full h-full object-cover opacity-15 blur-sm"
          onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
      </div>

      {/* Header */}
      <div className="relative flex-shrink-0 flex items-center justify-between px-12 py-5 border-b border-white/10">
        <img src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030187894/57Ypr7wbFX6eHCZZ7V6o8w/logo_cc3239cb.png"
          alt="Unimontes" className="h-10 brightness-0 invert" />
        {/* Badge da rede social no centro do header */}
        {isSocial && cfg && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-semibold"
            style={{ background: cfg.iconBg }}>
            {rede === 'youtube' ? <YoutubeIcon size={16} /> : <InstagramIcon size={16} />}
            {cfg.label}
          </div>
        )}
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-sm">{idx + 1} de {feed.length}</span>
          <button onClick={onDone} className="text-white/40 hover:text-white text-sm transition-colors">✕ Fechar</button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative flex-1 flex gap-8 px-12 py-8 min-h-0">

        {/* Coluna esquerda — imagem */}
        <div className="flex flex-col gap-4 flex-shrink-0" style={{ width: '38%' }}>
          <div className="rounded-2xl overflow-hidden flex-1 min-h-0">
            <img src={img} alt=""
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
          </div>
          {/* Meta abaixo da imagem */}
          <div>
            {!isSocial && item.categoria && (
              <span className="inline-block bg-yellow-400 text-blue-900 text-sm font-bold px-4 py-1 rounded-full mb-2">
                {item.categoria}
              </span>
            )}
            {!isSocial && (
              <p className="text-blue-300 text-sm">
                {String(item.dia).padStart(2,'0')}/{String(item.mes).padStart(2,'0')}/{item.ano}
              </p>
            )}
            {isSocial && cfg && (
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: cfg.btnBg }}>
                {rede === 'youtube' ? <YoutubeIcon size={14} /> : <InstagramIcon size={14} />}
                {cfg.btnLabel}
              </a>
            )}
          </div>
        </div>

        {/* Coluna direita — título/legenda + texto */}
        <div className="flex-1 flex flex-col justify-center min-h-0 min-w-0">
          <h1 className="text-white font-bold leading-tight mb-4 drop-shadow-lg"
            style={{ fontSize: isSocial
              ? (legenda.length > 200 ? '1.4rem' : '1.8rem')
              : (item.title.length > 80 ? '1.6rem' : item.title.length > 50 ? '2rem' : '2.4rem') }}>
            {isSocial ? legenda.split('\n')[0] : item.title}
          </h1>

          {/* Notícia: texto completo */}
          {!isSocial && hasText && (
            <p className="text-blue-100 leading-relaxed overflow-hidden"
              style={{
                fontSize: item.texto.length > 600 ? '0.85rem' : item.texto.length > 300 ? '0.95rem' : '1.05rem',
                display: '-webkit-box',
                WebkitLineClamp: item.texto.length > 600 ? 12 : item.texto.length > 300 ? 10 : 8,
                WebkitBoxOrient: 'vertical',
              }}>
              {item.texto}
            </p>
          )}
          {!isSocial && !hasText && (
            <p className="text-blue-400 text-base italic">Acesse o site para ler a notícia completa.</p>
          )}

          {/* Social: restante da legenda após a primeira linha */}
          {isSocial && legenda.includes('\n') && (
            <p className="text-blue-100 leading-relaxed overflow-hidden"
              style={{
                fontSize: '0.9rem',
                display: '-webkit-box',
                WebkitLineClamp: 10,
                WebkitBoxOrient: 'vertical',
              }}>
              {legenda.split('\n').slice(1).join('\n')}
            </p>
          )}
        </div>
      </div>

       {/* Barra de progresso */}
      <div className="relative flex-shrink-0 px-12 py-4 border-t border-white/10">
        <div className="flex gap-2 flex-1">
          {feed.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 flex-1 ${i === idx ? 'bg-yellow-400' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

// ─── Painel de Calendário ──────────────────────────────────────────────────────

function CalendarPanel({ items }: { items: CalendarItem[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-yellow-400 rounded-full flex-shrink-0" />
        <h2 className="text-xl font-bold text-white">Calendário Escolar</h2>
      </div>

      {items.length === 0 ? (
        <p className="text-blue-300 text-sm">Nenhum evento próximo.</p>
      ) : (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {items.map((item, idx) => (
            <div key={idx} className="flex-1 min-h-0 bg-white/10 rounded-xl px-3 flex gap-3 items-center overflow-hidden">
              <div className="flex-shrink-0 bg-yellow-400 rounded-lg w-11 text-center py-1">
                <div className="text-base font-bold text-blue-900 leading-none">{item.dia}</div>
                <div className="text-[9px] font-bold text-blue-900">{MESES_ABREV[item.mes - 1]}</div>
              </div>
              <p className="text-white text-xs leading-relaxed line-clamp-2 flex-1">{item.atividade}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function TvDisplay() {
  const [classes, setClasses]         = useState<ClassInfo[]>([]);
  const [weekDates, setWeekDates]     = useState({ start: '', end: '' });
  const [feed, setFeed]               = useState<FeedItem[]>([]);
  const [calendar, setCalendar]       = useState<CalendarItem[]>([]);
  const [weather, setWeather]         = useState<WeatherData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  // ⑦ Modo slide fullscreen
  const [slideMode, setSlideMode]     = useState(false);

  const pad = (n: number) => String(n).padStart(2, '0');

  // ─ Fetch clima (Open-Meteo, sem chave) ──────────────────────────────────────
  const loadWeather = useCallback(async () => {
    try {
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=-16.18&longitude=-40.69&current=temperature_2m,weathercode,windspeed_10m&timezone=America%2FSao_Paulo'
      );
      const json = await res.json();
      setWeather({
        temp: json.current.temperature_2m,
        code: json.current.weathercode,
        wind: json.current.windspeed_10m,
      });
    } catch { /* falha silenciosa */ }
  }, []);

  // ─ Fetch dados da planilha ───────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      // Agenda
      const agendaRows = await fetchCSV();
      if (agendaRows.length > 1) {
        const r = agendaRows[1];
        setWeekDates({ start: r[0]?.trim() || '', end: r[1]?.trim() || '' });
      }
      const loadedClasses: ClassInfo[] = [];
      for (let i = 1; i < agendaRows.length; i++) {
        const cells = agendaRows[i];
        if (cells.length < 5) continue;
        const curso     = cells[2]?.trim() || '';
        const periodo   = cells[3]?.trim() || '';
        const materia   = cells[4]?.trim() || '';
        const professor = cells[5]?.trim() || '';
        const hours     = cells[6]?.trim() || '';
        const obs       = cells[7]?.trim() || '';
        if (!curso || !periodo || !materia) continue;
        // "º" já vem na variável periodo (ex: "1º"), não duplicar
        loadedClasses.push({
          period:      `${periodo} PERÍODO`,
          subject:     materia,
          professor:   professor || undefined,
          hours:       materia !== 'Sem agendamento' ? (hours || undefined) : undefined,
          observation: materia !== 'Sem agendamento' ? (obs   || undefined) : undefined,
          curso,
        });
      }
      setClasses(loadedClasses);

      // Notícias — últimos 15 dias
      const newsRows = await fetchCSV('1463370073');
      const loadedNews: (FeedItem & { kind: 'news' })[] = [];
      const quinzeDiasAtras = new Date();
      quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);
      quinzeDiasAtras.setHours(0,0,0,0);
      for (const cells of newsRows.slice(1)) {
        const imageUrl  = cells[0]?.trim() || '';
        const title     = cells[1]?.trim() || '';
        const categoria = cells[3]?.trim() || '';
        const parsed    = parseDateBR(cells[4]?.trim() || '');
        const texto     = cells[5]?.trim() || '';
        if (imageUrl.startsWith('http') && parsed && parsed.date >= quinzeDiasAtras)
          loadedNews.push({ kind: 'news', imageUrl, title, texto, categoria, dia: parsed.dia, mes: parsed.mes, ano: parsed.ano });
      }
      loadedNews.sort((a,b) => new Date(b.ano,b.mes-1,b.dia).getTime() - new Date(a.ano,a.mes-1,a.dia).getTime());

      // Posts de redes sociais — últimos 10
      const socialRows = await fetchCSV(SOCIAL_GID);
      const loadedSocial: (FeedItem & { kind: 'social' })[] = socialRows.slice(1)
        .map(cells => {
          const imagem  = cells[0]?.trim() || '';
          const legenda = cells[1]?.trim() || '';
          const link    = cells[2]?.trim() || '';
          const tipoRaw = cells[3]?.trim().toLowerCase() || 'foto';
          const tipo    = tipoRaw.startsWith('v') || tipoRaw === 'reels' ? 'video' : 'foto';
          const redeRaw = cells[4]?.trim().toLowerCase() || 'instagram';
          const rede    = redeRaw.includes('youtube') ? 'youtube' : 'instagram';
          return { kind: 'social' as const, imagem, legenda, link, tipo, rede };
        })
        .filter(p => p.imagem.startsWith('http'));

      // Intercalar: notícia, social, notícia, social...
      const merged: FeedItem[] = [];
      const maxLen = Math.max(loadedNews.length, loadedSocial.slice(0, 10).length);
      for (let i = 0; i < maxLen; i++) {
        if (i < loadedNews.length)               merged.push(loadedNews[i]);
        if (i < loadedSocial.slice(0,10).length) merged.push(loadedSocial[i]);
      }
      setFeed(merged.slice(0, 20));

      // Calendário — ⑤ 9 itens
      const calRows = await fetchCSV('1799591414');
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      const loadedCal: (CalendarItem & { date: Date })[] = [];
      for (const cells of calRows.slice(1)) {
        const dia      = parseInt(cells[0]?.trim() || '', 10);
        const mes      = parseMes(cells[1]?.trim() || '');
        const ano      = parseInt(cells[2]?.trim() || '', 10);
        const atividade= cells[3]?.trim() || '';
        if (!dia || !mes || !ano || !atividade) continue;
        const date = new Date(ano, mes-1, dia);
        if (isNaN(date.getTime()) || date < hoje) continue;
        loadedCal.push({ dia, mes, ano, atividade, date });
      }
      loadedCal.sort((a,b) => a.date.getTime() - b.date.getTime());
      setCalendar(loadedCal.slice(0, 9).map(({ date: _d, ...rest }) => rest));

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao carregar dados para TV:', err);
    }
  }, []);

  useEffect(() => {
    loadAll();
    loadWeather();
    const d = setInterval(loadAll, DATA_REFRESH_MS);
    const w = setInterval(loadWeather, WEATHER_REFRESH_MS);
    return () => { clearInterval(d); clearInterval(w); };
  }, [loadAll, loadWeather]);

  // ⑦ Disparar slide fullscreen a cada SLIDE_INTERVAL_MS
  useEffect(() => {
    const id = setInterval(() => {
      if (feed.length > 0) setSlideMode(true);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [feed.length]);

  return (
    <>
      {/* ⑦ Modo slide fullscreen */}
      {slideMode && feed.length > 0 && (
        <NewsSlide feed={feed} onDone={() => setSlideMode(false)} />
      )}

      <div className="h-screen overflow-hidden flex flex-col select-none relative"
        style={{ fontFamily: "'Poppins','Inter',sans-serif" }}>

        {/* Fundo animado — gradiente em mesh com CSS puro, sem dependências */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0d1f5c, #1a3a8f, #0a4f8a, #1e2d6b)',
          backgroundSize: '400% 400%',
          animation: 'meshGradient 20s ease infinite',
        }} />
        {/* Camada de blob para efeito mesh */}
        <div className="absolute inset-0 overflow-hidden">
          <div style={{
            position: 'absolute', width: '60%', height: '60%',
            borderRadius: '50%', filter: 'blur(80px)', opacity: 0.25,
            background: '#2563eb',
            animation: 'blob1 18s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '50%', height: '50%',
            borderRadius: '50%', filter: 'blur(80px)', opacity: 0.2,
            background: '#1d4ed8',
            animation: 'blob2 22s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', width: '40%', height: '40%',
            borderRadius: '50%', filter: 'blur(60px)', opacity: 0.15,
            background: '#3b82f6',
            animation: 'blob3 16s ease-in-out infinite',
          }} />
        </div>

        <style>{`
          @keyframes meshGradient {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes blob1 {
            0%,100% { top: -10%; left: -10%; }
            33%     { top: 30%;  left: 50%;  }
            66%     { top: 60%;  left: 10%;  }
          }
          @keyframes blob2 {
            0%,100% { top: 60%; right: -10%; left: auto; }
            33%     { top: 10%; right: 30%;  left: auto; }
            66%     { top: 50%; right: 60%;  left: auto; }
          }
          @keyframes blob3 {
            0%,100% { bottom: -10%; left: 30%; }
            33%     { bottom: 50%;  left: 60%; }
            66%     { bottom: 20%;  left: 10%; }
          }
        `}</style>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <header className="relative z-10 flex-shrink-0 px-8 py-3 flex items-center justify-between border-b border-white/10">

          {/* ③ Logo centralizada sem texto — usa grid de 3 colunas */}
          <div className="flex-1 flex items-center gap-3">
            {/* ⑧ Clima à esquerda */}
            <WeatherWidget data={weather} />
          </div>

          <div className="flex justify-center">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030187894/57Ypr7wbFX6eHCZZ7V6o8w/logo_cc3239cb.png"
              alt="Unimontes Campus Almenara"
              className="h-12 w-auto brightness-0 invert"
            />
          </div>

          <div className="flex-1 flex justify-end">
            <Clock />
          </div>
        </header>

        {/* ── Conteúdo principal — altura fixa, nunca precisa de scroll ────── */}
        {/* Header ~72px + footer ~36px + padding vertical 20px × 2 = ~148px  */}
        <main className="relative z-10 grid grid-cols-3 gap-5 px-8 py-5" style={{ height: 'calc(100dvh - 148px)' }}>
          <div className="bg-white/5 rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden border border-white/10">
            <AgendaPanel classes={classes} weekDates={weekDates} />
          </div>
          <div className="bg-white/5 rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden border border-white/10">
            <NewsPanel feed={feed} />
          </div>
          <div className="bg-white/5 rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden border border-white/10">
            <CalendarPanel items={calendar} />
          </div>
        </main>

        {/* ── Rodapé ─────────────────────────────────────────────────────── */}
        <footer className="relative z-10 flex-shrink-0 px-8 py-2 border-t border-white/10 flex items-center justify-between">
          <p className="text-blue-100 text-xs">Universidade Estadual de Montes Claros — Campus Almenara</p>
          {lastUpdated && (
            <p className="text-blue-100 text-xs">Atualizado às {pad(lastUpdated.getHours())}:{pad(lastUpdated.getMinutes())}</p>
          )}
        </footer>
      </div>
    </>
  );
}
