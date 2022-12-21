// Funcion crear cuenta de stripe a partir de datos

import { PUBLIC_KEY } from "@env";
import { logger } from "react-native-logs";
import Stripe from "stripe";
import { fetchFromAPI, fetchFromStripe, partyusEmail, partyusPhone } from ".";
import { bankExternalType, cardExternalType } from "../types/stripe";

const log = logger.createLogger();

export default async function (params: {
  // Email que se asignara a compañia y persona
  email: string;
  phone: string;

  // Nombre persona
  first_name: string;
  paterno: string;
  materno: string;

  //
  // Cuenta bancaria
  bank_account:
    | undefined
    | {
        accountNumber: string;
        accountHolderName?: string;
      };
  // Tarjeta
  card:
    | undefined
    | {
        number: string;
        exp_month: string;
        exp_year: string;
        cvc: string;
      };
  accountType: "card" | "bank_account";
  //

  // Sub del usuario para la metadata
  userSub: string;

  // Documento de identidad
  documentIdBack?: string;
  documentIdFront?: string;

  // Fecha nacimiento
  day: number;
  month: number;
  year: number;

  // Address
  city?: string;
  country?: string;
  line1?: string;
  postal_code?: string;
  state?: string;

  // Terms of service
  ip: string;
  date: number;

  rfc?: string;
}) {
  const {
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

  // Obtener los RFC's y si no poner por defecto el mio
  rfc = rfc ? rfc : "TOHM020830S45";

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
    support_email: partyusEmail,
    support_phone: partyusPhone.slice(4),

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
    currency: "mxn",

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

    currency: "mxn",
  };

  // Datos para crear una persona
  // // Subir su ID de documento
  // const verification = {
  //   document: {
  //     front: documentIdFront,
  //     back: documentIdBack,
  //   },
  // };

  const accountCreate = new Stripe.AccountsResource();

  // Llenar sus datos
  const individual = {
    // verification,
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

  // return await fetchFromStripe({
  //   path: "/v1/accounts",
  //   type: "POST",
  //   input: accountObject,
  // });
  const res = await fetchFromAPI<Stripe.Response<Stripe.Account>>(
    "/payments/createAccount",
    "POST",
    accountObject
  );

  if (res?.error) {
    throw new Error(res as any);
  }

  return res;
}
