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
        <div className="flex-1 overflow-hidden space-y-2">
          {classes.map((c, idx) => {
            const cfg = cursoConfig[c.curso] || { dot: 'bg-gray-400', tag: c.curso.toUpperCase() };
            return (
              <div key={idx} className="bg-white/10 rounded-xl px-4 py-2.5 flex gap-3 items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                <div className="min-w-0 flex-1">
                  {/* ① Quebra de linha no nome do curso + formato correto do período */}
                  <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wide leading-tight">
                    {cfg.tag}<br />{c.period}
                  </div>
                  <p className="text-white font-semibold text-sm leading-snug mt-1">
                    {c.subject}
                  </p>
                  {c.professor && (
                    <p className="text-blue-300 text-xs mt-0.5 truncate">{c.professor}</p>
                  )}
                  {/* ⑥ Carga horária e observação */}
                  {c.hours && (
                    <p className="text-blue-400 text-[10px] mt-0.5">⏱ {c.hours}</p>
                  )}
                  {c.observation && (
                    <p className="text-yellow-300/80 text-[10px] mt-0.5 line-clamp-1">⚠ {c.observation}</p>
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

function NewsPanel({ news }: { news: NewsItem[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (news.length <= 1) return;
    const id = setInterval(() => setCurrent(prev => (prev + 1) % news.length), NEWS_ROTATION_MS);
    return () => clearInterval(id);
  }, [news.length]);

  if (news.length === 0) return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-yellow-400 rounded-full flex-shrink-0" />
        <h2 className="text-xl font-bold text-white">Notícias</h2>
      </div>
      <p className="text-blue-300 text-sm">Nenhuma notícia disponível.</p>
    </div>
  );

  const item = news[current];
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-yellow-400 rounded-full flex-shrink-0" />
        <h2 className="text-xl font-bold text-white">Notícias</h2>
        <span className="ml-auto text-blue-300 text-xs">{current + 1}/{news.length}</span>
      </div>

      <div className="relative w-full rounded-2xl overflow-hidden bg-white/10 flex-shrink-0" style={{ aspectRatio: '16/7' }}>
        <img key={item.imageUrl} src={item.imageUrl} alt={item.title}
          className="w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        {item.categoria && (
          <span className="absolute top-3 left-3 bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">
            {item.categoria}
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-bold text-lg leading-snug line-clamp-2 drop-shadow">{item.title}</p>
          <p className="text-blue-200 text-xs mt-1">
            {String(item.dia).padStart(2,'0')}/{String(item.mes).padStart(2,'0')}/{item.ano}
          </p>
        </div>
      </div>

      {news.length > 1 && (
        <div className="flex gap-1.5 mt-3 justify-center">
          {news.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'w-6 h-2 bg-yellow-400' : 'w-2 h-2 bg-white/30'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Slide Fullscreen ─────────────────────────────────────────────────────────

function NewsSlide({ news, onDone }: { news: NewsItem[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (news.length === 0) { onDone(); return; }
    const id = setInterval(() => {
      setIdx(prev => {
        const next = prev + 1;
        if (next >= news.length) { clearInterval(id); onDone(); return prev; }
        return next;
      });
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, [news.length, onDone]);

  if (news.length === 0) return null;
  const item = news[idx];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Imagem de fundo */}
      <div className="absolute inset-0">
        <img src={item.imageUrl} alt={item.title}
          className="w-full h-full object-cover opacity-40"
          onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
      </div>

      {/* Logo + skip */}
      <div className="relative flex items-center justify-between px-12 py-6">
        <img src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030187894/57Ypr7wbFX6eHCZZ7V6o8w/logo_cc3239cb.png"
          alt="Unimontes" className="h-12 brightness-0 invert" />
        <button onClick={onDone} className="text-white/50 hover:text-white text-sm transition-colors">
          Fechar apresentação ✕
        </button>
      </div>

      {/* Conteúdo centralizado */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-24 text-center">
        {item.categoria && (
          <span className="bg-yellow-400 text-blue-900 text-sm font-bold px-5 py-1.5 rounded-full mb-6 inline-block">
            {item.categoria}
          </span>
        )}
        <h1 className="text-white font-bold text-5xl leading-tight max-w-4xl drop-shadow-lg">
          {item.title}
        </h1>
        <p className="text-blue-300 text-lg mt-6">
          {String(item.dia).padStart(2,'0')}/{String(item.mes).padStart(2,'0')}/{item.ano}
        </p>
      </div>

      {/* Progresso + contador */}
      <div className="relative px-12 py-6 flex items-center gap-6">
        <div className="flex gap-2">
          {news.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-10 bg-yellow-400' : 'w-4 bg-white/30'}`} />
          ))}
        </div>
        <span className="text-white/50 text-xs ml-auto">{idx + 1} de {news.length}</span>
      </div>
    </div>
  );
}

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
        <div className="flex-1 overflow-hidden space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white/10 rounded-xl px-3 py-2.5 flex gap-3 items-start">
              <div className="flex-shrink-0 bg-yellow-400 rounded-lg w-11 text-center py-1.5">
                <div className="text-base font-bold text-blue-900 leading-none">{item.dia}</div>
                <div className="text-[9px] font-bold text-blue-900 mt-0.5">{MESES_ABREV[item.mes - 1]}</div>
              </div>
              <p className="text-white text-xs leading-relaxed line-clamp-2 flex-1 pt-0.5">{item.atividade}</p>
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
  const [news, setNews]               = useState<NewsItem[]>([]);
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
        if (!curso || !periodo || !materia || materia === 'Sem agendamento') continue;
        // ② formato: "1º PERÍODO" sem "O" duplicado
        loadedClasses.push({
          period:      `${periodo}º PERÍODO`,
          subject:     materia,
          professor:   professor || undefined,
          hours:       hours     || undefined,
          observation: obs       || undefined,
          curso,
        });
      }
      setClasses(loadedClasses);

      // Notícias
      const newsRows = await fetchCSV('1463370073');
      const loadedNews: NewsItem[] = [];
      for (const cells of newsRows.slice(1)) {
        const imageUrl  = cells[0]?.trim() || '';
        const title     = cells[1]?.trim() || '';
        const categoria = cells[3]?.trim() || '';
        const parsed    = parseDateBR(cells[4]?.trim() || '');
        if (imageUrl.startsWith('http') && parsed)
          loadedNews.push({ imageUrl, title, categoria, dia: parsed.dia, mes: parsed.mes, ano: parsed.ano });
      }
      loadedNews.sort((a,b) => new Date(b.ano,b.mes-1,b.dia).getTime() - new Date(a.ano,a.mes-1,a.dia).getTime());
      setNews(loadedNews.slice(0, 10));

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
      if (news.length > 0) setSlideMode(true);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [news.length]);

  return (
    <>
      {/* ⑦ Modo slide fullscreen */}
      {slideMode && news.length > 0 && (
        <NewsSlide news={news} onDone={() => setSlideMode(false)} />
      )}

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex flex-col select-none overflow-hidden"
        style={{ fontFamily: "'Poppins','Inter',sans-serif" }}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <header className="flex-shrink-0 px-8 py-3 flex items-center justify-between border-b border-white/10">

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

        {/* ── Conteúdo principal ──────────────────────────────────────────── */}
        <main className="flex-1 grid grid-cols-3 gap-5 px-8 py-5 min-h-0">
          <div className="bg-white/5 rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden border border-white/10">
            <AgendaPanel classes={classes} weekDates={weekDates} />
          </div>
          <div className="bg-white/5 rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden border border-white/10">
            <NewsPanel news={news} />
          </div>
          <div className="bg-white/5 rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden border border-white/10">
            <CalendarPanel items={calendar} />
          </div>
        </main>

        {/* ── Rodapé ─────────────────────────────────────────────────────── */}
        <footer className="flex-shrink-0 px-8 py-2 border-t border-white/10 flex items-center justify-between">
          <p className="text-blue-400 text-xs">Universidade Estadual de Montes Claros — Campus Almenara</p>
          {lastUpdated && (
            <p className="text-blue-500 text-xs">Atualizado às {pad(lastUpdated.getHours())}:{pad(lastUpdated.getMinutes())}</p>
          )}
        </footer>
      </div>
    </>
  );
}
