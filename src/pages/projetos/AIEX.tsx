import { ProjetoPage } from '@/components/ProjetoPage';

const intro = (
  <div className="space-y-3">
    <p>
      As <strong>Atividades Integradas de Extensão (AIEx)</strong> da Unimontes são ações curriculares obrigatórias que conectam o conhecimento acadêmico às necessidades da comunidade. Por meio delas, a universidade cumpre seu papel social ao levar o saber produzido dentro das salas de aula para além dos muros do campus.
    </p>
    <p>
      Para concluir o curso, cada estudante deve cumprir <strong>10% da carga horária total</strong> por meio de projetos, programas, cursos, oficinas ou eventos extensionistas devidamente aprovados pela instituição.
    </p>
  </div>
);

export default function AIEX() {
  return (
    <ProjetoPage
      title="AIEx — Atividades Integradas de Extensão"
      intro={intro}
      sheetGid="31923285"
    />
  );
}
