import { useState, useEffect } from 'react';
import { ArrowBigUp, ArrowBigDown, Repeat2, X } from 'lucide-react';
import { api } from '../api/client';
import { computeVote } from '../utils/computeVote';

export default function PostModal({ post, onClose, user, onCommentAdded, onPostUpdated, onAuthorClick = null, onShare = null }) {
  const [postData, setPostData]     = useState(post);
  const [comments, setComments]     = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userVote, setUserVote]     = useState(post.voto_usuario ?? null);

  useEffect(() => {
    if (!post?.id) return;
    async function loadPost() {
      try {
        const data = await api.get(`/publicaciones/${post.id}?userId=${user.id}`);
        setPostData(data);
        setUserVote(data.voto_usuario ?? null);
        onPostUpdated?.(data);
      } catch {
        setPostData(post);
        setUserVote(post.voto_usuario ?? null);
      }
    }
    loadPost();
  }, [post?.id, user.id]);

  useEffect(() => {
    if (!post?.id) return;
    fetchComments();
  }, [post?.id]);

  async function fetchComments() {
    setLoading(true);
    try {
      const data = await api.get(`/comentarios?publicacion_id=${post.id}`);
      setComments(data);
    } catch (e) {
      console.error('fetchComments:', e);
    }
    setLoading(false);
  }

  async function handleVote(voteType) {
    const { nextVote, votes } = computeVote({
      currentVote: userVote,
      voteType,
      votes: postData.votos,
    });

    const updated = { ...postData, votos: votes };
    setPostData(updated);
    setUserVote(nextVote);
    onPostUpdated?.(updated);

    try {
      const result = await api.post(`/publicaciones/${post.id}/votar`, { tipo_voto: voteType });
      const serverPost = result.post || { ...updated, votos: result.votos, voto_usuario: result.voto };
      setPostData(serverPost);
      setUserVote(result.voto);
      onPostUpdated?.(serverPost);
    } catch (e) {
      // Revertir
      setPostData(postData);
      setUserVote(userVote);
      onPostUpdated?.(postData);
    }
  }

  async function addComment(parentId = null, content = newComment) {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const data = await api.post('/comentarios', {
        contenido: content,
        publicacion_id: post.id,
        comentario_padre_id: parentId,
      });

      const updatedComments = [...comments, data];
      const updatedCount    = (postData.numero_comentarios ?? 0) + 1;
      const updatedPost     = { ...postData, numero_comentarios: updatedCount };

      setComments(updatedComments);
      if (!parentId) setNewComment('');
      setPostData(updatedPost);
      onCommentAdded?.(updatedCount);
      onPostUpdated?.(updatedPost);
      return data;
    } catch (e) {
      console.error('addComment:', e);
      return null;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Post */}
        <div className="modal-post">
          <div className="modal-post-meta">
            Publicado por <button className="inline-user-link" onClick={() => onAuthorClick?.(postData?.username)}>w/{postData?.username ?? 'anon'}</button>
            {postData?.comunidad_nombre ? ` en w/${postData.comunidad_nombre}` : ''}
          </div>
          <h1 className="modal-post-title">{postData?.titulo}</h1>

          {postData?.url_video ? (
            <video src={postData.url_video} controls style={{ width: '100%', borderRadius: 'var(--border-radius-md)', margin: 'var(--spacing-lg) 0', maxHeight: '31.25rem', objectFit: 'cover', background: '#000' }} />
          ) : postData?.url_imagen ? (
            <img src={postData.url_imagen} alt={postData.titulo} style={{ maxWidth: '100%', borderRadius: 'var(--border-radius-md)', margin: 'var(--spacing-lg) 0', maxHeight: '31.25rem', objectFit: 'cover' }} />
          ) : null}

          <div className="modal-post-content">{postData?.contenido}</div>
        </div>

        {/* Votos */}
        <div className="modal-votes">
          <button className="modal-vote-btn" title="Votar positivo" onClick={() => handleVote('up')}
            style={{ color: userVote === 'up' ? 'var(--primary)' : 'var(--secondary)', fontWeight: userVote === 'up' ? '700' : '400' }}>
            <ArrowBigUp size={20} />
          </button>
          <span className="modal-vote-count">{postData?.votos ?? 0}</span>
          <button className="modal-vote-btn" title="Votar negativo" onClick={() => handleVote('down')}
            style={{ color: userVote === 'down' ? 'var(--primary)' : 'var(--secondary)', fontWeight: userVote === 'down' ? '700' : '400' }}>
            <ArrowBigDown size={20} />
          </button>
          <button className="modal-vote-btn" onClick={() => onShare?.(postData)}>
            <Repeat2 size={18} />
            <span>{postData?.compartido_por_usuario ? 'Compartido' : 'Compartir'}</span>
          </button>
        </div>
        {/* Comentarios */}
        <div className="comments-section">
          <h3>Comentarios ({comments.length})</h3>

          <div className="comment-form">
            <textarea
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
            />
            <button onClick={() => addComment()} disabled={submitting || !newComment.trim()}>
              {submitting ? 'Enviando...' : 'Comentar'}
            </button>
          </div>

          <div className="comments-list">
            {loading ? (
              <div className="no-comments">Cargando comentarios...</div>
            ) : comments.length === 0 ? (
              <div className="no-comments">Sin comentarios aún</div>
            ) : (
              <CommentTree comments={comments} onReply={addComment} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentTree({ comments, onReply }) {
  const roots = comments.filter(c => !c.comentario_padre_id);
  const repliesByParent = comments.reduce((acc, comment) => {
    if (comment.comentario_padre_id) {
      const key = String(comment.comentario_padre_id);
      acc[key] = [...(acc[key] || []), comment];
    }
    return acc;
  }, {});

  return roots.map(comment => (
    <CommentItem
      key={comment.id}
      comment={comment}
      repliesByParent={repliesByParent}
      onReply={onReply}
    />
  ));
}

function CommentItem({ comment, repliesByParent, onReply }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const replies = repliesByParent[String(comment.id)] || [];

  async function submitReply() {
    const created = await onReply(comment.id, text);
    if (!created) return;
    setText('');
    setOpen(false);
  }

  return (
    <div className="comment-item">
      <div className="comment-meta">w/{comment.username}</div>
      <p className="comment-text">{comment.contenido}</p>
      <div className="comment-actions">
        <span>{new Date(comment.fecha_creacion).toLocaleDateString()}</span>
        <button onClick={() => setOpen(v => !v)}>Responder</button>
      </div>
      {open && (
        <div className="reply-form">
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Responder comentario..." />
          <button onClick={submitReply} disabled={!text.trim()}>Enviar</button>
        </div>
      )}
      {replies.length > 0 && (
        <div className="comment-replies">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              repliesByParent={repliesByParent}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
