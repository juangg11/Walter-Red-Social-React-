# Base de datos

La base de datos actual de Walter usa MySQL.

## Flujo local

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

## Ficheros

- `schema.sql`: esquema completo
- `seed.js`: datos demo
- `migrations/`: SQL histórico
- `../scripts/migrate.js`: aplica `schema.sql`
- `../scripts/upgrade.js`: upgrades puntuales

## Seed

El seed actual crea:

- usuarios demo
- comunidades
- miembros de comunidad
- publicaciones
- comentarios
- votos
- notificaciones

La contraseña común de usuarios demo está definida en `db/seed.js`.
