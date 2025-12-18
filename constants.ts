
import { Chapter } from './types';

// Descrições reutilizáveis para garantir consistência
// LOGAN BASE: Apenas características físicas. O equipamento muda conforme a história.
export const CHAR_LOGAN = "Logan Rylan (young human male, 16 years old, height 1.41m, short stature but strictly human proportions, round human ears, no beard, delicate human facial features, not a dwarf, not a gnome, lean and wiry, messy black hair, fair skin, stoic and emotionless face)";

// GARETH: Enfatizando "19 years old student" para remover o aspecto de "velho milionário"
export const CHAR_GARETH = "Gareth Aldren (young human male student, 16 years old, fresh youthful face, tall, short blonde hair, charming smile, wearing expensive magical academy student uniform - not old robes)";

export const CHAR_KOGGLE = "Koggle (gnome tinkerer, multi-lens goggles, oil-stained leather apron)";

// REI FELIPE: Nova constante para o Rei
export const CHAR_KING = "King Felipe (adult half-elf male, sharp noble features, vibrant red hair, groomed red beard, royal regalia, regal posture)";

// Prompt para a imagem de fundo do Hero
export const HERO_PROMPT = "Dark fantasy industrial city background, magical energy lines in sky, steampunk factories, atmospheric, cinematic, wide shot, masterpiece, 8k, forgotten realms";

/**
 * Constrói um prompt estruturado para o gerador de imagens.
 * Transforma metadados de cena em uma string descritiva otimizada para o Gemini 2.5 Flash Image.
 */
export const buildJsonPrompt = (params: {
  scene: string;
  camera_angle?: string;
  lighting?: string;
  depth_of_field?: string;
  composition_rules?: string[];
  aspect_ratio?: string;
}) => {
  const parts = [params.scene];
  if (params.camera_angle) parts.push(`Perspective: ${params.camera_angle}`);
  if (params.lighting) parts.push(`Lighting: ${params.lighting}`);
  if (params.depth_of_field) parts.push(`Focus: ${params.depth_of_field}`);
  if (params.composition_rules && params.composition_rules.length > 0) {
    parts.push(`Composition style: ${params.composition_rules.join(', ')}`);
  }
  // Adiciona sufixos de qualidade e estilo consistentes com Forgotten Realms
  return parts.join('. ') + '. High quality cinematic digital art, oil painting textures, epic atmosphere, Forgotten Realms setting, masterpiece, detailed environment.';
};

