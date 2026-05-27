import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { CommunitiesSidebar, TrendingSidebar } from '../components/Sidebar';
import Communities from '../components/Comunidades';
import request from '../api/client';

// Mock request
vi.mock('../api/client', () => ({
  default: vi.fn(),
  getChatSocketUrl: vi.fn(),
}));

describe('CommunitiesSidebar Component', () => {
  const mockCommunities = [
    { id: 1, nombre: 'react', es_miembro: 1 },
    { id: 2, nombre: 'vue', es_miembro: 1 },
  ];
  const mockSelectCommunities = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders joined communities and handles selection', () => {
    render(
      <CommunitiesSidebar
        communities={mockCommunities}
        selectedCommunities={[]}
        onSelectCommunities={mockSelectCommunities}
      />
    );

    expect(screen.getByText('w/react')).toBeInTheDocument();
    expect(screen.getByText('w/vue')).toBeInTheDocument();

    const reactItem = screen.getByText('w/react');
    fireEvent.click(reactItem);

    expect(mockSelectCommunities).toHaveBeenCalledWith(['1']);
  });

  it('toggles select all communities when Toutes/Clear clicked', () => {
    render(
      <CommunitiesSidebar
        communities={mockCommunities}
        selectedCommunities={['1', '2']}
        onSelectCommunities={mockSelectCommunities}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: 'Limpiar' });
    fireEvent.click(toggleBtn);

    expect(mockSelectCommunities).toHaveBeenCalledWith([]);
  });
});

describe('TrendingSidebar Component', () => {
  const mockPosts = [
    { id: '1', titulo: 'First Post', votos: 10 },
    { id: '2', titulo: 'Popular Post', votos: 25 },
  ];
  const mockOnPostClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and renders trending posts sorted by votes', async () => {
    request.mockResolvedValueOnce(mockPosts);

    render(<TrendingSidebar onPostClick={mockOnPostClick} />);

    expect(screen.getByText('Cargando...')).toBeInTheDocument();

    await waitFor(() => {
      // 25 votes is first
      expect(screen.getByText('1. Popular Post')).toBeInTheDocument();
      expect(screen.getByText('2. First Post')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('1. Popular Post'));
    expect(mockOnPostClick).toHaveBeenCalledWith(mockPosts[1]);
  });
});

describe('Communities Component', () => {
  const mockUser = { id: 'user-123' };
  const mockCommunitiesList = [
    { id: 'c1', nombre: 'ReactJS', descripcion: 'React group', categoria: 'ciencia', numero_miembros: 50, numero_posts: 10, es_miembro: 0 },
    { id: 'c2', nombre: 'Rock', descripcion: 'Rock music', categoria: 'música', numero_miembros: 15, numero_posts: 2, es_miembro: 1 },
  ];
  const mockOnCommunityCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and allows user to join/leave communities', async () => {
    request.mockResolvedValueOnce(mockCommunitiesList); // First load
    request.mockResolvedValueOnce({}); // Post join / Delete leave

    render(<Communities user={mockUser} onCommunityCreated={mockOnCommunityCreated} />);

    await waitFor(() => {
      expect(screen.getByText('w/ReactJS')).toBeInTheDocument();
      expect(screen.getByText('w/Rock')).toBeInTheDocument();
    });

    // Unirse button for ReactJS
    const joinBtn = screen.getByRole('button', { name: 'Unirse' });
    fireEvent.click(joinBtn);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith('/comunidades/c1/unirse', { method: 'POST', body: '{}' });
      expect(mockOnCommunityCreated).toHaveBeenCalled();
    });
  });

  it('opens create modal and handles creation', async () => {
    request.mockResolvedValueOnce(mockCommunitiesList);
    request.mockResolvedValueOnce({}); // Post create community
    request.mockResolvedValueOnce(mockCommunitiesList); // Re-fetch list

    render(<Communities user={mockUser} onCommunityCreated={mockOnCommunityCreated} />);

    await waitFor(() => {
      expect(screen.getByText('+ Nueva comunidad')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('+ Nueva comunidad'));

    expect(screen.getByText('Crear comunidad')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('ej. JavaScript');
    fireEvent.change(nameInput, { target: { value: 'Angular' } });

    const createBtn = screen.getByRole('button', { name: 'Crear' });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith('/comunidades', {
        method: 'POST',
        body: JSON.stringify({ nombre: 'Angular', descripcion: null, categoria: 'otro' }),
      });
    });
  });
});
