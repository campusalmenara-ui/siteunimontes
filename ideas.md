# Brainstorm de Design - Agenda Unimontes

## Contexto
Site de página única para alunos visualizarem a agenda semanal de aulas por turma. Foco em redução de carga cognitiva, responsividade mobile-first, e design emocional com transições suaves.

---

## Ideia 1: Design Corporativo Moderno com Accent Dinâmico
**Probabilidade: 0.08**

### Design Movement
Corporativo moderno com influências de design de sistemas (Design Systems), similar ao padrão de universidades contemporâneas.

### Core Principles
1. **Clareza Hierárquica:** Informações organizadas em níveis visuais bem definidos
2. **Minimalismo Funcional:** Apenas elementos essenciais, sem decoração desnecessária
3. **Acessibilidade Primeiro:** Contraste alto, tipografia legível, navegação intuitiva
4. **Responsividade Perfeita:** Comportamento fluido do mobile ao desktop

### Color Philosophy
- **Primário:** Azul marinho (#001F4D) - cor do logo Unimontes, transmite confiança e institucionalidade
- **Secundário:** Branco (#FFFFFF) - fundo limpo
- **Accent:** Vermelho vibrante (#E63946) - destaque para ações, similar ao vermelho da arte da agenda
- **Neutros:** Cinzas suaves para hierarquia de informações

### Layout Paradigm
- **Hero Section:** Cabeçalho com logo Unimontes, título e data da semana
- **Grid de Turmas:** Cards em grid responsivo (1 coluna mobile, 2-3 desktop)
- **Expansão Vertical:** Ao clicar, a turma expande para baixo revelando informações

### Signature Elements
1. **Cards com Borda Esquerda Colorida:** Cada turma tem uma cor diferente
2. **Ícones Minimalistas:** Matéria, professor, carga horária com ícones claros
3. **Transição Suave:** Expansão com animação de altura e fade-in

### Interaction Philosophy
- Clique simples para expandir/retrair
- Feedback visual imediato (mudança de cor, sombra)
- Scroll suave entre turmas

### Animation
- Expansão: 300ms ease-out
- Ícones: fade-in 200ms ao expandir
- Hover: elevação sutil com sombra aumentada

### Typography System
- **Display:** Poppins Bold (24-28px) - títulos principais
- **Heading:** Poppins SemiBold (18-20px) - nomes de turmas
- **Body:** Inter Regular (14-16px) - informações
- **Label:** Inter Medium (12-14px) - labels de campos

---

## Ideia 2: Design Educacional Lúdico e Acessível
**Probabilidade: 0.07**

### Design Movement
Educacional contemporâneo com influências de design infantil/juvenil, similar a plataformas de aprendizado modernas (Duolingo, Khan Academy).

### Core Principles
1. **Engajamento Visual:** Uso de cores vibrantes e formas arredondadas
2. **Redução de Fricção:** Interações intuitivas e divertidas
3. **Inclusão:** Design acessível para todos os alunos
4. **Progressão Clara:** Feedback visual mostra que algo aconteceu

### Color Philosophy
- **Primário:** Azul Unimontes (#001F4D)
- **Secundário:** Amarelo Ouro (#FDB913) - energia e otimismo
- **Accent:** Laranja Vibrante (#FF6B35) - ação e movimento
- **Neutros:** Tons de cinza suave com toque de cor

### Layout Paradigm
- **Seção Introdutória:** Bem-vindo com emoji/ícone animado
- **Carrossel Horizontal:** Turmas deslizáveis (mobile-first)
- **Expansão em Modal:** Ao clicar, abre um modal com informações

### Signature Elements
1. **Formas Arredondadas:** Todos os cards com border-radius generoso
2. **Ícones Coloridos:** Cada tipo de informação tem cor própria
3. **Animações Lúdicas:** Bounce, scale, rotate em interações

### Interaction Philosophy
- Toque para expandir em modal
- Swipe para navegar entre turmas
- Animações que fazem o usuário sorrir

### Animation
- Modal: scale-up 250ms ease-out
- Ícones: bounce 400ms ao expandir
- Swipe: transição suave 300ms

### Typography System
- **Display:** Fredoka Bold (26-32px) - títulos
- **Heading:** Fredoka SemiBold (20-24px) - turmas
- **Body:** Poppins Regular (14-16px) - informações
- **Label:** Poppins Medium (12-14px) - labels

---

## Ideia 3: Design Minimalista Elegante com Foco em Conteúdo
**Probabilidade: 0.09**

### Design Movement
Minimalismo elegante com influências de design suíço, similar a interfaces premium (Apple, Notion).

### Core Principles
1. **Conteúdo é Rei:** Informações em primeiro plano, design invisível
2. **Espaço Negativo:** Abundância de whitespace para respiração visual
3. **Tipografia Sofisticada:** Hierarquia através de peso e tamanho
4. **Sutileza:** Efeitos visuais discretos mas impactantes

### Color Philosophy
- **Primário:** Azul Marinho (#001F4D) - institucional
- **Secundário:** Branco e Off-white (#F8F9FA) - fundo
- **Accent:** Azul Claro (#4A90E2) - interações
- **Neutros:** Tons de cinza muito suaves

### Layout Paradigm
- **Topo Minimalista:** Apenas logo e data
- **Lista Vertical:** Turmas em lista simples, sem cards
- **Expansão In-Place:** Informações aparecem abaixo da turma ao clicar

### Signature Elements
1. **Linhas Divisórias Sutis:** Separação elegante entre turmas
2. **Tipografia Variada:** Pesos diferentes criam hierarquia
3. **Microinterações:** Hover com mudança de cor suave

### Interaction Philosophy
- Clique para revelar/ocultar
- Transições suaves sem exagero
- Feedback através de mudança de cor e espaçamento

### Animation
- Expansão: 250ms ease-in-out
- Fade: 150ms para novos elementos
- Hover: cor muda suavemente em 100ms

### Typography System
- **Display:** Playfair Display Bold (28-32px) - títulos
- **Heading:** Playfair Display SemiBold (20-24px) - turmas
- **Body:** Lato Regular (14-16px) - informações
- **Label:** Lato Medium (12-14px) - labels

---

## Decisão Final

**Escolhido: Ideia 1 - Design Corporativo Moderno com Accent Dinâmico**

### Justificativa
- Alinha-se com a identidade institucional da Unimontes (logo azul marinho)
- Reduz carga cognitiva através de hierarquia clara
- Responsividade perfeita para mobile (prioridade dos alunos)
- Transições suaves geram percepção de velocidade e polimento
- Acessibilidade garantida com contraste alto
- Cards com borda colorida criam diferenciação visual sem poluição
- Escalável para futuras turmas e semanas

### Implementação
- Tipografia: Poppins + Inter
- Cores: Azul marinho (#001F4D), Branco, Vermelho (#E63946)
- Layout: Grid responsivo com cards expansíveis
- Animações: Transições suaves 250-300ms
- Mobile-first com breakpoints bem definidos
