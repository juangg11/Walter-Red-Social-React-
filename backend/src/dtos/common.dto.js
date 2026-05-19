import { requiredId } from '../validators/schema.js';

export function idParamDto(params, key = 'id') {
  return { [key]: requiredId(params[key], key) };
}
