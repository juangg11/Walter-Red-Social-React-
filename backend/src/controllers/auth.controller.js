import { authService } from '../services/auth.service.js';
import { checkUsernameDto, loginDto, registerDto } from '../dtos/auth.dto.js';

export const authController = {

  async register(req, res) {
    const result = await authService.register(registerDto(req.body));
    res.status(201).json(result);
  },

  async login(req, res) {
    const result = await authService.login(loginDto(req.body));
    res.json(result);
  },

  async checkUsername(req, res) {
    const result = await authService.checkUsername(checkUsernameDto(req.query).username);
    res.json(result);
  },
};
