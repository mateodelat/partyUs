// amplify/backend/function/appsyncOperations/opt/appSyncRequest.js
const https = require('https')
const AWS = require('aws-sdk')
const urlParse = require('url').URL
const region = process.env.REGION

/**
 *
 * @param {Object} queryDetails Un objeto con {query y variables}
 * @param {String} appsyncUrl url of your AppSync API
 * @param {String} apiKey the api key to include in headers. if null, will sign with SigV4
 */

exports.graphqlOperation = (queryDetails, appsyncUrl, apiKey) => {
    const req = new AWS.HttpRequest(appsyncUrl, region)
    const endpoint = new urlParse(appsyncUrl).hostname.toString()

    req.method = 'POST'
    req.path = '/graphql'
    req.headers.host = endpoint
    req.headers['Content-Type'] = 'application/json'
    req.body = JSON.stringify(queryDetails)

    if (apiKey) {
        req.headers['x-api-key'] = apiKey
    } else {
        const signer = new AWS.Signers.V4(req, 'appsync', true)
        signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate())
    }

    return new Promise((resolve, reject) => {
        const httpRequest = https.request({ ...req, host: endpoint }, (result) => {
            result.on('data', (data) => {
                resolve(JSON.parse(data?.toString()))
            })
        })

        httpRequest.write(req.body)
        httpRequest.end()
    })
}