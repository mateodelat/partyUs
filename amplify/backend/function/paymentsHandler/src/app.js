/* Amplify Params - DO NOT EDIT
	API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
	API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
	API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')


var Openpay = require('openpay');
var openpay = new Openpay(process.env.MERCHANT_ID, process.env.SECRET_KEY);
// openpay.setProductionReady(true);


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




/**********************
 * GET obtener cuenta cliente *
 **********************/

app.get('/payments', function (req, res) {
  // Add your code here
  res.json({ success: 'get call succeed!', url: req.url });
});

app.get('/payments/clientInfo', async function (req, res) {
  try {
    const id = req.query.id
    const external_id = req.query.external_id


    // Si tengo id de cliente devolerlo
    if (id) {
      openpay.customers.get(id, function (error, body, response) {
        if (error?.http_code) {
          res.status(error?.http_code)
        }

        res.json({
          error,
          body
        })
      })
    } else if (external_id) {
      openpay.customers.list({
        external_id
      }, function (error, body, response) {
        if (error?.http_code) {
          res.status(error?.http_code)
        }

        // Si la lista esta vacia es porque no hay datos
        if (!body.length) {
          res.status(404)
          error = {
            "error_code": 1005, "category": "request", "description": `The customer with id '${external_id}' does not exist`
          }
          body = null

        }

        if (body) {
          body = body[0]
        }

        res.json({
          error,
          body
        })
      })

    }
    else {
      res.json({
        error: "Error, no se recibio id de customer o external_id",
      })

    }
  }
  catch (e) {

    console.log(e)
    res.status(500)
    res.json({
      error: "Hubo un error",
      body: JSON.stringify(e)
    })
  }

});


/**********************
 * GET listar tarjetas cliente *
 **********************/

app.get('/payments/card', async function (req, res) {
  try {
    const customer_id = req.query.customer_id

    if (!customer_id) {
      res.status(404)
      res.json({
        error: "Error, no se recibio customer_id",
        body: req.body
      })
    }

    openpay.customers.cards.list(customer_id, function (error, body, response) {
      if (error?.http_code) {
        res.status(error?.http_code)
      }

      res.json({
        error,
        body
      })
    })
  }
  catch (e) {

    console.log(e)
    res.status(500)
    res.json({
      error: "Hubo un error",
      body: JSON.stringify(e)
    })
  }

});



/****************************
* POST Crear tarjeta con token *
****************************/

app.post('/payments/card', function (req, res) {
  // Add your code here
  try {
    const token_id = req.body.token_id
    const device_session_id = req.body.device_session_id
    const customer_id = req.body.customer_id

    if (!customer_id || !token_id || !device_session_id) {
      res.status(404)
      res.json({
        error: "Error, no se recibio customer_id, token_id o device_session_id",
        body: req.body
      })
    }

    openpay.customers.cards.create(customer_id, {
      device_session_id,
      token_id
    }, function (error, body, response) {
      if (error?.http_code) {
        res.status(error?.http_code)
      }

      res.json({
        error,
        body
      })
    })
  }
  catch (e) {
    console.log(e)
    res.status(500)
    res.json({
      error: "Hubo un error",
      body: e.message
    })
  }
});


/**************************************
* Escuchar evento tras pago en tienda *
**************************************/
app.post('/payments/onPay', function (req, res) {
  // Add your code here
  try {
    const { body } = req
    const { status, method } = body.transaction //status: 'competed', method: store
    const { type } = body //charge.succeeded

    if (type !== "charge.succeeded") {
      console.log("Transaccion no es de tipo charge.succeeded")
      console.log(body)

      res.json()

    }


    if (method !== "store") {
      console.log("Transaccion no es pago con tarjeta")

      console.log(body)
      res.json()

    }


    if (status !== "completed") {
      console.log(body)
      console.log("La transaccion no tiene status.completed")
      res.json("La transaccion no tiene status.completed")
    }


  }
  catch (e) {
    console.log(e)
    res.status(500)
    res.json({
      error: "Hubo un error",
      body: e.message
    })
  }
});


/************************************************************
* Cancelar cargo de pago con tarjeta y transaccion asociada *
************************************************************/
app.post('/payments/cancelCharge', function (req, res) {
  // Add your code here
  try {
    const { body } = req
    const { reservaID } = body.transaction

    // console.log(reservaID)


    res.json({ reservaID })



  }
  catch (e) {
    console.log(e)
    res.status(500)
    res.json({
      error: "Hubo un error",
      body: e.message
    })
  }
});



/****************************
* Borrar tarjetas cliente *
****************************/
app.delete('/payments/card/:card_id', function (req, res) {
  const { card_id } = req.params
  const { customer_id } = req.query

  if (!customer_id) {
    res.status(404)
    res.json({
      error: "Error, no se recibio customer_id",
      body: req.query
    })
  }

  if (!card_id) {
    res.status(404)
    res.json({
      error: "Error, no se recibio card_id",
      body: req.params
    })
  }



  openpay.customers.cards.delete(customer_id, card_id, function (error, body, response) {
    if (error?.http_code) {
      res.status(error?.http_code)
    }

    res.json({
      error,
      body
    })
  })

});

// app.put('/payments/*', function (req, res) {
//   // Add your code here
//   res.json({ success: 'put call succeed!', url: req.url, body: req.body })
// });

/****************************
* Example delete method *
****************************/

app.delete('/card', function (req, res) {
  // Add your code here
  res.json({ success: 'delete call succeed!', url: req.url });
});

// app.delete('/payments/*', function (req, res) {
//   // Add your code here
//   res.json({ success: 'delete call succeed!', url: req.url });
// });

app.listen(3000);

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
