import { randomUUID } from 'crypto';
/**
 * Genera un identificador único global (UUID v4) para una wallet.
 * @param incluirGuiones Si es falso, remueve los guiones del UUID.
 */
export function generateAcccountNumberWallet(includeHyphens: boolean = true): string {
  const uuid = randomUUID();
  return includeHyphens ? uuid : uuid.replace(/-/g, '');
}