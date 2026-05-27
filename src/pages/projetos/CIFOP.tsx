import { ProjetoPage } from '@/components/ProjetoPage';

const intro = (
  <div className="space-y-3">
    <p>
      O <strong>CIFOP</strong> (Centro Interinstitucional de Formação de Professores da Educação Básica) é um projeto de extensão da Unimontes desenvolvido em parceria com a Rede Mineira de Formação de Professores. Funcionando como um <em>"terceiro espaço"</em>, ele integra o ensino superior às escolas públicas, promovendo formação continuada e diálogo docente de forma prática e colaborativa.
    </p>
    <p className="font-semibold text-gray-700">O projeto atua nas seguintes frentes:</p>
    <ul className="list-none space-y-2 pl-2">
      <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span><span><strong>Eventos e Formações:</strong> semanas de pedagogia e capacitações para elaboração de materiais didáticos voltados a professores da educação básica.</span></li>
      <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span><span><strong>Parcerias Regionais:</strong> integração com prefeituras e secretarias municipais de educação para fortalecer as diretrizes de ensino locais.</span></li>
      <li className="flex gap-2"><span className="text-blue-500 font-bold">•</span><span><strong>Instituições Envolvidas:</strong> além da Unimontes, o programa conta com a participação da UFMG, UFVJM e IFNMG.</span></li>
    </ul>
  </div>
);

export default function CIFOP() {
  return (
    <ProjetoPage
      title="CIFOP — Centro Interinstitucional de Formação de Professores"
      intro={intro}
      sheetGid="2043507306"
    />
  );
}
