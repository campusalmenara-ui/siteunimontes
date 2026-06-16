import { useState, useEffect } from 'react';

interface CalendarItem {
  dia: number;
  mes: number;
  ano: number;
  atividade: string;
  date: Date;
}

const MESES_ABREV = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

// URL do PDF do Calendário Escolar (mesmo link usado no menu Aluno)
const CALENDARIO_PDF_URL = 'https://drive.google.com/file/d/1KtIHqC2_AzpwGb-lZFTKTyxNVGr_MIcV/view';

// gid da aba "Calendário Escolar" na planilha
const SHEET_GID = '1799591414';

export function CalendarioEscolar() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendario();
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

      const lines = csv.trim().split('\n');
      const parsed: CalendarItem[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cells = parseCSVLine(line);
        if (cells.length < 4) continue;

        const dia = parseInt(cells[0]?.trim() || '', 10);
        const mes = parseInt(cells[1]?.trim() || '', 10);
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
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);

      setItems(futuras);
    } catch (err) {
      console.error('Erro ao carregar calendário escolar:', err);
      setError('Não foi possível carregar o calendário escolar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg">
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
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`flex gap-4 py-4 ${idx !== items.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex-shrink-0 w-14 text-center">
                <div className="bg-blue-50 rounded-lg py-2">
                  <div className="text-xl font-bold text-blue-600 leading-none">{item.dia}</div>
                  <div className="text-[10px] font-semibold text-blue-500 mt-1">{MESES_ABREV[item.mes - 1]}</div>
                </div>
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-gray-700 leading-relaxed">{item.atividade}</p>
              </div>
            </div>
          ))}
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
