import { useEffect, useState } from 'react';
import { api } from '../api/client';

const getCommunityId = (c) => c.id;

export const CommunitiesSidebar = ({ communities = [], selectedCommunities = [], onSelectCommunities }) => {
  const [showAll, setShowAll] = useState(false);
  const joinedCommunities = communities.filter(c => Boolean(c.es_miembro));
  const selectedIds = selectedCommunities.map(String);

  function toggleCommunity(community) {
    const id = String(getCommunityId(community));
    if (!id) return;
    const next = selectedIds.includes(id)
      ? selectedIds.filter(cur => cur !== id)
      : [...selectedIds, id];
    onSelectCommunities(next);
  }

  function selectAll() {
    const allIds    = joinedCommunities.map(c => String(getCommunityId(c)));
    const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
    onSelectCommunities(allSelected ? [] : allIds);
  }

  const displayed = showAll ? joinedCommunities : joinedCommunities.slice(0, 6);

  return (
    <div className="sidebar-left">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3>Mis Comunidades</h3>
        <button onClick={selectAll} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', padding: 0 }}>
          {joinedCommunities.length > 0 && selectedIds.length === joinedCommunities.length ? 'Limpiar' : 'Todas'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {displayed.length > 0 ? displayed.map((community, idx) => {
          const id         = String(getCommunityId(community));
          const isSelected = selectedIds.includes(id);
          return (
            <div
              key={id || `community-${idx}`}
              onClick={() => toggleCommunity(community)}
              style={{ padding: '10px 12px', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-secondary)', fontSize: '14px', fontWeight: '500', color: isSelected ? 'white' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}
            >
              <input type="checkbox" checked={isSelected} onChange={() => toggleCommunity(community)} onClick={e => e.stopPropagation()} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
              <span>{community.nombre || 'Comunidad'}</span>
            </div>
          );
        }) : (
          <p style={{ color: 'var(--secondary)', fontSize: '12px' }}>No hay comunidades</p>
        )}

        {joinedCommunities.length > 6 && (
          <button onClick={() => setShowAll(v => !v)} style={{ background: 'none', border: '1px solid var(--border-light)', color: 'var(--primary)', cursor: 'pointer', padding: '8px 12px', borderRadius: 'var(--border-radius-sm)', fontSize: '13px', fontWeight: '600', marginTop: '4px' }}>
            {showAll ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </div>
    </div>
  );
};

export const TrendingSidebar = ({ onPostClick }) => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get('/publicaciones');
        const sorted = [...data].sort((a, b) => (b.votos || 0) - (a.votos || 0)).slice(0, 5);
        setTrending(sorted);
      } catch (e) {
        console.error('TrendingSidebar:', e);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="sidebar-right">
      <h3 style={{ textAlign: 'center' }}>Tendencias</h3>
      {loading ? (
        <p style={{ color: 'var(--secondary)', fontSize: '12px' }}>Cargando...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {trending.length > 0 ? trending.map((post, idx) => (
            <div
              key={post.id}
              onClick={() => onPostClick?.(post)}
              style={{ padding: '10px', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'background-color 0.2s', backgroundColor: 'var(--bg-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--border-light)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            >
              <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px', color: 'var(--text-primary)' }}>
                {idx + 1}. {post.titulo || 'Sin título'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--secondary)' }}>{post.votos || 0} votos</p>
            </div>
          )) : (
            <p style={{ color: 'var(--secondary)', fontSize: '12px' }}>No hay tendencias</p>
          )}
        </div>
      )}
    </div>
  );
};
