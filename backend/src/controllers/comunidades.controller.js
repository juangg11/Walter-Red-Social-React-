import { comunidadesService } from '../services/comunidades.service.js';
import { idParamDto } from '../dtos/common.dto.js';
import { createComunidadDto } from '../dtos/comunidades.dto.js';

export const comunidadesController = {

  async getAll(req, res) {
    const data = await comunidadesService.getAll(req.query.userId || null);
    res.json(data);
  },

  async getById(req, res) {
    const { id } = idParamDto(req.params);
    const data = await comunidadesService.getById(id, req.query.userId || null);
    res.json(data);
  },

  async create(req, res) {
    const data = await comunidadesService.create({
      ...createComunidadDto(req.body),
      creadorId: req.user.id,
    });
    res.status(201).json(data);
  },

  async join(req, res) {
    const { id } = idParamDto(req.params);
    await comunidadesService.join(id, req.user.id);
    res.json({ mensaje: 'Te has unido a la comunidad' });
  },

  async leave(req, res) {
    const { id } = idParamDto(req.params);
    await comunidadesService.leave(id, req.user.id);
    res.json({ mensaje: 'Has abandonado la comunidad' });
  },
};
