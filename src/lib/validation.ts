/**
 * Tipo estandarizado para respuestas de acciones
 */
export type ActionResponse<T = null> = 
  | { success: true; data?: T }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Crea una respuesta exitosa
 */
export function successResponse<T>(data?: T): ActionResponse<T> {
  return { success: true, data };
}

/**
 * Crea una respuesta de error general
 */
export function errorResponse(error: string): ActionResponse {
  return { success: false, error };
}

/**
 * Crea una respuesta de error con errores por campo
 */
export function fieldErrorResponse(
  error: string,
  fieldErrors?: Record<string, string>
): ActionResponse {
  return { success: false, error, fieldErrors };
}

/**
 * Valida que los campos requeridos no estén vacíos
 */
export function validateRequired(fields: Record<string, any>) {
  const fieldErrors: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(fields)) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      fieldErrors[key] = `${key} es requerido`;
    }
  }
  
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
}
