import { Search, Home, User, LogOut, Bell, Users, MessageCircle, Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Navbar({ user, onSearchChange, notificationCount = 0, activeTab, onTabChange, onLogout, onNotificationsRead }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications]         = useState([]);

  async function handleNotificationsClick() {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      try {
        const data = await api.get('/notificaciones');
        setNotifications(data);
      } catch (e) {
        console.error('fetchNotifications:', e);
      }
    }
  }

  async function markAsRead(notificationId) {
    try {
      await api.patch(`/notificaciones/${notificationId}/leer`);
      setNotifications(cur => cur.filter(n => n.id !== notificationId));
    } catch (e) {
      console.error('markAsRead:', e);
    }
  }

  async function markAllRead() {
    try {
      await api.patch('/notificaciones/leer-todas');
      setNotifications([]);
      onNotificationsRead?.();
    } catch (e) {
      console.error('markAllRead:', e);
    }
  }

  function navIconStyle(tab) {
    return {
      cursor: 'pointer',
      color: activeTab === tab ? 'var(--primary)' : 'inherit',
      borderBottom: activeTab === tab ? '2px solid var(--navbar-indicator)' : '2px solid transparent',
      paddingBottom: '2px',
      transition: 'color 0.15s, border-color 0.15s',
      display: 'flex',
      alignItems: 'center',
    };
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">

          <div className="nav-left">
            <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => onTabChange?.('feed')}>
              <img className="nav-logo-mark" src="/walter.png" alt="Walter" />
            </div>
            <div className="nav-search">
              <Search size={16} />
              <input type="text" placeholder="Buscar posts y usuarios..." onChange={e => onSearchChange?.(e.target.value)} />
            </div>
          </div>

          <div className="nav-center-icons">
            <span style={navIconStyle('feed')} onClick={() => onTabChange?.('feed')} title="Inicio"><Home size={20} /></span>
            <span style={navIconStyle('messages')} onClick={() => onTabChange?.('messages')} title="Mensajes"><MessageCircle size={20} /></span>
            <span style={navIconStyle('communities')} onClick={() => onTabChange?.('communities')} title="Comunidades"><Users size={20} /></span>
            <span style={navIconStyle('profile')} onClick={() => onTabChange?.('profile')} title="Perfil"><User size={20} /></span>
            <span style={navIconStyle('settings')} onClick={() => onTabChange?.('settings')} title="Settings"><Settings size={20} /></span>
            <span style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={handleNotificationsClick} title="Notificaciones">
              <Bell size={20} />
              {notificationCount > 0 && (
                <div style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', width: '1.125rem', height: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 'bold', pointerEvents: 'none', zIndex: 1 }}>
                  {notificationCount > 9 ? '9+' : notificationCount}
                </div>
              )}
            </span>
          </div>

          <div className="nav-right">
            <div className="profile-menu">
              {user?.avatar_url ? (
                <img className="nav-user-avatar" src={user.avatar_url} alt={user.username} />
              ) : (
                <span className="nav-user-avatar">{user?.username?.slice(0, 2).toUpperCase()}</span>
              )}
              <button type="button" className="profile-link-nav" onClick={() => navigate(`/u/${user?.username}`)}>{user?.username}</button>
              <button onClick={onLogout} title="Cerrar sesión"><LogOut size={18} /></button>
            </div>
          </div>

        </div>
      </nav>

      {/* Notificaciones dropdown */}
      {showNotifications && (
        <div style={{ position: 'fixed', top: '5rem', right: '1.25rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--border-radius-md)', minWidth: '18.75rem', maxHeight: '25rem', overflowY: 'auto', zIndex: 10000, boxShadow: 'var(--shadow-md)', border: '2px solid var(--primary-hover)' }}>
          {notifications.length > 0 ? (
            <>
              <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}>
                  Marcar todas como leídas
                </button>
              </div>
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  <p style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{notif.titulo || 'Nueva notificación'}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{notif.mensaje}</p>
                </div>
              ))}
            </>
          ) : (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.75rem' }}>
              No tienes notificaciones
            </div>
          )}
        </div>
      )}
    </>
  );
}
