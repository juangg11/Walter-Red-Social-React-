import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../src/config/db.js';

const DEMO_PASSWORD = 'demo1234';

const users = [
  { username: 'ana_garcia', email: 'ana.garcia@walter.local' },
  { username: 'carlos_ruiz', email: 'carlos.ruiz@walter.local' },
  { username: 'laura_martin', email: 'laura.martin@walter.local' },
  { username: 'diego_santos', email: 'diego.santos@walter.local' },
  { username: 'marta_lopez', email: 'marta.lopez@walter.local' },
  { username: 'pablo_ortega', email: 'pablo.ortega@walter.local' },
  { username: 'irene_castro', email: 'irene.castro@walter.local' },
  { username: 'sergio_navarro', email: 'sergio.navarro@walter.local' },
  { username: 'elena_torres', email: 'elena.torres@walter.local' },
  { username: 'alberto_mora', email: 'alberto.mora@walter.local' },
  { username: 'lucia_vargas', email: 'lucia.vargas@walter.local' },
  { username: 'daniel_arias', email: 'daniel.arias@walter.local' },
];

const communities = [
  {
    nombre: 'technology',
    categoria: 'Tecnologia',
    descripcion: 'Noticias y debates sobre tecnologia de consumo, IA, privacidad y productos que realmente usamos.',
    creador: 'ana_garcia',
    miembros: ['ana_garcia', 'carlos_ruiz', 'laura_martin', 'sergio_navarro', 'elena_torres', 'daniel_arias'],
  },
  {
    nombre: 'programming',
    categoria: 'Desarrollo',
    descripcion: 'Codigo, herramientas, carrera profesional y decisiones tecnicas del dia a dia.',
    creador: 'carlos_ruiz',
    miembros: ['carlos_ruiz', 'marta_lopez', 'pablo_ortega', 'irene_castro', 'daniel_arias', 'ana_garcia'],
  },
  {
    nombre: 'travel',
    categoria: 'Viajes',
    descripcion: 'Rutas reales, consejos logisticos y errores que merece la pena evitar.',
    creador: 'laura_martin',
    miembros: ['laura_martin', 'diego_santos', 'lucia_vargas', 'sergio_navarro', 'ana_garcia'],
  },
  {
    nombre: 'todayilearned',
    categoria: 'Curiosidades',
    descripcion: 'Datos curiosos y descubrimientos pequenos que te hacen abrir otra pestana.',
    creador: 'irene_castro',
    miembros: ['irene_castro', 'alberto_mora', 'elena_torres', 'lucia_vargas', 'pablo_ortega'],
  },
  {
    nombre: 'gadgets',
    categoria: 'Hardware',
    descripcion: 'Monitores, teclados, audio, redes domesticas y cacharros utiles de verdad.',
    creador: 'sergio_navarro',
    miembros: ['sergio_navarro', 'carlos_ruiz', 'marta_lopez', 'alberto_mora', 'daniel_arias'],
  },
  {
    nombre: 'books',
    categoria: 'Lectura',
    descripcion: 'Novela, ensayo y recomendaciones con contexto, no solo listas de moda.',
    creador: 'elena_torres',
    miembros: ['elena_torres', 'lucia_vargas', 'ana_garcia', 'irene_castro', 'diego_santos'],
  },
  {
    nombre: 'movies',
    categoria: 'Cine',
    descripcion: 'Peliculas recientes, clasicos y conversaciones sobre guion, ritmo y puesta en escena.',
    creador: 'alberto_mora',
    miembros: ['alberto_mora', 'marta_lopez', 'pablo_ortega', 'elena_torres', 'laura_martin'],
  },
  {
    nombre: 'food',
    categoria: 'Cocina',
    descripcion: 'Recetas repetibles entre semana, ingredientes faciles y pequenos trucos que ahorran tiempo.',
    creador: 'lucia_vargas',
    miembros: ['lucia_vargas', 'ana_garcia', 'diego_santos', 'elena_torres', 'daniel_arias'],
  },
];

