/* Amplify Params - DO NOT EDIT
  API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT *//* Amplify Params - DO NOT EDIT
  API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */


const { GraphQLClient } = require('graphql-request');



const production = process.env.ENV === "production"

const SECRET_KEY = production ? process.env.SECRET_KEY_PROD : process.env.SECRET_KEY_STAG

const stripe = require('stripe')(SECRET_KEY);


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
  const randomColor = Math.round(Math.random() * listaColores.length - 1);
  let bgc = listaColores[randomColor];


  let color = randomColor > 3 ? "000" : "fff";

  // Si no hay color de fondo seleccionar blanco y negro
  if (!bgc || !color) {
    bgc = "#fff"
    color = "#000"
  }


  return `https://ui-avatars.com/api/?name=${nombre}&bold=true&background=${bgc}&color=${color}&length=1`;
}

async function createCustomer({
  email,
  name,
  id
}) {

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { id }
  })

  return customer?.id
}

const operation = `
    mutation CreateUsuario(
      $inputUsr: CreateUsuarioInput!
      $inputNot: CreateNotificacionInput!
    ) {

      createNotificacion(input: $inputNot) {
        id
        
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
        tipo

        titulo
        descripcion
        usuarioID
        showAt


      }

      createUsuario(input: $inputUsr) {
        id
        
        _version
        _deleted
        _lastChangedAt
        createdAt
        updatedAt
 
        id
        nickname
        email
        paymentClientID
        foto
        owner
    
      }
    }
  `;



exports.handler = async (event, context, callback) => {
  console.log(event)
  const sub = event.userName;
  const attributes = event.request.userAttributes;


  // Si viene de post confirm password devolver
  if (event.triggerSource === "PostConfirmation_ConfirmForgotPassword") {
    callback(null, event);
  }

  // Crear customer de plataforma pago
  const paymentClientID = await createCustomer({
    email: attributes.email,
    name: attributes.nickname,
    id: sub
  })

  const inputUsr = {
    id: sub,
    nickname: attributes.nickname,
    email: attributes.email,
    paymentClientID,

    // Generar foto de perfil con letra inicial
    foto: generateProfilePicture(attributes.nickname),

    owner: sub
  };
  console.log("Atributos recibidos en crear usuario: ", inputUsr);

  if (inputUsr.id) {
    // Informacion para conectarse a graphql
    const endpoint = process.env.API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT;
    const headers = {
      "x-api-key": process.env.API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT,
    };



    const client = new GraphQLClient(endpoint, { headers });


    const inputNot = {
      tipo: "BIENVENIDA",

      titulo: "Party us",
      descripcion:
        (attributes.nickname) +
        " gracias por registrarte en party us.\nAqui podras encontrar los mejores eventos de tu ciudad",

      usuarioID: sub,
      showAt: new Date().toISOString()
    }

    await client
      .request(operation, { inputUsr, inputNot })
      .then((r) => {
        console.log("Resultado crear usuario: ", r);
      })
      .catch((err) => {
        console.log("Error creando usuario: ", err);
      });

  } else {
    console.log("Error creando el usuario");
  }

  callback(null, event);
}

