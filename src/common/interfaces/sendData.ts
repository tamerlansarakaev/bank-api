import { Currency } from "../entities/card.entity";

export interface ISendData {
  userId: number;
  amount: number;
  senderCardId: number;
  receiverCardNumber: string;
  currency: Currency;
}
