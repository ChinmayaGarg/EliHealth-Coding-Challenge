export const getQRCodeStatus = (qrCode: string | null): 'valid' | 'expired' | 'invalid' => {
  if (!qrCode) return 'invalid';
  if (qrCode.startsWith('ELI-2025')) return 'valid';
  if (qrCode.startsWith('ELI-2024')) return 'expired';
  return 'invalid';
};