import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import { UserModel } from '../models/user.model.js';
 
export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token requerido'));
  }
 
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(payload.id);
    if (!user) {
      return next(new AppError(401, 'Tu sesion ya no es valida. Inicia sesion otra vez.'));
    }
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Token inválido o expirado'));
  }
}
 
