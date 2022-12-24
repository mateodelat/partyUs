/* Amplify Params - DO NOT EDIT
  API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
  ENV
  REGION
Amplify Params - DO NOT EDIT */
const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')


const production = process.env.ENV === "production"

const SECRET_KEY = production ? process.env.SECRET_KEY_PROD : process.env.SECRET_KEY_STAG

const stripe = require('stripe')(SECRET_KEY);



// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});



/*******************************************************************************************************************************
*************************************************** ACCOUNTS *******************************************************************
********************************************************************************************************************************/

/*****************************************
* POST Crear account de cliente en stripe *
*****************************************/

async function createAccount(req, res) {
  try {

    if (!req || !req.body) {
      res.status(404)
      res.json({
        error: "Error, no se recibio cuerpo de peticion",
        body: req.body
      })
    }

    const input = req.body

    const account = await stripe.accounts.create(input);


    handleResponse(res, account)
  }
  catch (e) {
    handleError(res, e)
  }
}
app.post('/payments/createAccount', createAccount)


/***********************************************
* POST Actualizar account de cliente en stripe *
***********************************************/
app.post('/payments/updateAccount', async function (req, res) {

  // Validar que existan los parametros de body y accountID
  if (!req || !req.body) {
    res.status(404)
    res.json({
      error: "Error, no se recibio cuerpo de peticion",
      body: null
    })
    return
  }
  const accountID = req.body?.accountID

  if (!accountID) {
    res.status(404)
    res.json({
      error: "Error, no se accountID",
      body: req.body
    })
    return
  }


  let input = req.body
  delete input.accountID

  try {

    // Intentar crear la cuenta con el account id
    let account = await stripe.accounts.update(accountID, input);


    handleResponse(res, account)
  }
  catch (e) {
    // Si nos da error de tipo accountInvalid, es porque no existe la cuenta, crearla
    if (e.code === "account_invalid") {
      createAccount({
        body: {
          ...input,
          type: "custom",
          country: "MX",

        }
      }
        , res)
      return
    }

    // De lo contrario, enviar el error
    handleError(res, e)
  }
});




/*******************************************************************************************************************************
*********************************************** PAYMENT INTENT *****************************************************************
********************************************************************************************************************************/

/********************************************************
* POST Crear payment intent y obtener el client secret  *
********************************************************/
app.post('/payments/createPaymentIntent', async (req, res) => {
  try {
    // Validar que existan los parametros de body y accountID
    if (!req || !req.body) {
      res.status(404)
      res.json({
        error: "Error, no se recibio cuerpo de peticion",
      })
      return
    }

    let { body } = req

    // Create the PaymentIntent
    let intent = await stripe.paymentIntents.create(body);

    return handleResponse(res, intent);
  } catch (e) {
    handleError(res, e)
  }
});

/*******************************************************************************************************************************
*********************************************** CLIENT CARDS *******************************************************************
********************************************************************************************************************************/

/**************************************
* GET Obtener tarjetas de un cliente  *
**************************************/
app.get('/payments/card/:clientID', async (req, res) => {
  try {
    const { clientID } = req.params


    // Validar que existan los parametros clientID
    if (!clientID) {
      console.log(req)
      res.status(404)
      res.json({
        error: "Error, no se recibio clientID",
      })
      return
    }

    let cards = await stripe.customers.listPaymentMethods(clientID,
      { type: 'card' });

    return handleResponse(res, cards);
  } catch (e) {
    handleError(res, e)
  }
});

/******************************************
* GET Agregar tipo de pago a un cliente  *
******************************************/
app.post('/payments/card', async (req, res) => {
  try {
    const { body } = req

    console.log({
      body
    })

    if (!body) {
      res.status(404)
      res.json({
        error: "Error, no se recibio body en la solicitud GET",
        body: body

      })
      return
    }
    if (!body.customerID) {
      res.status(404)
      res.json({
        error: "Error, no se customerID en body de solicitud GET",
        body: body

      })
      return
    }
    if (!body.paymentMethodID) {
      res.status(404)
      res.json({
        error: "Error, no se recibio paymentMethodID en la solicitud GET",
        body: body

      })
      return
    }
    const { customerID, paymentMethodID } = body

    let result = await stripe.paymentMethods.attach(
      paymentMethodID,
      { customer: customerID }
    );


    return handleResponse(res, result);
  } catch (e) {
    handleError(res, e)
  }
});

/******************************************************
* DELETE Borrar tipo de pago (tarjeta) de un cliente  *
******************************************************/
app.delete('/payments/card/:id', async (req, res) => {
  try {
    console.log(req.params)

    const { id } = req?.params


    if (!id) {
      res.status(404)
      res.json({
        error: "Error, no se recibio ruta del cliente a borrar en solicitud DELETE",
      })
      return
    }

    let result = await stripe.paymentMethods.detach(
      id,
    );


    return handleResponse(res, "Deleted sucessfull");
  } catch (e) {
    handleError(res, e)
  }
});


/***********************************************************************************************************************************
************************************************* RESPONSE HANDLERS *****************************************************************
************************************************************************************************************************************/

// Estandarizar respuestas exitosas y errores
function handleResponse(res, input) {
  console.log("Repuesta exitosa")

  res.status(200)
  res.json({
    error: null,
    body: input
  })
}

function handleError(res, e) {

  console.log(e)

  // Si no hay e.type es que no es de stripe, codigo de error 500
  if (!e.type) {
    return res.json({
      error: "error interno",
      body: e
    });

  }

  const mes = e.message
  const statusCode = e?.statusCode ? e.statusCode : 500

  res.status(statusCode)

  return res.json({
    error: mes,
    body: e.error
  });

}


app.listen(3000);
module.exports = app
