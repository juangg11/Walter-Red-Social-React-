import { requiredEmail, requiredString, requiredUsernameValue } from '../validators/schema.js';

export function registerDto(body) {
  return {
    email: requiredEmail(body),
    username: requiredUsernameValue(body.username),
    password: requiredString(body, 'password', 'La contraseña', { min: 6, max: 128 }),
  };
}

export function loginDto(body) {
  return {
    email: requiredEmail(body),
    password: requiredString(body, 'password', 'La contraseña', { min: 1, max: 128 }),
  };
}

export function checkUsernameDto(query) {
  return { username: requiredUsernameValue(query.username) };
}
