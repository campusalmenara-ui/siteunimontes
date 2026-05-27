import { ProjetoPage } from '@/components/ProjetoPage';

const intro = (
  <div className="space-y-3">
    <p>
      Confira os <strong>eventos acadêmicos e científicos</strong> da Unimontes — Campus Almenara. Esta página reúne o registro fotográfico e informações sobre as atividades realizadas no campus, incluindo congressos, simpósios, mesas-redondas e outras ações culturais e educacionais.
    </p>
    <p>
      Use os filtros abaixo para encontrar eventos por curso e acompanhe a programação que atende à comunidade acadêmica local de Almenara.
    </p>
  </div>
);

export default function Eventos() {
  return (
    <ProjetoPage
      title="Eventos"
      intro={intro}
      sheetGid="1150212095"
    />
  );
}
