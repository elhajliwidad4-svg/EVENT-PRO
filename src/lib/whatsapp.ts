export function normalizeWhatsAppDigits(rawNumber?: string | null): string {
  if (!rawNumber) return '';
  return rawNumber.replace(/[^0-9]/g, '');
}

export function buildWhatsAppUrl(
  configuredNumber: string | undefined | null,
  contextLabel?: string
): string | null {
  const digits = normalizeWhatsAppDigits(configuredNumber);
  if (digits.length < 8) return null;
  const text = contextLabel
    ? `Bonjour EVENT PRO, je souhaite échanger au sujet de : ${contextLabel} (Casablanca).`
    : 'Bonjour EVENT PRO, je souhaite obtenir des informations pour organiser un événement à Casablanca.';
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
