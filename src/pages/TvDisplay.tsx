import { useState, useEffect, useCallback } from 'react';

// ─── Interfaces ────────────────────────────────────────────────────────────────

interface ClassInfo {
  period: string;
  subject: string;
  professor?: string;
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
  atividade: string;
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const SPREADSHEET_ID = '1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0';
const MESES_ABREV = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
const MESES_NOMES: { [key: string]: number } = {
  'janeiro':1,'jan':1,'fevereiro':2,'fev':2,'marco':3,'março':3,'mar':3,
  'abril':4,'abr':4,'maio':5,'mai':5,'junho':6,'jun':6,'julho':7,'jul':7,
  'agosto':8,'ago':8,'setembro':9,'set':9,'outubro':10,'out':10,
  'novembro':11,'nov':11,'dezembro':12,'dez':12,
};

// Intervalo de rotação de notícias (ms) e de atualização de dados (ms)
const NEWS_ROTATION_MS   = 12_000;
const DATA_REFRESH_MS    = 5 * 60_000;

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
  let ano = parseInt(m[3], 10);
  if (ano < 100) ano += 2000;
  const date = new Date(ano, mes - 1, dia);
  return isNaN(date.getTime()) ? null : { dia, mes, ano, date };
}

// Parser CSV completo (respeita aspas e quebras de linha dentro de células)
function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQ = false;
  let i = 0;
  while (i < csv.length) {
    const c = csv[i], n = csv[i + 1];
    if (c === '"') {
      if (inQ && n === '"') { cell += '"'; i += 2; continue; }
      inQ = !inQ; i++; continue;
    }
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
  let res = await fetch(url);
  let text = await res.text();
  if (text.includes('Temporary Redirect') && text.includes('HREF')) {
    const m = text.match(/HREF="([^"]+)"/);
    if (m?.[1]) { res = await fetch(m[1].replace(/&amp;/g, '&')); text = await res.text(); }
  }
  if (!res.ok || text.includes('<HTML>') || text.includes('<!DOCTYPE'))
    throw new Error('Planilha inacessível');
  return parseCSV(text);
}

// ─── Relógio ───────────────────────────────────────────────────────────────────

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const diasSemana = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];

  return (
    <div className="text-right">
      <div className="text-4xl font-bold text-white tabular-nums leading-none">
        {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
      </div>
      <div className="text-blue-200 text-sm mt-1">
        {diasSemana[now.getDay()]}, {pad(now.getDate())}/{pad(now.getMonth() + 1)}/{now.getFullYear()}
      </div>
    </div>
  );
}

// ─── Painel de Agenda ──────────────────────────────────────────────────────────

