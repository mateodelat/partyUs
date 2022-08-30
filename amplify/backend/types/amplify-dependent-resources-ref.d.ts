export type AmplifyDependentResourcesAttributes = {
    "api": {
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
        "partyuscapaPostSignUp": {
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