import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, AlertTriangle, CheckCircle, Mail, ExternalLink } from 'lucide-react';
import { Header } from '@/components/Header';

interface Solicitacao {
  titulo: string;
  tag: 'aluno+coord' | 'aluno+secretaria' | 'aluno+secretaria+coord' | 'aluno+professor' | 'recepcao' | null;
  conteudo: React.ReactNode;
}

const Tag = ({ tipo }: { tipo: Solicitacao['tag'] }) => {
  const map: Record<string, { label: string; color: string }> = {
    'aluno+coord':             { label: '👤 Aluno + Coordenação',                    color: 'bg-purple-100 text-purple-700' },
    'aluno+secretaria':        { label: '👤 Aluno + Secretaria Geral',               color: 'bg-blue-100 text-blue-700' },
    'aluno+secretaria+coord':  { label: '👤 Aluno + Secretaria + Coordenação',       color: 'bg-indigo-100 text-indigo-700' },
    'aluno+professor':         { label: '👤 Aluno + Professor',                      color: 'bg-green-100 text-green-700' },
    'recepcao':                { label: '📬 Protocolar via Recepção',                color: 'bg-orange-100 text-orange-700' },
  };
  if (!tipo || !map[tipo]) return null;
  const { label, color } = map[tipo];
  return <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${color} mb-3`}>{label}</span>;
};

const Alerta = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm mb-3">
    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

const Info = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-sm mb-3">
    <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

const Passo = ({ num, children }: { num: number; children: React.ReactNode }) => (
  <div className="flex gap-3 mb-2">
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{num}</span>
    <span className="text-gray-600 text-sm leading-relaxed">{children}</span>
  </div>
);

const Lista = ({ items }: { items: string[] }) => (
  <ul className="space-y-1 mb-3">
    {items.map((item, i) => (
      <li key={i} className="flex gap-2 text-sm text-gray-600">
        <span className="text-blue-500 font-bold flex-shrink-0">•</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const EmailBtn = ({ email, titulo }: { email: string; titulo?: string }) => (
  <a href={`mailto:${email}${titulo ? `?subject=${encodeURIComponent(titulo)}` : ''}`}
    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors">
    <Mail size={13} /> {email}
  </a>
);

const Link = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium text-sm">
    {children} <ExternalLink size={12} />
  </a>
);

const SecretariaLink = () => (
  <Info>Para consultar o e-mail do responsável pelo seu curso, acesse a aba <strong>Secretaria → Contatos</strong>.</Info>
);

const solicitacoes: Solicitacao[] = [
  {
    titulo: 'Abono de Faltas',
    tag: 'aluno+coord',
    conteudo: (
      <div>
        <Info>Esta solicitação é resolvida diretamente com a Coordenação do Curso — <strong>não passa pela Secretaria Geral</strong>.</Info>
        <p className="text-sm text-gray-700 font-semibold mb-2">O abono de faltas só é concedido em dois casos:</p>
        <Lista items={[
          'Estudante convocado para manobras militares.',
          'Estudante participando de congresso científico, competição desportiva ou artística em caráter oficial.',
        ]} />
        <Alerta>Atestado médico de até 3 dias não abona faltas. Apresente à coordenação apenas para justificar ausência em atividade avaliativa.</Alerta>
        <Info>Estudantes em luto (pai, mãe, filho(a), irmão(ã), avô, avó ou cônjuge) têm direito a trabalhos e provas em 2ª oportunidade — data marcada pelo Coordenador.</Info>
        <p className="text-sm text-gray-500">Se o atestado for de mais de 4 dias, consulte a solicitação <strong>Tratamento Excepcional</strong>.</p>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Acesso ao WEBGIZ ("WebAluno")',
    tag: null,
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">O WebGiz é o sistema onde o aluno acompanha frequência, notas, disciplinas matriculadas, comprovante de matrícula, coeficiente de rendimento e dados cadastrais.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como acessar:</p>
        <Passo num={1}>Acesse <Link href="http://www.webgiz.unimontes.br">webgiz.unimontes.br</Link></Passo>
        <Passo num={2}>Em <strong>Login</strong>, digite seu número de matrícula completo.</Passo>
        <Passo num={3}>Em <strong>Senha</strong>, digite sua data de nascimento com 8 dígitos. Ex: 28041983</Passo>
        <Passo num={4}>Se esqueceu a senha, clique em <strong>"Esqueci a senha"</strong>.</Passo>
        <Alerta>Se não conseguir acessar, envie e-mail ao responsável do seu curso na Secretaria Geral.</Alerta>
        <p className="text-sm font-semibold text-gray-700 mb-2">Renovação de Matrícula via WebGiz:</p>
        <Lista items={[
          'A renovação de matrícula é feita semestralmente pelo WebGiz.',
          'Consulte o Calendário Acadêmico para não perder o prazo.',
          'Quem não renovar no prazo será considerado desistente.',
          'Se a matrícula estiver trancada, solicite a renovação por e-mail ao responsável do curso.',
        ]} />
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Aproveitamento de Carga Horária (PIBID/RP) para Estágio',
    tag: 'aluno+professor',
    conteudo: (
      <div>
        <Info>Esta solicitação é resolvida diretamente com o professor de estágio — <strong>não passa pela Secretaria Geral nem pela Coordenação</strong>.</Info>
        <p className="text-sm text-gray-700 mb-3">A <strong>Resolução nº 039 – CEPEx/2018</strong> regulamenta o aproveitamento da carga horária do PIBID e da Residência Pedagógica (RP).</p>
        <Lista items={[
          'O PIBID não pode ser aproveitado diretamente para Estágio, mas pode ser usado para AACC e AIEx.',
          'A Residência Pedagógica (RP) pode ter um percentual aproveitado para Estágio, conforme definido pelo colegiado de cada curso.',
        ]} />
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Entre em contato com o professor de estágio.</Passo>
        <Passo num={2}>Entregue toda a documentação necessária, que ficará registrada na pasta de estágio.</Passo>
        <div className="mt-3">
          <Link href="https://unimontes.br/wp-content/uploads/2019/05/resolucoes/cepex/2018/resolucao_cepex039.pdf">
            Consultar Resolução CEPEx 039/2018
          </Link>
        </div>
      </div>
    ),
  },
  {
    titulo: 'Alteração de Dados Cadastrais',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <Info>Esta solicitação é feita por e-mail — <strong>não é necessário ir presencialmente à Secretaria</strong>.</Info>
        <p className="text-sm text-gray-700 mb-3">Caso tenha emitido 2ª via de documentos, alterado estado civil ou deseje registrar Nome Social, envie um e-mail ao responsável do curso.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como enviar o e-mail:</p>
        <Lista items={[
          'Título: ALTERAÇÃO DE DADOS CADASTRAIS',
          'Texto: nome completo, curso, turno, campus/cidade e as informações a alterar.',
          'Anexe o documento atualizado em PDF, se necessário.',
        ]} />
        <p className="text-sm font-semibold text-gray-700 mt-3 mb-2">Para Nome Social especificamente:</p>
        <Lista items={[
          'Título do e-mail: NOME SOCIAL',
          'Informe seu nome de registro, curso e campus.',
          'Anexe documento de identificação oficial.',
          'O nome social aparecerá nas listas de presença, diário e WebAluno.',
          'Nas declarações, históricos e diploma constará o nome de registro.',
        ]} />
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Cancelamento de Matrícula em Disciplina (Apenas uma)',
    tag: 'aluno+secretaria+coord',
    conteudo: (
      <div>
        <Alerta>Prazo máximo: 7 dias após a realização da matrícula. Fora do prazo, a solicitação será indeferida.</Alerta>
        <p className="text-sm text-gray-700 mb-3">Conforme o Art. 55, §3º das Normas de Graduação, o cancelamento só é permitido em <strong>uma disciplina por semestre</strong>, após consulta ao Coordenador Didático.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>CANCELAMENTO DE DISCIPLINA</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, turno, campus/cidade e a disciplina a cancelar.</Passo>
        <Info>Se deferido, a disciplina continuará aparecendo no WebAluno com o status <strong>"CANCELADA"</strong> — isso é normal.</Info>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Colação de Grau / Colação Extemporânea (depois do prazo)',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">A outorga de grau é feita em solenidade presidida pelo Reitor, conforme data prevista no Calendário Acadêmico. A Secretaria analisa os históricos de todos os alunos matriculados no último período e elabora a lista de formandos.</p>
        <Info>Recomendado: um dia antes da Colação, confirme com a Secretaria Geral se seu nome está na lista.</Info>
        <p className="text-sm font-semibold text-gray-700 mb-2">Documentos obrigatórios antes da Colação:</p>
        <Lista items={[
          'Certidão de Nascimento ou Casamento (atualizada).',
          'Carteira de Identidade (se emitiu nova via durante a graduação).',
          'Título de Eleitor e comprovante de quitação eleitoral.',
          'CPF.',
          'Comprovante de quitação do Serviço Militar (se aplicável).',
          'Diploma do Ensino Médio ou equivalente.',
          'Foto 3×4 recente.',
        ]} />
        <Alerta>Aluno que não estiver matriculado no último período deve entrar em contato com a Secretaria para solicitar a Colação.</Alerta>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Declaração no Formato Digital',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">A declaração digital é enviada por e-mail em formato PDF, com assinatura eletrônica válida.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do seu curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>DECLARAÇÃO DIGITAL</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, turno, campus/cidade e o tipo de declaração necessária.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Declaração Impressa',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">A declaração impressa é retirada presencialmente na Secretaria Geral do Campus.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do seu curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>DECLARAÇÃO IMPRESSA</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, turno, campus/cidade e o tipo de declaração.</Passo>
        <Passo num={4}>Aguarde o prazo de confecção e retire presencialmente.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Desistência de Curso',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <Info>Esta solicitação é feita por e-mail — <strong>não é necessário ir presencialmente</strong>.</Info>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail para <EmailBtn email="secretaria.recepcao@unimontes.br" titulo="DESISTÊNCIA DE CURSO" /></Passo>
        <Passo num={2}>Título: <strong>DESISTÊNCIA DE CURSO</strong></Passo>
        <Passo num={3}>Anexe um único PDF com: documento de identificação (frente e verso) + requerimento preenchido.</Passo>
        <div className="mt-2 mb-3">
          <Link href="https://drive.google.com/file/d/1vvH7NFcDBCtyT1beMLrnWNscS8FpeJSw/view?usp=drive_link">
            Baixar Requerimento de Desistência
          </Link>
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-2">No requerimento, informe obrigatoriamente:</p>
        <Lista items={[
          'Nome completo e nº de matrícula.',
          'Curso e campus/cidade.',
          'Forma de ingresso (PAES, Vestibular Próprio, SISU).',
          'Chamada em que foi convocado (1º período).',
          'Semestre/ano de ingresso.',
        ]} />
      </div>
    ),
  },
  {
    titulo: 'Diplomas Graduação - 1ª VIA',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">O diploma de 1ª via é emitido automaticamente após a conclusão do curso e a conferência de toda a documentação pelo responsável de curso.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Documentos necessários:</p>
        <Lista items={[
          'Certidão de Nascimento ou Casamento.',
          'Carteira de Identidade.',
          'CPF.',
          'Título de Eleitor e quitação eleitoral.',
          'Comprovante de quitação militar (se aplicável).',
          'Diploma do Ensino Médio.',
          'Foto 3×4 recente.',
        ]} />
        <Alerta>Pendências de documentação podem atrasar a emissão do diploma. Regularize antes da Colação de Grau.</Alerta>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Diplomas Graduação - 2ª VIA',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">A 2ª via do diploma é solicitada em casos de perda, roubo ou dano ao documento original.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>DIPLOMA 2ª VIA</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, campus e o motivo da solicitação.</Passo>
        <Passo num={4}>Anexe boletim de ocorrência (em caso de roubo ou perda).</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Diplomas/Certificados Pós-Graduação - 1ª VIA',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">Emitido após a conclusão do curso de pós-graduação e aprovação de toda a documentação.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>DIPLOMA PÓS-GRADUAÇÃO 1ª VIA</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, campus e documentos solicitados pelo responsável.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Diplomas/Certificados Pós-Graduação - 2ª VIA',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">Solicitada em casos de perda, roubo ou dano ao documento original.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>DIPLOMA PÓS-GRADUAÇÃO 2ª VIA</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, campus e motivo da solicitação.</Passo>
        <Passo num={4}>Anexe boletim de ocorrência, se for caso de perda ou roubo.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Dispensa de Disciplinas / Aproveitamento de Estudos',
    tag: 'aluno+secretaria+coord',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">Permite ao estudante solicitar dispensa de disciplinas cursadas em outra instituição ou curso, mediante análise do colegiado.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>DISPENSA DE DISCIPLINA / APROVEITAMENTO DE ESTUDOS</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, campus e as disciplinas a serem aproveitadas.</Passo>
        <Passo num={4}>Anexe: histórico escolar da instituição de origem e ementas das disciplinas cursadas.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Documentos Pendentes',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">Documentos exigidos no ato da matrícula que não foram entregues devem ser regularizados o quanto antes para evitar prejuízos acadêmicos.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como regularizar:</p>
        <Passo num={1}>Verifique com a Secretaria Geral quais documentos estão pendentes.</Passo>
        <Passo num={2}>Envie e-mail ao responsável do curso com os documentos em PDF.</Passo>
        <Passo num={3}>Título: <strong>DOCUMENTOS PENDENTES</strong></Passo>
        <Alerta>Documentos pendentes podem impedir a renovação de matrícula ou emissão de diplomas.</Alerta>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Ementas',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">A ementa descreve o conteúdo programático de uma disciplina. Geralmente solicitada para processos de equivalência curricular ou aproveitamento de estudos.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>EMENTA</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, campus e o nome da(s) disciplina(s).</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Equivalência Curricular',
    tag: 'aluno+secretaria+coord',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">Processo para equiparar disciplinas cursadas em outro curso ou instituição com as disciplinas do currículo atual, evitando repetição de conteúdos já estudados.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>EQUIVALÊNCIA CURRICULAR</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, campus e as disciplinas para análise.</Passo>
        <Passo num={4}>Anexe: histórico escolar e ementas das disciplinas cursadas.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Históricos no Formato Digital',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">O histórico digital é enviado por e-mail em PDF com assinatura eletrônica.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>HISTÓRICO DIGITAL</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, turno e campus/cidade.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Históricos Impressos',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">O histórico impresso é retirado presencialmente na Secretaria Geral após solicitação.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>HISTÓRICO IMPRESSO</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, turno e campus/cidade.</Passo>
        <Passo num={4}>Aguarde o prazo de confecção e retire presencialmente.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Matrícula em Disciplina de Outro Curso (Multicurso)',
    tag: 'aluno+secretaria+coord',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">Permite ao estudante cursar disciplinas de outro curso da Unimontes, sujeito à disponibilidade de vagas e aprovação da coordenação.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>MATRÍCULA MULTICURSO</strong></Passo>
        <Passo num={3}>Informe: nome completo, matrícula, curso de origem e disciplina/curso que deseja cursar.</Passo>
        <Alerta>A solicitação deve ser feita dentro do período de matrícula previsto no Calendário Acadêmico.</Alerta>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Matrícula Fora do Prazo (Renovação)',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <Alerta>Solicitação só é aceita em casos justificados. Quem não renova no prazo é considerado desistente.</Alerta>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>MATRÍCULA FORA DO PRAZO</strong></Passo>
        <Passo num={3}>Informe: nome completo, matrícula, curso, campus e o motivo do atraso.</Passo>
        <Passo num={4}>Anexe documentação comprobatória, se houver.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Matriz Curricular',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">A Matriz Curricular lista todas as disciplinas do seu curso, com suas respectivas cargas horárias e períodos.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>MATRIZ CURRICULAR</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, turno e campus/cidade.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Nome Social',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">O nome social é o nome pelo qual a pessoa se identifica e deseja ser chamada, diferente do nome de registro civil. Assegurado pela Resolução SEE 3.423/2017.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>NOME SOCIAL</strong></Passo>
        <Passo num={3}>Informe: nome de registro, curso e campus. Solicite o cadastro do nome social.</Passo>
        <Passo num={4}>Anexe documento de identificação oficial.</Passo>
        <Info>O nome social aparecerá nas listas de presença, diários e no WebAluno. Nas declarações, históricos e diploma constará o nome de registro.</Info>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Obtenção de Novo Título',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">Solicitado quando o estudante conclui um segundo curso de graduação e deseja obter o novo título acadêmico.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>OBTENÇÃO DE NOVO TÍTULO</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso concluído, campus e documentação necessária.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Plano de Ensino',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">O Plano de Ensino detalha os objetivos, conteúdo, metodologia e critérios de avaliação de uma disciplina. Geralmente necessário em processos de equivalência ou aproveitamento de estudos.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>PLANO DE ENSINO</strong></Passo>
        <Passo num={3}>Informe: nome completo, curso, campus e o nome da(s) disciplina(s).</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Prova de 2ª Oportunidade',
    tag: 'aluno+coord',
    conteudo: (
      <div>
        <Info>Esta solicitação é resolvida diretamente com a Coordenação do Curso.</Info>
        <p className="text-sm text-gray-700 mb-3">O estudante tem direito à prova de 2ª oportunidade quando perder uma avaliação por motivo justificado, como doença ou luto.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Situações que dão direito:</p>
        <Lista items={[
          'Estudantes em luto pelo falecimento de familiar próximo (3 dias).',
          'Outros casos justificados, a critério da Coordenação.',
        ]} />
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Entre em contato com a Coordenação do seu curso.</Passo>
        <Passo num={2}>Apresente a justificativa e documentação comprobatória.</Passo>
        <Passo num={3}>A data da prova será agendada pelo Coordenador.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Renovação de Matrícula',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">A renovação de matrícula é feita semestralmente pelo <strong>WebGiz (WebAluno)</strong>, dentro do prazo previsto no Calendário Acadêmico.</p>
        <Alerta>Quem não renovar dentro do prazo será considerado desistente do curso.</Alerta>
        <p className="text-sm font-semibold text-gray-700 mb-2">Passo a passo:</p>
        <Passo num={1}>Acesse o WebGiz em <Link href="http://www.webgiz.unimontes.br">webgiz.unimontes.br</Link></Passo>
        <Passo num={2}>Realize a seleção das disciplinas para o próximo semestre.</Passo>
        <Passo num={3}>Confirme a renovação dentro do prazo.</Passo>
        <Info>Se sua matrícula estiver trancada, você não conseguirá renovar pelo WebAluno. Neste caso, envie e-mail ao responsável do curso solicitando a renovação manualmente.</Info>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Retorno ao Curso',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">Estudante que foi considerado desistente pode solicitar retorno ao curso, sujeito a análise e disponibilidade de vaga.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>RETORNO AO CURSO</strong></Passo>
        <Passo num={3}>Informe: nome completo, matrícula, curso, campus e o período em que parou.</Passo>
        <Alerta>O retorno pode implicar adaptação curricular caso o Projeto Pedagógico do curso tenha sido alterado.</Alerta>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Revisão de Nota / Prova',
    tag: 'aluno+coord',
    conteudo: (
      <div>
        <Info>Esta solicitação é feita diretamente com a Coordenação — não passa pela Secretaria Geral.</Info>
        <p className="text-sm text-gray-700 mb-3">O estudante tem o direito de solicitar revisão de nota ou de prova quando discordar do resultado divulgado.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Entre em contato com a Coordenação do seu curso.</Passo>
        <Passo num={2}>Informe a disciplina, a avaliação e o motivo da revisão.</Passo>
        <Passo num={3}>A Coordenação mediará o processo com o professor responsável.</Passo>
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Tratamento Excepcional (Atestado Médico a partir de 4 dias)',
    tag: 'recepcao',
    conteudo: (
      <div>
        <Alerta>Esta solicitação deve ser protocolada exclusivamente via e-mail da recepção — <strong>nunca com o responsável de curso ou coordenação</strong>.</Alerta>
        <p className="text-sm text-gray-700 mb-3">Conforme o Art. 86 das Normas de Graduação, têm direito ao regime de exercícios domiciliares:</p>
        <Lista items={[
          'Aluna gestante (a partir do 8º mês e por 3 meses).',
          'Aluno com afecções, infecções, traumatismos ou outras condições incompatíveis com presença.',
          'Aluno portador de necessidades educativas especiais.',
        ]} />
        <Alerta>Não é concedido para estágio curricular, práticas laboratoriais ou atividades que só ocorrem no campus.</Alerta>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Baixe e preencha o requerimento: <Link href="https://drive.google.com/file/d/1vvH7NFcDBCtyT1beMLrnWNscS8FpeJSw/view">Requerimento de Tratamento Excepcional</Link></Passo>
        <Passo num={2}>Junte ao Laudo/Atestado Médico (emitido em até 15 dias após o fato).</Passo>
        <Passo num={3}>Envie para: <EmailBtn email="secretaria.recepcao@unimontes.br" /></Passo>
        <Passo num={4}>No e-mail, informe: nome completo, curso, turno e campus/cidade.</Passo>
        <p className="text-sm font-semibold text-gray-700 mt-3 mb-2">Fluxo após protocolo:</p>
        <Lista items={[
          'A recepção encaminha ao responsável de curso.',
          'O responsável encaminha ao Diretor de Centro (com cópia para a coordenação).',
          'Se deferido, a coordenação orienta professores e o acadêmico.',
          'O responsável lança o período de afastamento no sistema.',
        ]} />
      </div>
    ),
  },
  {
    titulo: 'Trancamento de Curso',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">O trancamento consiste na desistência temporária de cursar o período letivo atual. O aluno retorna no semestre seguinte.</p>
        <Info>São permitidos 2 trancamentos em cursos semestrais e 1 em cursos anuais. Não é permitido no 1º período.</Info>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail ao responsável do curso na Secretaria Geral.</Passo>
        <Passo num={2}>Título: <strong>TRANCAMENTO DE CURSO</strong></Passo>
        <Passo num={3}>Informe: nome completo, matrícula e motivo do trancamento.</Passo>
        <Passo num={4}>Anexe o histórico escolar.</Passo>
        <p className="text-sm font-semibold text-gray-700 mt-3 mb-2">Importante:</p>
        <Lista items={[
          'Se o PPC for alterado durante o trancamento, ao retornar o aluno pode precisar de adaptação curricular.',
          'No semestre de retorno, o aluno não consegue renovar pelo WebAluno — deve solicitar por e-mail.',
          'Se não retornar no prazo, será considerado desistente.',
        ]} />
        <SecretariaLink />
      </div>
    ),
  },
  {
    titulo: 'Transferência EX-OFFÍCIO',
    tag: 'recepcao',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">Destinada a servidor público federal (civil ou militar) ou dependente transferido por necessidade de serviço, proveniente de instituição pública.</p>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como solicitar:</p>
        <Passo num={1}>Envie e-mail para: <EmailBtn email="secretaria.recepcao@unimontes.br" titulo="TRANSFERÊNCIA EX-OFFÍCIO" /></Passo>
        <Passo num={2}>Título: <strong>TRANSFERÊNCIA EX-OFFÍCIO</strong></Passo>
        <Passo num={3}>Anexe um único PDF com todos os documentos abaixo.</Passo>
        <p className="text-sm font-semibold text-gray-700 mt-3 mb-2">Documentos necessários:</p>
        <Lista items={[
          'Certidão de transferência funcional ex-offício.',
          'Cópia do Diário Oficial com a publicação da transferência.',
          'Certidão de exercício em Montes Claros e/ou cidades vizinhas.',
          'Atestado de situação funcional.',
          'Certidão de casamento ou nascimento (se dependente).',
          'Histórico Escolar do Ensino Médio.',
          'Prova de quitação com o Serviço Militar (se aplicável).',
          'Certidão de Quitação Eleitoral (TSE).',
          'Documento oficial de identificação, CPF.',
          'Certidão de Nascimento ou Casamento, comprovante de residência.',
          'Foto 3×4 recente.',
          'Histórico do curso regularmente matriculado.',
          'Reconhecimento do curso (se não constar no histórico).',
          'Plano de ensino de todas as disciplinas cursadas com aprovação.',
        ]} />
      </div>
    ),
  },
  {
    titulo: 'Transferência Externa',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">Permite que estudantes de outras instituições (EAD ou presencial) transfiram sua matrícula para a Unimontes, com ou sem mudança de curso.</p>
        <Info>Estudantes com matrícula trancada também podem participar, desde que comprovem vínculo com a instituição de origem.</Info>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como ocorre:</p>
        <Lista items={[
          'O processo ocorre no Edital de Vagas Remanescentes, conforme o Calendário Acadêmico.',
          'Em 2026, a data prevista é 08/05.',
        ]} />
        <div className="mt-2">
          <Link href="https://www.coteps.unimontes.br/vagas-remaneascentes/">
            Acompanhe o Edital de Vagas Remanescentes (COTEPS)
          </Link>
        </div>
      </div>
    ),
  },
  {
    titulo: 'Transferência Interna',
    tag: 'aluno+secretaria',
    conteudo: (
      <div>
        <p className="text-sm text-gray-700 mb-3">Permite trocar de curso, turno ou campus dentro da própria Unimontes. Estudantes do 1º período não podem participar.</p>
        <Info>Estudantes com matrícula trancada também podem participar.</Info>
        <p className="text-sm font-semibold text-gray-700 mb-2">Como ocorre:</p>
        <Lista items={[
          'O processo ocorre no Edital de Vagas Remanescentes, conforme o Calendário Acadêmico.',
          'Em 2026, a data prevista é 08/05.',
        ]} />
        <div className="mt-2">
          <Link href="https://www.coteps.unimontes.br/vagas-remaneascentes/">
            Acompanhe o Edital de Vagas Remanescentes (COTEPS)
          </Link>
        </div>
      </div>
    ),
  },
];

export default function Solicitacoes() {
  const [aberto, setAberto] = useState<number | null>(null);
  const [busca, setBusca] = useState('');

  const filtradas = solicitacoes.filter(s =>
    s.titulo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-yellow-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-10">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Solicitações</h1>
          </div>
          <p className="text-gray-500 leading-relaxed">
            Encontre abaixo as informações sobre como realizar cada tipo de solicitação junto à Secretaria Geral do Campus Almenara. Clique em um item para ver os detalhes e o passo a passo.
          </p>
        </div>

        {/* Busca */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Buscar solicitação..."
            value={busca}
            onChange={e => { setBusca(e.target.value); setAberto(null); }}
            className="w-full px-5 py-3 pl-12 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400"
          />
          <svg className="absolute left-4 top-3.5 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>

        {/* Lista */}
        {filtradas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>Nenhuma solicitação encontrada para "<strong>{busca}</strong>"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtradas.map((s, i) => {
              const isOpen = aberto === i;
              return (
                <div
                  key={i}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-blue-300 bg-white shadow-md' : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm'
                  }`}
                >
                  <button
                    onClick={() => setAberto(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        isOpen ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                      }`}>
                        {isOpen ? '−' : '+'}
                      </span>
                      <span className={`font-semibold transition-colors ${isOpen ? 'text-blue-700' : 'text-gray-700 group-hover:text-blue-600'}`}>
                        {s.titulo}
                      </span>
                    </div>
                    {isOpen ? <ChevronUp size={18} className="text-blue-500 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-blue-100 pt-4">
                      <Tag tipo={s.tag} />
                      {s.conteudo}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-10">
          {filtradas.length} solicitação{filtradas.length !== 1 ? 'ões' : ''} {busca ? 'encontrada' + (filtradas.length !== 1 ? 's' : '') : 'disponíve' + (filtradas.length !== 1 ? 'is' : 'l')}
        </p>
      </main>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-8 px-4 md:px-8 lg:px-16 xl:px-24">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-semibold">
            Universidade Estadual de Montes Claros - UNIMONTES - Campus Almenara
          </p>
          <p className="text-xs text-gray-400 mt-2">
            © 2026 - Desenvolvido por Secretaria da Unimontes - Campus Almenara
          </p>
        </div>
      </div>
    </div>
  );
}
