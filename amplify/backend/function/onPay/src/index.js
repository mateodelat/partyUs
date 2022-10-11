/* Amplify Params - DO NOT EDIT
  ENV
  REGION
  API_PARTYUSAPI_GRAPHQLAPIIDOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  API_PARTYUSAPI_GRAPHQLAPIKEYOUTPUT
  MERCHANT_ID
  SECRET_KEY
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */


async function graphqlRequest({ query, variables }) {
  const endpoint = new URL(
    process.env.API_PARTYUSAPI_GRAPHQLAPIENDPOINTOUTPUT
  );

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: AWS_REGION,
    service: "appsync",
    sha256: Sha256,
  });

  const requestToBeSigned = new HttpRequest({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: endpoint.host,
    },
    hostname: endpoint.host,
    body: JSON.stringify(
      !!variables
        ? { query, variables }
        : {
          query,
        }
    ),
    path: endpoint.pathname,
  });

  const signed = await signer.sign(requestToBeSigned);
  const request = new Request(endpoint, signed);



  let statusCode = 200;
  let body;
  let response;

  try {
    response = await fetch(request)
    body = await response.json()
    if (body.errors) statusCode = 400;
  } catch (error) {
    console.log("Error fetcheando objeto")
    statusCode = 500;
    body = {
      error: [
        {
          status: response.status,
          message: error.message,
          stack: error.stack,
        },
      ],
    };
  }

  return body
}

function formatResponse({ error, body, statusCode }) {
  let r = {
    statusCode,
  }
  if (error) {
    body = {
      ...body,
      error
    }
  }

  if (body) {
    r = {
      ...r,
      body: JSON.stringify(body, null, 2)
    }
  }
  console.log(r)
  return r

}

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  return {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  }, 
    body: JSON.stringify('Hello from Lambda!'),
  };
};