function AgendaPanel({ classes, weekDates }: { classes: ClassInfo[]; weekDates: { start: string; end: string } }) {
  const cursoConfig: { [key: string]: { dot: string; label: string } } = {
    'Pedagogia':  { dot: 'bg-purple-400', label: 'Pedagogia'  },
    'Letras':     { dot: 'bg-blue-400',   label: 'Letras'     },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-yellow-400 rounded-full flex-shrink-0" />
        <h2 className="text-xl font-bold text-white">Agenda Semanal</h2>
      </div>

      {weekDates.start && (
        <p className="text-blue-200 text-xs mb-4">
          Semana de {weekDates.start} a {weekDates.end}
        </p>
      )}

      {classes.length === 0 ? (
        <p className="text-blue-300 text-sm">Nenhuma aula cadastrada.</p>
      ) : (
        <div className="flex-1 overflow-hidden space-y-2">
          {classes.map((c, idx) => {
            const cfg = cursoConfig[c.curso] || { dot: 'bg-gray-400', label: c.curso };
            return (
              <div key={idx} className="bg-white/10 rounded-xl px-4 py-3 flex gap-3 items-start">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${cfg.dot}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wide">
                      {c.curso} • {c.period}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm leading-snug mt-0.5 truncate">
                    {c.subject}
                  </p>
                  {c.professor && (
                    <p className="text-blue-300 text-xs mt-0.5 truncate">
                      {c.professor}
                    </p>
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

// ─── Painel de Notícias (carrossel automático) ─────────────────────────────────

function NewsPanel({ news }: { news: NewsItem[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (news.length <= 1) return;
    const id = setInterval(() => {
      setCurrent(prev => (prev + 1) % news.length);
    }, NEWS_ROTATION_MS);
    return () => clearInterval(id);
  }, [news.length]);

  if (news.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-yellow-400 rounded-full flex-shrink-0" />
          <h2 className="text-xl font-bold text-white">Notícias</h2>
        </div>
        <p className="text-blue-300 text-sm">Nenhuma notícia disponível.</p>
      </div>
    );
  }

  const item = news[current];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-yellow-400 rounded-full flex-shrink-0" />
        <h2 className="text-xl font-bold text-white">Notícias</h2>
        <span className="ml-auto text-blue-300 text-xs">
          {current + 1}/{news.length}
        </span>
      </div>

      {/* Imagem */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-white/10 flex-shrink-0"
           style={{ aspectRatio: '16/7' }}>
        <img
          key={item.imageUrl}
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-opacity duration-700"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {item.categoria && (
          <span className="absolute top-3 left-3 bg-yellow-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-full">
            {item.categoria}
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white font-bold text-lg leading-snug line-clamp-2 drop-shadow">
            {item.title}
          </p>
          <p className="text-blue-200 text-xs mt-1">
            {String(item.dia).padStart(2,'0')}/{String(item.mes).padStart(2,'0')}/{item.ano}
          </p>
        </div>
      </div>

      {/* Indicadores */}
      {news.length > 1 && (
        <div className="flex gap-1.5 mt-3 justify-center">
          {news.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-2 bg-yellow-400' : 'w-2 h-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
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
            <div key={idx} className="bg-white/10 rounded-xl px-3 py-3 flex gap-3 items-start">
              <div className="flex-shrink-0 bg-yellow-400 rounded-lg w-12 text-center py-1.5">
                <div className="text-xl font-bold text-blue-900 leading-none">{item.dia}</div>
                <div className="text-[10px] font-bold text-blue-900 mt-0.5">
                  {MESES_ABREV[item.mes - 1]}
                </div>
              </div>
              <p className="text-white text-sm leading-relaxed line-clamp-3 flex-1">
                {item.atividade}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function TvDisplay() {
  const [classes, setClasses]       = useState<ClassInfo[]>([]);
  const [weekDates, setWeekDates]   = useState({ start: '', end: '' });
  const [news, setNews]             = useState<NewsItem[]>([]);
  const [calendar, setCalendar]     = useState<CalendarItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQ = false;
    for (const char of line) {
      if (char === '"') { inQ = !inQ; continue; }
      if (char === ',' && !inQ) { result.push(current); current = ''; continue; }
      current += char;
    }
    result.push(current);
    return result;
  };

  const loadAll = useCallback(async () => {
    try {
      // ── Agenda ───────────────────────────────────────────────────────────
      const agendaRows = await fetchCSV();
      if (agendaRows.length > 1) {
        const firstRow = parseCSVLine(agendaRows[1].join(','));
        setWeekDates({ start: firstRow[0]?.trim() || '', end: firstRow[1]?.trim() || '' });
      }

      const loadedClasses: ClassInfo[] = [];
      for (let i = 1; i < agendaRows.length; i++) {
        const cells = agendaRows[i];
        if (cells.length < 5) continue;
        const curso     = cells[2]?.trim() || '';
        const periodo   = cells[3]?.trim() || '';
        const materia   = cells[4]?.trim() || '';
        const professor = cells[5]?.trim() || '';
        if (!curso || !periodo || !materia || materia === 'Sem agendamento') continue;
        loadedClasses.push({ period: `${periodo}° P`, subject: materia, professor: professor || undefined, curso });
      }
      setClasses(loadedClasses);

      // ── Notícias ─────────────────────────────────────────────────────────
      const newsRows = await fetchCSV('1463370073');
      const loadedNews: NewsItem[] = [];
      for (const cells of newsRows.slice(1)) {
        const imageUrl  = cells[0]?.trim() || '';
        const title     = cells[1]?.trim() || '';
        const categoria = cells[3]?.trim() || '';
        const dataRaw   = cells[4]?.trim() || '';
        const parsed = parseDateBR(dataRaw);
        if (imageUrl.startsWith('http') && parsed) {
          loadedNews.push({ imageUrl, title, categoria, dia: parsed.dia, mes: parsed.mes, ano: parsed.ano });
        }
      }
      loadedNews.sort((a, b) => new Date(b.ano, b.mes-1, b.dia).getTime() - new Date(a.ano, a.mes-1, a.dia).getTime());
      setNews(loadedNews.slice(0, 10));

      // ── Calendário ───────────────────────────────────────────────────────
      const calRows = await fetchCSV('1799591414');
      const hoje = new Date(); hoje.setHours(0,0,0,0);
      const loadedCal: CalendarItem[] = [];
      for (const cells of calRows.slice(1)) {
        const dia = parseInt(cells[0]?.trim() || '', 10);
        const mes = parseMes(cells[1]?.trim() || '');
        const ano = parseInt(cells[2]?.trim() || '', 10);
        const atividade = cells[3]?.trim() || '';
        if (!dia || !mes || !ano || !atividade) continue;
        const date = new Date(ano, mes-1, dia);
        if (isNaN(date.getTime()) || date < hoje) continue;
        loadedCal.push({ dia, mes, atividade });
      }
      loadedCal.sort((a, b) => {
        const dA = new Date(new Date().getFullYear(), a.mes-1, a.dia);
        const dB = new Date(new Date().getFullYear(), b.mes-1, b.dia);
        return dA.getTime() - dB.getTime();
      });
      setCalendar(loadedCal.slice(0, 6));

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao carregar dados para TV:', err);
    }
  }, []);

  // Carrega na montagem e recarrega a cada DATA_REFRESH_MS
  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, DATA_REFRESH_MS);
    return () => clearInterval(id);
  }, [loadAll]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex flex-col select-none overflow-hidden"
      style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 px-8 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-4">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310419663030187894/57Ypr7wbFX6eHCZZ7V6o8w/logo_cc3239cb.png"
            alt="Unimontes"
            className="h-10 w-auto brightness-0 invert"
          />
          <div>
            <p className="text-white font-bold text-base leading-none">Unimontes</p>
            <p className="text-blue-300 text-xs mt-0.5">Campus Almenara</p>
          </div>
        </div>

        <Clock />
      </header>

      {/* ── Conteúdo principal ─────────────────────────────────────────────── */}
      <main className="flex-1 grid grid-cols-3 gap-5 px-8 py-5 min-h-0">

        {/* Coluna 1 — Agenda */}
        <div className="bg-white/5 rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden border border-white/10">
          <AgendaPanel classes={classes} weekDates={weekDates} />
        </div>

        {/* Coluna 2 — Notícias (carrossel) */}
        <div className="bg-white/5 rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden border border-white/10">
          <NewsPanel news={news} />
        </div>

        {/* Coluna 3 — Calendário */}
        <div className="bg-white/5 rounded-2xl p-5 flex flex-col min-h-0 overflow-hidden border border-white/10">
          <CalendarPanel items={calendar} />
        </div>

      </main>

      {/* ── Rodapé ─────────────────────────────────────────────────────────── */}
      <footer className="flex-shrink-0 px-8 py-2 border-t border-white/10 flex items-center justify-between">
        <p className="text-blue-400 text-xs">
          Universidade Estadual de Montes Claros — Campus Almenara
        </p>
        {lastUpdated && (
          <p className="text-blue-500 text-xs">
            Atualizado às {pad(lastUpdated.getHours())}:{pad(lastUpdated.getMinutes())}
          </p>
        )}
      </footer>
    </div>
  );
}
