export interface cardType {
    "id"?:string|Promise<string|undefined>,
    "type"?:string,
    "brand":"visa"|"mastercard"|"carnet"|"american_express",
    "address"?:Object,
    "card_number":string,
    "holder_name":string,
    "expiration_year"?:string,
    "expiration_month"?:string,
    "allows_charges"?:boolean,
    "allows_payouts"?:boolean,
    "creation_date"?:string,
    "bank_name"?:string,
    "bank_code"?:string,
    "customer_id"?:string,
    
    // Variables tarjetas locales
    "icon":NodeRequire
    "tokenID"?:string
    saveCard?:boolean




}

export interface errorOpenPay {
    "category" : string,
    "description" : string,
    "http_code" : number,
    "error_code" : number,
    "request_id" : string,

}
