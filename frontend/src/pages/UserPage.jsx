import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, MessageSquare, UserPlus, UserRoundCheck } from 'lucide-react';
import { api } from '../api/client';
import { PostCard } from '../components/Feed';
import PostModal from '../components/PostModal';
import { computeVote } from '../utils/computeVote';

const TABS = [
  ['posts', 'Posts'],
  ['comments', 'Respuestas'],
  ['shared', 'Compartidos'],
];

export default function UserPage({ user, onUserUpdate }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [sharedPosts, setSharedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [bioDraft, setBioDraft] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [userVotes, setUserVotes] = useState({});

  useEffect(() => {
    if (!username) return;
    loadProfilePage();
  }, [username]);

  async function loadProfilePage() {
    setLoading(true);
    try {
      const [profileData, postsData, commentsData, sharedData] = await Promise.all([
        api.get(`/usuarios/perfil/${username}`),
        api.get(`/usuarios/perfil/${username}/publicaciones`),
        api.get(`/usuarios/perfil/${username}/comentarios`),
        api.get(`/usuarios/perfil/${username}/compartidos`),
      ]);

      setProfile(profileData);
      setPosts(postsData);
      setComments(commentsData);
      setSharedPosts(sharedData);
      setBioDraft(profileData.bio || '');

      const voteMap = {};
      [...postsData, ...sharedData].forEach(post => {
        if (post?.voto_usuario) voteMap[post.id] = post.voto_usuario;
      });
      setUserVotes(voteMap);
    } catch (e) {
      console.error('loadProfilePage:', e);
    }
    setLoading(false);
  }

  function syncPost(updatedPost) {
    setPosts(cur => cur.map(post => post.id === updatedPost.id ? { ...post, ...updatedPost } : post));
    setSharedPosts(cur => cur.map(post => post.id === updatedPost.id ? { ...post, ...updatedPost } : post));
    setUserVotes(cur => ({ ...cur, [updatedPost.id]: updatedPost.voto_usuario ?? cur[updatedPost.id] ?? null }));
    setSelectedPost(cur => cur?.id === updatedPost.id ? { ...cur, ...updatedPost } : cur);
  }

  async function handleVote(postId, voteType) {
    const post = [...posts, ...sharedPosts].find(item => item.id === postId);
    if (!post) return;

    const { nextVote, votes } = computeVote({
      currentVote: userVotes[postId],
      voteType,
      votes: post.votos,
    });

    syncPost({ ...post, votos: votes, voto_usuario: nextVote });

    try {
      const result = await api.post(`/publicaciones/${postId}/votar`, { tipo_voto: voteType });
      syncPost(result.post || { ...post, votos: result.votos, voto_usuario: result.voto });
    } catch (e) {
      syncPost(post);
    }
  }

  async function handleShare(post) {
    try {
      const updated = post.compartido_por_usuario
        ? await api.delete(`/usuarios/compartidos/${post.id}`)
        : await api.post(`/usuarios/compartidos/${post.id}`, {});

      syncPost(updated);
      if (!post.compartido_por_usuario) {
        setSharedPosts(cur => cur.some(item => item.id === updated.id) ? cur : [updated, ...cur]);
      } else if (profile?.is_me) {
        setSharedPosts(cur => cur.filter(item => item.id !== post.id));
      }
    } catch (e) {
      console.error('handleShare:', e);
    }
  }

  async function handleFollow() {
    if (!profile) return;
    try {
      const next = profile.is_following
        ? await api.delete(`/usuarios/${profile.username}/follow`)
        : await api.post(`/usuarios/${profile.username}/follow`, {});
      setProfile(next);
    } catch (e) {
      console.error('handleFollow:', e);
    }
  }

  async function handleSaveBio() {
    setSavingBio(true);
    try {
      const updated = await api.patch('/usuarios/perfil', { bio: bioDraft });
      onUserUpdate?.(updated);
      setProfile(cur => cur ? { ...cur, bio: updated.bio } : cur);
    } catch (e) {
      console.error('saveBio:', e);
    }
    setSavingBio(false);
  }

  async function openPost(postId) {
    try {
      const data = await api.get(`/publicaciones/${postId}?userId=${user.id}`);
      setSelectedPost(data);
    } catch (e) {
      console.error('openPost:', e);
    }
  }

  if (loading) {
    return <main className="profile-page"><div className="profile-shell"><div className="profile-panel">Cargando perfil...</div></div></main>;
  }

  if (!profile) {
    return <main className="profile-page"><div className="profile-shell"><div className="profile-panel">Perfil no encontrado.</div></div></main>;
  }

  const joinedDate = profile.fecha_creacion
    ? new Date(profile.fecha_creacion).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : 'Sin fecha';

  return (
    <main className="profile-page">
      <div className="profile-shell">
        <section className="profile-header">
          <div className="profile-cover" />
          <div className="profile-header-body">
            <div className="profile-avatar-large">
              {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.username} /> : <span>{profile.username.slice(0, 2).toUpperCase()}</span>}
            </div>

            <div className="profile-title-block">
              <div className="profile-title-row">
                <div>
                  <h1>w/{profile.username}</h1>
                  <span>{profile.email}</span>
                </div>
                {!profile.is_me && (
                  <button type="button" className="profile-follow-btn" onClick={handleFollow}>
                    {profile.is_following ? <UserRoundCheck size={16} /> : <UserPlus size={16} />}
                    <span>{profile.is_following ? 'Siguiendo' : 'Seguir'}</span>
                  </button>
                )}
              </div>

              <div className="profile-stats">
                <Stat label="Posts" value={profile.counts.posts_count} />
                <Stat label="Respuestas" value={profile.counts.comments_count} />
                <Stat label="Compartidos" value={profile.counts.shared_count} />
                <Stat label="Seguidores" value={profile.counts.followers_count} />
                <Stat label="Seguidos" value={profile.counts.following_count} />
              </div>
            </div>
          </div>

          <div className="profile-tabs">
            {TABS.map(([id, label]) => (
              <button key={id} type="button" className={activeTab === id ? 'active' : ''} onClick={() => setActiveTab(id)}>
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="profile-grid">
          <div className="profile-panel">
            {activeTab === 'posts' && (
              <div className="profile-post-list">
                {posts.length > 0 ? posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userVote={userVotes[post.id]}
                    onVote={handleVote}
                    onShare={handleShare}
                    onAuthorClick={handleUsernameClick}
                    onClick={() => setSelectedPost(post)}
                  />
                )) : <EmptyState text="Este usuario no ha publicado nada todavía." />}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="profile-comment-list">
                {comments.length > 0 ? comments.map(comment => (
                  <article key={comment.id} className="profile-comment-card">
                    <div className="profile-comment-meta">
                      <button type="button" className="inline-user-link" onClick={() => navigate(`/u/${profile.username}`)}>w/{profile.username}</button>
                      <span>en {comment.publicacion_titulo || 'Publicación'}</span>
                    </div>
                    <p>{comment.contenido}</p>
                    <button type="button" className="profile-link-btn" onClick={() => openPost(comment.publicacion_ref_id)}>
                      <MessageSquare size={16} />
                      <span>Ver post</span>
                    </button>
                  </article>
                )) : <EmptyState text="Este usuario no ha respondido todavía." />}
              </div>
            )}

            {activeTab === 'shared' && (
              <div className="profile-post-list">
                {sharedPosts.length > 0 ? sharedPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userVote={userVotes[post.id]}
                    onVote={handleVote}
                    onShare={handleShare}
                    onAuthorClick={handleUsernameClick}
                    onClick={() => setSelectedPost(post)}
                  />
                )) : <EmptyState text="No hay publicaciones compartidas." />}
              </div>
            )}
          </div>

          <aside className="profile-side">
            <section className="profile-panel">
              <h3>Sobre w/{profile.username}</h3>
              <p className="profile-about-text">{profile.bio || 'Sin biografía todavía.'}</p>
              <div className="profile-created-row">
                <CalendarDays size={16} />
                <span>{joinedDate}</span>
              </div>
              {profile.is_me && (
                <div className="profile-bio-editor">
                  <textarea value={bioDraft} onChange={event => setBioDraft(event.target.value)} maxLength={280} placeholder="Biografía" />
                  <button type="button" onClick={handleSaveBio} disabled={savingBio}>
                    {savingBio ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              )}
            </section>
            <section className="profile-panel">
              <h3>Seguidores</h3>
              <UserList users={profile.followers} navigate={navigate} emptyText="Sin seguidores aún." />
            </section>
            <section className="profile-panel">
              <h3>Seguidos</h3>
              <UserList users={profile.following} navigate={navigate} emptyText="No sigue a nadie todavía." />
            </section>
          </aside>
        </section>
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          user={user}
          onClose={() => setSelectedPost(null)}
          onPostUpdated={syncPost}
          onAuthorClick={handleUsernameClick}
          onShare={handleShare}
        />
      )}
    </main>
  );

  function handleUsernameClick(nextUsername) {
    if (!nextUsername) return;
    navigate(`/u/${nextUsername}`);
  }
}

function Stat({ label, value }) {
  return (
    <div className="profile-stat">
      <strong>{value ?? 0}</strong>
      <span>{label}</span>
    </div>
  );
}

function UserList({ users = [], navigate, emptyText }) {
  if (!users.length) return <p className="profile-empty-copy">{emptyText}</p>;
  return (
    <div className="profile-user-list">
      {users.map(item => (
        <button key={item.id} type="button" className="profile-user-chip" onClick={() => navigate(`/u/${item.username}`)}>
          {item.avatar_url ? <img src={item.avatar_url} alt={item.username} /> : <span>{item.username.slice(0, 2).toUpperCase()}</span>}
          <small>w/{item.username}</small>
        </button>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="profile-empty-copy">{text}</div>;
}