export const STORY_DATA: Chapter[] = [
  {
    id: "chapter-1",
    number: "Capítulo 1",
    title: "A Engrenagem Sobressalente",
    imagePrompt: `High angle top-down view of a messy steampunk workbench, ${CHAR_LOGAN} wearing simple workman apron and shirt, working on intricate small gears with tweezers, ${CHAR_KOGGLE} watching from the side, workshop cluttered with brass pipes and steam, depth of field focused on Logan's hands, cinematic lighting, detailed atmosphere`,
    content: `Para Logan Rylan, o mundo sempre pareceu uma máquina emperrada — atrito onde deveria haver encaixe perfeito.

A mansão dos Rylan, nos subúrbios fumacentos de Esmeltaran, não era casa. Era fábrica disfarçada de nobreza. O ar fedia a óleo queimado misturado com fuligem grossa — aquele tipo de cheiro que gruda na pele e não sai nem com sabão. Até no "Refeitório dos Menores" — nome pomposo para o cantinho esquecido onde os filhos "extras" comiam — o cheiro grudava nas paredes.

Logan era o trigésimo oitavo rebento de Lorde Agripina Rylan. *Trigésimo. Oitavo.*

Na contabilidade fria da família, ele não era herdeiro. Não era executivo em treinamento. Nem mesmo um bom partido para casamento arranjado. Era "estoque excedente". Uma engrenagem solta, jogada no fundo da gaveta, esquecida até enferrujar.

Sua fraqueza física piorava tudo. Baixo. Magrelo. Para um humano, ele era franzino em demasia. As espadas de treino da milícia familiar pesavam demais, desequilibrando seu centro de gravidade. Os escudos cobriam sua visão. Enquanto os irmãos mais velhos — altos, largos, barulhentos — gritavam e suavam nos pátios de treino, recebendo tapinhas nas costas dos mestres de armas, Logan observava do parapeito.

E via. Via o que ninguém mais via.

Os *vetores de força* invisíveis. Onde a postura do irmão falhava antes mesmo do golpe começar. Onde o equilíbrio ruía, milissegundos antes do impacto. Ele entendia a física do combate — a teoria pura, a matemática da violência. Mas seus braços finos tremiam só de segurar uma espada de treino.

A salvação veio de um gnomo exilado que vivia nos porões. *Koggle Sprocketwhistle*. Óculos com lentes múltiplas que faziam seus olhos parecerem insetos presos em vidro. Cheiro constante de pólvora fresca e graxa rançosa. Mãos manchadas de óleo que nunca saía completamente. Koggle viu no garoto quieto o que o pai ignorava: dedos hábeis, paciência infinita para detalhes minúsculos, e aquele jeito de olhar para mecanismos como quem lê poesia.

— Trama Mágica? Bah, não é poesia, não importa o que os bardos bêbados cantam — Koggle resmungava, ajustando uma válvula enquanto Logan assistia, hipnotizado. — É sistema. É *pressão e fluxo*. Entende a pressão, a energia obedece. Entende o fluxo, o impossível vira rotina.

Anos nos porões. Anos entre engrenagens de latão que clicavam suavemente e cristais de foco que zumbiam baixinho. Ali, Logan se sentia poderoso. Ali, ele consertava o quebrado, otimizava o ineficiente. E foi ali que o aço deixou de ser um peso morto e virou aliado maleável.

Koggle notou Logan espiando as armas dos guardas. O garoto analisava o equilíbrio, a distribuição de peso, a geometria da lâmina. Então o gnomo deu um tapa nas costas dele.
— Vou te ensinar forja básica, moleque. Não aquela barbaridade humana de martelar até cansar. — Ele cuspiu no chão. — Estilo anão-gnômico. Esperto, barato e *preciso*.

Logan não conseguia levantar o martelo de forja principal. Pesava demais. Então ele construiu um sistema de polias e contrapesos — engenharia simples, mas eficaz. Fazia a força vir de cima, não dos braços. Ele aprendeu a moldar metal. A misturar ligas. A criar peças que encaixavam com precisão cirúrgica, sem folga, sem atrito desnecessário.

No calor da fornalha, com o metal cantando ritmadamente sob impactos controlados, ele percebeu algo. Com as ferramentas certas, ele podia criar *qualquer coisa*. Qualquer coisa, menos respeito naquela casa.

Quando Logan completou dezesseis anos, a partida não foi dramática. Not foi fuga na calada da noite, com mochila e corda pela janela. Foi descarte administrativo. Ele solicitou a licença de maioridade. Um escriba da família carimbou o papel sem levantar os olhos. Entregou uma bolsa modesta de moedas — o equivalente a três meses de salário de um operário.

Logan embarcou no navio mercante *Dama de Ferro* rumo ao norte. Levou suas ferramentas, as lições de Koggle e nada mais. Ninguém acenou do cais. Ninguém notou quando ele partiu. E, honestamente, Logan não esperava que notassem.`
  },
  {
    id: "chapter-2",
    number: "Capítulo 2",
    title: "A Cidade das Linhas de Prata",
    imagePrompt: `Low angle shot looking up from street level, majestic futuristic fantasy city with glowing scaffolds, crowd of ordinary HUMANS with round ears (no elves) waiting in line, ${CHAR_LOGAN} wearing simple traveler clothes and backpack walking through the crowd looking up in awe, towering white stone architecture, cinematic scale, volumetric lighting`,
    content: `Albion atingiu Logan como um soco nos sentidos. Sua terra natal era ouro velho, política empoeirada e gente que parava de se mexer. Albion era cicatriz aberta, tijolo sobre entulho e uma esperança tão feroz que quase dava para tocar.

A capital, *Online*, subia no horizonte como se desafiasse o céu a derrubá-la de novo. Logan conhecia as histórias — "5 Quilômetros", a tirania do Imperador Palpatine, a época em que magia era crime e virava combustível de guerra. Mas a cidade que ele encontrou ao desembarcar não parecia fantasma de nada. Pulsava. Vibrava. Os elfos a chamavam de *Aon-Lae'in* — A Convergência das Linhas de Prata. Logan achava que parecia mais "A Cidade que Recusou Morrer".

As ruas eram uma bagunça fascinante. Arquitetura humana antiga — blocos de pedra cinza, fortificações militares, prédios quadrados e pragmáticos — entrelaçada com construções élficas modernas de reconstrução. Torres de pedra branca que cresciam em espirais orgânicas, andaimes mágicos flutuando feito teias de aranha luminosas, autômatos simples varrendo calçadas com vassourinhas patéticas.

Logan mal havia atravessado as primeiras ruas quando percebeu que algo estava acontecendo. Multidões. Não as barulhentas — as silenciosas, que são piores. Filas quilométricas de gente serpentinham pelas ruas, todas apontando para o mesmo distrito. O ar fedia a reverência. Ou medo. Às vezes é difícil diferenciar.

Logan encostou numa parede fria, ajeitou a mochila e observou. Engenheiro observa, sempre. Cada pessoa na fila carregava algo — um símbolo, um medalhão, uma tatuagem visível do punho cerrado de Helm. Fiéis. Milhares deles. Eles caminhavam em direção ao *Templo da Manopla*, no distrito oeste.

À entrada, cada devoto tocava um cristal de foco do tamanho de um punho. O cristal brilhava azul-pálido, e então a pessoa sussurrava uma única palavra, uma única frase. O feitiço *Mensagem* disparava invisível, voando junto com milhares de outros sussurros prateados, direto para a mente de *Varian Lightbringer*, o Sumo Sacerdote de Helm.

O zumbido mágico no ar era quase físico. Logan sentiu na nuca, como eletricidade estática.

— Por que tanta gente? — perguntou a um mercador de tecidos ao lado, que torcia as mãos nervosamente.

O homem olhou de lado, baixou a voz. — Dia da Permissão. Todo fiel de Helm precisa pedir permissão ao Sumo Sacerdote pra rezar hoje. Es tradição antiga. Um decreto real, mas só pros devotos da Manopla. — Ele engoliu seco. — Eu só quero minha permissão pra orar em paz. Pra pedir proteção.

Um velho mais atrás resmungou, rouco: — Ouvi dizer que Varian usa isso pra detectar ameaças. Que cada pedido de permissão alimenta uma barreira mágica ao redor da cidade. Prendendo algo. Uma criatura abissal.

Logan franziu a testa, observando a cena com uma mistura de fascínio e perplexidade. Não fazia sentido. Nenhum sentido lógico. Milhares de pessoas desperdiçando horas em filas intermináveis só pra pedir permissão de rezar? Um sistema burocrático inserido na fé, controlado por um único homem, vulnerável a falhas humanas, manipulação, gargalos...

Deveria colapsar. Deveria gerar revolta. Deveria ser ineficiente. Mas funcionava. As pessoas aceitavam. Obedeciam. E, de alguma forma incompreensível, aquilo sustentava algo maior.

Caos organizado. Contradição viva. Albion era tudo que Logan não era. Imprevisível. Caótica. Ilógica nas fundações, mas de pé mesmo assim. Ele não sabia se gostava ou se odiava aquilo. Talvez ambos. Mas uma coisa era certa: ali, magia não era enfeite de nobres entediados. Tinha função. Tinha peso. Tinha consequências.`
  },
  {
    id: "chapter-3",
    number: "Capítulo 3",
    title: "A Rotina na Corte das Corujas",
    imagePrompt: `Over the shoulder shot from behind ${CHAR_LOGAN} (in foreground, slightly out of focus) wearing student robes, looking up at ${CHAR_GARETH} who is holding a glowing magical device triumphantly in a laboratory, showing the height difference and Gareth's charisma, magical sparks in the air, detailed background`,
    content: `A Corte das Corujas não rolou tapete vermelho para Logan Rylan. Não tinha trombetas, nem cerimônia de boas-vindas. Ele entrou pelos fundos, segurando uma vassoura e vestindo um avental que cheirava a mofo.

A prestigiada academia de magia e engenharia de Albion tinha portões dourados na frente — para gente com sobrenome e dinheiro. Logan tinha uma mochila surrada e o equivalente a três semanas de aluguel no bolso. O trabalho disponível? Zelador assistente da Ala de Artifícios. Não era glamouroso. Era sobrevivência.

Seus dias começavam quando a cidade ainda estava escura. Varrer limalha de ferro dos laboratórios. Polir lentes de telescópios enormes que estudantes nem se dignavam a limpar. E o melhor — ou pior, dependendo do humor —: consertar os autômatos de limpeza que os filhinhos de papai quebravam por pura negligência.

A virada aconteceu numa terça-feira chuvosa.

*Valerius Gearshift*, o Grão-Artífice da academia — elfo alto, rosto angular com tatuagens arcanas percorrendo a têmpora esquerda, e uma reputação de destruir egos com uma única pergunta —, achou Logan no canto mais esquecido de um laboratório. O garoto estava com os braços enfiados até os cotovelos nas entranhas de um golem de lixo.

— O que você está fazendo, garoto? — A voz de Valerius ecoou no salão vazio como um trovão contido.

Logan nem levantou a cabeça. Continuou apertando um parafuso com precisão cirúrgica.
— O eixo central estava instável, senhor. Vibração excessiva causava desgaste prematuro nos rolamentos. Reduzi a oscilação em 12%, reconfigurei o giroscópio e ajustei o fluxo de mana no núcleo. — Ele finalmente olhou para cima. — Agora ele consome 8% menos energia e varre 15% mais rápido. Testei três vezes.

Valerius cruzou os braços, observando o golem ganhar vida. O autômato se moveu pela sala com uma suavidade que não deveria ter. O elfo não disse nada. Apenas assentiu e saiu.

Na semana seguinte, Logan não tinha mais vassoura. Tinha uma túnica de estudante bolsista, uma bancada no laboratório 4B e o ódio invejoso de metade da turma. Foi no 4B que Logan conheceu Gareth.

*Gareth Aldren* era tudo que Logan não era. Alto, ombros largos, cabelo loiro que parecia brilhar mesmo sob a luz fraca das velas. Sorriso fácil que abria portas trancadas. O tipo de cara que você olha e pensa: "Ele vai longe."

E Gareth era brilhante na teoria. Citava tratados arcanos de memória. Mas as mãos dele? Desastre. Seus protótipos explodiam. Literalmente. Circuitos derretiam, cristais rachavam.

— Precisa de ajuda? — ofereceu Logan, numa tarde em que Gareth olhava para os destroços fumegantes de um autômato.

Gareth riu. — Cara, eu juro que entendo como funciona na minha cabeça. Mas quando coloco no metal... não funciona.

Logan pegou o projeto. Dez minutos depois, tinha identificado três falhas críticas. Funcionou na primeira tentativa. Gareth olhou para o autômato, depois para Logan, e sorriu.

— Parceria? — ele estendeu a mão.

Eles viraram uma simbiose. Logan construía, Gareth apresentava. Logan resolvia as equações impossíveis, Gareth vendia a solução com o carisma de um bardo.

— Nós vamos mudar o mundo, Logan — Gareth dizia. — Você é o cérebro. Eu sou a voz. Juntos? Imparáveis.

Logan acreditou. A vida na Corte era intensa. Ele devorava cada aula, cada livro. Não tinha amigos além de Gareth. Não ia nas festas. Ele vivia para a bancada. Para o cheiro de ozônio queimando no ar. E, pela primeira vez na vida, Logan Rylan se sentia parte de algo.`
  },
  {
    id: "chapter-4",
    number: "Capítulo 4",
    title: "O Sussurro de Shadowmoor",
    imagePrompt: `Dutch angle tilted camera shot, horror atmosphere, close up on a ominous black grimoire on a pedestal with pulsating veins, ${CHAR_LOGAN} wearing field expedition tunic reaching out to touch it with trembling hand, liquid shadows dripping, unnerving composition, dark forest background`,
    content: `Segundo ano. Expedição de campo obrigatória. A *Orla do Crepúsculo* — uma faixa de terra onde a realidade era fina como papel molhado e a magia selvagem vazava de planos que ninguém deveria visitar.

A floresta era errada. As árvores tinham cascas cinzentas, textura de pele morta esticada sobre ossos podres. O silêncio era absoluto, quebrado só pelo estalar de galhos secos que ninguém pisava. Logan mantinha os olhos na bússola de mana, ignorando o frio que subia pela espinha.

Então ele ouviu. Não. Errado. Ele *sentiu*.

Não era som. Era vibração. Nos ossos. Um zumbido baixo, contínuo, que parecia vir de dentro do próprio crânio, como se algo estivesse arranhando a parte de dentro do seu cérebro com unha enferrujada. A bússola girou. Apontou para a esquerda. Para o nada.

*Não faça isso*, gritou a razão. Mas suas pernas se moveram. Não foi decisão. Foi compulsão.

A clareira apareceu de repente. A luz do sol não entrava ali. No centro, sobre um pedestal de pedra negra — não esculpida, *crescida*, cheia de veias roxas pulsando fracamente — estava o livro.

O *Grimoire da Raiz Retorcida*.

A capa era feita de sombras que se recusavam a ficar paradas e couro que pulsava. Veias. Tinha veias correndo por baixo da superfície, bombeando algo que definitivamente não era tinta. Logan estendeu a mão. Mãos tremendo. Ele tocou.

O mundo *despencou*.

Frio absoluto. Como ser mergulhado em água congelante, mas a água estava *dentro* dele. Sombras explodiram do livro. Líquidas, viscosas, vivas, subindo pelo braço dele como serpentes famintas. Penetraram a pele. Invadiram os olhos. Logan tentou gritar. Saiu vento seco, sussurro de folhas mortas.

Escuridão.

Acordou com gosto de ferrugem na boca. O pedestal estava vazio. O livro, sumido. Mas tinha algo errado. Um zumbido baixo na orelha esquerda. E o frio teimoso no centro do peito. E a sombra dele... a sombra estava mais densa. Como se tivesse ganhado peso.

A volta levou dois dias. Logan caminhou em silêncio. Chegou à Corte exausto, roupas rasgadas, mas sem ferimentos. Foi direto para o escritório de Valerius.

— Senhor — Logan disse, voz rouca. — Entrei em contato com um artefato não catalogado. Grimório de origem sombria. Fui exposto a energias necróticas. Solicito contenção imediata e avaliação de risco. — Ele engoliu seco. — Se eu representar ameaça à segurança da Corte, autorizo minha neutralização.

Valerius tirou os óculos. Piscou.
— Você está pedindo pra ser morto se necessário?
— Estou relatando uma falha estrutural, senhor. Ocultação de dados leva a colapso catastrófico do sistema.

O elfo ficou em silêncio. Depois fez exames por horas.
— É uma marca residual. *Maldição menor, classe três*. Você não é uma bomba-relógio, garoto. É só... azarado. Mas sua honestidade é rara. Perigosamente rara.

Logan aceitou. Catalogou mentalmente: *Maldição de Shadowmoor. Efeitos: interferência menor. Status: gerenciável.* Nos meses seguintes, colegas o evitavam. Gareth notou o cheiro de ferrugem. Mas Logan sabia: se precisasse, aquela sombra poderia ser útil.`
  },
  {
    id: "chapter-5",
    number: "Capítulo 5",
    title: "O Pastor e o Escudo",
    imagePrompt: `Extreme close up macro shot of a glass of red wine being held by a hand, focus on the red liquid reflection, background is blurred showing ${CHAR_GARETH} smiling and ${CHAR_LOGAN} in a workshop, atmosphere of subtle betrayal, cinematic bokeh`,
    content: `O Grande Concurso de Inovação Real estava chegando. Cinco mil peças de ouro. Título de Engenheiro Real Júnior. Para Logan, a saída da pobreza. Para Gareth, a salvação de sua família falida — algo que ele escondia desesperadamente.

— Vamos fazer história, irmão — Gareth disse, com um brilho febril nos olhos.

O projeto era ambicioso. *Iron Shepherd* — O Pastor de Ferro. Um cão de guarda mecânico. Autônomo. Leal. Indestrutível. O soldado perfeito para as fronteiras de Albion.

Logan mergulhou de cabeça. Semanas sem dormir, sustentado por café forte e poções de vitalidade. O chassi de mithril estava pronto, as articulações hidráulicas perfeitas. Mas a alma... a animação falhou. A matriz de inteligência que Gareth prometera desenvolver simplesmente não funcionava. O cão era uma estátua magnífica e morta.

Faltando três dias, o desespero bateu.
— Gareth, precisamos de mais tempo — Logan disse.
— Não. Não há mais tempo — Gareth cortou, voz assustadoramente firme.

Logan improvisou. Se não podiam criar um soldado que pensasse, criariam uma ferramenta que protegesse. Ele desmontou o núcleo defensivo do autômato inerte. Dezesseis horas direto.

Quando terminou, o sol estava nascendo.

O *Aégis*.

Não era o cão. Era o escudo. Um dispositivo portátil, com cristais rotacionando em anéis concêntricos e runas gravadas em adamantina. Capaz de projetar barreiras de luz sólida, ofuscar atacantes, absorver impactos mortais. Era genial. Era funcional. Era *dele*.

— Logan. — A voz de Gareth, suave. Ele segurava uma garrafa de vinho caro. — Você é um gênio, cara. Isso vai mudar tudo. Um brinde. Ao nosso futuro.

Logan hesitou. Tinha uma sensação de parafuso solto. Mas Gareth sorria, aquele sorriso exausto.
— Ao nosso futuro — Logan repetiu, aceitando a taça.

O vinho era suave. Sabor rico, levemente adocicado. Amêndoas?
Dois goles. O cansaço bateu como maré. Pesado. Irresistível.
Escuridão sem sonhos.`
  },
  {
    id: "chapter-6",
    number: "Capítulo 6",
    title: "A Queda e o Exílio",
    imagePrompt: `Static cinematic shot, low camera placed slightly behind and to the right of ${CHAR_LOGAN}, shoulder-level perspective. Logan occupies the extreme left third of the frame, mostly in shadow, partially cropped, back turned to the camera. His silhouette is sharp but understated, clothing wrinkled and dark, edges catching minimal rim light.The depth of field is long and clean. In the far background, centered on the stage, ${CHAR_GARETH} stands under intense magical illumination, presenting the glowing Aegis at chest height. The Aegis is the brightest point in the image, perfectly centered on the rule-of-thirds intersection.The Grand Hall architecture creates strong leading lines: floor patterns, banners, and columns converge toward Gareth, visually pulling attention away from Logan. The crowd is implied as blurred shapes, not detailed, forming a visual barrier between foreground and stage.Lighting contrast is extreme: foreground nearly black, background overexposed with warm gold and arcane blue light. No motion, no action — a frozen moment of realization.Mood: quiet humiliation, public triumph versus private ruin. Dark fantasy, painterly realism, controlled color palette, deliberate composition, no dynamic action, no visual clutter`,
    content: `Logan acordou com a cabeça latejando. A luz da manhã entrava cruel. O laboratório estava silencioso.

Silêncio errado.

A bancada estava vazia. O *Aégis* sumira. Os cadernos de anotações — três anos de trabalho — sumiram. Os diagramas, os protótipos. Tudo.

O pânico frio de engenheiro bateu. Ele correu. Roupas amassadas, manchadas de óleo, cheiro de vinho azedo. Chegou ao Grande Salão de Apresentações a tempo de ouvir os aplausos.

O salão estava lotado. O Rei Felipe estava lá. E no palco, iluminado por luzes mágicas, estava Gareth.

O *Aégis* flutuava ao redor dele. Barreiras de luz sólida defendiam disparos de teste com perfeição. A plateia estava de pé.
— Eu dedico esta invenção à segurança de Albion — Gareth dizia, mão no coração. — E à memória do meu avô.

Logan parou na porta. Ele viu o tremor nas mãos de Gareth. Viu o suor frio. Viu a culpa. Mas ninguém mais via. Eles viam o herói.

Análise fria.
*Fato 1:* Gareth tinha a posse física e o carisma.
*Fato 2:* Logan parecia um louco, sujo e sem provas.
Confronto significaria prisão.

Logan caminhou até o Magistrado e protocolou a denúncia.
— Você tem provas? — o Magistrado perguntou.
— Tinha cadernos. Diagramas.
— *Tinha*.

O julgamento foi uma farsa. Gareth trouxe testemunhas compradas. Apresentou cadernos falsificados com caligrafia copiada perfeitamente. E sussurrou aos juízes:
— O acidente na floresta... Logan nunca mais foi o mesmo. A mente dele cria fantasias.

Valerius Gearshift, presidindo o conselho, hesitou. Olhou para Logan, o garoto honesto. Olhou para as provas físicas perfeitas de Gareth.
O veredito: *Calúnia Invejosa e Tentativa de Sabotagem*.

Expulsão imediata. Banimento.

Logan aceitou em silêncio. Olhou para Gareth uma última vez. Gareth desviou o olhar.
Logan saiu pelos portões sob chuva fina. A cidade o recebeu indiferente. Ele parou numa ponte, pensou em desistir. Mas sentiu o zumbido da maldição. O frio no peito. Ele ainda tinha recursos.

Calculou. *Zona da Verdade* num julgamento formal custava 500 peças de ouro. Ele tinha doze cobres.
Logan sorriu. Não de alegria. De propósito.
Novo objetivo: acumular recursos. Comprar a verdade.
Ele voltaria.`
  },
  {
    id: "epilogue",
    number: "Epílogo",
    title: "O Primeiro Passo",
    imagePrompt: `Low angle hero shot from the ground looking up at ${CHAR_LOGAN} (human, 1.41m) wearing custom industrial SCALE MAIL made of scrap metal washers and gears over leather, wearing brass goggles on forehead, tool pouches on belt, holding a small pneumatic smithing hammer against shoulder, standing inside a forge, dramatic rim lighting, sense of determination and new beginning, masterpiece`,
    content: `Seis meses depois.

A Forja Grímsdottir cheirava a carvão e ferro. Logan martelava a última arruela de uma ombreira reforçada.
— Vai mesmo fazer isso, garoto? Sair caçando monstros? — Hilda Grímsdottir, a anã, bufou.
— Vou.
— Idiota. Mas seu pagamento tá pronto. Quatro peças de ouro. E pode levar aquele martelo velho.

Logan assentiu. Nas noites, ele construíra o que precisava com sobras.

Agora, sozinho fora dos muros de Online, ele checava o equipamento.

*A armadura:* **Cota de Escamas (Scale Mail)** customizada. Feia, mas genial. Logan não tinha placas grandes de metal, então usou o que encontrou no lixo industrial: centenas de arruelas achatadas, pedaços de engrenagens quebradas e retalhos de aço cortados em forma de escama. Tudo meticulosamente rebitado sobre um casaco de couro pesado de monstro. Parecia a pele de um dragão mecânico. Pesada, barulhenta, mas flexível onde precisava ser.

*O Martelo de Forja:* Não era uma arma de guerra. Era sua ferramenta. Cabeça de aço temperado, mas o cabo... o cabo era uma obra de arte improvisada. Tubos de cobre percorriam a madeira, conectados a um pequeno cilindro pneumático na base. Quando Logan sussurrava as palavras antigas que aprendeu observando druidas urbanos — *Shillelagh* —, não era a natureza que respondia, mas a física. As runas brilhavam, o sistema pressurizava, e o martelo vibrava, tornando-se leve como uma pluma em sua mão, mas batendo com o peso de uma bigorna. Ele não precisava de músculos. Precisava de cálculo.

*Ferramentas:* Cintos cruzados sobre o peito carregavam bolsas de couro pesado. Chaves de boca, alicates, gazuas para trancas teimosas, formões para madeira. Na testa, óculos de proteção (goggles) com lentes intercambiáveis de latão.

*O escudo:* Aço simples, ganchos internos para ferramentas. Confiável.

Na mochila: corda, pitons, o livro *Fundamentos de Metalurgia Avançada*, e quatro peças de ouro escondidas no forro.

E a maldição. Sempre a maldição. O zumbido na orelha. A sombra que se esticava sozinha.

Meta: 500 peças de ouro. Faltavam 496.

Logan ajustou as fivelas da cota de escamas. O metal raspou contra metal. Ele baixou os óculos sobre os olhos por um segundo, testando o ajuste, e depois os subiu novamente para a testa.

Estava na hora.`
  }
];
