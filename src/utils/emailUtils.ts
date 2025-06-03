
/**
 * Utilitários para sanitização e validação de emails
 */

/**
 * Sanitiza um email removendo espaços e convertendo para minúsculas
 */
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Valida se um email tem formato válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitiza e valida um email
 */
export const sanitizeAndValidateEmail = (email: string): { isValid: boolean; sanitizedEmail: string } => {
  const sanitizedEmail = sanitizeEmail(email);
  const isValid = isValidEmail(sanitizedEmail);
  
  return {
    isValid,
    sanitizedEmail
  };
};
