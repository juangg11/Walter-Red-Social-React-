import { useEffect, useState, useCallback } from 'react';
import { ArrowBigUp, ArrowBigDown, MessageSquare, Plus, Repeat2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PostModal from './PostModal';
import PostCreate from './PostCreate';
import { api } from '../api/client';
import { computeVote } from '../utils/computeVote';

export function PostCard({ post, userVote, onVote, onClick, onShare, onAuthorClick = null }) {
  return (
    <div className="post-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="votes">
        <button className="vote-btn" title="Votar positivo" onClick={e => { e.stopPropagation(); onVote(post.id, 'up'); }}
          style={{ color: userVote === 'up' ? 'var(--primary)' : 'var(--secondary)' }}>
          <ArrowBigUp size={20} />
        </button>
        <span className="vote-count">{post.votos ?? 0}</span>
        <button className="vote-btn" title="Votar negativo" onClick={e => { e.stopPropagation(); onVote(post.id, 'down'); }}
          style={{ color: userVote === 'down' ? 'var(--primary)' : 'var(--secondary)' }}>
          <ArrowBigDown size={20} />
        </button>
      </div>

      <div className="post-content">
        <p className="post-meta">
          Publicado por <button className="inline-user-link" onClick={e => { e.stopPropagation(); onAuthorClick?.(post.username); }}>w/{post.username ?? 'anon'}</button>
          {post.comunidad_nombre ? ` en w/${post.comunidad_nombre}` : ''}
        </p>
        <h3>{post.titulo ?? 'Sin título'}</h3>

        {post.url_video ? (
          <video src={post.url_video} controls style={{ width: '100%', borderRadius: 'var(--border-radius-md)', marginBottom: 'var(--spacing-md)', maxHeight: '25rem', objectFit: 'cover', background: '#000' }} />
        ) : post.url_imagen ? (
          <img src={post.url_imagen} alt={post.titulo} style={{ maxWidth: '100%', borderRadius: 'var(--border-radius-md)', marginBottom: 'var(--spacing-md)', maxHeight: '25rem', objectFit: 'cover' }} />
        ) : null}

        <p>{post.contenido ?? ''}</p>

        <div className="post-footer">
          <MessageSquare size={18} />
          <span>{post.numero_comentarios ?? 0} Comentarios</span>
          <button
            className="post-share-btn"
            onClick={e => {
              e.stopPropagation();
              onShare?.(post);
            }}
          >
            <Repeat2 size={16} />
            <span>{post.compartido_por_usuario ? 'Compartido' : 'Compartir'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Feed({ user, searchQuery, selectedCommunities, communities = [] }) {
  const navigate = useNavigate();
  const [posts, setPosts]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [createOpen, setCreateOpen]     = useState(false);
  const [userVotes, setUserVotes]       = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const data = await api.get(`/publicaciones?userId=${user.id}`);
      setPosts(data);
      // Extraer votos del usuario de la respuesta
      const votesMap = {};
      data.forEach(p => { if (p.voto_usuario) votesMap[p.id] = p.voto_usuario; });
      setUserVotes(votesMap);
    } catch (e) {
      console.error('fetchPosts:', e);
    }
    setLoading(false);
  }

  async function handleVote(postId, voteType) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const { nextVote, votes } = computeVote({
      currentVote: userVotes[postId],
      voteType,
      votes: post.votos,
    });

    // Optimista
    setPosts(cur => cur.map(p => p.id === postId ? { ...p, votos: votes } : p));
    setUserVotes(cur => ({ ...cur, [postId]: nextVote }));

    try {
      const result = await api.post(`/publicaciones/${postId}/votar`, { tipo_voto: voteType });
      const serverPost = result.post || { ...post, votos: result.votos, voto_usuario: result.voto };
      setPosts(cur => cur.map(p => p.id === postId ? serverPost : p));
      setUserVotes(cur => ({ ...cur, [postId]: result.voto }));
    } catch (e) {
      // Revertir si falla
      setPosts(cur => cur.map(p => p.id === postId ? { ...p, votos: post.votos } : p));
      setUserVotes(cur => ({ ...cur, [postId]: userVotes[postId] }));
    }
  }

  const syncPost = useCallback((updatedPost) => {
    setPosts(cur => cur.map(p => p.id === updatedPost.id ? updatedPost : p));
    setUserVotes(cur => ({ ...cur, [updatedPost.id]: updatedPost.voto_usuario ?? cur[updatedPost.id] ?? null }));
    setSelectedPost(prev => prev?.id === updatedPost.id ? updatedPost : prev);
  }, []);

  const handleCommentAdded = useCallback((postId, count) => {
    setPosts(cur => cur.map(p => p.id === postId ? { ...p, numero_comentarios: count } : p));
  }, []);

  async function handleShare(post) {
    try {
      const updated = post.compartido_por_usuario
        ? await api.delete(`/usuarios/compartidos/${post.id}`)
        : await api.post(`/usuarios/compartidos/${post.id}`, {});

      setPosts(cur => cur.map(item => item.id === post.id ? updated : item));
      setSelectedPost(cur => cur?.id === post.id ? updated : cur);
    } catch (e) {
      console.error('sharePost:', e);
    }
  }

  const filteredPosts = posts.filter(p => {
    const q = searchQuery?.toLowerCase().trim();
    const matchesSearch = !q ||
      p.titulo?.toLowerCase().includes(q) ||
      p.contenido?.toLowerCase().includes(q) ||
      p.username?.toLowerCase().includes(q);
    const matchesCommunity = !selectedCommunities?.length ||
      selectedCommunities.map(String).includes(String(p.comunidad_id));
    return matchesSearch && matchesCommunity;
  });

  const emptyMessage = searchQuery
    ? 'No se encontraron posts con esa búsqueda'
    : selectedCommunities?.length
    ? 'No hay posts en las comunidades seleccionadas'
    : 'Sé el primero en compartir algo en w/Walter';

  return (
    <>
      <div className="feed">
        {loading ? (
          <EmptyCard><p>Cargando posts...</p></EmptyCard>
        ) : filteredPosts.length === 0 ? (
          <EmptyCard>
            <h3 style={{ marginBottom: '0.5rem' }}>Sin posts</h3>
            <p>{emptyMessage}</p>
          </EmptyCard>
        ) : (
          filteredPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              userVote={userVotes[post.id]}
              onVote={handleVote}
              onShare={handleShare}
              onAuthorClick={username => navigate(`/u/${username}`)}
              onClick={() => setSelectedPost(post)}
            />
          ))
        )}
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          user={user}
          onClose={() => setSelectedPost(null)}
          onCommentAdded={count => handleCommentAdded(selectedPost.id, count)}
          onPostUpdated={syncPost}
          onAuthorClick={username => navigate(`/u/${username}`)}
          onShare={handleShare}
        />
      )}

      <PostCreate
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        user={user}
        communities={communities}
        onPostCreated={fetchPosts}
      />

      <button
        onClick={() => setCreateOpen(true)}
        title="Crear nuevo post"
        style={{ position: 'fixed', bottom: '1.875rem', right: '1.875rem', width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 0.25rem 0.75rem rgba(237, 158, 174, 0.3)', transition: 'transform 0.15s, box-shadow 0.15s, background-color 0.15s', zIndex: 100 }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary-hover)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <Plus size={28} />
      </button>
    </>
  );
}

function EmptyCard({ children }) {
  return (
    <div className="post-card" style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ color: 'var(--secondary)' }}>{children}</div>
    </div>
  );
}
