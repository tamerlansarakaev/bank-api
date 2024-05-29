import { Currency } from '../entities/card.entity';

export class CreateCardDTO {
  name: string;
  surname: string;
  cardNumber: string;
  cvv: string;
  userId: number;
  expirationDate: Date;
  currency: Currency;
}
