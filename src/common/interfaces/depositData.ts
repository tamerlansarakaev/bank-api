import { Currency } from "../entities/card.entity";

export interface IDepositData {
  userId: number;
  cardId: number;
  amount: number;
  currency: Currency;
}
