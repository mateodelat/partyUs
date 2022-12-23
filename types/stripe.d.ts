
/**When creating a card for payouts. [See docs](https://stripe.com/docs/api/external_account_cards/create).*/
export interface cardExternalType {
    /**The type of external account. Should be `card` .*/
    object: "card"

    /**The card number, as a string without any separators.*/
    number: string

    /**Two-digit number representing the card's expiration month.*/
    exp_month: string

    /**Two- or four-digit number representing the card's expiration year.*/
    exp_year: string

    /**Card security code. Highly recommended to always include this value, but it's required only for accounts based in European countries.*/
    cvc: string

    /**CUSTOM CONNECT ONLY
     Required when adding a card to an account (not applicable to customers or recipients). The card (which must be a debit card) can be used as a transfer destination for funds in this currency.*/
    currency: "mxn"

    /**Cardholder's full name.*/
    name?: string

    /**A set of key-value pairs that you can attach to a card object. This can be useful for storing additional information about the card in a structured format.*/
    metadata?: Object

    /**Address line 1 (Street address / PO Box / Company name).*/
    address_line1?: string

    /**Address line 2 (Apartment / Suite / Unit / Building).*/
    address_line2?: string

    /**City / District / Suburb / Town / Village.*/
    address_city?: string

    /**State / County / Province / Region.*/
    address_state?: string

    /**ZIP or postal code.*/
    address_zip?: string

    /**Billing address country, if provided.*/
    address_country?: string

    /**When set to `true`, or if this is the first external account added in this currency, this account becomes the default external account for its currency. */
    default_for_currency?: boolean

}

type cardType_type = "cash" | "debit" | "credit" | string
type cardOrigType = {
    "id"?: string
    "type"?: cardType_type,
    "brand"?: cardBrand_type,
    "address"?: address_type,
    "card_number": string,
    "holder_name": string,
    "expiration_year": string,
    "expiration_month": string,
    "allows_charges": boolean,
    "allows_payouts": boolean,
    "creation_date": string,
    "bank_name": string,
    "bank_code": string,
    "customer_id"?: string,
}


/**When creating a bank account for payouts. [See docs](https://stripe.com/docs/api/external_account_bank_accounts/create).*/
export type bankExternalType = {
    /**The type of external account. Should be `bank_account` .*/
    object: "bank_account"


    /**The country in which the bank account is located.*/
    country: string

    /**The currency the bank account is in. This must be a country/currency pairing that Stripe supports.*/
    currency: string

    /**The name of the person or business that owns the bank account. This field is required when attaching the bank account to a `Customer` object.*/
    account_holder_name?: string

    /**The type of entity that holds the account. This can be either `individual` or `company`. This field is required when attaching the bank account to a Customer object.*/
    account_holder_type?: "individual" | "company"

    /**The account number for the bank account, in string form. Must be a checking account.*/
    account_number: string


}

type currency_type = "MXN"

export type tipoTransaccion = "charge" | "payout" | "refund" | "transfer" | "fee"
export type method_type = "card" | "store" | "bank"
export type operation_type = "in" | "out"
export type transactionStatus_type = "completed" | "failed" | "in_progress" | "cancelled" | "refunded" | "chargeback_pending" | "chargeback_accepted" | "chargeback_adjustement" | "charge_pending" | "expired"
export type cardBrand_type = "discover"
    | "jcb"
    | "mastercard"
    | "unionpay"
    | "visa"
    | "americanexpress"
    | "dinersclub"



export interface errorOpenPay {
    "category": string,
    "description": string,
    "http_code": number,
    "error_code": number,
    "request_id": string,

}
