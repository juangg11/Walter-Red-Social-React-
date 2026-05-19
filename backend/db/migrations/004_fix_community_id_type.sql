-- Cambiar community_id de UUID a INTEGER para que sea compatible con id_com en Comunidades
-- Primero eliminar la restricción FK si existe
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_community_id_fkey;

-- Cambiar el tipo de datos
ALTER TABLE posts ALTER COLUMN community_id TYPE INTEGER USING (community_id::text::integer);

-- Agregar nuevamente la FK
ALTER TABLE posts ADD CONSTRAINT posts_community_id_fkey 
  FOREIGN KEY (community_id) REFERENCES "Comunidades"(id_com) ON DELETE CASCADE;

-- Recrear índice
DROP INDEX IF EXISTS idx_posts_community_id;
CREATE INDEX idx_posts_community_id ON posts(community_id);
