import { useEffect } from 'react';
import { useHashLocation } from 'wouter/use-hash-location';

/**
 * Reseta o scroll para o topo sempre que a rota (hash) muda.
 *
 * Importante: usa behavior instantâneo (sem 'smooth') e roda de forma
 * síncrona no momento da troca de rota — antes de qualquer setTimeout
 * de scroll-to-section disparado por botões como "Notícias", "Cursos",
 * "Projetos" ou "Secretaria" (que usam delays de 300-600ms). Esses
 * fluxos continuam funcionando normalmente: este componente só evita
 * que a NOVA página abra "no meio", herdando a posição de scroll da
 * página anterior quando não há nenhuma intenção de rolagem.
 */
export function ScrollToTop() {
  const [location] = useHashLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location]);

  return null;
}
