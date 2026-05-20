import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../src/config/db.js';

const DEMO_PASSWORD = 'demo1234';

const users = [
  { username: 'walter_admin', email: 'walter.admin@walter.local', bio: 'Moderando w/Walter y montando proyectos side quest.' },
  { username: 'ana_garcia', email: 'ana.garcia@walter.local', bio: 'Product manager. Cafe y roadmaps.' },
  { username: 'carlos_ruiz', email: 'carlos.ruiz@walter.local', bio: 'Backend + infra. Menos magia, mas observabilidad.' },
  { username: 'laura_martin', email: 'laura.martin@walter.local', bio: 'Viajes con mochila ligera y cuaderno.' },
  { username: 'diego_santos', email: 'diego.santos@walter.local', bio: 'SRE y cocinillas de noche.' },
  { username: 'marta_lopez', email: 'marta.lopez@walter.local', bio: 'Frontend, accesibilidad y animaciones discretas.' },
  { username: 'pablo_ortega', email: 'pablo.ortega@walter.local', bio: 'Cine, fotografia y tecnicas de guion.' },
  { username: 'irene_castro', email: 'irene.castro@walter.local', bio: 'Curiosidades historicas y UX research.' },
  { username: 'sergio_navarro', email: 'sergio.navarro@walter.local', bio: 'Hardware y setup nerd sin humo.' },
  { username: 'elena_torres', email: 'elena.torres@walter.local', bio: 'Libros, notas y clubes de lectura.' },
  { username: 'alberto_mora', email: 'alberto.mora@walter.local', bio: 'Data y stats de deporte.' },
  { username: 'lucia_vargas', email: 'lucia.vargas@walter.local', bio: 'Recetas de diario y batch cooking.' },
  { username: 'daniel_arias', email: 'daniel.arias@walter.local', bio: 'Fullstack generalista. README first.' },
  { username: 'nora_dev', email: 'nora.dev@walter.local', bio: 'Mobile engineer. iOS, Android y cafe frio.' },
  { username: 'hector_ai', email: 'hector.ai@walter.local', bio: 'LLMs en produccion y evaluaciones.' },
  { username: 'sara_design', email: 'sara.design@walter.local', bio: 'Design systems y tipografia.' },
  { username: 'bruno_audio', email: 'bruno.audio@walter.local', bio: 'Audio gear y produccion casera.' },
  { username: 'ines_fitness', email: 'ines.fitness@walter.local', bio: 'Running, fuerza y recovery.' },
];

const communities = [
  { nombre: 'technology', categoria: 'Tecnologia', descripcion: 'Noticias y debate tech con enfoque practico.', creador: 'walter_admin' },
  { nombre: 'programming', categoria: 'Desarrollo', descripcion: 'Codigo, arquitectura, carrera y tooling.', creador: 'carlos_ruiz' },
  { nombre: 'startups', categoria: 'Negocio', descripcion: 'Producto, growth, ventas y realidad de early stage.', creador: 'ana_garcia' },
  { nombre: 'travel', categoria: 'Viajes', descripcion: 'Rutas reales, presupuesto y errores utiles.', creador: 'laura_martin' },
  { nombre: 'todayilearned', categoria: 'Curiosidades', descripcion: 'Mini descubrimientos para aprender algo al dia.', creador: 'irene_castro' },
  { nombre: 'gadgets', categoria: 'Hardware', descripcion: 'Teclados, monitores, audio y setups.', creador: 'sergio_navarro' },
  { nombre: 'books', categoria: 'Lectura', descripcion: 'Recomendaciones y debate de libros.', creador: 'elena_torres' },
  { nombre: 'movies', categoria: 'Cine', descripcion: 'Peliculas, guion y fotografia.', creador: 'pablo_ortega' },
  { nombre: 'food', categoria: 'Cocina', descripcion: 'Comidas repetibles para semana real.', creador: 'lucia_vargas' },
  { nombre: 'design', categoria: 'Diseno', descripcion: 'UI, UX y sistemas de diseno.', creador: 'sara_design' },
  { nombre: 'fitness', categoria: 'Salud', descripcion: 'Entrenamiento, descanso y progresion sostenible.', creador: 'ines_fitness' },
  { nombre: 'music', categoria: 'Musica', descripcion: 'Produccion, escucha y descubrimientos.', creador: 'bruno_audio' },
];

