export class CreateCardDTO {
  name: string;
  surname: string;
  cardNumber: number;
  cvv: number;
  userId: number;
  expirationDate: Date;
  currency: string;
}
