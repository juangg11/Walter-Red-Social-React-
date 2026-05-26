import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/user.model.js';
import { AppError } from '../utils/AppError.js';

export const authService = {

  async register({ email, username, password }) {
    const existing = await UserModel.findByEmailOrUsername(email, username);
    if (existing.length > 0) {
      throw new AppError(409, 'Email o username ya en uso');
    }

    const id           = uuidv4();
    const passwordHash = await bcrypt.hash(password, 12);

    await UserModel.create({ id, email, username, passwordHash });

    const token = jwt.sign({ id, email, username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const user = await UserModel.findById(id);
    return { token, user: { id: user.id, email: user.email, username: user.username, avatar_url: user.avatar_url, bio: user.bio, fecha_creacion: user.fecha_creacion } };
  },

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);

    if (!user) throw new AppError(401, 'Credenciales incorrectas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'Credenciales incorrectas');

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return { token, user: { id: user.id, email: user.email, username: user.username, avatar_url: user.avatar_url, bio: user.bio, fecha_creacion: user.fecha_creacion } };
  },

  async checkUsername(username) {
    return { available: !(await UserModel.usernameExists(username)) };
  },
};
