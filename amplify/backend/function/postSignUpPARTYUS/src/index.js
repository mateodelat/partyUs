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
    "ffdddd",
    "ffffff",
    "cccccc",
  ];
  const randomColor = Math.round(Math.random() * listaColores.length);
  const bgc = listaColores[randomColor];

  const color = randomColor > 3 ? "000" : "fff";

  return `https://ui-avatars.com/api/?name=${nombre}&bold=true&background=${bgc}&color=${color}&length=1`;
}

async function generateBGIMG() {
  return await axios
    .get("https://source.unsplash.com/random/900x500/?party").then(
      async (r) => {
        const data = r.url;
        console.log(data)

        return data;
      }
    );
}

const crearUsr = `
    mutation CreateUsuario(
      $input: CreateUsuarioInput!
    ) {
      createUsuario(input: $input) {
        id
      }
    }
  `;


exports.handler = async (event, context, callback) => {
  const sub = event.userName;
  const attributes = event.request.userAttributes;


  const input = {
    id: sub,
    nickname: attributes.nickname,
    email: attributes.email,

    // Generar imagen de fondo de unsplash
    imagenFondo: await generateBGIMG(),

    // Generar foto de perfil con letra inicial
    foto: generateProfilePicture(attributes.nickname),
  };
  console.log("Atributos recibidos en crear usuario: ", input);

  if (input.id) {
    // Informacion para conectarse a graphql
    const endpoint = process.env.API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT;
    const headers = {
      "x-api-key": process.env.API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT,
    };

    const client = new GraphQLClient(endpoint, { headers });

    client
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
}

