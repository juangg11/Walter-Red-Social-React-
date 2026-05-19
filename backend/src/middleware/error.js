import { isAppError } from '../utils/AppError.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  if (error?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'El recurso ya existe' });
  }

  if (isAppError(error)) {
    return res.status(error.status).json({
      error: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
}
