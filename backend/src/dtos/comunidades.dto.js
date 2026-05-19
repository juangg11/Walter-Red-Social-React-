import { optionalString, requiredString } from '../validators/schema.js';

export function createComunidadDto(body) {
  return {
    nombre: requiredString(body, 'nombre', 'El nombre', { min: 2, max: 100 }),
    descripcion: optionalString(body, 'descripcion', 'La descripción', { max: 1000 }),
    categoria: optionalString(body, 'categoria', 'La categoría', { max: 100 }),
  };
}
