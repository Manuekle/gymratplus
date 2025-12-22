/**
 * Valida que un número de teléfono tenga formato internacional válido
 * Debe comenzar con + seguido del código de país
 */
export function validatePhoneNumber(phone: string): boolean {
  // Formato internacional: +[código de país][número]
  // Ejemplo: +1234567890, +521234567890
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

/**
 * Formatea un número de teléfono para enmascararlo
 * Ejemplo: +1234567890 -> +1 *** *** **90
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 4) return phone;

  const countryCode = phone.substring(0, phone.length - 10);
  const lastDigits = phone.substring(phone.length - 2);

  return `${countryCode} *** *** **${lastDigits}`;
}
