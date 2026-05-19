import { publicacionesService } from '../services/publicaciones.service.js';
import { idParamDto } from '../dtos/common.dto.js';
import { createPublicacionDto, listPublicacionesDto, votePublicacionDto } from '../dtos/publicaciones.dto.js';

export const publicacionesController = {

  async getAll(req, res) {
    const data = await publicacionesService.getAll(listPublicacionesDto(req.query));
    res.json(data);
  },

  async getById(req, res) {
    const { id } = idParamDto(req.params);
    const data = await publicacionesService.getById(id, req.query.userId || null);
    res.json(data);
  },

  async create(req, res) {
    const data = await publicacionesService.create({
      ...createPublicacionDto(req.body),
      usuarioId: req.user.id,
    });
    res.status(201).json(data);
  },

  async remove(req, res) {
    const { id } = idParamDto(req.params);
    await publicacionesService.remove(id, req.user.id);
    res.json({ mensaje: 'Publicación eliminada' });
  },

  async vote(req, res) {
    const { id } = idParamDto(req.params);
    const { tipo_voto } = votePublicacionDto(req.body);
    const result = await publicacionesService.vote(id, req.user.id, tipo_voto);
    res.json(result);
  },
};