const communityMembers = {
  technology: ['walter_admin', 'ana_garcia', 'carlos_ruiz', 'marta_lopez', 'daniel_arias', 'hector_ai', 'nora_dev', 'sergio_navarro', 'sara_design'],
  programming: ['carlos_ruiz', 'marta_lopez', 'daniel_arias', 'nora_dev', 'hector_ai', 'walter_admin', 'ana_garcia', 'sara_design'],
  startups: ['ana_garcia', 'walter_admin', 'daniel_arias', 'marta_lopez', 'hector_ai', 'pablo_ortega', 'sara_design'],
  travel: ['laura_martin', 'diego_santos', 'lucia_vargas', 'irene_castro', 'pablo_ortega', 'walter_admin'],
  todayilearned: ['irene_castro', 'elena_torres', 'alberto_mora', 'hector_ai', 'ana_garcia', 'nora_dev'],
  gadgets: ['sergio_navarro', 'bruno_audio', 'carlos_ruiz', 'marta_lopez', 'walter_admin', 'alberto_mora'],
  books: ['elena_torres', 'irene_castro', 'ana_garcia', 'lucia_vargas', 'sara_design', 'nora_dev'],
  movies: ['pablo_ortega', 'alberto_mora', 'laura_martin', 'elena_torres', 'walter_admin'],
  food: ['lucia_vargas', 'diego_santos', 'ines_fitness', 'ana_garcia', 'nora_dev', 'walter_admin'],
  design: ['sara_design', 'marta_lopez', 'nora_dev', 'ana_garcia', 'walter_admin', 'hector_ai'],
  fitness: ['ines_fitness', 'diego_santos', 'alberto_mora', 'lucia_vargas', 'walter_admin'],
  music: ['bruno_audio', 'pablo_ortega', 'sergio_navarro', 'laura_martin', 'walter_admin'],
};

