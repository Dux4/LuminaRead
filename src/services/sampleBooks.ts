import { Book } from '../types';

export const INITIAL_SAMPLE_BOOKS: Book[] = [
  {
    id: 'sample-dom-casmurro',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    coverColor: '#5856D6',
    format: 'EPUB',
    currentChapterIndex: 0,
    currentProgressPercent: 0,
    totalPages: 38,
    currentPage: 1,
    bookmarks: [],
    addedAt: new Date().toISOString(),
    chapters: [
      {
        id: 'dc-ch-1',
        title: 'Capítulo I: Do Título',
        content: `Uma noite destas, vindo da cidade para o Engenho Novo, encontrei no trem da Central um rapaz aqui do bairro, que eu conheço de vista e de chapéu. Cumprimentou-me, sentou-se ao meu lado, falou da lua e dos ministros, e acabou recitando-me versos. A viagem era curta, e os versos talvez não fossem maus, mas eu estava cansado, fechei os olhos, cochilei.

Ele parou a recitação e empurrou-me a espinha:
— Acorde, leitor! O senhor não dorme no trem!

Abri os olhos, desculpei-me; ele insistiu na leitura de seus versos. Foi então que os vizinhos de vagão me chamaram de "Dom Casmurro". O título pegou. Não te zangues com o título; o livro é a história de minha vida e da minha amada Capitu.`
      },
      {
        id: 'dc-ch-2',
        title: 'Capítulo II: Do Livro',
        content: `Agora que expliquei o título, passo a escrever o livro. Não consulto a memória de outros, nem documentos de arquivo; a minha memória é que há de contar tudo com a fidelidade da velhice.

Capitu era Capitu, isto é, uma criatura extraordinária. Olhos de cigana oblíqua e dissimulada. Eu não sabia o que era oblíqua, mas dissimulada sabia, e queria ver se podiam chamar assim aos olhos dela. Olhei para Capitu, e ela para mim; a distância era de dois passos. Tinha os olhos grandes, abertos, como que a buscar a sombra da imaginação.`
      },
      {
        id: 'dc-ch-3',
        title: 'Capítulo III: Olhos de Ressaca',
        content: `Retrato de Capitu: tinha uns olhos de ressaca. Traziam não sei que fluido misterioso e enganador. Uma força que arrastava para dentro, como a vaga que se retira da praia nos dias de ressaca.

Para não ser tragado, agarrei-me às lembranças da infância, às conversas no quintal de nossa casa, às promessas que minha mãe fizera de me mandar para o seminário. Mas o amor já havia fincado raízes profundas na alma de Bento Santiago.`
      }
    ]
  },
  {
    id: 'sample-arte-da-guerra',
    title: 'A Arte da Guerra',
    author: 'Sun Tzu',
    coverColor: '#FF9F0A',
    format: 'TXT',
    currentChapterIndex: 0,
    currentProgressPercent: 0,
    totalPages: 24,
    currentPage: 1,
    bookmarks: [],
    addedAt: new Date().toISOString(),
    chapters: [
      {
        id: 'sw-ch-1',
        title: 'Capítulo 1: Estimativas e Planejamento',
        content: `A arte da guerra é de vital importância para o Estado. É um domínio de vida ou de morte, um caminho para a segurança ou para a ruína. Portanto, é um assunto de estudo que não pode ser negligenciado em hipótese alguma.

Sun Tzu disse: A guerra é governada por cinco fatores fundamentais. São eles: a Lei Moral, o Clima, o Terreno, o Comando e a Doutrina.

A Lei Moral faz com que o povo esteja em completo acordo com seu governante, de modo que o siga independentemente de suas vidas, sem se abalar por nenhum perigo.

Aquele que conhece a si mesmo e ao inimigo garantirá a vitória em cem batalhas sem correr perigo.`
      },
      {
        id: 'sw-ch-2',
        title: 'Capítulo 2: A Condução da Guerra',
        content: `Na operação da guerra, onde há no campo mil carros rápidos, mil carros pesados e cem mil soldados armados, os suprimentos devem ser transportados por milhares de léguas.

Se a vitória demorar a vir, as armas dos homens ficarão cegas e seu ardor esfriará. Se você cercar uma cidade, gastará suas forças. Nunca uma nação se beneficiou de uma guerra prolongada.

A suprema arte da guerra consiste em submeter o inimigo sem combater.`
      }
    ]
  },
  {
    id: 'sample-o-cortico',
    title: 'O Cortiço',
    author: 'Aluísio Azevedo',
    coverColor: '#FF375F',
    format: 'EPUB',
    currentChapterIndex: 0,
    currentProgressPercent: 0,
    totalPages: 42,
    currentPage: 1,
    bookmarks: [],
    addedAt: new Date().toISOString(),
    chapters: [
      {
        id: 'oc-ch-1',
        title: 'Capítulo I: João Romão',
        content: `João Romão foi, dos treze aos vinte e cinco anos, empregado de um português que mantinha uma taverna. Trabalhava sem descanso, guardava cada tostão e acabou comprando a taverna do patrão quando este resolveu voltar a Portugal.

Ao lado da taverna havia um terreno baldio. João Romão começou a construir casinhas de aluguel. Surgia ali o Cortiço, uma colméia humana pulsante, viva, onde os trabalhadores e famílias se misturavam na rotina suada do Rio de Janeiro oitocentista.`
      },
      {
        id: 'oc-ch-2',
        title: 'Capítulo II: A Desentupidora',
        content: `No cortiço acordava-se cedo. O sol surgia sobre as telhas de zinco e a passarada cantava nas pedreiras. Bertoleza cuidava da comida e das finanças junto com João Romão. O cortiço crescia a cada dia, absorvendo a força e as paixões de todos os seus moradores.`
      }
    ]
  },
  {
    id: 'sample-pequeno-principe',
    title: 'O Pequeno Príncipe',
    author: 'Antoine de Saint-Exupéry',
    coverColor: '#30D158',
    format: 'PDF',
    currentChapterIndex: 0,
    currentProgressPercent: 0,
    totalPages: 30,
    currentPage: 1,
    bookmarks: [],
    addedAt: new Date().toISOString(),
    chapters: [
      {
        id: 'pp-ch-1',
        title: 'Capítulo I: A Jiboia e o Elefante',
        content: `Certa vez, quando tinha seis anos, vi num livro sobre a Floresta Virgem uma imagem impressionante. Representava uma jiboia engolindo uma fera.

Desenhei então o meu Desenho Número 1. Mostrei a minha obra-prima às pessoas grandes e perguntei se o meu desenho lhes fazia medo.

Responderam-me: "Por que é que um chapéu faria medo?"
O meu desenho não representava um chapéu. Representava uma jiboia a digerir um elefante. Desenhei então o interior da jiboia, para que as pessoas grandes pudessem compreender. Elas têm sempre necessidade de explicações.`
      },
      {
        id: 'pp-ch-2',
        title: 'Capítulo II: O Encontro no Deserto',
        content: `Vivi assim só, sem ninguém com quem falar verdadeiramente, até que tive uma pane no deserto de Saara, há seis anos. Qualquer coisa se quebrara no meu motor.

E a primeira noite adormeci sobre a areia, a mil milhas de toda a terra habitada. Estava mais isolado que um náufrago numa jangada no meio do oceano.

Imaginem a minha surpresa quando, ao romper do dia, uma voz singular me acordou:
— Por favor... desenha-me um carneiro!`
      }
    ]
  }
];
