/**
 * Normalização: usada antes de salvar no banco e antes de comparar
 * duplicidade, para que "123.456.789-09" e "12345678909" sejam
 * tratados como o mesmo valor.
 */
export function apenasDigitos(valor: string | null | undefined): string {
  return (valor || '').replace(/\D/g, '');
}

export function normalizarEmail(valor: string | null | undefined): string {
  return (valor || '').trim().toLowerCase();
}

/**
 * Formatação: usada só na hora de exibir na tela. O valor salvo no
 * banco fica sempre "limpo" (só dígitos / e-mail em minúsculas).
 */
export function formatarCpfCnpj(valor: string | null | undefined): string {
  const digitos = apenasDigitos(valor);
  if (digitos.length === 11) {
    return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (digitos.length === 14) {
    return digitos.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return valor || '';
}

export function formatarTelefone(valor: string | null | undefined): string {
  const digitos = apenasDigitos(valor);
  if (digitos.length === 11) {
    return digitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digitos.length === 10) {
    return digitos.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return valor || '';
}
