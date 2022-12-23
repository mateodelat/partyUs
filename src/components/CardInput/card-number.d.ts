import type { Verification } from "./types";
declare type CreditCardType = {
    type?: string;
    cvv?: number
};
export interface CardNumberVerification extends Verification {
    card?: CreditCardType | null;
}
declare type CardNumberOptions = {
    maxLength?: number;
    luhnValidateUnionPay?: boolean;
};
export declare function cardNumber(value: string | unknown, options?: CardNumberOptions): CardNumberVerification;
