const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const WS_BASE = BASE.replace(/^http/, 'ws').replace(/\/api$/, '/ws');

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.assign('/');
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
  if (!res.ok) throw new Error(data.error || 'Error en la petición');
  return data;
}

export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  (path, body)   => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: 'DELETE' }),
};

export function getChatSocketUrl() {
  const token = localStorage.getItem('token') || '';
  return `${WS_BASE}?token=${encodeURIComponent(token)}`;
}
