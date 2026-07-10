import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarItem {
  dia: number;
  mes: number;
  ano: number;
  atividade: string;
  date: Date;
}

const MESES_ABREV = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const MESES_NOMES: { [key: string]: number } = {
  'janeiro': 1, 'jan': 1,
  'fevereiro': 2, 'fev': 2,
  'marco': 3, 'março': 3, 'mar': 3,
  'abril': 4, 'abr': 4,
  'maio': 5, 'mai': 5,
  'junho': 6, 'jun': 6,
  'julho': 7, 'jul': 7,
  'agosto': 8, 'ago': 8,
  'setembro': 9, 'set': 9,
  'outubro': 10, 'out': 10,
  'novembro': 11, 'nov': 11,
  'dezembro': 12, 'dez': 12,
};

function parseMes(raw: string): number {
  const trimmed = raw.trim();

  const asNumber = parseInt(trimmed, 10);
  if (!isNaN(asNumber) && asNumber >= 1 && asNumber <= 12) return asNumber;

  const normalized = trimmed
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return MESES_NOMES[normalized] || 0;
}

const CALENDARIO_PDF_URL = 'https://drive.google.com/file/d/1KtIHqC2_AzpwGb-lZFTKTyxNVGr_MIcV/view';
const SHEET_GID = '1799591414';
const ITEMS_PER_PAGE = 7;

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

export function CalendarioEscolar() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCalendario();
  }, []);

  const fetchCalendario = async () => {
    try {
      setLoading(true);
      setError(null);

      const sheetUrl = `https://docs.google.com/spreadsheets/d/1q_bLd3HXuFUH7Sogj3lo9D7aLv2BMqgX8P2iAnwbMF0/export?format=csv&gid=${SHEET_GID}`;

      let response = await fetch(sheetUrl);
      let csv = await response.text();

      if (csv.includes('Temporary Redirect') && csv.includes('HREF')) {
        const match = csv.match(/HREF="([^"]+)"/);
        if (match && match[1]) {
          const redirectUrl = match[1].replace(/&amp;/g, '&');
          response = await fetch(redirectUrl);
          csv = await response.text();
        }
      }

      if (!response.ok) throw new Error(`Erro ao buscar dados da planilha: ${response.status}`);
      if (!csv || csv.includes('<HTML>') || csv.includes('<!DOCTYPE')) {
        throw new Error('Planilha não está acessível.');
      }

      const rows = parseCSV(csv).slice(1); // pula header
      const parsed: CalendarItem[] = [];

      for (const cells of rows) {
        if (cells.length < 4) continue;

        const dia = parseInt(cells[0]?.trim() || '', 10);
        const mes = parseMes(cells[1]?.trim() || '');
        const ano = parseInt(cells[2]?.trim() || '', 10);
        const atividade = cells[3]?.trim() || '';

        if (!dia || !mes || !ano || !atividade) continue;

        const date = new Date(ano, mes - 1, dia);
        if (isNaN(date.getTime())) continue;

        parsed.push({ dia, mes, ano, atividade, date });
      }

      // Filtra a partir de hoje (inclusive) e ordena por data crescente
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const futuras = parsed
        .filter((item) => item.date >= hoje)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      setItems(futuras);
      setCurrentPage(1);
    } catch (err) {
      console.error('Erro ao carregar calendário escolar:', err);
      setError('Não foi possível carregar o calendário escolar.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 md:p-8 h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-7 bg-blue-600 rounded-full" />
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Calendário Escolar</h2>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-gray-500">{error}</p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum evento próximo cadastrado.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="space-y-0">
          {paginatedItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex gap-4 py-4 ${idx !== paginatedItems.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              {(() => {
                const hoje = new Date(); hoje.setHours(0,0,0,0);
                const isToday = new Date(item.ano, item.mes - 1, item.dia).getTime() === hoje.getTime();
                return (
                  <div className="flex-shrink-0 w-14 text-center relative">
                    {isToday && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-blue-900 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide leading-none whitespace-nowrap z-10">
                        HOJE
                      </span>
                    )}
                    <div className={`rounded-lg py-2 ${isToday ? 'bg-yellow-400' : 'bg-blue-50'}`}>
                      <div className={`text-xl font-bold leading-none ${isToday ? 'text-blue-900' : 'text-blue-600'}`}>{item.dia}</div>
                      <div className={`text-[10px] font-semibold mt-1 ${isToday ? 'text-blue-900' : 'text-blue-500'}`}>{MESES_ABREV[item.mes - 1]}</div>
                    </div>
                  </div>
                );
              })()}
              <div className="flex-1 pt-1">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item.atividade}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação numérica */}
      {!loading && !error && totalPages > 1 && (
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

      <div className="mt-4 pt-4 border-t border-gray-100">
        <a
          href={CALENDARIO_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Ver calendário escolar
          <span aria-hidden="true">›</span>
        </a>
      </div>
    </div>
  );
}
