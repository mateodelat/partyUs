const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')


var Openpay = require('openpay');
var openpay = new Openpay(process.env.MERCHANT_ID, process.env.SECRET_KEY);


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
 * Example get method *
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



/****************************
* Example post method *
****************************/

app.post('/payments', function (req, res) {
  // Add your code here
  res.json({ success: 'post call succeed!', url: req.url, body: req.body })
});

app.post('/payments/*', function (req, res) {
  // Add your code here
  res.json({ success: 'post call succeed!', url: req.url, body: req.body })
});

/****************************
* Example put method *
****************************/

app.put('/payments', function (req, res) {
  // Add your code here
  res.json({ success: 'put call succeed!', url: req.url, body: req.body })
});

app.put('/payments/*', function (req, res) {
  // Add your code here
  res.json({ success: 'put call succeed!', url: req.url, body: req.body })
});

/****************************
* Example delete method *
****************************/

app.delete('/payments', function (req, res) {
  // Add your code here
  res.json({ success: 'delete call succeed!', url: req.url });
});

app.delete('/payments/*', function (req, res) {
  // Add your code here
  res.json({ success: 'delete call succeed!', url: req.url });
});

app.listen(3000);

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
