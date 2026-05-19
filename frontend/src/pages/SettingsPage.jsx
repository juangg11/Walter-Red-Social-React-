import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ImagePlus, Moon, Type, UserRound } from 'lucide-react';
import { api } from '../api/client';
import { uploadToCloudinary } from '../utils/cloudinary';

export default function SettingsPage({ user, settings, onSettingsChange, onUserUpdate }) {
  const fileInputRef = useRef(null);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [avatarStatus, setAvatarStatus] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('');

  useEffect(() => {
    setAvatarUrl(user.avatar_url || '');
  }, [user.avatar_url]);

  const memberSince = useMemo(() => (
    user.fecha_creacion
      ? new Date(user.fecha_creacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Sin fecha disponible'
  ), [user.fecha_creacion]);

  function updateNotifications(patch) {
    onSettingsChange({
      ...settings,
      notifications: {
        ...settings.notifications,
        ...patch,
      },
    });
  }

  async function handleAvatarSelection(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setAvatarStatus('');

    try {
      const uploaded = await uploadToCloudinary(file, 'walter/avatars');
      const updated = await api.patch('/usuarios/perfil', { avatar_url: uploaded.asset.secure_url });
      setAvatarUrl(updated.avatar_url || uploaded.asset.secure_url);
      onUserUpdate(updated);
      setAvatarStatus('Avatar actualizado.');
    } catch (error) {
      setAvatarStatus(error.message);
    }

    event.target.value = '';
    setUploadingAvatar(false);
  }

  async function handleDesktopNotifications(nextValue) {
    setNotificationStatus('');

    if (!nextValue) {
      updateNotifications({ desktopMessages: false });
      return;
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationStatus('Este navegador no soporta notificaciones del sistema.');
      return;
    }

    const permission = Notification.permission === 'default'
      ? await Notification.requestPermission()
      : Notification.permission;

    const granted = permission === 'granted';
    updateNotifications({ desktopMessages: granted });
    setNotificationStatus(
      granted
        ? 'Permiso concedido.'
        : 'Permiso bloqueado. Tendrás que habilitarlo desde el navegador.'
    );
  }

  return (
    <main className="settings-page">
      <div className="settings-shell">
        <section className="settings-panel">
          <div className="settings-section-title">
            <UserRound size={16} />
            <h2>Cuenta</h2>
          </div>

          <div className="settings-account-grid">
            <div className="settings-avatar-block">
              <div className="settings-avatar-frame">
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" /> : <span>{user.username.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div className="settings-avatar-copy">
                <strong>w/{user.username}</strong>
                <span>{user.email}</span>
                <small>Miembro desde {memberSince}</small>
              </div>
            </div>

            <div className="settings-card-minimal">
              <p className="settings-card-label">Avatar</p>
              <div className="settings-inline-actions">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
                  <ImagePlus size={16} />
                  <span>{uploadingAvatar ? 'Subiendo...' : 'Subir imagen'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarSelection}
                />
              </div>
              {avatarStatus && <p className="settings-inline-status">{avatarStatus}</p>}
            </div>
          </div>
        </section>

        <section className="settings-panel">
          <div className="settings-section-title">
            <Type size={16} />
            <h2>Lectura</h2>
          </div>

          <div className="settings-text-size-row">
            <span className="settings-row-label">Tamaño del texto</span>
            <div className="settings-segmented">
              {[
                ['md', 'Normal'],
                ['lg', 'Grande'],
                ['xl', 'Muy grande'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={settings.textSize === value ? 'active' : ''}
                  onClick={() => onSettingsChange({ ...settings, textSize: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ToggleRow
            title="Contraste alto"
            checked={settings.contrast === 'high'}
            onChange={checked => onSettingsChange({ ...settings, contrast: checked ? 'high' : 'normal' })}
          />
          <ToggleRow
            title="Reducir animaciones"
            checked={settings.reduceMotion}
            onChange={checked => onSettingsChange({ ...settings, reduceMotion: checked })}
          />
        </section>

        <section className="settings-panel">
          <div className="settings-section-title">
            <Bell size={16} />
            <h2>Notificaciones</h2>
          </div>

          <ToggleRow
            title="Aviso dentro de Walter"
            checked={settings.notifications.chatToasts}
            onChange={checked => updateNotifications({ chatToasts: checked })}
          />
          <ToggleRow
            title="Notificación del navegador"
            checked={settings.notifications.desktopMessages}
            onChange={handleDesktopNotifications}
          />
          {notificationStatus && <p className="settings-inline-status">{notificationStatus}</p>}
        </section>

        <section className="settings-panel">
          <div className="settings-section-title">
            <Moon size={16} />
            <h2>Apariencia</h2>
          </div>

          <ToggleRow
            title="Tema oscuro"
            checked={settings.theme === 'dark'}
            onChange={checked => onSettingsChange({ ...settings, theme: checked ? 'dark' : 'light' })}
          />
        </section>
      </div>
    </main>
  );
}

function ToggleRow({ title, checked, onChange }) {
  return (
    <div className="settings-toggle-row">
      <div className="settings-toggle-copy">
        <strong>{title}</strong>
      </div>
      <button
        type="button"
        className={`settings-switch ${checked ? 'on' : ''}`}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}
