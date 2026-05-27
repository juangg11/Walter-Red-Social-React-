import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Navbar from '../components/Navbar';
import request from '../api/client';

// Mock client request
vi.mock('../api/client', () => ({
  default: vi.fn(),
  getChatSocketUrl: vi.fn(),
}));

// Mock react-router-dom useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Navbar Component', () => {
  const mockUser = {
    username: 'walter',
    avatar_url: 'https://example.com/avatar.png',
  };
  const mockOnTabChange = vi.fn();
  const mockOnSearchChange = vi.fn();
  const mockOnLogout = vi.fn();
  const mockOnNotificationsRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders navbar correctly with user details', () => {
    render(
      <Navbar
        user={mockUser}
        onTabChange={mockOnTabChange}
        onSearchChange={mockOnSearchChange}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('walter')).toBeInTheDocument();
    expect(screen.getByAltText('walter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar posts y usuarios...')).toBeInTheDocument();
  });

  it('triggers onSearchChange when typing', () => {
    render(
      <Navbar
        user={mockUser}
        onSearchChange={mockOnSearchChange}
      />
    );

    const input = screen.getByPlaceholderText('Buscar posts y usuarios...');
    fireEvent.change(input, { target: { value: 'react' } });

    expect(mockOnSearchChange).toHaveBeenCalledWith('react');
  });

  it('clicks tab buttons correctly', () => {
    render(
      <Navbar
        user={mockUser}
        onTabChange={mockOnTabChange}
        activeTab="feed"
      />
    );

    const inicioBtn = screen.getByTitle('Inicio');
    const settingsBtn = screen.getByTitle('Settings');

    fireEvent.click(settingsBtn);
    expect(mockOnTabChange).toHaveBeenCalledWith('settings');
  });

  it('displays notification count badge', () => {
    render(
      <Navbar
        user={mockUser}
        notificationCount={5}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('displays 9+ when notification count is greater than 9', () => {
    render(
      <Navbar
        user={mockUser}
        notificationCount={12}
      />
    );

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('toggles notification panel and fetches notifications', async () => {
    const mockNotifications = [
      { id: '1', titulo: 'Alerta', mensaje: 'Mensaje de prueba' },
    ];
    request.mockResolvedValueOnce(mockNotifications);

    render(
      <Navbar
        user={mockUser}
        notificationCount={1}
        onNotificationsRead={mockOnNotificationsRead}
      />
    );

    const bell = screen.getByTitle('Notificaciones');
    fireEvent.click(bell);

    expect(request).toHaveBeenCalledWith('/notificaciones');

    await waitFor(() => {
      expect(screen.getByText('Alerta')).toBeInTheDocument();
      expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
    });
  });

  it('marks individual notification as read', async () => {
    const mockNotifications = [
      { id: '1', titulo: 'Alerta', mensaje: 'Mensaje de prueba' },
    ];
    request.mockResolvedValueOnce(mockNotifications);
    request.mockResolvedValueOnce({}); // For patch call

    render(
      <Navbar
        user={mockUser}
        notificationCount={1}
      />
    );

    fireEvent.click(screen.getByTitle('Notificaciones'));

    await waitFor(() => {
      expect(screen.getByText('Alerta')).toBeInTheDocument();
    });

    const notifItem = screen.getByText('Alerta');
    fireEvent.click(notifItem);

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith('/notificaciones/1/leer', { method: 'PATCH' });
    });
  });

  it('marks all notifications as read', async () => {
    const mockNotifications = [
      { id: '1', titulo: 'Alerta', mensaje: 'Mensaje de prueba' },
    ];
    request.mockResolvedValueOnce(mockNotifications);
    request.mockResolvedValueOnce({}); // For patch call all

    render(
      <Navbar
        user={mockUser}
        notificationCount={1}
        onNotificationsRead={mockOnNotificationsRead}
      />
    );

    fireEvent.click(screen.getByTitle('Notificaciones'));

    await waitFor(() => {
      expect(screen.getByText('Marcar todas como leídas')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Marcar todas como leídas'));

    await waitFor(() => {
      expect(request).toHaveBeenCalledWith('/notificaciones/leer-todas', { method: 'PATCH' });
      expect(mockOnNotificationsRead).toHaveBeenCalled();
    });
  });

  it('calls onLogout when logout button is clicked', () => {
    render(
      <Navbar
        user={mockUser}
        onLogout={mockOnLogout}
      />
    );

    const logoutBtn = screen.getByTitle('Cerrar sesión');
    fireEvent.click(logoutBtn);

    expect(mockOnLogout).toHaveBeenCalled();
  });
});
