import { CommunityModel } from '../models/community.model.js';
import { AppError } from '../utils/AppError.js';

export const comunidadesService = {

  async getAll(userId) {
    return CommunityModel.findAll(userId);
  },

  async getById(id, userId) {
    const comunidad = await CommunityModel.findById(id, userId);
    if (!comunidad) throw new AppError(404, 'Comunidad no encontrada');
    return comunidad;
  },

  async create({ nombre, descripcion, categoria, creadorId }) {
    const comunidadId = await CommunityModel.create({ nombre, descripcion, categoria, creadorId });

    await CommunityModel.addMember(comunidadId, creadorId);
    await CommunityModel.incrementMembers(comunidadId);

    return this.getById(comunidadId, creadorId);
  },

  async join(comunidadId, userId) {
    await this.getById(comunidadId, userId);
    const alreadyMember = await CommunityModel.isMember(comunidadId, userId);
    if (alreadyMember) return;
    await CommunityModel.addMember(comunidadId, userId);
    await CommunityModel.incrementMembers(comunidadId);
  },

  async leave(comunidadId, userId) {
    const affectedRows = await CommunityModel.removeMember(comunidadId, userId);
    if (affectedRows === 0) throw new AppError(404, 'No eres miembro de esta comunidad');
    await CommunityModel.decrementMembers(comunidadId);
  },
};
