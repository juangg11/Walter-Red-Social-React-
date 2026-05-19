# Walter Backend

Backend de Walter basado en Express + MySQL.

## Scripts

```bash
npm run dev
npm run db:migrate
npm run db:seed
npm run db:upgrade
```

## Variables de entorno

```env
DB_HOST=127.0.0.1
DB_PORT=3308
DB_USER=walter
DB_PASSWORD=walter1234
DB_NAME=walter
JWT_SECRET=cambia_este_secreto
PORT=3000
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Cloudinary

El backend firma subidas y registra assets en la tabla `media_assets`.

Endpoints:

- `POST /api/media/signature`
- `POST /api/media/commit`

Flujo:

1. El frontend pide una firma temporal al backend.
2. El archivo se sube directamente a Cloudinary.
3. El frontend confirma el asset al backend.
4. El backend persiste el asset en MySQL.

## Estructura

- `src/routes`: definición de endpoints
- `src/controllers`: capa HTTP
- `src/dtos`: validación y normalización de entrada
- `src/services`: reglas de negocio
- `src/models`: acceso SQL
- `src/middleware`: auth, seguridad y errores
- `src/config`: conexiones y proveedores externos

## Notas

- La autenticación es JWT propia, no Supabase.
- La base de datos actual es MySQL.
- Los assets multimedia se suben a Cloudinary y se guardan en `media_assets`.
