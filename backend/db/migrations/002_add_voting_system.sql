-- Tabla para registrar votos de usuarios
CREATE TABLE IF NOT EXISTS user_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100),
  post_id UUID NOT NULL,
  vote_type VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Agregar campo community_id a posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS community_id UUID;

-- Crear índices para mejorar performance en votos
CREATE INDEX IF NOT EXISTS idx_user_votes_post_id ON user_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_user_votes_user_id ON user_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_community_id ON posts(community_id);