const posts = [
  {
    username: 'ana_garcia',
    community: 'technology',
    title: 'Llevo una semana con DNS local para bloquear anuncios y ha sido el cambio mas silencioso pero mas util de mi red',
    content: 'No esperaba notar tanta diferencia en televisiones, moviles y tablets. Lo mejor es que los familiares dejaron de preguntarme por banners raros y popups.',
    createdHoursAgo: 2,
  },
  {
    username: 'sergio_navarro',
    community: 'technology',
    title: 'Mi portatil nuevo tiene mejor bateria por software que por capacidad y eso me parece la noticia del ano',
    content: 'Entre perfiles adaptativos, suspension bien afinada y apps menos invasivas he pasado de vivir pegado al cargador a terminar la jornada con margen.',
    createdHoursAgo: 5,
  },
  {
    username: 'carlos_ruiz',
    community: 'programming',
    title: 'Me esta funcionando mejor TypeScript para iterar y Rust para las partes lentas que intentar usar un solo lenguaje para todo',
    content: 'No es una religion ni una guerra de stacks. Simplemente deje de forzar una herramienta para problemas que no le sientan bien.',
    createdHoursAgo: 8,
  },
  {
    username: 'marta_lopez',
    community: 'programming',
    title: 'Deje de ver tutoriales durante una semana y monte una API pequena de principio a fin: aprendi mucho mas',
    content: 'Autenticacion, validacion, errores y despliegue. Nada heroico, pero por primera vez senti que entendia el flujo completo.',
    createdHoursAgo: 14,
  },
  {
    username: 'laura_martin',
    community: 'travel',
    title: 'Para un viaje de 14 dias por Japon me ha salido mejor reducir ciudades y dormir dos noches mas en cada sitio',
    content: 'La diferencia entre visitar y arrastrarse con la maleta es enorme. Menos check-in y mas tiempo para caminar sin reloj.',
    createdHoursAgo: 18,
  },
  {
    username: 'diego_santos',
    community: 'travel',
    title: 'La mejor decision de mi ultimo viaje fue coger los trenes largos a primera hora aunque me costara madrugar',
    content: 'Llegar con luz, dejar la mochila y tener la tarde libre cambia por completo la sensacion de cansancio.',
    createdHoursAgo: 21,
  },
  {
    username: 'irene_castro',
    community: 'todayilearned',
    title: 'Hoy aprendi que varios trenes nocturnos europeos volvieron a llenarse por comodidad mas que por nostalgia',
    content: 'Tiene sentido: ahorras hotel, llegas al centro y la experiencia se siente mas humana que otra cola de aeropuerto.',
    createdHoursAgo: 28,
  },
  {
    username: 'alberto_mora',
    community: 'gadgets',
    title: 'Despues de un mes con monitor ultrawide me cuesta volver a dos pantallas pequenas',
    content: 'No es solo espacio. Tener una sola superficie reduce mucho el cansancio y hace mas agradable editar, programar y comparar documentos.',
    createdHoursAgo: 30,
  },
  {
    username: 'elena_torres',
    community: 'books',
    title: 'Que libro reciente os ha devuelto el habito de leer por la noche sin mirar el movil a mitad de capitulo',
    content: 'Busco algo agil pero con buena prosa. Me valen novelas, no ficcion o ensayos cortos que realmente enganchen.',
    createdHoursAgo: 34,
  },
  {
    username: 'pablo_ortega',
    community: 'movies',
    title: 'La pelicula que mas me ha gustado este ano no fue la mas ambiciosa: fue la que mejor estaba escrita',
    content: 'Cada escena empujaba a la siguiente sin ruido ni postureo. Salir del cine pensando en los dialogos me pasa muy pocas veces.',
    createdHoursAgo: 38,
  },
  {
    username: 'lucia_vargas',
    community: 'food',
    title: 'La receta que mas repito entre semana tarda 15 minutos, ensucia una sola sarten y no parece comida de emergencia',
    content: 'Pasta corta, tomate, ajo, espinacas y un poco de limon al final. No inventa nada, pero resuelve muchisimo.',
    createdHoursAgo: 42,
  },
  {
    username: 'daniel_arias',
    community: 'programming',
    title: 'He empezado a escribir README cortos antes de picar codigo y me esta ahorrando retrabajo',
    content: 'Definir alcance, entradas y salidas en diez lineas me deja menos hueco para decisiones impulsivas que luego cuestan dias.',
    createdHoursAgo: 46,
  },
];

