import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../api/client';
import { uploadToCloudinary } from '../utils/cloudinary';

export default function PostCreate({ isOpen, onClose, user, communities, onPostCreated }) {
  const [titulo, setTitulo]                   = useState('');
  const [contenido, setContenido]             = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [urlImagen, setUrlImagen]             = useState('');
  const [urlVideo, setUrlVideo]               = useState('');
  const [mediaFile, setMediaFile]             = useState(null);
  const [mediaPreview, setMediaPreview]       = useState('');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [availableCommunities, setAvailableCommunities] = useState(communities);
  const memberCommunities = availableCommunities.filter(c => Boolean(c.es_miembro));

  useEffect(() => {
    if (!isOpen) {
      setTitulo('');
      setContenido('');
      setSelectedCommunity('');
      setUrlImagen('');
      setUrlVideo('');
      setMediaFile(null);
      setMediaPreview('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    setAvailableCommunities(communities);
  }, [communities]);

  useEffect(() => {
    if (!isOpen || !user?.id) return;

    async function refreshCommunities() {
      try {
        const data = await api.get(`/comunidades?userId=${user.id}`);
        setAvailableCommunities(data);
      } catch (e) {
        console.error('refreshCommunities:', e);
      }
    }

    refreshCommunities();
  }, [isOpen, user?.id]);

  async function handleCreate() {
    if (!titulo.trim())       { setError('El título es obligatorio'); return; }
    if (!contenido.trim())    { setError('El contenido es obligatorio'); return; }
    if (!selectedCommunity)   { setError('Debes seleccionar una comunidad a la que pertenezcas'); return; }

    setLoading(true);
    setError('');
    try {
      let mediaAssetId = null;
      if (mediaFile) {
        const uploaded = await uploadToCloudinary(mediaFile, 'walter/posts');
        mediaAssetId = uploaded.asset.id;
      }

      await api.post('/publicaciones', {
        titulo,
        contenido,
        comunidad_id: Number(selectedCommunity),
        url_imagen:   mediaAssetId ? null : (urlImagen.trim() || null),
        url_video:    mediaAssetId ? null : (urlVideo.trim()  || null),
        media_asset_id: mediaAssetId,
      });
      onPostCreated?.();
      onClose();
    } catch (e) {
      setError(e.message || 'Error al crear el post');
    }
    setLoading(false);
  }

  if (!isOpen) return null;

  const inputStyle = {
    width: '100%', padding: '10px',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '14px',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={24} /></button>

        <div className="modal-post">
          <h2 style={{ marginBottom: '20px' }}>Crear un nuevo post</h2>

          {/* Comunidad */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Comunidad</label>
            <select value={selectedCommunity} onChange={e => setSelectedCommunity(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Selecciona una comunidad</option>
              {memberCommunities.length > 0 ? (
                memberCommunities.map(c => (
                  <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                ))
              ) : (
                <option disabled>No perteneces a ninguna comunidad</option>
              )}
            </select>
            {memberCommunities.length === 0 && (
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Únete a una comunidad antes de publicar.
              </p>
            )}
          </div>

          {/* Título */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Título</label>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título del post" style={inputStyle} />
          </div>

          {/* Contenido */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Contenido</label>
            <textarea value={contenido} onChange={e => setContenido(e.target.value)} placeholder="¿Qué tienes en mente?" rows="5" style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          {/* URL imagen */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>URL de imagen (opcional)</label>
            <input value={urlImagen} onChange={e => setUrlImagen(e.target.value)} placeholder="https://ejemplo.com/imagen.jpg" style={inputStyle} disabled={Boolean(mediaFile)} />
          </div>

          {/* URL vídeo */}
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>URL de vídeo (opcional)</label>
            <input value={urlVideo} onChange={e => setUrlVideo(e.target.value)} placeholder="https://ejemplo.com/video.mp4" style={inputStyle} disabled={Boolean(mediaFile)} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Archivo multimedia (opcional)</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={e => {
                const file = e.target.files?.[0] || null;
                setMediaFile(file);
                if (!file) {
                  setMediaPreview('');
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => setMediaPreview(String(reader.result || ''));
                reader.readAsDataURL(file);
              }}
              style={inputStyle}
            />
            {mediaPreview && (
              <div style={{ marginTop: '8px' }}>
                {mediaFile?.type?.startsWith('video/')
                  ? <video src={mediaPreview} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '220px' }} />
                  : <img src={mediaPreview} alt="preview" style={{ width: '100%', borderRadius: '8px', maxHeight: '220px', objectFit: 'cover' }} />}
              </div>
            )}
          </div>

          {error && (
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: 'var(--border-radius-sm)', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={loading || memberCommunities.length === 0}
            style={{ width: '100%', padding: '12px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-sm)', fontSize: '14px', fontWeight: '600', cursor: loading || memberCommunities.length === 0 ? 'not-allowed' : 'pointer', opacity: loading || memberCommunities.length === 0 ? 0.6 : 1 }}
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  );
}
