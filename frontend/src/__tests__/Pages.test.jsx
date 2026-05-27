import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import HomePage from '../pages/HomePage';
import CommunitiesPage from '../pages/CommunitiesPage';
import ChatPage from '../pages/ChatPage';
import SettingsPage from '../pages/SettingsPage';
import UserPage from '../pages/UserPage';
import request from '../api/client';

// Mock API Client
vi.mock('../api/client', () => ({
  default: vi.fn(),
  getChatSocketUrl: vi.fn(() => 'ws://localhost:3001/ws'),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ username: 'alice' }),
}));

describe('HomePage', () => {
  const mockUser = { id: 'user-123', username: 'alice' };
  const mockCommunities = [
    { id: 1, nombre: 'science', es_miembro: 1 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebars and feed correctly', async () => {
    request.mockResolvedValueOnce([]); // Feed posts load
    request.mockResolvedValueOnce([]); // Trending posts load

    render(
      <HomePage
        user={mockUser}
        searchQuery=""
        selectedCommunities={[]}
        setSelectedCommunities={vi.fn()}
        communities={mockCommunities}
        onPostClick={vi.fn()}
      />
    );

    expect(screen.getByText('Mis Comunidades')).toBeInTheDocument();
    expect(screen.getByText('Tendencias')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('w/science')).toBeInTheDocument();
    });
  });
});

describe('CommunitiesPage', () => {
  const mockUser = { id: 'user-123' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders communities view within the page shell', async () => {
    request.mockResolvedValueOnce([]);

    render(
      <CommunitiesPage
        user={mockUser}
        onCommunityCreated={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('+ Nueva comunidad')).toBeInTheDocument();
    });
  });
});

describe('ChatPage', () => {
  const mockUser = { id: 'user-123', username: 'alice' };

  beforeEach(() => {
    vi.clearAllMocks();
    global.WebSocket = vi.fn().mockImplementation(() => ({
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it('renders chat shell page', async () => {
    request.mockResolvedValueOnce([]); // Contacts load

    render(<ChatPage user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText(/Mensajes/i)).toBeInTheDocument();
    });
  });
});

describe('SettingsPage', () => {
  const mockUser = { id: 'user-123', username: 'alice', bio: 'Hello', email: 'alice@example.com' };
  const mockSettings = {
    theme: 'light',
    textSize: 'md',
    contrast: 'normal',
    reduceMotion: false,
    notifications: {
      chatToasts: true,
      desktopMessages: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings options', () => {
    render(
      <SettingsPage
        user={mockUser}
        settings={mockSettings}
        onSettingsChange={vi.fn()}
        onUserUpdate={vi.fn()}
      />
    );

    expect(screen.getByText('Cuenta')).toBeInTheDocument();
    expect(screen.getByText('Lectura')).toBeInTheDocument();
    expect(screen.getByText('Tamaño del texto')).toBeInTheDocument();
  });
});

describe('UserPage', () => {
  const mockUser = { id: 'user-123', username: 'alice' };
  const mockProfileUser = {
    id: 'user-123',
    username: 'alice',
    bio: 'Alice bio',
    avatar_url: null,
    fecha_creacion: '2026-05-27T00:00:00Z',
    counts: {
      posts_count: 5,
      comment_count: 2,
      shared_count: 1,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile page with user publications', async () => {
    request.mockResolvedValueOnce(mockProfileUser); // 1. Fetch profile
    request.mockResolvedValueOnce([]); // 2. Fetch user posts
    request.mockResolvedValueOnce([]); // 3. Fetch comments
    request.mockResolvedValueOnce([]); // 4. Fetch shared posts

    render(
      <UserPage
        user={mockUser}
        onUserUpdate={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Alice bio')).toBeInTheDocument();
    });
  });
});
