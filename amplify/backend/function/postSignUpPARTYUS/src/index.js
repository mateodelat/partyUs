/* Amplify Params - DO NOT EDIT
  API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */


const axios = require('axios');
const { GraphQLClient } = require('graphql-request');





function generateProfilePicture(nombre) {
  const listaColores = [
    "f34856",
    "273440",
    "000000",
    "f01829",
    "ffbf5e",
    "577590",
    "F4F6F8",
    "cccccc",
  ];
  const randomColor = Math.round(Math.random() * listaColores.length);
  const bgc = listaColores[randomColor];

  const color = randomColor > 3 ? "000" : "fff";

  return `https://ui-avatars.com/api/?name=${nombre}&bold=true&background=${bgc}&color=${color}&length=1`;
}

async function createCustomer({
  email,
  name,
  id
}) {

  var data = JSON.stringify({
    "name": name,
    "email": email,
    "external_id": id,
    "requires_account": true
  });
  let authKey = Buffer.from(process.env.SECRET_KEY).toString('base64').replace("=", "6")

  var config = {
    method: 'post',
    url:
      // 'https://sandbox-api.openpay.mx/v1/mcwffetlymvvcqthcdxu/customers'
      'https://api.openpay.mx/v1/m1qt7k7zcarncm0jkvrp/customers'
    ,
    headers: {
      'Authorization': "Basic " + authKey,
      'Content-Type': 'application/json'
    },
    data: data
  };
  return await axios(config).then(
    (r) => {
      return r.data.id;
    }
  );
}

const crearUsr = `
    mutation CreateUsuario(
      $input: CreateUsuarioInput!
    ) {
      createUsuario(input: $input) {
        id
        
         _version
         _deleted
         _lastChangedAt
         createdAt
         updatedAt
 

      }
    }
  `;


exports.handler = async (event, context, callback) => {
  console.log(event)
  const sub = event.userName;
  const attributes = event.request.userAttributes;


  // Crear customer de plataforma pago
  const userPaymentID = await createCustomer({
    email: attributes.email,
    name: attributes.nickname,
    id: sub
  })

  const input = {
    id: sub,
    nickname: attributes.nickname,
    email: attributes.email,
    userPaymentID,

    // Generar foto de perfil con letra inicial
    foto: generateProfilePicture(attributes.nickname),

    owner: sub
  };
  console.log("Atributos recibidos en crear usuario: ", input);

  if (input.id) {
    // Informacion para conectarse a graphql
    const endpoint = process.env.API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT;
    const headers = {
      "x-api-key": process.env.API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT,
    };



    const client = new GraphQLClient(endpoint, { headers });

    await client
      .request(crearUsr, { input })
      .then((r) => {
        console.log("Resultado crear usuario: ", r);
      })
      .catch((err) => {
        console.log("Error creando usuario: ", err);
      });

    // // Crear la notificacion de bienvenida cuando no existia el usuario
    // client.request(crearNotificacion, {
    //   input: {
    //     tipo: "BIENVENIDA",

    //     titulo: "Party us",
    //     descripcion:
    //       (attributes.nickname) +
    //       " gracias por registrarte en party us.\nAqui podras encontrar los mejores eventos en tu ciudad",

    //     usuarioID: sub,
    //   },
    // });
  } else {
    console.log("Error creando el usuario");
  }

  callback(null, event);
}