const comments = [
  {
    postTitle: 'Llevo una semana con DNS local para bloquear anuncios y ha sido el cambio mas silencioso pero mas util de mi red',
    username: 'carlos_ruiz',
    content: 'Estoy igual. Lo bueno es que se nota incluso en dispositivos donde no puedes instalar nada.',
    createdHoursAgo: 1,
  },
  {
    postTitle: 'Me esta funcionando mejor TypeScript para iterar y Rust para las partes lentas que intentar usar un solo lenguaje para todo',
    username: 'ana_garcia',
    content: 'Esa combinacion tiene sentido. Donde muchos se lian es intentando justificar una unica stack para problemas muy distintos.',
    createdHoursAgo: 6,
  },
  {
    postTitle: 'Deje de ver tutoriales durante una semana y monte una API pequena de principio a fin: aprendi mucho mas',
    username: 'marta_lopez',
    content: 'La parte que mas me enseño fue romper produccion en local y tener que arreglarlo sin copiar una guia paso a paso.',
    createdHoursAgo: 10,
  },
  {
    postTitle: 'Para un viaje de 14 dias por Japon me ha salido mejor reducir ciudades y dormir dos noches mas en cada sitio',
    username: 'lucia_vargas',
    content: 'Totalmente. El mejor recuerdo casi siempre sale del tiempo muerto, no de correr de una foto a otra.',
    createdHoursAgo: 12,
  },
  {
    postTitle: 'Que libro reciente os ha devuelto el habito de leer por la noche sin mirar el movil a mitad de capitulo',
    username: 'diego_santos',
    content: 'A mi me funciono volver a libros cortos. Cuando el objetivo es recuperar ritmo, acabar uno rapido ayuda mucho.',
    createdHoursAgo: 26,
  },
  {
    postTitle: 'La receta que mas repito entre semana tarda 15 minutos, ensucia una sola sarten y no parece comida de emergencia',
    username: 'elena_torres',
    content: 'El toque de limon al final es justo lo que separa una cena correcta de una que quieres repetir.',
    createdHoursAgo: 33,
  },
];

const votes = [
  { username: 'carlos_ruiz', postTitle: posts[0].title, tipo: 'up' },
  { username: 'laura_martin', postTitle: posts[0].title, tipo: 'up' },
  { username: 'sergio_navarro', postTitle: posts[0].title, tipo: 'up' },
  { username: 'marta_lopez', postTitle: posts[2].title, tipo: 'up' },
  { username: 'daniel_arias', postTitle: posts[2].title, tipo: 'up' },
  { username: 'ana_garcia', postTitle: posts[3].title, tipo: 'up' },
  { username: 'lucia_vargas', postTitle: posts[4].title, tipo: 'up' },
  { username: 'diego_santos', postTitle: posts[4].title, tipo: 'up' },
  { username: 'ana_garcia', postTitle: posts[6].title, tipo: 'up' },
  { username: 'pablo_ortega', postTitle: posts[8].title, tipo: 'up' },
  { username: 'elena_torres', postTitle: posts[9].title, tipo: 'up' },
  { username: 'marta_lopez', postTitle: posts[10].title, tipo: 'up' },
  { username: 'alberto_mora', postTitle: posts[1].title, tipo: 'down' },
];

const notifications = [
  {
    username: 'ana_garcia',
    title: 'Nuevo comentario en tu publicacion',
    message: 'Carlos Ruiz ha comentado en tu publicacion sobre DNS local.',
    postTitle: posts[0].title,
    read: false,
    createdHoursAgo: 1,
  },
  {
    username: 'carlos_ruiz',
    title: 'Tu publicacion esta recibiendo votos',
    message: 'Varios usuarios han votado tu post sobre TypeScript y Rust.',
    postTitle: posts[2].title,
    read: false,
    createdHoursAgo: 4,
  },
  {
    username: 'laura_martin',
    title: 'Nuevo comentario en tu itinerario',
    message: 'Lucia Vargas ha dejado una respuesta en tu post sobre Japon.',
    postTitle: posts[4].title,
    read: true,
    createdHoursAgo: 11,
  },
];

function hoursAgo(hours) {
  const date = new Date(Date.now() - hours * 60 * 60 * 1000);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function insertUsers(connection) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userIds = new Map();

  for (const user of users) {
    const id = uuidv4();
    userIds.set(user.username, id);
    await connection.query(
      'INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)',
      [id, user.email, user.username, passwordHash]
    );
  }

  return userIds;
}

async function insertCommunities(connection, userIds) {
  const communityIds = new Map();

  for (const community of communities) {
    const [result] = await connection.query(
      `INSERT INTO comunidades (nombre, descripcion, categoria, creador_id, fecha_creacion)
       VALUES (?, ?, ?, ?, ?)`,
      [
        community.nombre,
        community.descripcion,
        community.categoria,
        userIds.get(community.creador),
        hoursAgo(72),
      ]
    );
    communityIds.set(community.nombre, result.insertId);
  }

  for (const community of communities) {
    for (const username of community.miembros) {
      await connection.query(
        `INSERT INTO miembros_comunidad (usuario_id, comunidad_id, fecha_union)
         VALUES (?, ?, ?)`,
        [userIds.get(username), communityIds.get(community.nombre), hoursAgo(48)]
      );
    }
  }

  return communityIds;
}

