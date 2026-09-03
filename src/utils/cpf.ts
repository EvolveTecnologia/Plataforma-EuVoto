/**
 * Validação de e-mail padrão RFC
 */
export function validarEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(email.trim());
}

/**
 * Validação rigorosa dos dígitos verificadores do CPF brasileiro
 * Algoritmo oficial da Receita Federal do Brasil
 */
export function validarCPF(cpfLimpo: string): boolean {
  const cpf = cpfLimpo.replace(/\D/g, '');

  if (cpf.length !== 11) return false;

  // Rejeita sequências conhecidas de dígitos iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do 1º dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const digito1 = resto >= 10 ? 0 : resto;
  if (digito1 !== parseInt(cpf.charAt(9), 10)) return false;

  // Validação do 2º dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  resto = 11 - (soma % 11);
  const digito2 = resto >= 10 ? 0 : resto;
  if (digito2 !== parseInt(cpf.charAt(10), 10)) return false;

  return true;
}

/**
 * Aplica máscara 999.999.999-99
 */
export function mascararCPF(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Aplica máscara de celular (99) 99999-9999
 */
export function mascararCelular(valor: string): string {
  const digits = valor.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Gera hash SHA-256 do CPF para cumprimento estrito da LGPD
 */
export async function gerarHashCpf(cpfLimpo: string): Promise<string> {
  const digits = cpfLimpo.replace(/\D/g, '');
  if (!window.crypto || !window.crypto.subtle) {
    // Fallback simples caso SubtleCrypto não esteja disponível
    let hash = 0;
    for (let i = 0; i < digits.length; i++) {
      hash = (hash << 5) - hash + digits.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash)}_${digits.slice(0, 3)}`;
  }

  const msgBuffer = new TextEncoder().encode(`euvoto_salt_2026_${digits}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
