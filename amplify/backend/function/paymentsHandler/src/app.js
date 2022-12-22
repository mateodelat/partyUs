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



/***************************************************
******************** ACCOUNTS **********************
***************************************************/

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
    let error = undefined

    if (account.error) {
      error = account.error
      res.status(error?.code)
    }

    res.json({
      error,
      body: account
    })
  }
  catch (e) {
    const mes = e?.Error ? e.Error : e?.code ? (e.code + "\n" + e.message) : JSON.stringify(e)
    res.status(500)
    res.json({
      error: "Hubo un error",
      body: mes
    })
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
      body: req.body
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
    let error = undefined


    if (account.error) {
      error = account.error
      res.status(error?.code)
    }

    res.json({
      error,
      body: account
    })
  }
  catch (e) {
    console.log(e)
    const mes = e?.errorMessage ? e?.errorMessage : e.Errore?.Error ? e.Error : e?.code ? (e.code + "\n" + e.message) : JSON.stringify(e)

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

    const statusCode = e?.statusCode ? e.statusCode : 500

    res.status(statusCode)
    res.json({
      error: mes,
    })
  }
});




// /******************************************
// * POST Crear transferencia entre cuentas  *
// ******************************************/
// app.post('/payments/transfer', function (req, res) {
//   // Add your code here
//   try {
//     const source_id = req.body.source_id
//     const target_id = req.body.target_id
//     const amount = req.body.amount


//     const description = req.body.description
//     const order_id = req.body.order_id

//     if (!target_id || !source_id || !amount) {
//       res.status(404)
//       res.json({
//         error: "Error, no se recibio target_id, source_id o amount",
//         body: req.body
//       })
//     }

//     openpay.customers.transfers.create(source_id, {
//       customer_id: target_id,
//       amount,
//       description,
//       order_id

//     }, function (error, body) {
//       if (error?.http_code) {
//         res.status(error?.http_code)
//       }

//       res.json({
//         error,
//         body
//       })
//     })
//   }
//   catch (e) {
//     console.log(e)
//     res.status(500)
//     res.json({
//       error: "Hubo un error",
//       body: e.message
//     })
//   }
// });





// /*******************************
// * POST Crear fee sobre cuenta  *
// *******************************/
// app.post('/payments/fee', function (req, res) {
//   // Add your code here
//   try {
//     const source_id = req.body.source_id
//     const amount = req.body.amount


//     const description = req.body.description
//     const order_id = req.body.order_id

//     if (!source_id || !amount) {
//       res.status(404)
//       res.json({
//         error: "Error, no se recibio source_id o amount",
//         body: req.body
//       })
//     }

//     openpay.fees.create({
//       customer_id: source_id,
//       amount,
//       description,
//       order_id

//     }, function (error, body) {
//       if (error?.http_code) {
//         res.status(error?.http_code)
//       }

//       res.json({
//         error,
//         body
//       })
//     })
//   }
//   catch (e) {
//     console.log(e)
//     res.status(500)
//     res.json({
//       error: "Hubo un error",
//       body: e.message
//     })
//   }
// });





// /****************************
// * Borrar tarjetas cliente *
// ****************************/
// app.delete('/payments/card/:card_id', function (req, res) {
//   const { card_id } = req.params
//   const { customer_id } = req.query

//   if (!customer_id) {
//     res.status(404)
//     res.json({
//       error: "Error, no se recibio customer_id",
//       body: req.query
//     })
//   }

//   if (!card_id) {
//     res.status(404)
//     res.json({
//       error: "Error, no se recibio card_id",
//       body: req.params
//     })
//   }



//   openpay.customers.cards.delete(customer_id, card_id, function (error, body, response) {
//     if (error?.http_code) {
//       res.status(error?.http_code)
//     }

//     res.json({
//       error,
//       body
//     })
//   })

// });



app.listen(3000);
module.exports = app
