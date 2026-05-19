import { optionalString, requiredUrl, requiredUsernameValue } from '../validators/schema.js';

export function usernameParamDto(params) {
  return { username: requiredUsernameValue(params.username) };
}

export function updatePerfilDto(body) {
  return {
    avatar_url: requiredUrl(body, 'avatar_url', 'avatar_url'),
    bio: optionalString(body, 'bio', 'La biografía', { max: 280 }),
  };
}
