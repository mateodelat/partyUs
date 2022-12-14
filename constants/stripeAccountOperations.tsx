// Funcion crear cuenta de stripe a partir de datos

import { logger } from "react-native-logs";
import Stripe from "stripe";
import { currency, fetchFromAPI } from ".";
import { bankExternalType, cardExternalType } from "../types/stripe";

export default async function (
  params: {
    // Id en caso de ser actualizacion de docs
    accountID?: string;
    // Email que se asignara a compañia y persona
    email?: string;
    phone?: string;

    // Nombre persona
    first_name?: string;
    paterno?: string;
    materno?: string;

    //
    // Cuenta bancaria
    bank_account?:
      | undefined
      | {
          accountNumber?: string;
          accountHolderName?: string;
        };
    // Tarjeta
    card?:
      | undefined
      | {
          number: string;
          exp_month: string;
          exp_year: string;
          cvc: string;
        };
    accountType?: "card" | "bank_account";
    //

    // Sub del usuario para la metadata
    userSub?: string;

    // Documento de identidad
    documentIdBack?: string;
    documentIdFront?: string;

    // Fecha nacimiento
    day?: number;
    month?: number;
    year?: number;

    // Address
    city?: string;
    country?: string;
    line1?: string;
    postal_code?: string;
    state?: string;

    // Terms of service
    ip?: string;
    date?: number;

    rfc?: string;
  },
  opType: "create" | "update"
) {
  const {
    accountID,

    // Email que se asignara a compañia y persona
    email,
    phone,

    // Nombre persona
    first_name,
    paterno,
    materno,

    // Cuenta bancaria
    bank_account,
    card,
    accountType,

    // Sub del usuario para la metadata
    userSub,

    // Fecha nacimiento
    day,
    month,
    year,

    // Terms of service
    ip,
    date,
  } = params;

  let {
    rfc,

    // Address
    city,
    country,
    line1,
    postal_code,
    state,
  } = params;

  // Obtener los RFC's y si no poner por defecto el generico
  rfc = rfc ? rfc : "XAXX010101000";

  // Nombre de la cuenta o empresa
  const name = first_name + " " + paterno + " " + materno;

  const defaultAddress = {
    city: "Guadalajara",
    country: "MX",
    line1: "Patria 878",
    postal_code: "45030",
    state: "Jal.",
  };

  // Poner direccion default
  city = city ? city : defaultAddress.city;
  country = country ? country : defaultAddress.country;
  line1 = line1 ? line1 : "Patria 878";
  postal_code = postal_code ? postal_code : "45030";
  state = state ? state : "Jal.";

  // Terminos y condiciones
  const tos_acceptance = {
    ip,
    date,
  };

  // Direccion
  const address = {
    city,
    country,
    line1,
    postal_code,
    state,
  };

  // Fecha de nacimiento
  const dob = {
    day,
    month,
    year,
  };

  // Perfil de la cuenta
  const business_profile = {
    url: "https://partyusmx.com",
    mcc: "7922",

    name,
    support_email: email,
    support_phone: phone,

    product_description: "Tickets",
  };

  // Permisos a dar
  const capabilities = {
    card_payments: {
      requested: true,
    },
    transfers: {
      requested: true,
    },
    oxxo_payments: {
      requested: true,
    },
  };

  // Cuenta bancaria a depositar
  const ban_account: bankExternalType = {
    object: "bank_account",

    country: "MX",
    currency,

    account_holder_name: bank_account?.accountHolderName
      ? bank_account.accountHolderName
      : name,
    account_holder_type: "individual",

    account_number: bank_account?.accountNumber,
  };

  // Tarjeta a debitarle
  const car_acccount: cardExternalType = {
    object: "card",
    cvc: card.cvc,
    exp_month: card.exp_month,
    exp_year: card.exp_year,
    number: card.number,

    name,

    address_city: address.city,
    address_country: address.country,
    address_line1: address.line1,
    address_state: address.state,
    address_zip: address.postal_code,

    currency,
  };

  // Llenar sus datos
  const individual = {
    id_number: rfc,
    first_name,
    last_name: paterno + " " + materno,
    phone,
    email,
    address,
    dob,
  };

  let accountObject = {
    type: "custom",
    country: "MX",
    email,

    // Operaciones a realizar
    capabilities,

    business_type: "individual",

    // Datos de la persona
    individual,

    // Datos de la empresa
    business_profile,

    // Cuenta de banco o tarjeta para agregar fondos
    external_account:
      accountType === "bank_account" ? ban_account : car_acccount,

    metadata: {
      userSub,
    },

    // Terminos y condiciones
    tos_acceptance,
  };

  // Si es actualizar, agregar id de cuenta
  if (opType === "update") {
    (accountObject as any).accountID = accountID;
    delete accountObject.country;
    delete accountObject.type;
  }

  // Si se elige actualizar se manda a otra direccion
  const res = await fetchFromAPI<Stripe.Account>(
    "/payments/" + (opType === "create" ? "createAccount" : "updateAccount"),
    "POST",
    accountObject
  );

  if (res?.error) {
    throw new Error(res as any);
  }

  return res;
}