const mediaLibrary = [
  { key: 'desk_setup', public_id: 'seed/desk_setup', secure_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80', resource_type: 'image', format: 'jpg', bytes: 420000, width: 1400, height: 933, duration: null },
  { key: 'train_japan', public_id: 'seed/train_japan', secure_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=80', resource_type: 'image', format: 'jpg', bytes: 410000, width: 1400, height: 934, duration: null },
  { key: 'coffee_code', public_id: 'seed/coffee_code', secure_url: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1400&q=80', resource_type: 'image', format: 'jpg', bytes: 390000, width: 1400, height: 933, duration: null },
  { key: 'meal_prep', public_id: 'seed/meal_prep', secure_url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=80', resource_type: 'image', format: 'jpg', bytes: 380000, width: 1400, height: 934, duration: null },
  { key: 'cinema_frame', public_id: 'seed/cinema_frame', secure_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80', resource_type: 'image', format: 'jpg', bytes: 350000, width: 1400, height: 787, duration: null },
  { key: 'book_stack', public_id: 'seed/book_stack', secure_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1400&q=80', resource_type: 'image', format: 'jpg', bytes: 320000, width: 1400, height: 934, duration: null },
  { key: 'gym_track', public_id: 'seed/gym_track', secure_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80', resource_type: 'image', format: 'jpg', bytes: 360000, width: 1400, height: 934, duration: null },
  { key: 'music_room', public_id: 'seed/music_room', secure_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80', resource_type: 'image', format: 'jpg', bytes: 365000, width: 1400, height: 935, duration: null },
  { key: 'keyboard', public_id: 'seed/keyboard', secure_url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1400&q=80', resource_type: 'image', format: 'jpg', bytes: 310000, width: 1400, height: 933, duration: null },
  { key: 'city_night', public_id: 'seed/city_night', secure_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1400&q=80', resource_type: 'image', format: 'jpg', bytes: 375000, width: 1400, height: 933, duration: null },
  { key: 'street_food', public_id: 'seed/street_food', secure_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80', resource_type: 'image', format: 'jpg', bytes: 380000, width: 1400, height: 933, duration: null },
  { key: 'sample_video', public_id: 'seed/sample_video', secure_url: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4', resource_type: 'video', format: 'mp4', bytes: 1200000, width: 1280, height: 720, duration: 5.0 },
];

const posts = [
  { username: 'ana_garcia', community: 'technology', title: 'La app mas util de este mes fue la que me apago notificaciones de forma inteligente', content: 'Parece una tonteria, pero redujo la ansiedad en reuniones. Muy vibe de hilo de X: pequeno cambio, impacto enorme.', hoursAgo: 2, mediaKey: 'desk_setup' },
  { username: 'carlos_ruiz', community: 'programming', title: 'Hot take estilo Reddit: mas logs no es observabilidad, es ruido caro', content: 'Si no tienes preguntas de negocio que responder, da igual que guardes 300GB de logs diarios.', hoursAgo: 3, mediaKey: 'coffee_code' },
  { username: 'marta_lopez', community: 'design', title: 'Mini caso real: cambiamos 1 boton y subio el ratio de publicacion 18%', content: 'No fue magia. Mejoramos texto, contraste y ubicacion. Lo dejo aqui porque parece post de growth pero fue puro UX.', hoursAgo: 4, mediaKey: 'keyboard' },
  { username: 'laura_martin', community: 'travel', title: 'Un hilo de viaje resumido en un post: menos ciudades, mas recuerdos', content: 'En 10 dias por Japon pase de 6 ciudades a 3. Se sintio menos checklist y mas viaje real.', hoursAgo: 6, mediaKey: 'train_japan' },
  { username: 'sergio_navarro', community: 'gadgets', title: 'Setup 2026: monitor 32, brazo decente y luz indirecta, cero humo', content: 'No compre nada viral. Solo piezas estables. Este tipo de post deberia venir con factura y no con afiliados.', hoursAgo: 7, mediaKey: 'desk_setup' },
  { username: 'elena_torres', community: 'books', title: 'Libro que me saco del doomscroll en 4 noches', content: 'Novela corta, ritmo alto y personajes memorables. Si estais bloqueados, buscad libros de 200 paginas.', hoursAgo: 8, mediaKey: 'book_stack' },
  { username: 'pablo_ortega', community: 'movies', title: 'No necesitaba un plano secuencia, necesitaba un guion mejor', content: 'Review en frio: visualmente impecable, pero el tercer acto parecia reescrito en el parking.', hoursAgo: 10, mediaKey: 'cinema_frame' },
  { username: 'lucia_vargas', community: 'food', title: 'Cena de 15 minutos que parece de domingo', content: 'Pasta, tomate, ajo, limon y albahaca. Sabor brutal con cero complicacion.', hoursAgo: 11, mediaKey: 'meal_prep' },
  { username: 'hector_ai', community: 'startups', title: 'Si vas a meter IA en producto, empieza por soporte interno', content: 'Es menos sexy para Twitter, pero te da aprendizaje rapido y reduce coste operativo desde el dia 1.', hoursAgo: 12, mediaKey: null },
  { username: 'nora_dev', community: 'programming', title: 'Deploy del viernes: regla autoimpuesta, no merges despues de las 16:00', content: 'No es cobardia, es salud del equipo. Desde que lo hacemos hay menos rollback y menos drama.', hoursAgo: 13, mediaKey: null },
  { username: 'diego_santos', community: 'fitness', title: 'Mejor PR del ano: dormir 7h estables durante 3 semanas', content: 'No fue suplemento ni rutina milagrosa. Fue apagar pantallas 45 min antes.', hoursAgo: 14, mediaKey: 'gym_track' },
  { username: 'bruno_audio', community: 'music', title: 'Comparativa honesta de monitores de estudio baratos', content: 'Hay vida fuera de marcas hype. Si calibras sala primero, ganas mas que cambiando de cajas.', hoursAgo: 16, mediaKey: 'music_room' },
  { username: 'irene_castro', community: 'todayilearned', title: 'TIL: los hilos largos se leen mas si la primera frase da contexto', content: 'Aplicado a posts internos tambien. Si no dices para quien es y por que importa, se pierde.', hoursAgo: 17, mediaKey: null },
  { username: 'alberto_mora', community: 'technology', title: 'Datos de uso reales: dark mode activo en 71% despues de las 20:00', content: 'No todo es preferencia estetica. En encuestas internas pesa mucho la fatiga visual.', hoursAgo: 18, mediaKey: null },
  { username: 'sara_design', community: 'design', title: 'Componente que parecia trivial y nos rompio 3 flujos', content: 'El selector de fecha tenia 12 estados no contemplados. Documentar estados es la mitad del trabajo.', hoursAgo: 20, mediaKey: null },
  { username: 'walter_admin', community: 'startups', title: 'Roadmap publico: lo bueno, lo malo y lo que no vamos a hacer', content: 'Estamos priorizando estabilidad y velocidad de publicacion. Nada de features flashy sin base.', hoursAgo: 22, mediaKey: null },
  { username: 'ana_garcia', community: 'programming', title: 'Post tipo Reddit: tu mejor aprendizaje de bugs en produccion', content: 'Empiezo yo: los retries sin limites son bombas de tiempo con temporizador.', hoursAgo: 24, mediaKey: null },
  { username: 'carlos_ruiz', community: 'technology', title: 'Subi un mini video del rack para enseñar cableado limpio', content: 'No es para posturear, es para que el proximo incidente no empiece con buscar un cable.', hoursAgo: 26, mediaKey: 'sample_video' },
  { username: 'laura_martin', community: 'travel', title: 'Checklist real para vuelos largos en economy', content: 'Compresion, hidratacion, asiento de pasillo y mochila sin caos. Parece obvio hasta que no lo haces.', hoursAgo: 28, mediaKey: 'city_night' },
  { username: 'marta_lopez', community: 'design', title: 'Microcopy que baja soporte: no es error, es explicacion', content: 'Cambiar Error de pago por Revisa CVV o saldo corto tickets de soporte en dos semanas.', hoursAgo: 30, mediaKey: null },
  { username: 'pablo_ortega', community: 'movies', title: 'Plano favorito de la semana (sin spoiler)', content: 'Uso de reflejos para narrar conflicto sin dialogo. De esos detalles que te reconcilian con el cine.', hoursAgo: 31, mediaKey: 'cinema_frame' },
  { username: 'elena_torres', community: 'books', title: 'Reto comunitario: 1 ensayo corto por mes', content: 'No para acumular titulos, para discutir ideas. Propuesta: votamos el primero este finde.', hoursAgo: 32, mediaKey: null },
  { username: 'lucia_vargas', community: 'food', title: 'Street food night en casa con 4 ingredientes base', content: 'Tortillas, pollo especiado, cebolla encurtida y salsa yogur. Post inspiracion Reddit cooking.', hoursAgo: 34, mediaKey: 'street_food' },
  { username: 'ines_fitness', community: 'fitness', title: 'Semana 1 de volver a correr sin lesionarme', content: 'Ritmo suave, 3 dias, movilidad. Menos ego y mas continuidad.', hoursAgo: 35, mediaKey: null },
  { username: 'bruno_audio', community: 'gadgets', title: 'Auriculares cerrados para trabajar: ranking sin afiliados', content: 'Confort > graves exagerados. Si te duelen a la hora, no sirven.', hoursAgo: 36, mediaKey: null },
  { username: 'hector_ai', community: 'technology', title: 'Resumen de la semana en IA aplicado a producto', content: 'Lo que sirve ahora: RAG bien medido, guardrails simples y evaluaciones automatizadas.', hoursAgo: 38, mediaKey: null },
  { username: 'nora_dev', community: 'programming', title: 'Lint + tests en pre-push: al principio duele, luego salva', content: 'Nos evito varios PR rotos en main. El coste es minimo frente al ruido que ahorra.', hoursAgo: 40, mediaKey: null },
  { username: 'daniel_arias', community: 'startups', title: 'Regla de PM para equipos chicos: cada feature con metrica dueña', content: 'Si no sabes como medir exito, no es feature, es deseo.', hoursAgo: 42, mediaKey: null },
  { username: 'irene_castro', community: 'todayilearned', title: 'TIL: los mejores hilos internos empiezan con contexto y cifras', content: 'Cuando alguien nuevo llega al equipo agradece que no asumas conocimiento previo.', hoursAgo: 44, mediaKey: null },
  { username: 'sergio_navarro', community: 'gadgets', title: 'Foto comparativa de dos teclados lineales', content: 'El caro no gano por goleada. El tacto final depende mucho de keycaps y espuma.', hoursAgo: 46, mediaKey: 'keyboard' },
  { username: 'walter_admin', community: 'technology', title: 'Bienvenida a la seed mega: feed lleno para probar de verdad', content: 'Si ves este post, la carga de datos salio bien y la red social ya respira.', hoursAgo: 48, mediaKey: null },
];

const commentTemplates = [
  'Totalmente de acuerdo, lo hemos visto igual en nuestro equipo.',
  'Buenisimo aporte. Esto merece quedar pineado en la comunidad.',
  'No pensaba igual hasta que lo probe, ahora no vuelvo atras.',
  'Dato clave. Gracias por compartir cifras reales y no solo opinion.',
  'Me llevo esta idea para probarla esta semana.',
  'Esto tiene energia de hilo top en Reddit, muy bien resumido.',
  'Buen punto. Lo unico que matizaria es el coste de mantenimiento.',
  'Confirmo, en mi caso fue tal cual y ahorre tiempo.',
];

function randomFrom(list, indexOffset = 0) {
  return list[(Math.floor(Math.random() * list.length) + indexOffset) % list.length];
}

function hoursAgo(hours) {
  const date = new Date(Date.now() - hours * 60 * 60 * 1000);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function clearDatabase(connection) {
  const tables = [
    'notificaciones',
    'mensajes_chat',
    'chats_participantes',
    'chats',
    'votos_usuarios',
    'comentarios',
    'publicaciones_compartidas',
    'usuarios_seguidos',
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

async function insertUsers(connection) {
  const userIds = new Map();
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const [index, user] of users.entries()) {
    const id = uuidv4();
    userIds.set(user.username, id);
    await connection.query(
      `INSERT INTO users (id, email, username, password, avatar_url, bio, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        user.email,
        user.username,
        hash,
        `https://i.pravatar.cc/300?img=${index + 1}`,
        user.bio,
        hoursAgo(24 * 20 - index * 5),
      ]
    );
  }

  return userIds;
}

async function insertCommunities(connection, userIds) {
  const communityIds = new Map();

  for (const [index, community] of communities.entries()) {
    const [result] = await connection.query(
      `INSERT INTO comunidades (nombre, descripcion, categoria, creador_id, fecha_creacion)
       VALUES (?, ?, ?, ?, ?)`,
      [
        community.nombre,
        community.descripcion,
        community.categoria,
        userIds.get(community.creador),
        hoursAgo(24 * 18 - index * 4),
      ]
    );
    communityIds.set(community.nombre, result.insertId);
  }

  for (const [communityName, members] of Object.entries(communityMembers)) {
    for (const [idx, username] of members.entries()) {
      await connection.query(
        `INSERT INTO miembros_comunidad (usuario_id, comunidad_id, fecha_union)
         VALUES (?, ?, ?)`,
        [userIds.get(username), communityIds.get(communityName), hoursAgo(24 * 12 - idx * 3)]
      );
    }
  }

  return communityIds;
}

async function insertMedia(connection) {
  const mediaIds = new Map();

  for (const item of mediaLibrary) {
    const [result] = await connection.query(
      `INSERT INTO media_assets
       (public_id, secure_url, resource_type, format, bytes, width, height, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.public_id,
        item.secure_url,
        item.resource_type,
        item.format,
        item.bytes,
        item.width,
        item.height,
        item.duration,
      ]
    );
    mediaIds.set(item.key, result.insertId);
  }

  return mediaIds;
}

async function insertPosts(connection, userIds, communityIds, mediaIds) {
  const postIds = new Map();

  for (const post of posts) {
    const mediaAssetId = post.mediaKey ? mediaIds.get(post.mediaKey) : null;
    const mediaMeta = post.mediaKey ? mediaLibrary.find((x) => x.key === post.mediaKey) : null;
    const imageUrl = mediaMeta?.resource_type === 'image' ? mediaMeta.secure_url : null;
    const videoUrl = mediaMeta?.resource_type === 'video' ? mediaMeta.secure_url : null;

    const [result] = await connection.query(
      `INSERT INTO publicaciones
       (titulo, contenido, url_imagen, url_video, usuario_id, comunidad_id, media_asset_id, fecha_creacion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.title,
        post.content,
        imageUrl,
        videoUrl,
        userIds.get(post.username),
        communityIds.get(post.community),
        mediaAssetId,
        hoursAgo(post.hoursAgo),
      ]
    );

    postIds.set(post.title, result.insertId);
  }

  return postIds;
}

async function insertComments(connection, userIds, postIds) {
  const usernames = users.map((u) => u.username);
  let totalComments = 0;

  for (const [postIdx, post] of posts.entries()) {
    const postId = postIds.get(post.title);
    const parentCommentIds = [];
    const commentCount = 2 + (postIdx % 2);

    for (let i = 0; i < commentCount; i += 1) {
      const username = randomFrom(usernames, postIdx + i);
      const [result] = await connection.query(
        `INSERT INTO comentarios (contenido, usuario_id, publicacion_id, comentario_padre_id, fecha_creacion)
         VALUES (?, ?, ?, NULL, ?)`,
        [
          randomFrom(commentTemplates, postIdx + i),
          userIds.get(username),
          postId,
          hoursAgo(Math.max(1, post.hoursAgo - (i + 1))),
        ]
      );
      parentCommentIds.push(result.insertId);
      totalComments += 1;
    }

    const replyCount = Math.min(2, parentCommentIds.length);
    for (let r = 0; r < replyCount; r += 1) {
      const username = randomFrom(usernames, postIdx + r + 5);
      await connection.query(
        `INSERT INTO comentarios (contenido, usuario_id, publicacion_id, comentario_padre_id, fecha_creacion)
         VALUES (?, ?, ?, ?, ?)`,
        [
          `Reply rapido: ${randomFrom(commentTemplates, postIdx + r + 2)}`,
          userIds.get(username),
          postId,
          parentCommentIds[r],
          hoursAgo(Math.max(1, post.hoursAgo - (r + 1))),
        ]
      );
      totalComments += 1;
    }
  }

  return totalComments;
}

async function insertVotes(connection, userIds, postIds) {
  const usernames = users.map((u) => u.username);
  let totalVotes = 0;

  for (const [postIdx, post] of posts.entries()) {
    const postId = postIds.get(post.title);
    const votesForPost = 3 + (postIdx % 5);
    const used = new Set();

    for (let i = 0; i < votesForPost; i += 1) {
      let username = randomFrom(usernames, postIdx + i * 2);
      while (used.has(username) || username === post.username) {
        username = randomFrom(usernames, postIdx + i * 3 + 1);
      }
      used.add(username);
      const tipo = i % 6 === 0 ? 'down' : 'up';

      await connection.query(
        `INSERT INTO votos_usuarios (usuario_id, publicacion_id, tipo_voto, fecha_creacion)
         VALUES (?, ?, ?, ?)`,
        [userIds.get(username), postId, tipo, hoursAgo(Math.max(1, post.hoursAgo - 1))]
      );
      totalVotes += 1;
    }
  }

  return totalVotes;
}

async function insertShares(connection, userIds, postIds) {
  const usernames = users.map((u) => u.username);
  let totalShares = 0;

  for (const [postIdx, post] of posts.entries()) {
    const postId = postIds.get(post.title);
    if (postIdx % 3 !== 0) continue;

    const shareUsers = [randomFrom(usernames, postIdx + 1), randomFrom(usernames, postIdx + 4)];
    for (const username of shareUsers) {
      if (username === post.username) continue;
      await connection.query(
        `INSERT IGNORE INTO publicaciones_compartidas (usuario_id, publicacion_id, fecha_creacion)
         VALUES (?, ?, ?)`,
        [userIds.get(username), postId, hoursAgo(Math.max(1, post.hoursAgo - 1))]
      );
      totalShares += 1;
    }
  }

  return totalShares;
}

async function insertFollows(connection, userIds) {
  let totalFollows = 0;
  const usernames = users.map((u) => u.username);

  for (const [idx, follower] of usernames.entries()) {
    const targets = [randomFrom(usernames, idx + 2), randomFrom(usernames, idx + 5), randomFrom(usernames, idx + 8)];
    for (const followed of targets) {
      if (follower === followed) continue;
      await connection.query(
        `INSERT IGNORE INTO usuarios_seguidos (seguidor_id, seguido_id, fecha_creacion)
         VALUES (?, ?, ?)`,
        [userIds.get(follower), userIds.get(followed), hoursAgo(24 * 6 - idx)]
      );
      totalFollows += 1;
    }
  }

  return totalFollows;
}

async function insertChats(connection, userIds, mediaIds) {
  const chatPairs = [
    ['ana_garcia', 'carlos_ruiz'],
    ['laura_martin', 'pablo_ortega'],
    ['marta_lopez', 'sara_design'],
    ['hector_ai', 'daniel_arias'],
    ['lucia_vargas', 'ines_fitness'],
  ];

  let totalMessages = 0;

  for (const [index, pair] of chatPairs.entries()) {
    const [creator, second] = pair;
    const [chatResult] = await connection.query(
      `INSERT INTO chats (creado_por, estado, fecha_creacion, fecha_actualizacion)
       VALUES (?, 'activo', ?, ?)`,
      [userIds.get(creator), hoursAgo(72 - index * 6), hoursAgo(1)]
    );
    const chatId = chatResult.insertId;

    await connection.query(
      `INSERT INTO chats_participantes (chat_id, usuario_id) VALUES (?, ?), (?, ?)`,
      [chatId, userIds.get(creator), chatId, userIds.get(second)]
    );

    const firstMessage = `Hey @${second}, viste el ultimo post de la comunidad?`;
    const secondMessage = 'Si, estuvo top. Luego te paso mas detalle por aqui.';

    await connection.query(
      `INSERT INTO mensajes_chat (chat_id, usuario_id, contenido, media_asset_id, imagen_data, respuesta_a_id, fecha_creacion)
       VALUES (?, ?, ?, NULL, NULL, NULL, ?)`,
      [chatId, userIds.get(creator), firstMessage, hoursAgo(20 - index)]
    );

    await connection.query(
      `INSERT INTO mensajes_chat (chat_id, usuario_id, contenido, media_asset_id, imagen_data, respuesta_a_id, fecha_creacion)
       VALUES (?, ?, ?, ?, NULL, NULL, ?)`,
      [chatId, userIds.get(second), secondMessage, index % 2 === 0 ? mediaIds.get('sample_video') : null, hoursAgo(18 - index)]
    );

    totalMessages += 2;
  }

  return totalMessages;
}

async function insertNotifications(connection, userIds, postIds) {
  const topPosts = posts.slice(0, 12);
  let totalNotifications = 0;

  for (const [idx, post] of topPosts.entries()) {
    const userId = userIds.get(post.username);
    const postId = postIds.get(post.title);
    const title = idx % 2 === 0 ? 'Tu post esta en tendencia' : 'Nuevo comentario en tu post';
    const message = idx % 2 === 0
      ? 'Tu publicacion esta recibiendo mucho movimiento.'
      : 'Alguien respondio a tu publicacion. Entra a seguir el hilo.';

    await connection.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje, publicacion_id, comentario_id, leida, fecha_creacion)
       VALUES (?, ?, ?, ?, NULL, ?, ?)`,
      [userId, title, message, postId, idx % 3 === 0 ? 1 : 0, hoursAgo(10 - (idx % 4))]
    );
    totalNotifications += 1;
  }

  return totalNotifications;
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

async function seed() {
  const connection = await pool.getConnection();

  try {
    console.log('Iniciando seed mega...');
    console.log(`Password comun para usuarios demo: ${DEMO_PASSWORD}`);
    await connection.beginTransaction();

    await clearDatabase(connection);
    const userIds = await insertUsers(connection);
    const communityIds = await insertCommunities(connection, userIds);
    const mediaIds = await insertMedia(connection);
    const postIds = await insertPosts(connection, userIds, communityIds, mediaIds);
    const totalComments = await insertComments(connection, userIds, postIds);
    const totalVotes = await insertVotes(connection, userIds, postIds);
    const totalShares = await insertShares(connection, userIds, postIds);
    const totalFollows = await insertFollows(connection, userIds);
    const totalMessages = await insertChats(connection, userIds, mediaIds);
    const totalNotifications = await insertNotifications(connection, userIds, postIds);
    await recalculateCounters(connection);

    await connection.commit();

    console.log(`Usuarios: ${users.length}`);
    console.log(`Comunidades: ${communities.length}`);
    console.log(`Media assets: ${mediaLibrary.length}`);
    console.log(`Posts: ${posts.length}`);
    console.log(`Comentarios: ${totalComments}`);
    console.log(`Votos: ${totalVotes}`);
    console.log(`Compartidos: ${totalShares}`);
    console.log(`Follows: ${totalFollows}`);
    console.log(`Mensajes chat: ${totalMessages}`);
    console.log(`Notificaciones: ${totalNotifications}`);
    console.log('Seed mega completado.');
  } catch (error) {
    await connection.rollback();
    console.error('Error en seed mega:', error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();
