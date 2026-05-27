import { ProjetoPage } from '@/components/ProjetoPage';

const intro = (
  <div className="space-y-3">
    <p>
      As <strong>Atividades Acadêmico-Científico-Culturais (AACC)</strong> são componentes curriculares obrigatórios do eixo de formação prática na Unimontes. Seu objetivo é enriquecer a formação interdisciplinar e humanística dos estudantes, exigindo o cumprimento de uma carga horária mínima extra-sala de aula — que varia conforme o Projeto Pedagógico de cada curso.
    </p>
    <p className="font-semibold text-gray-700">Exemplos de atividades válidas para contabilizar horas:</p>
    <ul className="list-none space-y-2 pl-2">
      <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span><span><strong>Pesquisa e Extensão:</strong> participação em projetos institucionais e monitorias.</span></li>
      <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span><span><strong>Eventos Acadêmicos:</strong> simpósios, congressos, semanas científicas, palestras e seminários.</span></li>
      <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span><span><strong>Produção Cultural e Científica:</strong> publicação de artigos e participação em grupos de estudos.</span></li>
      <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span><span><strong>Cursos de Extensão:</strong> atividades extracurriculares voltadas ao mercado de trabalho e à área de atuação.</span></li>
    </ul>
  </div>
);

export default function AACC() {
  return (
    <ProjetoPage
      title="AACC — Atividades Acadêmico-Científico-Culturais"
      intro={intro}
      sheetGid="159757681"
    />
  );
}
