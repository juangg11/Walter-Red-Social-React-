import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Mail, Lock, User } from 'lucide-react';

const USERNAME_IDLE     = 'idle';
const USERNAME_CHECKING = 'checking';
const USERNAME_TAKEN    = 'taken';
const USERNAME_FREE     = 'free';

export default function Auth({ onLogin }) {
  const [loading, setLoading]   = useState(false);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError]       = useState('');
  const [usernameStatus, setUsernameStatus] = useState(USERNAME_IDLE);

  useEffect(() => {
    if (!isSignUp || username.trim().length < 3) {
      setUsernameStatus(USERNAME_IDLE);
      return;
    }
    setUsernameStatus(USERNAME_CHECKING);
    const timer = setTimeout(() => checkUsername(username.trim()), 500);
    return () => clearTimeout(timer);
  }, [username, isSignUp]);

  async function checkUsername(name) {
    try {
      const data = await api.get(`/auth/check-username?username=${encodeURIComponent(name)}`);
      setUsernameStatus(data.available ? USERNAME_FREE : USERNAME_TAKEN);
    } catch {
      setUsernameStatus(USERNAME_IDLE);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError('');
    if (username.trim().length < 3) { setError('El nombre de usuario debe tener al menos 3 caracteres.'); return; }
    if (usernameStatus === USERNAME_TAKEN) { setError('Ese nombre de usuario ya está en uso.'); return; }
    if (usernameStatus !== USERNAME_FREE)  { setError('Espera a que se compruebe el nombre de usuario.'); return; }

    setLoading(true);
    try {
      const data = await api.post('/auth/register', { email, password, username: username.trim() });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  function handleSwitch() {
    setIsSignUp(v => !v);
    setError('');
    setUsername('');
    setUsernameStatus(USERNAME_IDLE);
  }

  const usernameBorderColor =
    usernameStatus === USERNAME_FREE  ? 'var(--primary)' :
    usernameStatus === USERNAME_TAKEN ? '#E24B4A'        : 'var(--border-color, #ccc)';

  const usernameHint =
    usernameStatus === USERNAME_CHECKING ? '⏳ Comprobando...'  :
    usernameStatus === USERNAME_TAKEN    ? '✗ Nombre ya en uso' :
    usernameStatus === USERNAME_FREE     ? '✓ Disponible'       :
    username.length > 0 && username.length < 3 ? 'Mínimo 3 caracteres' : '';

  const usernameHintColor =
    usernameStatus === USERNAME_FREE  ? 'var(--primary)' :
    usernameStatus === USERNAME_TAKEN ? '#E24B4A'        : 'var(--text-secondary)';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '1.25rem' }}>
      <div className="auth-container" style={{ width: '100%' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: 'var(--primary)', fontSize: '2.25rem', marginBottom: '0.5rem', fontWeight: '700', letterSpacing: '-0.0625rem' }}>
            w/Walter
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>¡Comparte tus ideas con la comunidad!</p>
        </div>

        <form onSubmit={isSignUp ? handleSignUp : handleLogin} style={{ marginBottom: '1.25rem' }}>
          {isSignUp && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', pointerEvents: 'none' }} />
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
                  required
                  maxLength={30}
                  style={{ paddingLeft: '2.5rem', borderColor: usernameBorderColor }}
                />
              </div>
              {usernameHint && (
                <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: usernameHintColor, paddingLeft: '0.25rem' }}>
                  {usernameHint}
                </p>
              )}
            </div>
          )}

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', pointerEvents: 'none' }} />
            <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: '2.5rem' }} />
          </div>

          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', pointerEvents: 'none' }} />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: '2.5rem' }} />
          </div>

          {error && <p style={{ fontSize: '0.8125rem', color: '#E24B4A', marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || (isSignUp && usernameStatus !== USERNAME_FREE)}
            style={{ opacity: (loading || (isSignUp && usernameStatus !== USERNAME_FREE)) ? '0.6' : '1', cursor: (loading || (isSignUp && usernameStatus !== USERNAME_FREE)) ? 'not-allowed' : 'pointer', marginBottom: '0.75rem' }}
          >
            {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
          </p>
          <button
            onClick={handleSwitch}
            style={{ background: 'none', border: '0.125rem solid var(--primary)', color: 'var(--primary)', padding: 'var(--spacing-md) var(--spacing-lg)', borderRadius: 'var(--border-radius-sm)', fontWeight: '600', fontSize: 'var(--font-size-base)', cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.backgroundColor = 'var(--primary)'; e.target.style.color = 'white'; }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--primary)'; }}
          >
            {isSignUp ? 'Entrar' : 'Crear Cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}