async function insertPosts(connection, userIds, communityIds) {
  const postIds = new Map();

  for (const post of posts) {
    const [result] = await connection.query(
      `INSERT INTO publicaciones
       (titulo, contenido, usuario_id, comunidad_id, fecha_creacion)
       VALUES (?, ?, ?, ?, ?)`,
      [
        post.title,
        post.content,
        userIds.get(post.username),
        communityIds.get(post.community),
        hoursAgo(post.createdHoursAgo),
      ]
    );
    postIds.set(post.title, result.insertId);
  }

  return postIds;
}

async function insertComments(connection, userIds, postIds) {
  for (const comment of comments) {
    await connection.query(
      `INSERT INTO comentarios (contenido, usuario_id, publicacion_id, fecha_creacion)
       VALUES (?, ?, ?, ?)`,
      [
        comment.content,
        userIds.get(comment.username),
        postIds.get(comment.postTitle),
        hoursAgo(comment.createdHoursAgo),
      ]
    );
  }
}

async function insertVotes(connection, userIds, postIds) {
  for (const vote of votes) {
    await connection.query(
      `INSERT INTO votos_usuarios (usuario_id, publicacion_id, tipo_voto, fecha_creacion)
       VALUES (?, ?, ?, ?)`,
      [
        userIds.get(vote.username),
        postIds.get(vote.postTitle),
        vote.tipo,
        hoursAgo(3),
      ]
    );
  }
}

async function insertNotifications(connection, userIds, postIds) {
  for (const notification of notifications) {
    await connection.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, publicacion_id, leida, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userIds.get(notification.username),
        notification.title,
        notification.message,
        postIds.get(notification.postTitle),
        notification.read,
        hoursAgo(notification.createdHoursAgo),
      ]
    );
  }
}

async function recalculateCounters(connection) {
  await connection.query(
    `UPDATE comunidades c
     SET numero_miembros = (
       SELECT COUNT(*) FROM miembros_comunidad mc WHERE mc.comunidad_id = c.id
     ),
     numero_posts = (
       SELECT COUNT(*) FROM publicaciones p WHERE p.comunidad_id = c.id
     )`
  );

  await connection.query(
    `UPDATE publicaciones p
     SET numero_comentarios = (
       SELECT COUNT(*) FROM comentarios c WHERE c.publicacion_id = p.id
     ),
     votos = (
       SELECT COALESCE(SUM(CASE WHEN v.tipo_voto = 'up' THEN 1 ELSE -1 END), 0)
       FROM votos_usuarios v
       WHERE v.publicacion_id = p.id
     )`
  );
}

async function clearDatabase(connection) {
  const tables = [
    'notificaciones',
    'mensajes_chat',
    'chats_participantes',
    'chats',
    'votos_usuarios',
    'comentarios',
    'publicaciones',
    'miembros_comunidad',
    'comunidades',
    'users',
    'media_assets',
  ];

  for (const table of tables) {
    await connection.query(`DELETE FROM ${table}`);
  }
}

async function seed() {
  const connection = await pool.getConnection();

  try {
    console.log('Iniciando seed real de MySQL...');
    console.log(`Password comun para usuarios demo: ${DEMO_PASSWORD}`);

    await connection.beginTransaction();

    await clearDatabase(connection);
    const userIds = await insertUsers(connection);
    const communityIds = await insertCommunities(connection, userIds);
    const postIds = await insertPosts(connection, userIds, communityIds);
    await insertComments(connection, userIds, postIds);
    await insertVotes(connection, userIds, postIds);
    await insertNotifications(connection, userIds, postIds);
    await recalculateCounters(connection);

    await connection.commit();

    console.log(`Usuarios creados: ${users.length}`);
    console.log(`Comunidades creadas: ${communities.length}`);
    console.log(`Posts creados: ${posts.length}`);
    console.log(`Comentarios creados: ${comments.length}`);
    console.log(`Notificaciones creadas: ${notifications.length}`);
    console.log('Seed completado.');
  } catch (error) {
    await connection.rollback();
    console.error('Error al ejecutar el seed:', error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();
