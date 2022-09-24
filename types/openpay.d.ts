export interface cardType {
    "id"?: string | Promise<string | undefined>,
    "type"?: cardBrand_type,
    "brand"?: cardBrand_type,
    "address"?: Object,
    "card_number": string,
    "holder_name": string,
    "expiration_year"?: string,
    "expiration_month"?: string,
    "allows_charges"?: boolean,
    "allows_payouts"?: boolean,
    "creation_date"?: string,
    "bank_name"?: string,
    "bank_code"?: string,
    "customer_id"?: string,

    // Variables tarjetas locales
    "icon": NodeRequire
    "tokenID"?: string
    saveCard?: boolean
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



export interface address_type {
    /**Primera línea de dirección del tarjeta habiente. Usada comúnmente para indicar la calle y número exterior e interior.*/
    line1: string

    /**Segunda línea de la dirección del tarjeta habiente. Usada comúnmente para indicar condominio, suite o delegación.*/
    line2?: string

    /**Tercer línea de la dirección del tarjeta habiente. Usada comúnmente para indicar la colonia.*/
    line3?: string

    /**Código postal del tarjeta habiente*/
    postal_code: string
    /**Estado del tarjeta habiente*/
    state: string
    /**Ciudad del tarjeta habiente*/
    city: string
    /**Código del país del tarjeta habiente a dos caracteres en formato ISO_3166-1*/
    country_code: string
}

export interface chargeType {
    "amount": number,
    "card": cardOrigType
    "conciliated": boolean,
    "creation_date": string,
    "currency": currency_type,
    "customer_id": string,
    "description": string,
    "error_message"?: string,
    "fee": {
        "amount": number,
        "currency": currency_type,
        "tax": number,
    },
    "id": string,
    "method": method_type,
    "operation_date": string,
    "operation_type": operation_type,
    "order_id": string,
    "status": transactionStatus_type,
    "transaction_type": tipoTransaccion,

    payment_method?: {
        "barcode_url": string,
        "reference": string,
        "type": "store",
    }
}

export type fee_type = {
    /**
     (longitud = 45)
     El identificador único del cliente al que deseas cobrarle la comisión.
     */
    customer_id: string

    /**
     Cantidad del cargo. Debe ser una cantidad mayor a cero, con hasta dos dígitos decimales.
     */
    amount: number

    /**
     (longitud = 250)
     Una descripción asociada al cobro de comisión.
     */
    description: string

    /**
     (longitud = 100)
     Identificador único de la comisión. Debe ser único para todas las transacciones.
     */
    order_id?: string
}

export type transaction_type = {
    /**Identificador único asignado por Openpay al momento de su creación.*/
    id: string

    /**Número de autorización generado por el procesador.*/
    authorization: string

    /**Tipo de transacción que fue creada: fee, charge, payout, transfer.*/
    transaction_type: tipoTransaccion

    /**Tipo de afectación en la cuenta: in, out.*/
    operation_type: string

    /** Tipo de método usado en la transacción: card, bank o customer.*/
    method: method_type

    /**Fecha de creación de la transacción en formato ISO 8601.*/
    creation_date: string
    /**Referencia única o número de orden / transacción.*/
    order_id: string

    /**Estatus actual de la transacción.Posibles valores: completed, in_progress, failed.*/
    status: transactionStatus_type

    /**Cantidad de la transacción a dos decimales.*/
    amount: number

    /**Descripción de la transacción.*/
    description: string

    /**Si la transacción está en status: failed, en este campo se mostrará la razón del fallo.*/
    error_message?: string

    /**Identificardor único del cliente al cual pertence la transacción.Si el valor es nulo, la transacción pertenece a la cuenta del comercio.*/
    customer_id: string

    /**Moneda usada en la operación, por default es MXN.*/
    currency: currency_type

    /**Datos de la cuenta bancaria usada en la transacción.Ver objeto BankAccoount*/
    bank_account?: bankAccount_type

    /**Datos de la tarjeta usada en la transacción.Ver objeto Card*/
    card?: cardOrigType
}

export type bankAccount_type = {
    /**ID de la cuenta bancaria.*/
    id: string

    /**Nombre completo del titular.*/
    holder_name: string

    /**Nombre por el cual se identifica a la cuenta bancaria.*/
    alias: string

    /**Número CLABE asignado a la cuenta bancaria.*/
    clabe: string

    /**Nombre abreviado del banco donde radica la cuenta, en base al siguiente catálogo de Códigos de Banco.*/
    bank_name: string

    /**Código del banco donde radica la cuenta bancaria, en base al siguiente catálogo de Códigos de Banco.*/
    bank_code: string

    /**Fecha y hora en que se creó la cuenta bancaria en formato ISO 8601.*/
    creation_date: string
}

type currency_type = "MXN"

export type tipoTransaccion = "charge" | "payout" | "refund" | "transfer" | "fee"
export type method_type = "card" | "store" | "bank"
export type operation_type = "in" | "out"
export type transactionStatus_type = "completed" | "in_progress" | "failed"
export type cardBrand_type = "visa" | "mastercard" | "american_express"


export interface errorOpenPay {
    "category": string,
    "description": string,
    "http_code": number,
    "error_code": number,
    "request_id": string,

}
