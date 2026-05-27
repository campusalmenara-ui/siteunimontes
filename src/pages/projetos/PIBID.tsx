import { ProjetoPage } from '@/components/ProjetoPage';

const intro = (
  <div className="space-y-3">
    <p>
      O <strong>PIBID</strong> (Programa Institucional de Bolsa de Iniciação à Docência) insere estudantes de licenciatura da Unimontes diretamente em escolas públicas, aproximando a formação acadêmica da realidade da sala de aula desde os primeiros períodos do curso.
    </p>
    <p>
      Financiado pela{' '}
      <a href="https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/educacao-basica/pibid" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">CAPES</a>
      , o programa oferece bolsas tanto para os estudantes participantes quanto para os professores supervisores das escolas parceiras. É uma oportunidade única de vivenciar a docência de forma orientada e com suporte institucional.
    </p>
    <p>
      Informações atualizadas, resultados de processos seletivos e documentos oficiais de inscrição estão disponíveis na{' '}
      <a href="https://unimontes.br/editais/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Página de Editais da Unimontes</a>.
    </p>
  </div>
);

export default function PIBID() {
  return (
    <ProjetoPage
      title="PIBID — Programa de Iniciação à Docência"
      intro={intro}
      sheetGid="1876570171"
    />
  );
}
