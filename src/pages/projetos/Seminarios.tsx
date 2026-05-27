import { ProjetoPage } from '@/components/ProjetoPage';

const intro = (
  <div className="space-y-3">
    <p>
      O <strong>seminário acadêmico</strong> é uma atividade de estudo aprofundado e apresentação oral sobre um tema específico. Diferente de uma aula expositiva comum, o seminário coloca o estudante como protagonista: ele pesquisa, organiza o conteúdo, elabora materiais de apoio e conduz o debate com a turma.
    </p>
    <p>
      Para uma boa apresentação, é essencial dominar o tema, estruturar bem os slides ou materiais visuais, ser claro e objetivo na fala e estar preparado para responder perguntas e estimular a discussão. O seminário desenvolve habilidades fundamentais para a vida acadêmica e profissional, como comunicação, síntese e pensamento crítico.
    </p>
  </div>
);

export default function Seminarios() {
  return (
    <ProjetoPage
      title="Seminários"
      intro={intro}
      sheetGid="1513698017"
    />
  );
}
