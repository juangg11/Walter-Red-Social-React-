import { mediaCommitDto, mediaSignatureDto } from '../dtos/media.dto.js';
import { mediaService } from '../services/media.service.js';

export const mediaController = {
  async signature(req, res) {
    const data = mediaService.createSignature({
      ...mediaSignatureDto(req.body),
      userId: req.user.id,
    });
    res.json(data);
  },

  async commit(req, res) {
    const data = await mediaService.commit(mediaCommitDto(req.body));
    res.status(201).json(data);
  },
};
