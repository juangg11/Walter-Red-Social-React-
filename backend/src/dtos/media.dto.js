import { AppError } from '../utils/AppError.js';
import { optionalString, requiredString } from '../validators/schema.js';

export function mediaSignatureDto(body) {
  const folder = requiredString(body, 'folder', 'folder', { min: 2, max: 120 });
  return { folder };
}

export function mediaCommitDto(body) {
  return {
    public_id: requiredString(body, 'public_id', 'public_id', { min: 3, max: 255 }),
    secure_url: requiredString(body, 'secure_url', 'secure_url', { min: 10, max: 5000 }),
    resource_type: requiredString(body, 'resource_type', 'resource_type', { min: 3, max: 20 }),
    format: optionalString(body, 'format', 'format', { max: 20 }),
    bytes: Number.isFinite(Number(body.bytes)) ? Number(body.bytes) : null,
    width: Number.isFinite(Number(body.width)) ? Number(body.width) : null,
    height: Number.isFinite(Number(body.height)) ? Number(body.height) : null,
    duration: Number.isFinite(Number(body.duration)) ? Number(body.duration) : null,
  };
}

export function validateMediaResourceType(resourceType) {
  if (!['image', 'video', 'raw'].includes(resourceType)) {
    throw new AppError(400, 'resource_type inválido');
  }
}
