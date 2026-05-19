import { optionalId, optionalString, requiredId } from '../validators/schema.js';
import { AppError } from '../utils/AppError.js';

export function createChatDto(body) {
  const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
  if (!userId) throw new AppError(400, 'userId es obligatorio');
  return { userId };
}

export function createMessageDto(body) {
  const contenido = optionalString(body, 'contenido', 'El mensaje', { max: 5000 });
  const media_asset_id = optionalId(body.media_asset_id, 'media_asset_id');
  if (!contenido && !media_asset_id) throw new AppError(400, 'El mensaje o la imagen son obligatorios');
  return {
    contenido,
    media_asset_id,
    respuesta_a_id: optionalId(body.respuesta_a_id, 'respuesta_a_id'),
  };
}

export function chatIdDto(params) {
  return { chatId: requiredId(params.chatId, 'chatId') };
}
