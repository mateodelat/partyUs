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




/******************************
 * GET obtener cuenta cliente *
 *****************************/
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

/******************************************
 * GET obtener transferencias del usuario *
 ******************************************/
app.get('/payments/getClientTransfers', async function (req, res) {
  try {
    const id = req.query.id
    const limit = req.query.limit
    const offset = req.query.offset

    var searchParams = {
      limit,
      offset
    };

    openpay.customers.transfers.list(id, searchParams, function (error, body, response) {
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

/******************************************
 * GET obtener cargos del usuario *
 ******************************************/
app.get('/payments/getClientCharges', async function (req, res) {
  try {
    const id = req.query.id
    const limit = req.query.limit
    const offset = req.query.offset

    var searchParams = {
      limit,
      offset
    };

    openpay.customers.charges.list(id, searchParams, function (error, body, response) {
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



/*******************************
 * GET listar tarjetas cliente *
 ******************************/

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

/****************************************
 * GET listar cuentas bancarias cliente *
 ***************************************/

app.get('/payments/bankaccount', async function (req, res) {
  try {
    const customer_id = req.query.customer_id

    if (!customer_id) {
      res.status(404)
      res.json({
        error: "Error, no se recibio customer_id",
        body: req.body
      })
    }

    openpay.customers.bankaccounts.list(customer_id, function (error, body, response) {
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


/****************************************
* POST Crear cuenta de banco en usuario *
****************************************/

app.post('/payments/bankaccount', function (req, res) {
  // Add your code here
  try {
    const holder_name = req.body.holder_name
    const customer_id = req.body.customer_id
    const clabe = req.body.clabe
    const alias = req.body.alias ? req.body.alias : "Cuenta principal"

    if (!customer_id || !holder_name || !clabe) {
      res.status(404)
      res.json({
        error: "Error, no se recibio customer_id, clabe o holder_name",
        body: req.body
      })
    }

    openpay.customers.bankaccounts.create(customer_id, {
      holder_name, clabe,

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



app.listen(3000);
module.exports = app
