import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Feed, { PostCard } from '../components/Feed';
import PostCreate from '../components/PostCreate';
import PostModal from '../components/PostModal';
import request from '../api/client';
import { uploadToCloudinary } from '../utils/cloudinary';

// Mock API Client
vi.mock('../api/client', () => ({
  default: vi.fn(),
  getChatSocketUrl: vi.fn(),
}));

// Mock Cloudinary upload
vi.mock('../utils/cloudinary', () => ({
  uploadToCloudinary: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('PostCard Component', () => {
  const mockPost = {
    id: 'post-1',
    titulo: 'Post Title',
    contenido: 'Post Content',
    username: 'john_doe',
    comunidad_nombre: 'w/react',
    votos: 15,
    numero_comentarios: 3,
    compartido_por_usuario: 0,
  };
  const mockOnVote = vi.fn();
  const mockOnClick = vi.fn();
  const mockOnShare = vi.fn();

  it('renders post card fields correctly', () => {
    render(
      <PostCard
        post={mockPost}
        userVote={null}
        onVote={mockOnVote}
        onClick={mockOnClick}
        onShare={mockOnShare}
      />
    );

    expect(screen.getByText('Post Title')).toBeInTheDocument();
    expect(screen.getByText('Post Content')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('3 Comentarios')).toBeInTheDocument();
  });

  it('triggers onVote when upvote/downvote buttons are clicked', () => {
    render(
      <PostCard
        post={mockPost}
        userVote={null}
        onVote={mockOnVote}
        onClick={mockOnClick}
        onShare={mockOnShare}
      />
    );

    const upBtn = screen.getByTitle('Votar positivo');
    fireEvent.click(upBtn);
    expect(mockOnVote).toHaveBeenCalledWith('post-1', 'up');
  });
});

describe('Feed Component', () => {
  const mockUser = { id: 'user-123' };
  const mockPosts = [
    { id: 'p1', titulo: 'Test React', contenido: 'React content', username: 'alice', comunidad_id: 1, comunidad_nombre: 'react', votos: 5, numero_comentarios: 1, voto_usuario: null },
    { id: 'p2', titulo: 'Test Vue', contenido: 'Vue content', username: 'bob', comunidad_id: 2, comunidad_nombre: 'vue', votos: 2, numero_comentarios: 0, voto_usuario: null },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and lists posts', async () => {
    request.mockResolvedValueOnce(mockPosts);

    render(<Feed user={mockUser} searchQuery="" selectedCommunities={[]} />);

    expect(screen.getByText('Cargando posts...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test React')).toBeInTheDocument();
      expect(screen.getByText('Test Vue')).toBeInTheDocument();
    });
  });

  it('filters posts by search query', async () => {
    request.mockResolvedValueOnce(mockPosts);

    render(<Feed user={mockUser} searchQuery="Vue" selectedCommunities={[]} />);

    await waitFor(() => {
      expect(screen.queryByText('Test React')).not.toBeInTheDocument();
      expect(screen.getByText('Test Vue')).toBeInTheDocument();
    });
  });
});

describe('PostCreate Component', () => {
  const mockCommunities = [
    { id: 1, nombre: 'react', es_miembro: 1 },
    { id: 2, nombre: 'vue', es_miembro: 0 },
  ];
  const mockOnPostCreated = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and allows user to create a text post', async () => {
    request.mockResolvedValueOnce({});

    render(
      <PostCreate
        isOpen={true}
        onClose={mockOnClose}
        communities={mockCommunities}
        onPostCreated={mockOnPostCreated}
      />
    );

    expect(screen.getByText('Crear un nuevo post')).toBeInTheDocument();

    // Fill fields
    const comSelect = screen.getByRole('combobox');
    const titleInput = screen.getByPlaceholderText('Titulo del post');
    const contentText = screen.getByPlaceholderText('Que tienes en mente?');

    fireEvent.change(comSelect, { target: { value: '1' } });
    fireEvent.change(titleInput, { target: { value: 'New Release' } });
    fireEvent.change(contentText, { target: { value: 'React 19 is amazing!' } });

    const submitBtn = screen.getByRole('button', { name: 'Publicar' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith('/publicaciones', {
        method: 'POST',
        body: JSON.stringify({
          titulo: 'New Release',
          contenido: 'React 19 is amazing!',
          comunidad_id: 1,
          media_asset_id: null,
        }),
      });
      expect(mockOnPostCreated).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});

describe('PostModal Component', () => {
  const mockPost = {
    id: 'post-1',
    titulo: 'Post Title',
    contenido: 'Post Content',
    username: 'john_doe',
    comunidad_nombre: 'w/react',
    votos: 15,
    numero_comentarios: 1,
    voto_usuario: null,
  };
  const mockComments = [
    { id: 'c1', username: 'alice', contenido: 'Cool post!', fecha_creacion: '2026-05-27T00:00:00Z', comentario_padre_id: null },
  ];
  const mockOnClose = vi.fn();
  const mockOnCommentAdded = vi.fn();
  const mockOnPostUpdated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders comments and allows commenting', async () => {
    request.mockResolvedValueOnce(mockComments); // Load comments
    request.mockResolvedValueOnce({
      id: 'c2',
      username: 'bob',
      contenido: 'Excellent comment!',
      fecha_creacion: '2026-05-27T00:00:00Z',
      comentario_padre_id: null,
    }); // Add comment response

    render(
      <PostModal
        post={mockPost}
        onClose={mockOnClose}
        onCommentAdded={mockOnCommentAdded}
        onPostUpdated={mockOnPostUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Cool post!')).toBeInTheDocument();
    });

    const commentTextarea = screen.getByPlaceholderText('Escribe un comentario...');
    fireEvent.change(commentTextarea, { target: { value: 'Excellent comment!' } });

    const submitBtn = screen.getByRole('button', { name: 'Comentar' });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith('/comentarios', {
        method: 'POST',
        body: JSON.stringify({
          contenido: 'Excellent comment!',
          publicacion_id: 'post-1',
          comentario_padre_id: null,
        }),
      });
      expect(mockOnCommentAdded).toHaveBeenCalledWith(2);
    });
  });
});
