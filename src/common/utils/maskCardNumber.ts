export function maskCardNumber(cardNumber: string) {
  const last4Digits = cardNumber.slice(-4);
  return last4Digits.padStart(cardNumber.length, '*');
}
