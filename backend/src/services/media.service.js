import cloudinary from '../config/cloudinary.js';
import { MediaModel } from '../models/media.model.js';
import { AppError } from '../utils/AppError.js';
import { validateMediaResourceType } from '../dtos/media.dto.js';

export const mediaService = {
  createSignature({ folder, userId }) {
    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = {
      folder,
      timestamp,
      context: `user_id=${userId}`,
    };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    return {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
      context: paramsToSign.context,
    };
  },

  async commit(asset) {
    validateMediaResourceType(asset.resource_type);
    const existing = await MediaModel.findByPublicId(asset.public_id);
    if (existing) return existing;
    const mediaId = await MediaModel.create(asset);
    return MediaModel.findById(mediaId);
  },

  async getById(id) {
    const media = await MediaModel.findById(id);
    if (!media) throw new AppError(404, 'Asset no encontrado');
    return media;
  },
};
