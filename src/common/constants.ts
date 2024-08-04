export const jwtConstants = {
  secret: 'clientToken',
  adminToken: 'adminToken',
  refreshToken: 'refreshToken',
  adminRefreshToken: 'adminRefreshToken',
};

export const configHash = {
  hashSalt: 12,
};

export enum errorMessages {
  TRANSACTION_NOT_FOUND = 'Transaction not found',
  CARD_NOT_FOUND = 'Card not found',
  USER_NOT_FOUND = 'User not found',
  RECEIVER_CARD_NOT_FOUND = 'Receiver card not found',
}
