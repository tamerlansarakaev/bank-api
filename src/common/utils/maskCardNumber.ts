export function maskCardNumber(cardNumber: string) {
  return cardNumber
    .split('')
    .map((cardNum, i) => {
      if (cardNumber.length - 4 <= i) {
        return cardNum;
      }
      return '*';
    })
    .join('');
}
