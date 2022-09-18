export type AmplifyDependentResourcesAttributes = {
    "api": {
        "partyUsREST": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        },
        "partyUsAPI": {
            "GraphQLAPIKeyOutput": "string",
            "GraphQLAPIIdOutput": "string",
            "GraphQLAPIEndpointOutput": "string"
        }
    },
    "auth": {
        "partyus82cb367f": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string"
        }
    },
    "function": {
        "postSignUpPARTYUS": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "createReserva": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "paymentsHandler": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "partyusmodule": {
            "Arn": "string"
        },
        "partyuslayerff799a71": {
            "Arn": "string"
        }
    },
    "storage": {
        "partyUsStorage": {
            "BucketName": "string",
            "Region": "string"
        }
    }
}